#!/usr/bin/env node

/**
 * 测试脚本：验证DevScope API扩展包是否包含必要的依赖
 */

const fs = require('fs');
const path = require('path');
const yauzl = require('yauzl'); // ZIP文件读取库

console.log('🔍 开始验证 DevScope API 扩展包...\n');

const vsixPath = path.join(__dirname, 'devscope-api-0.1.2.vsix');

if (!fs.existsSync(vsixPath)) {
    console.error('❌ 扩展包文件不存在:', vsixPath);
    process.exit(1);
}

console.log('📦 扩展包信息:');
const stats = fs.statSync(vsixPath);
console.log(`   文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
console.log(`   修改时间: ${stats.mtime.toLocaleString()}\n`);

// 检查关键依赖
const requiredFiles = [
    'extension/package.json',
    'extension/out/extension.js',
    'extension/out/server.js',
    'extension/node_modules/express/package.json',
    'extension/node_modules/body-parser/package.json'
];

console.log('🔍 检查关键文件...');

yauzl.open(vsixPath, { lazyEntries: true }, (err, zipfile) => {
    if (err) {
        console.error('❌ 无法读取扩展包:', err.message);
        process.exit(1);
    }

    const foundFiles = new Set();

    zipfile.on('entry', (entry) => {
        foundFiles.add(entry.fileName);

        // 检查关键文件
        if (requiredFiles.includes(entry.fileName)) {
            console.log(`   ✅ ${entry.fileName}`);
        }
    });

    zipfile.on('end', () => {
        console.log('\n📋 验证结果:');

        let allFound = true;
        requiredFiles.forEach(file => {
            if (foundFiles.has(file)) {
                console.log(`   ✅ ${file}`);
            } else {
                console.log(`   ❌ ${file} - 缺失!`);
                allFound = false;
            }
        });

        if (allFound) {
            console.log('\n🎉 扩展包验证通过！');
            console.log('   ✅ 所有必需的依赖和文件都已包含');
            console.log('   ✅ Express.js 模块已包含');
            console.log('   ✅ Body-parser 模块已包含');
            console.log('   ✅ 编译后的扩展代码已包含');
            console.log('\n🚀 扩展已准备好发布到 Marketplace！');
        } else {
            console.log('\n❌ 扩展包验证失败！');
            console.log('   请检查打包配置和依赖项');
            process.exit(1);
        }
    });

    zipfile.readEntry();
});