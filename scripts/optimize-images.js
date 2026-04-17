/**
 * Image Optimization Script
 * Compresses all images in public folder
 * Run: node scripts/optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Directories to optimize
const dirs = [
  'public/filaments',
  'public/landingpage',
  'public/landing',
  'public/printer-images',
  'public/services',
  'public/hero-images',
  'public/about',
  'public', // Root public folder (for logo.png, etc.)
];

// Image settings
const QUALITY = 80; // Balance between quality and size
const MAX_WIDTH = 1920; // Max width for large images
const PRODUCT_MAX_WIDTH = 1200; // Max width for product images

async function optimizeImage(filePath, outputPath, maxWidth = MAX_WIDTH) {
  try {
    const info = await sharp(filePath)
      .resize(maxWidth, null, {
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: QUALITY })
      .toFile(outputPath);
    
    const originalSize = fs.statSync(filePath).size;
    const newSize = info.size;
    const savings = ((1 - newSize / originalSize) * 100).toFixed(1);
    
    console.log(`✅ ${path.basename(filePath)}: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(newSize / 1024 / 1024).toFixed(2)}MB (${savings}% saved)`);
    
    return { originalSize, newSize, savings };
  } catch (error) {
    console.error(`❌ Error optimizing ${filePath}:`, error.message);
    return null;
  }
}

async function processDirectory(dir, maxWidth = MAX_WIDTH) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory not found: ${dir}`);
    return;
  }

  console.log(`\n📁 Processing: ${dir}`);
  
  const files = fs.readdirSync(dir, { withFileTypes: true });
  let totalOriginal = 0;
  let totalNew = 0;
  let count = 0;

  for (const file of files) {
    const filePath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      // Recursively process subdirectories
      await processDirectory(filePath, maxWidth);
      continue;
    }
    
    // Only process image files
    if (!file.name.match(/\.(jpg|jpeg|png)$/i)) {
      continue;
    }
    
    // Skip if already .webp
    if (file.name.endsWith('.webp')) {
      continue;
    }
    
    // Create output filename with .webp extension
    const outputPath = filePath.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    
    // Skip if webp version already exists
    if (fs.existsSync(outputPath)) {
      console.log(`⏭️  Skipping ${file.name} (webp already exists)`);
      continue;
    }
    
    const result = await optimizeImage(filePath, outputPath, maxWidth);
    if (result) {
      totalOriginal += result.originalSize;
      totalNew += result.newSize;
      count++;
    }
  }

  if (count > 0) {
    const totalSavings = ((1 - totalNew / totalOriginal) * 100).toFixed(1);
    console.log(`\n📊 ${dir} Summary:`);
    console.log(`   Optimized: ${count} images`);
    console.log(`   Original: ${(totalOriginal / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   New: ${(totalNew / 1024 / 1024).toFixed(2)}MB`);
    console.log(`   Saved: ${(totalOriginal / 1024 / 1024 - totalNew / 1024 / 1024).toFixed(2)}MB (${totalSavings}%)`);
  }
}

async function main() {
  console.log('🚀 Starting image optimization...\n');
  console.log('This will create .webp versions of all JPG/PNG images');
  console.log('Original files will NOT be deleted (you can remove them later)\n');

  let grandTotalOriginal = 0;
  let grandTotalNew = 0;

  for (const dir of dirs) {
    await processDirectory(dir, dir.includes('product') ? PRODUCT_MAX_WIDTH : MAX_WIDTH);
  }

  console.log('\n✅ Optimization complete!');
  console.log('\n📝 Next steps:');
  console.log('1. Test your site to ensure images load correctly');
  console.log('2. Once confirmed, delete the original JPG/PNG files');
  console.log('3. Update image references in your code to use .webp');
}

// Check if sharp is installed
try {
  require.resolve('sharp');
  main().catch(console.error);
} catch (e) {
  console.error('❌ Error: sharp is not installed');
  console.log('\n📦 Install sharp first:');
  console.log('   npm install --save-dev sharp');
  console.log('\nThen run this script again:');
  console.log('   node scripts/optimize-images.js');
  process.exit(1);
}
