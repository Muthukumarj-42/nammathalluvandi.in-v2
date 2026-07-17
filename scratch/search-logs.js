const fs = require('fs');
const readline = require('readline');
const path = require('path');

const logFile = 'C:\\Users\\muthu\\.gemini\\antigravity\\brain\\bb7d8c8c-8755-4b5e-9aae-9507cd11840d\\.system_generated\\logs\\transcript.jsonl';

async function search() {
  const fileStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    if (line.includes("fetch-db.js") || line.includes("Connecting to") || line.includes("price_per_month")) {
      console.log(`Line ${lineCount}:`);
      // Print first 500 characters of the matching line to avoid flooding
      console.log(line.substring(0, 800) + "...\n");
    }
  }
}

search();
