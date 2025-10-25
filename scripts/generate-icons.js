#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 检查是否存在 sharp 库（用于 SVG 到 PNG 转换）
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('Sharp not found. Installing sharp for image processing...');
  console.log('Please run: npm install --save-dev sharp');
  process.exit(1);
}

async function generateIcons() {
  const svgPath = path.join(__dirname, '../resources/icon.svg');
  const pngPath = path.join(__dirname, '../resources/icon.png');

  try {
    if (!fs.existsSync(svgPath)) {
      throw new Error('SVG icon not found at: ' + svgPath);
    }

    console.log('Generating 128x128 PNG icon from SVG...');

    await sharp(svgPath)
      .resize(128, 128, {
        fit: 'contain',
        background: { r: 0, g: 122, b: 204, alpha: 1 } // VS Code blue background
      })
      .png()
      .toFile(pngPath);

    console.log('✅ Icon generated successfully at:', pngPath);

    // 验证文件大小
    const stats = fs.statSync(pngPath);
    console.log(`📊 Icon file size: ${(stats.size / 1024).toFixed(2)} KB`);

    // 生成其他尺寸的图标（可选）
    await generateAdditionalSizes();

  } catch (error) {
    console.error('❌ Failed to generate icon:', error.message);
    process.exit(1);
  }
}

async function generateAdditionalSizes() {
  const svgPath = path.join(__dirname, '../resources/icon.svg');
  const sizes = [16, 32, 48, 64, 256];

  console.log('Generating additional icon sizes...');

  for (const size of sizes) {
    try {
      const outputPath = path.join(__dirname, `../resources/icon-${size}.png`);

      await sharp(svgPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 122, b: 204, alpha: 1 }
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ Generated ${size}x${size} icon: icon-${size}.png`);
    } catch (error) {
      console.warn(`⚠️  Failed to generate ${size}x${size} icon:`, error.message);
    }
  }
}

// 运行脚本
generateIcons().catch(console.error);