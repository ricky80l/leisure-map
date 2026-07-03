const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

const svgImage = `
<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0E7C66" />
  <text x="600" y="315" font-family="Georgia, serif" font-size="110" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">Leisure Map</text>
  <text x="600" y="440" font-family="Arial, sans-serif" font-size="45" fill="rgba(255, 255, 255, 0.9)" text-anchor="middle" dominant-baseline="middle">Trova il tuo tempo libero in Veneto</text>
</svg>
`;

sharp(Buffer.from(svgImage))
  .png()
  .toFile(path.join(publicDir, 'og-default.png'))
  .then(() => {
    console.log('✅ og-default.png generated successfully at public/og-default.png!');
  })
  .catch(err => {
    console.error('❌ Error generating image:', err);
    process.exit(1);
  });
