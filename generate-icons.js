const fs = require('fs');
const sharp = require('sharp');

const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#0a0a0f"/>
  <path d="M256 448L241.28 434.606C137.6 340.849 70.4 279.794 70.4 204.8C70.4 143.744 118.528 96 181.76 96C217.472 96 251.264 112.512 271.36 138.88C291.456 112.512 325.248 96 360.96 96C424.192 96 472.32 143.744 472.32 204.8C472.32 279.794 405.12 340.849 301.44 434.606L286.72 448H256Z" fill="#e82a5c" />
</svg>
`;

async function main() {
    await sharp(Buffer.from(svgIcon))
        .resize(192, 192)
        .toFile('./public/icon-192.png');

    await sharp(Buffer.from(svgIcon))
        .resize(512, 512)
        .toFile('./public/icon-512.png');

    console.log('Icons generated successfully!');
}

main().catch(console.error);
