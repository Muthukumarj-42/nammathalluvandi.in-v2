const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');

async function processDirectory(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await processDirectory(fullPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (['.webp', '.png', '.jpg', '.jpeg'].includes(ext)) {
        console.log(`Processing image: ${fullPath}`);
        try {
          const isCart = fullPath.includes(path.join('public', 'carts'));
          const isBrand = fullPath.includes(path.join('public', 'brand'));
          
          let quality = 75;
          let maxWidth = 768;
          if (isBrand) {
            quality = 80;
            maxWidth = 300;
          } else if (isCart) {
            quality = 75;
            maxWidth = 768;
          }

          // Temporarily read into buffer
          const imageBuffer = await fs.promises.readFile(fullPath);
          let transformer = sharp(imageBuffer);

          // Get metadata to inspect width
          const metadata = await transformer.metadata();
          
          // Only resize if the width is larger than our maxWidth
          if (metadata.width && metadata.width > maxWidth) {
            transformer = transformer.resize({ width: maxWidth });
          }

          // Convert to webp with the target quality
          const outputBuffer = await transformer.webp({ quality }).toBuffer();

          // Write back
          const dirName = path.dirname(fullPath);
          const baseName = path.basename(fullPath, ext);
          const outputPath = path.join(dirName, `${baseName.toLowerCase()}.webp`);

          await fs.promises.writeFile(outputPath, outputBuffer);
          console.log(`Compressed: ${outputPath} (${outputBuffer.length} bytes)`);

          // If extension wasn't .webp, delete the original file
          if (ext !== '.webp') {
            await fs.promises.unlink(fullPath);
            console.log(`Deleted original: ${fullPath}`);
          }
        } catch (err) {
          console.error(`Failed to process ${fullPath}:`, err);
        }
      }
    }
  }
}

(async () => {
  console.log(`Scanning public directory: ${PUBLIC_DIR}`);
  if (!fs.existsSync(PUBLIC_DIR)) {
    console.error(`Directory does not exist: ${PUBLIC_DIR}`);
    process.exit(1);
  }
  await processDirectory(PUBLIC_DIR);
  console.log('Image compression complete!');
})();
