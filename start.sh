#!/bin/bash
echo "Starting Next.js Development Server..."

# Load fnm environment so node/npm are available
export PATH="/home/gb/.local/share/fnm:$PATH"
if command -v fnm &> /dev/null; then
  eval "$(fnm env --shell bash)"
fi

# Run the dev server
npm run dev
