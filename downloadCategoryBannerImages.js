const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://image.pollinations.ai/prompt/';
const ASSETS_BASE_PATH = path.join(__dirname, 'assets', 'generated_images');
const CATEGORIES_PATH = path.join(ASSETS_BASE_PATH, 'categories');
const BANNERS_PATH = path.join(ASSETS_BASE_PATH, 'banners');

const categoriesData = [
  { name: 'Vegetables & Fruits', filename: 'cat_veg_fruits.png', prompt: 'Vibrant display of fresh vegetables and fruits, grocery store style, high quality food photography' },
  { name: 'Dairy & Breakfast', filename: 'cat_dairy_breakfast.png', prompt: 'Assortment of dairy products and breakfast items like milk, cheese, eggs, and cereal, clean bright lighting, appetizing food photography' },
  { name: 'Munchies', filename: 'cat_munchies.png', prompt: 'Colorful collection of snacks and munchies like chips, pretzels, and cookies, fun and inviting, product showcase' },
  { name: 'Cold Drinks & Juices', filename: 'cat_drinks_juices.png', prompt: 'Refreshing cold drinks and juices, various bottles and cartons with condensation, icy and cool, bright beverage photography' },
  { name: 'Instant & Frozen Food', filename: 'cat_instant_frozen.png', prompt: 'Selection of instant noodles, ready-to-eat meals, and frozen food packages, convenient and quick, modern packaging' },
  { name: 'Spices', filename: 'cat_spices.png', prompt: 'Aromatic array of whole and ground spices in small bowls or jars, colorful and exotic, culinary flat lay' },
];

const bannerData = {
  filename: 'main_banner.png',
  prompt: 'Wide promotional banner for an online grocery delivery app, showing a variety of fresh produce, dairy, and packaged goods, with a theme of speed and freshness, bright and appealing modern design',
};

function ensureDirExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

function downloadImage(prompt, filePath, imageName) {
  return new Promise((resolve, reject) => {
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `${BASE_URL}${encodedPrompt}`;
    const humanFriendlyPath = path.relative(__dirname, filePath); // For logging

    console.log(`Downloading ${imageName} with prompt: \"${prompt}\"`);
    console.log(`  URL: ${url}`);
    console.log(`  Saving to: ${humanFriendlyPath}`);

    const fileStream = fs.createWriteStream(filePath);
    
    const request = https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${imageName}. Status code: ${response.statusCode} from ${url}`));
        return;
      }
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Successfully downloaded ${imageName} to ${humanFriendlyPath}`);
        resolve();
      });
    });

    request.on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the empty file if created
      reject(new Error(`Error during download of ${imageName}: ${err.message}`));
    });

    // Set a timeout for the request
    request.setTimeout(60000, () => { // 60 seconds timeout
        request.destroy();
        reject(new Error(`Request timed out for ${imageName} from ${url}`));
    });

  });
}

async function main() {
  console.log('Starting image download process...');
  ensureDirExists(ASSETS_BASE_PATH);
  ensureDirExists(CATEGORIES_PATH);
  ensureDirExists(BANNERS_PATH);

  // Download category images
  for (const category of categoriesData) {
    const filePath = path.join(CATEGORIES_PATH, category.filename);
    try {
      await downloadImage(category.prompt, filePath, category.name);
    } catch (error) {
      console.error(`Failed to download category image ${category.name}:`, error.message);
    }
    // Add a small delay to avoid overwhelming the API, if necessary
    // await new Promise(resolve => setTimeout(resolve, 1000)); 
  }

  // Download banner image
  const bannerFilePath = path.join(BANNERS_PATH, bannerData.filename);
  try {
    await downloadImage(bannerData.prompt, bannerFilePath, 'Main Banner');
  } catch (error) {
    console.error('Failed to download banner image:', error.message);
  }

  console.log('Image download process finished.');
}

main(); 