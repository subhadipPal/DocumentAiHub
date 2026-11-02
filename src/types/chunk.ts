export interface FileMetadata {
  name: string;
  size: number;
  modificationTime: Date;
  extension: string;
  mimeType?: string;
}

export interface SourceFile {
  id: string;
  path: string;
  metadata: FileMetadata;
  chunks: string[];
}

export interface RawTextBlock {
  text: string;
  metadata: {
    source: string;
    sectionIndex: number;
    title?: string;
  };
}

export interface Chunk {
  content: string;
  sourceId: string;
  metadata: FileMetadata;
  chunkNumber: number;
}
