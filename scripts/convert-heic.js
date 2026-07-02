const fs = require('fs');
const path = require('path');
const convert = require('heic-convert');

const CARTS_DIR = path.join(__dirname, '..', 'public', 'carts');

async function processDirectory(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.HEIC') || entry.name.endsWith('.heic'))) {
      console.log(`Processing: ${fullPath}`);
      try {
        const inputBuffer = await fs.promises.readFile(fullPath);
        const outputBuffer = await convert({
          buffer: inputBuffer,
          format: 'JPEG',
          quality: 0.85
        });

        const dirName = path.dirname(fullPath);
        const baseName = path.basename(fullPath, path.extname(fullPath));
        const outputPath = path.join(dirName, `${baseName.toLowerCase()}.jpg`);

        await fs.promises.writeFile(outputPath, outputBuffer);
        console.log(`Successfully converted to: ${outputPath}`);

        // Delete the original HEIC file
        await fs.promises.unlink(fullPath);
        console.log(`Deleted original HEIC file: ${fullPath}`);
      } catch (err) {
        console.error(`Failed to process ${fullPath}:`, err);
      }
    }
  }
}

(async () => {
  console.log(`Scanning directory: ${CARTS_DIR}`);
  if (!fs.existsSync(CARTS_DIR)) {
    console.error(`Directory does not exist: ${CARTS_DIR}`);
    process.exit(1);
  }
  await processDirectory(CARTS_DIR);
  console.log('Conversion complete!');
})();
