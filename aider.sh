cd ~/_.code/DocumentAiHub

cat > run-aider-deepseek.sh <<'EOF'
#!/bin/zsh
set -e
cd "$(dirname "$0")"
export OLLAMA_API_BASE="${OLLAMA_API_BASE:-http://127.0.0.1:11434}"

exec python3 -m aider \
  --model ollama_chat/deepseek-r1:8b \
  --stream \
  --verbose \
  --show-diffs \
  --llm-history-file .aider-deepseek.log \
  "$@"
EOF

chmod +x run-aider-deepseek.sh
./run-aider-deepseek.sh