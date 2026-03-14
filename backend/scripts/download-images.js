/**
 * Download Mock Product Images
 * Downloads sample food images from Unsplash for testing
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Create uploads directory if not exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'products');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory:', uploadsDir);
}

// Image URLs from Unsplash (free, high-quality food images)
const images = [
  {
    name: 'bakso-beranak.jpg',
    url: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=800&h=600&fit=crop',
    label: 'Bakso Beranak',
  },
  {
    name: 'bakso-komplit.jpg',
    url: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=800&h=600&fit=crop',
    label: 'Bakso Komplit',
  },
  {
    name: 'bakso-urat.jpg',
    url: 'https://images.unsplash.com/photo-1529563021891-75076329c1fe?w=800&h=600&fit=crop',
    label: 'Bakso Urat',
  },
  {
    name: 'bakso-halus.jpg',
    url: 'https://images.unsplash.com/photo-1579887829661-608bb8e2e636?w=800&h=600&fit=crop',
    label: 'Bakso Halus',
  },
  {
    name: 'bakso-kecil.jpg',
    url: 'https://images.unsplash.com/photo-1563245318-85964857da48?w=800&h=600&fit=crop',
    label: 'Bakso Kecil',
  },
  {
    name: 'tahu-bakso.jpg',
    url: 'https://images.unsplash.com/photo-1541696490-8744a5dc022a?w=800&h=600&fit=crop',
    label: 'Tahu Bakso',
  },
  {
    name: 'es-teh.jpg',
    url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&h=600&fit=crop',
    label: 'Es Teh',
  },
  {
    name: 'es-jeruk.jpg',
    url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=800&h=600&fit=crop',
    label: 'Es Jeruk',
  },
  {
    name: 'es-campur.jpg',
    url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&h=600&fit=crop',
    label: 'Es Campur',
  },
  {
    name: 'gorengan.jpg',
    url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop',
    label: 'Gorengan',
  },
  {
    name: 'lumpia.jpg',
    url: 'https://images.unsplash.com/photo-1544025151-914903c8a6b9?w=800&h=600&fit=crop',
    label: 'Lumpia',
  },
];

function downloadImage(url, filePath, label) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        console.warn(`⚠️  ${label}: HTTP ${response.statusCode}`);
        // Create placeholder image instead
        createPlaceholderImage(filePath, label);
        resolve();
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✅ ${label}: Downloaded`);
        resolve();
      });
    }).on('error', (err) => {
      console.warn(`⚠️  ${label}: Error - ${err.message}`);
      // Create placeholder image instead
      createPlaceholderImage(filePath, label);
      resolve();
    });
    
    // Timeout after 10 seconds
    setTimeout(() => {
      console.warn(`⏰ ${label}: Timeout, creating placeholder`);
      createPlaceholderImage(filePath, label);
      resolve();
    }, 10000);
  });
}

function createPlaceholderImage(filePath, label) {
  // Create a simple SVG placeholder
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#F59E0B;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#FCD34D;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#grad1)"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">
        ${label}
      </text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="24" fill="#FFFFFF" text-anchor="middle">
        🍜 Bakso Premium
      </text>
    </svg>
  `;
  
  fs.writeFileSync(filePath, svg);
  console.log(`🎨 ${label}: Placeholder created`);
}

async function downloadAllImages() {
  console.log('📥 Downloading product images...\n');
  
  for (const image of images) {
    const filePath = path.join(uploadsDir, image.name);
    await downloadImage(image.url, filePath, image.label);
  }
  
  console.log('\n✅ All images processed!');
  console.log(`📁 Saved to: ${uploadsDir}`);
  console.log(`📊 Total: ${images.length} images\n`);
}

// Run
downloadAllImages().catch(console.error);
