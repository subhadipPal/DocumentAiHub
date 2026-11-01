# Data Source Integration

This document outlines the data source architecture for Document AI Hub's RAG/MCP document grounding system. The goal is to support multiple file sources with a unified interface, starting with local Markdown files and expanding to Google Drive API and NextCloud integration.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Unification Strategy](#unification-strategy)
3. [Common Interface Definition](#common-interface-definition)
4. [Local Markdown Files](#local-markdown-files)
5. [Google Drive API Integration](#google-drive-api-integration)
6. [NextCloud API Integration](#nextcloud-api-integration)
7. [Chunking Strategy](#chunking-strategy)
8. [Batch Processing Patterns](#batch-processing-patterns)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Data Source Abstraction Layer                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │   Unified File Reader (DataSourceInterface)               │  │
│  │   - readFiles()     List files with metadata              │  │
│  │   - readFileContent Read file content as text             │  │
│  │   - getMetadata()   Retrieve file details                 │  │
│  └───────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                          ┌─────┬─────┬─────┐                    │
│          Source Handlers  │  MD │ GCP│ NC  │                    │
│  ┌───────────────────────┤     │     │     ├────────────────────┐│
│  │ LocalMarkdownReader   │     │     │     │    DataSource      ││
│  │ GoogleDriveReader     │     │     │     │    Registry        ││
│  │ NextCloudReader       │◄───┤───►│◄───┤    Factory           ││
│  └───────────────────────┘     │   │   │     └──────────────────┘│
├─────────────────────────────────────────────────────────────────┤
│                       Unified Chunking Engine                     │
│                    (Consistent across all sources)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Unification Strategy

### Common Interface Pattern

All data sources implement a standard TypeScript interface:

\`\`\`typescript
interface DataSource {
  name: string;
  readFiles(
    options?: ReadFileOptions
  ): AsyncIterable<SourceFile>;
  
  readFileContent(
    fileId: string,
    encoding?: BufferEncoding
  ): Promise<string>;
  
  getMetadata(fileId: string): Promise<FileMetadata>;
}

interface SourceFile {
  id: string;
  path: string;
  metadata: FileMetadata;
  chunks: string[];
}

interface FileMetadata {
  name: string;
  size: number;
  modificationTime: Date;
  extension: string;
  mimeType?: string;
}
\`\`\`

### Metadata Schema Unification

| Field | Local | Google Drive | NextCloud | Notes |
|-------|-------|--------------|-----------|-------|
| \`id\` | absolute path | file ID | file ID | Unique identifier |
| \`name\` | filename | filename | filename | Extracted name |
| \`extension\` | extension | MIME/type | MIME/type | Common convention |
| \`size\` | fs.stat() | metadata | properties | Bytes size |
| \`modificationTime\` | mtime | modified | modification_time | Date object |

---

## Local Markdown Files

### Reading Directory Structure

\`\`\`typescript
interface LocalMarkdownReader extends DataSource {
  /**
   * Recursively read all .md files from a directory
   */
  async readFiles(dirPath: string, recursive?: boolean): AsyncIterable<SourceFile>;
}
\`\`\`

### Implementation Approach

**Directory Traversal:**
- Use \`fs.promises.readdir()\` with recursive option (Node.js 20+)
- Or use \`fast-glob\` for pattern matching ({dir}/**/*.md)
- Filter by .md extension only

**File Metadata Extraction:**
\`\`\`typescript
const fileStats = await fs.stat(filePath);
const metadata: FileMetadata = {
  name: path.basename(filePath),
  size: fileStats.size,
  modificationTime: fileStats.mtime,
  extension: '.md',
  mimeType: 'text/markdown'
};
\`\`\`

### Parsing Markdown Content

**Header Extraction:**
- Headers: \`#\`, \`##\`, \`###\` (H1-H6)
- Extract title from first H1 header
- Section headers for semantic chunking

**Code Block Extraction:**
\`\`\`typescript
// Regex patterns for extraction
const headerPattern = /^(#{1,6})\s+(.*)$/gm;
const codeBlockPattern = /```(\w*)?\n([\s\S]*?)```/g;
const tablePattern = /\|.*\n(\|.*)+/g;
\`\`\`

### Chunking Strategy Considerations for Local Files

**Recommended Approach:**
1. **Header-based chunking**: Split at H2/H3 headers (semantic boundaries)
2. **Size-based fallback**: 500-800 tokens per chunk when no headers present
3. **Table preservation**: Keep complete tables together (do not split mid-table)
4. **Code block isolation**: Separate code blocks as their own chunks
5. **Window overlap**: 10% overlap for context continuity

**Pseudocode:**
\`\`\`typescript
function createChunks(markdown: string, options: ChunkOptions): string[] {
  const headers = extractAllHeaders(markdown);
  
  return headers.map(header => {
    const sectionContent = getContentBetweenHeaders(header);
    
    // If section too large, split by size while keeping headers
    if (sectionContent.length > options.chunkSize) {
      return splitBySize(sectionContent, options.chunkSize);
    }
    
    return header.text + '\n\n' + sectionContent;
  });
}
\`\`\`

---

## Google Drive API Integration

### Authentication Flow

#### Option A: Service Account (Server-side/Headless)

**Best for:** Automated background processing, MCP servers

**Steps:**
1. Create service account in [Google Cloud Console](https://console.cloud.google.com/)
2. Generate JSON key file
3. Authenticate with \`google-auth-library\`

\`\`\`typescript
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(serviceAccountKey.client_email);
const auth = await client.requestAccessToken({
  scopes: ['https://www.googleapis.com/auth/drive.readonly']
});

// Drive API v3
const drive = google.drive({ version: 'v3', auth });
\`\`\`

**Scopes Required:**
- \`drive.readonly\` - List files, read content
- \`drive.file.readonly\` - Limited to own Google Drive files (if in personal domain)

#### Option B: OAuth 2.0 (User Interaction)

**Best for:** Desktop apps with user consent

\`\`\`typescript
const client = new OAuth2Client(
  CLIENT_ID,
  CLIENT_SECRET,
  AUTH_URI,
  TOKEN_URI,
  REDIRECT_URI
);

// Get authorization URL
const authUrl = await client.generateAuthUrl({
  access_type: 'offline',
  scope: ['drive.readonly']
});

// Exchange code for token after user consent
const { tokens } = await client.getToken(authCode);
\`\`\`

### File Listing and Filtering

\`\`\`typescript
async function listMarkdownFiles(drive: google.drive.v3.Drive, folderId?: string) {
  const response = await drive.files.list({
    q: \`mimeType in 'application/vnd.google-apps.document' 
        OR mimeType endsWith '.md'\`,
    fields: "files(id,name,mimeType,size,createdTime,modifiedTime,published)",
    spaces: 'root',
    includeFieldsForUsers: true,
    pageSize: 100, // Increase for bulk operations
    orderBy: 'modifiedTime desc',
  });

  return response.files.map(file => ({
    id: file.id!,
    name: file.name!,
    mimeType: file.mimeType,
    size: file.size! || 0,
    modificationTime: new Date(file.modifiedTime),
    published: !!file.published,
    folderId: file.parents?.[0] || 'root',
  }));
}
\`\`\`

### File Content Extraction

\`\`\`typescript
async function readFileContent(drive: google.drive.v3.Drive, fileId: string): Promise<string> {
  try {
    // Check if it is a Google Doc
    const fileMetadata = await drive.files.get({
      fileId,
      fields: 'mimeType'
    });

    if (fileMetadata.data.mimeType === 'application/vnd.google-apps.document') {
      // Export to text/markdown format
      return await drive.files.export({
        fileId,
        mimeType: 'text/plain', // Or 'text/markdown' for Google Docs export
      });
    } 
    else if (fileMetadata.data.mimeType === 'application/vnd.google-apps.folder') {
      throw new Error('Folder detected');
    }
    
    // Regular file download - needs media API
    const binaryStream = drive.files.getMedia({
      fileId,
      alt: 'media',
    });

    let content = '';
    for await (const chunk of binaryStream) {
      content += chunk.toString('utf8');
    }

    return content;
  } catch (error) {
    if (error.message.includes('Permission denied')) {
      throw new ShareRestrictedError('File is not accessible');
    }
    throw error;
  }
}
\`\`\`

### Metadata Handling

\`\`\`typescript
interface GoogleDriveMetadata extends FileMetadata {
  folderId: string;
  sharedWithMe: boolean;
  published: boolean;
  webViewLink?: string;
}

const googleMetadata: GoogleDriveMetadata = {
  name: file.name!,
  size: file.size! || 0,
  modificationTime: new Date(file.modifiedTime),
  extension: extractExtension(file.name!),
  mimeType: file.mimeType,
  folderId: file.parents?.[0] || 'root',
  sharedWithMe: false, // Determine from sharing settings
  published: !!file.published,
};

function extractExtension(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'application/vnd.google-apps.document': '.md',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
  };
  
  return mimeMap[mimeType] || '';
}
\`\`\`

### Error Handling for Sharing Restrictions

\`\`\`typescript
class GoogleDriveError extends Error {
  constructor(message: string, public originalError?: Error) {
    super(message);
    this.name = 'GoogleDriveError';
  }
}

class ShareRestrictedError extends GoogleDriveError {
  // File is not shared or permissions insufficient
}

async function safelyReadFile(drive: google.drive.v3.Drive, fileId: string): Promise<string> {
  try {
    return await readFileContent(drive, fileId);
  } catch (error) {
    if (error instanceof ShareRestrictedError) {
      // Log for manual review or skip
      logger.warn(\`Skipping shared-restricted file: \${fileId}\`);
      return null;
    }
    throw error;
  }
}
\`\`\`

---

## NextCloud API Integration

### Authentication Options

#### Option A: OAuth Client Credentials (Server-side)

**Best for:** MCP servers, automated systems

\`\`\`bash
# Get app password from NextCloud settings or use OAuth flow
\`\`\`

\`\`\`typescript
import axios from 'axios';
import BasicAuth from '@aws-sdk/client-sso/dist-es/runtimeClient.js';

async function authenticateNextCloud(clientId: string, clientSecret: string): Promise<string> {
  const response = await axios.post(
    \`\${NEXTCLOUD_URL}/ocs/v2.php/apps/oauth2/api/v1/token\`,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
      scope: 'openid'
    })
  );

  return response.data.ocs.data.access_token;
}
\`\`\`

#### Option B: Basic Auth with Apps Password (Desktop/Manual)

**Best for:** Desktop applications with user accounts

\`\`\`typescript
async function authenticateBasic(username: string, appsPassword: string): Promise<string> {
  const auth = Buffer.from(\`\${username}:\${appsPassword}\`).toString('base64');
  return \`Basic \${auth}\`;
}
\`\`\`

#### Option C: Web Interface (OAuth Flow)

\`\`\`typescript
const oauthUrl = \`\${NEXTCLOUD_URL}/login\`; // Open in browser for user consent
\`\`\`

### Folder Traversal and File Listing

\`\`\`typescript
interface NextCloudFile {
  id: number;
  name: string;
  mimeType: string;
  size: number;
  modificationTime: Date;
  parentFolder: string;
}

async function listFilesInFolder(
  nextcloud: any,
  folderId: string = '/',
  limit: number = 100
): Promise<NextCloudFile[]> {
  const response = await axios.get(
    \`\${NEXTCLOUD_URL}/remote.php/dav/files/\${folderId}\`,
    {
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json'
      }
    }
  );

  // OCS v2 response parsing
  const files = [];
  for (const file of response.data.ocs.data) {
    if (file.mimeType && file.name.endsWith('.md')) {
      files.push({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size || 0,
        modificationTime: new Date(file.cdate),
        parentFolder: folderId,
      });
    }
  }

  return files;
}
\`\`\`

### File Content Retrieval via OCPro or Web Interface

#### Using NextCloud API (REST)

\`\`\`typescript
async function readFileContentNextCloud(
  accessToken: string,
  fileIdOrPath: string
): Promise<string> {
  const url = fileIdOrPath.startsWith('/') 
    ? \`\${NEXTCLOUD_URL}/remote.php/dav/files/\${fileIdOrPath}\`
    : \`\${NEXTCLOUD_URL}/remote.php/dav/files/parentid/file.txt\`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: \`Bearer \${accessToken}\`,
        'Content-Type': 'application/json',
      }
    });

    // Handle OCS v2 or v16 response format
    return response.data.ocs?.data || JSON.stringify(response.data);
  } catch (error) {
    // Check for file not found, permission denied
    throw error;
  }
}
\`\`\`

#### Using OCClient (JavaScript SDK)

\`\`\`bash
npm install @nextcloud/owncloud-sdk2 --legacy-peer-deps
\`\`\`

\`\`\`typescript
import { initClient } from '@nextcloud/owncloud-sdk2';

async function withNextCloudClient() {
  const client = await initClient({
    baseUrl: NEXTCLOUD_URL,
    credentials: {
      username: USERNAME,
      password: PASSWORD // Or use tokens
    },
  });

  const files = await client.files.list('/', { includeFilesOnly: true });
  
  for (const file of files) {
    const content = await client.files.readFile(file.id);
    // Parse and chunk...
  }
}
\`\`\`

### Metadata Handling

\`\`\`typescript
interface NextCloudMetadata extends FileMetadata {
  parentFolder: string;
  sharePermissions?: {
    shareable: boolean;
    permissions: number; // 1=read, 4=write, etc.
  };
}

const nextcloudMetadata: NextCloudMetadata = {
  name: file.name,
  size: file.size || 0,
  modificationTime: new Date(file.cdate),
  extension: getFileExtension(file.name),
  mimeType: file.mimeType || 'application/octet-stream',
  parentFolder: file.path.substring(0, file.path.lastIndexOf('/')),
};

function getFileExtension(fileName: string): string {
  const match = fileName.match(/\.[^\/]+$/);
  return match ? match[0] : '';
}
\`\`\`

### SSL/HTTPS Considerations

\`\`\`typescript
// Verify SSL certificates (recommended)
async function verifySSLCertificate(nextcloudUrl: string, certificate: any): Promise<boolean> {
  // For NextCloud behind reverse proxy or self-signed certs:
  
  const https = require('https');
  const certData = await getCertificateFromServer(nextcloudUrl);

  try {
    openssl.parse({
      data: certData,
      strict: true,
    });
    
    // Check expiration
    if (certData.validity.notAfter < new Date()) {
      throw new Error('Certificate expired');
    }
    
    return true;
  } catch (error) {
    logger.warn('SSL verification failed:', error);
    return false;
  }
}

// If using self-signed certs, allow insecure connections (not recommended for production)
const httpsAgent = new HttpsAgent({
  rejectUnauthorized: false
});

axios.get(url, {
  headers: { Authorization: \`Bearer \${token}\` },
  httpsAgent // Only for self-signed certificates
});
\`\`\`

---

## Chunking Strategy

### Unified Chunking Engine

\`\`\`typescript
interface ChunkOptions {
  chunkSize: number;      // Default: 512 tokens
  overlap: number;        // Default: 10%
  preserveHeaders: boolean;
  separateCodeBlocks: boolean;
  preserveTables: boolean;
}

class UnifiedChunker {
  constructor(options: ChunkOptions) {
    this.options = options;
  }

  chunk(content: string, metadata?: FileMetadata): AsyncGenerator<string> {
    // Header-based extraction
    const semanticBoundaries = extractSemanticBoundaries(content);
    
    for (const boundary of semanticBoundaries) {
      if (boundary.type === 'header') {
        yield this.extractSection(content, boundary.position);
      } else if (boundary.type === 'code_block') {
        yield boundary.text; // Yield as separate chunk
      } else {
        yield this.splitBySize(
          boundary.text,
          this.options.chunkSize,
          this.options.overlap
        );
      }
    }

    // Fallback: size-based splitting for non-header content
    const remainder = this.getRemainderContent(content);
    if (remainder.length > 0) {
      yield* this.splitBySize(remainder, this.options.chunkSize, this.options.overlap);
    }
  }
}

function extractSemanticBoundaries(markdown: string): SemanticBoundary[] {
  const boundaries: SemanticBoundary[] = [];
  
  // Find H1-H6 headers
  const headerRegex = /^(#{1,6})\s+(.*)$/gm;
  let match;
  while ((match = headerRegex.exec(markdown)) !== null) {
    boundaries.push({
      type: 'header',
      level: match[1].length,
      text: match[2],
      position: match.index,
    });
  }

  // Find code blocks
  const codeBlockRegex = /```(\w*)?\n([\s\S]*?)```/g;
  let codeMatch;
  while ((codeMatch = codeBlockRegex.exec(markdown)) !== null) {
    boundaries.push({
      type: 'code_block',
      text: codeMatch[0], // Full code block including ``` markers
      position: codeMatch.index,
    });
  }

  return boundaries.sort((a, b) => a.position - b.position);
}
\`\`\`

### Chunking Strategy Consistency Across Sources

| Consideration | Implementation |
|---------------|----------------|
| **Header Priority** | Extract headers first regardless of source |
| **Code Block Preservation** | Always separate code blocks from text |
| **Table Handling** | Keep complete tables intact |
| **Size Limits** | Apply same token/character limit |
| **Overlap** | Consistent overlap percentage |
| **Metadata Attachment** | Attach source info to each chunk |

\`\`\`typescript
interface Chunk {
  content: string;
  sourceId: string;        // Local path, file ID, etc.
  metadata?: FileMetadata;
  chunkNumber: number;
}

async function createChunksFromSource(source: DataSource, options: ChunkOptions): AsyncIterable<Chunk> {
  for await (const sourceFile of source.readFiles()) {
    const content = await source.readFileContent(sourceFile.id);
    
    for (const chunkText of UnifiedChunker.chunk(content, sourceFile.metadata)) {
      yield {
        content: chunkText,
        sourceId: sourceFile.id,
        metadata: sourceFile.metadata,
        chunkNumber: 0, // Sequential within file
      };
    }
  }
}
\`\`\`

---

## Batch Processing Patterns

### Parallel File Reading with Rate Limiting

\`\`\`typescript
async function readFilesBatched(
  sources: DataSource[],
  options: {
    concurrentLimit: number;
    retryDelayMs?: number;
  }
): Promise<SourceFile[]> {
  const readFileQueue = async (source: DataSource): Promise<SourceFile> => {
    for await (const file of source.readFiles()) {
      const content = await source.readFileContent(file.id);
      return { ...file, content };
    }
  };

  // Use pLimit for concurrency control
  const limiter = pLimit(options.concurrentLimit);
  
  const batches = [];
  for (const source of sources) {
    for await (const file of source.readFiles()) {
      batches.push(limiter(() => readFileQueue(source).catch(e => null)));
    }
  }

  return await Promise.all(batches);
}
\`\`\`

### Retry with Exponential Backoff

\`\`\`typescript
async function retryWithBackoff(
  operation: () => Promise<string>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<string> {
  let delay = initialDelayMs;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const backoffDelay = Math.min(delay * 2, 30000); // Max 30s
      delay = backoffDelay;
      
      logger.warn(\`Retry \${attempt + 1}/\${maxRetries} after \${backoffDelay}ms\`);
      await sleep(backoffDelay);
    }
  }

  throw new Error('Failed after all retries');
}
\`\`\`

---

## Quick Start Implementation

### Basic Example

\`\`\`typescript
import { DataSource } from './types';
import { LocalMarkdownReader } from './readers/localMarkdown';
import { GoogleDriveReader } from './readers/googleDrive';
import { NextCloudReader } from './readers/nextCloud';

async function example() {
  // Initialize sources
  const localReader = new LocalMarkdownReader({
    directory: '/path/to/docs',
  });

  const googleReader = new GoogleDriveReader({
    credentialsPath: '/path/to/service-account.json',
    scopes: ['drive.readonly'],
  });

  const nextcloudReader = new NextCloudReader({
    baseUrl: 'https://nextcloud.example.com',
    clientId: 'app-id',
    clientSecret: 'secret',
  });

  // Unified chunker
  const options: ChunkOptions = {
    chunkSize: 512,
    overlap: 50,
    preserveHeaders: true,
    separateCodeBlocks: true,
    preserveTables: true,
  };

  const unifiedChunker = new UnifiedChunker(options);

  // Process all sources
  const source: DataSource[] = [localReader, googleReader, nextcloudReader];
  
  for await (const chunk of createChunksFromSource(source, options)) {
    console.log(\`[\${chunk.metadata?.name}] \${chunk.content.substring(0, 100)}...\`);
    // Send to embedding model or RAG database
  }
}
\`\`\`

---

## Error Handling Reference

| Source | Error Type | Handling Strategy |
|--------|------------|-------------------|
| Local | File not found | Skip with warning |
| Local | Permission denied | Skip, log user |
| Google Drive | 403 Forbidden | Share restricted -> skip |
| Google Drive | 404 Not found | Log and continue |
| NextCloud | Network error | Retry with backoff |
| NextCloud | Authentication failed | Re-authenticate or skip |

---

## Future Enhancements

1. **PDF Support**: Add PDF parser for multi-source content
2. **Database Indexing**: Store chunk metadata for faster retrieval
3. **File Watching**: Real-time updates using OS/FSEvents watch APIs
4. **Selective Filtering**: Content filtering (PII, sensitive sections)
5. **Metadata Enrichment**: Extract topics, entities per section

---

## License & References

- Google Drive API: https://developers.google.com/drive/api/v3/quickstart/nodejs
- NextCloud API: https://nextcloud.com/dev-api-docs/
- MCP Protocol: https://modelcontextprotocol.io/
