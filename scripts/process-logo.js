const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const inputPath = 'C:/Users/USER/.gemini/antigravity/brain/c9ae243d-6e33-4b73-9508-4904867d0d58/.user_uploaded/media_1794031700367_29242890.jpg';
const outputDir = path.join(__dirname, '..', 'public');
const outputPath = path.join(outputDir, 'logo.png');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function removeGreenBackground() {
  const image = sharp(inputPath);
  const metadata = await image.metadata();
  console.log('Image dimensions:', metadata.width, metadata.height);

  // Get raw RGBA buffer
  const { data, info } = await image
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  console.log(`Processing ${width}x${height} with ${channels} channels`);

  // Chroma key green detection
  // The green background is bright green: high G, lower R and B.
  // Let's sample corners:
  console.log('Sample top-left pixel RGB:', data[0], data[1], data[2]);

  let transparentPixels = 0;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Chroma key check:
    // Green is clearly dominant over red and blue
    // Typically in green screen: g > 100 && g > r * 1.3 && g > b * 1.3
    // Or if green is pure green (e.g. #00d22d, #00eb33 etc.)
    const isGreen = g > 110 && (g - r > 40) && (g - b > 40);

    if (isGreen) {
      data[i + 3] = 0; // alpha = 0 (fully transparent)
      transparentPixels++;
    } else {
      // Soft edge despill: if slightly green fringed
      if (g > r && g > b && (g - Math.max(r, b) < 40)) {
        // slightly reduce green spill
        data[i + 1] = Math.round((r + b) / 2);
      }
    }
  }

  console.log(`Made ${transparentPixels} / ${width * height} pixels transparent (${((transparentPixels / (width * height)) * 100).toFixed(1)}%)`);

  // Save back to PNG
  await sharp(data, {
    raw: {
      width,
      height,
      channels: 4,
    },
  })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);

  console.log('Saved transparent logo to:', outputPath);
}

removeGreenBackground().catch(err => {
  console.error('Error processing logo:', err);
  process.exit(1);
});
