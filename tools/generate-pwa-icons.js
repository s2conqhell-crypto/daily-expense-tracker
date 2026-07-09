#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SOURCE_SVG = path.join(__dirname, '..', 'public', 'icons', 'icon-512.svg');
const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');
const SPLASH_DIR = path.join(__dirname, '..', 'public', 'icons', 'splash');

const ICONS = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'apple-touch-icon-152.png', size: 152 },
  { name: 'apple-touch-icon-120.png', size: 120 },
];

const SPLASH = [
  { name: 'iphone_5.png', width: 320, height: 568, ratio: 2 },
  { name: 'iphone_6.png', width: 375, height: 667, ratio: 2 },
  { name: 'iphone_6_plus.png', width: 414, height: 736, ratio: 3 },
  { name: 'iphone_x.png', width: 375, height: 812, ratio: 3 },
  { name: 'iphone_xr.png', width: 414, height: 896, ratio: 2 },
  { name: 'iphone_xs_max.png', width: 414, height: 896, ratio: 3 },
  { name: 'iphone_12.png', width: 390, height: 844, ratio: 3 },
  { name: 'iphone_12_pro_max.png', width: 428, height: 926, ratio: 3 },
  { name: 'iphone_14_pro.png', width: 393, height: 852, ratio: 3 },
  { name: 'iphone_14_pro_max.png', width: 430, height: 932, ratio: 3 },
  { name: 'ipad_mini.png', width: 768, height: 1024, ratio: 2 },
  { name: 'ipad_air.png', width: 834, height: 1112, ratio: 2 },
  { name: 'ipad_pro_10.png', width: 834, height: 1194, ratio: 2 },
  { name: 'ipad_pro_12.png', width: 1024, height: 1366, ratio: 2 },
];

async function generate() {
  try {
    const sharp = require('sharp');
    
    if (!fs.existsSync(SPLASH_DIR)) {
      fs.mkdirSync(SPLASH_DIR, { recursive: true });
    }

    const svgBuffer = fs.readFileSync(SOURCE_SVG);

    // Generate icons
    for (const icon of ICONS) {
      const outputPath = path.join(ICONS_DIR, icon.name);
      await sharp(svgBuffer)
        .resize(icon.size, icon.size)
        .png()
        .toFile(outputPath);
      console.log(`Generated ${icon.name} (${icon.size}x${icon.size})`);
    }

    // Generate splash screens
    const splashBg = Buffer.from(
      `<svg width="1280" height="1280" xmlns="http://www.w3.org/2000/svg">
        <rect width="1280" height="1280" fill="#0b0b1a"/>
      </svg>`
    );

    for (const splash of SPLASH) {
      const outputPath = path.join(SPLASH_DIR, splash.name);
      const w = splash.width * splash.ratio;
      const h = splash.height * splash.ratio;
      
      // Create splash: dark background with centered icon
      const iconSize = Math.round(Math.min(w, h) * 0.2);
      const iconBuffer = await sharp(svgBuffer).resize(iconSize, iconSize).png().toBuffer();

      await sharp(splashBg)
        .resize(w, h, { fit: 'fill' })
        .composite([{ input: iconBuffer, gravity: 'center' }])
        .png()
        .toFile(outputPath);
      console.log(`Generated splash/${splash.name} (${w}x${h})`);
    }

    console.log('\nAll icons and splash screens generated successfully!');
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      console.error('sharp is not installed. Install it with: npm install -D sharp');
      process.exit(1);
    }
    throw err;
  }
}

generate().catch(console.error);
