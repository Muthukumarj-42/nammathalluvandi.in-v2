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
    // We are looking for logs containing cart objects with properties like price_per_month, stove_type, etc.
    if (line.includes("price_per_month") && line.includes("juice") || line.includes("Fast Food") || line.includes("Nagaraj")) {
      // Print the line index and parts of the line containing the carts list
      console.log(`Line ${lineCount}:`);
      console.log(line.substring(0, 1000) + "...\n");
    }
  }
}

search();
