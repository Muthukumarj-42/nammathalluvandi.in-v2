const fs = require('fs');
const readline = require('readline');

const logFile = 'C:\\Users\\muthu\\.gemini\\antigravity\\brain\\bb7d8c8c-8755-4b5e-9aae-9507cd11840d\\.system_generated\\logs\\transcript_full.jsonl';

async function search() {
  const fileStream = fs.createReadStream(logFile);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let lineCount = 0;
  for await (const line of rl) {
    lineCount++;
    // Look for console outputs printing lists of carts
    if (line.includes("latitude:") && line.includes("longitude:") && (line.includes("id:") || line.includes('"id":'))) {
      console.log(`Match at line ${lineCount}:`);
      console.log(line.substring(0, 1500) + "...\n");
    }
  }
}

search();
