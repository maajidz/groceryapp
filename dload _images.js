// downloadProductImages.js
const fs = require('fs');
const path = require('path');
const https = require('https'); // Use https for pollinations.ai

const BASE_URL = "https://image.pollinations.ai/prompt";
const ASSETS_ROOT = path.join(__dirname, 'assets/generated_images'); // Ensure __dirname is used for relative paths
const PRODUCTS_DIR = path.join(ASSETS_ROOT, 'products');

if (!fs.existsSync(PRODUCTS_DIR)) {
  fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
}

function urlEncode(str) {
  // Using Node.js's built-in querystring.escape or URLSearchParams is more robust
  // but for simple prompt encoding, this should suffice.
  // A more complete solution would be: return new URLSearchParams({prompt: str}).toString().substring(7);
  return encodeURIComponent(str).replace(/[!'()*]/g, function(c) {
    return '%' + c.charCodeAt(0).toString(16);
  });
}

// --- Start of data copied from data/products.ts ---

// Helper to generate product image filenames and prompts (copied from data/products.ts)
const generateProductImageAssets = (product, placeholderImages) => {
  const imageFileNames = [];
  const prompts = [];
  placeholderImages.forEach((_originalImageUrl, index) => {
    imageFileNames.push(`product_${product.id}_${index}.png`);
    let prompt = `Commercial product photo of ${product.name}, brand: ${product.brand}, category: ${product.category}, detailed, high quality, studio lighting`;
    if (placeholderImages.length > 1) {
      if (index === 0) prompt += ', main front view';
      else if (index === 1) prompt += ', alternative angle view';
      else prompt += `, additional view ${index + 1}`;
    }
    if (product.description) prompt += `, ${product.description.substring(0, 50)}...`;
    prompts.push(prompt);
  });
  return { imageFileNames, prompts };
};

const rawProductsData = [
  { id: 'h1', name: 'Catch Cumin Seeds / Jeera Seeds', category: 'Spices', brand: 'Catch', weight: '100 g', price: '₹49', oldPrice: '₹65', discount: '24% OFF', deliveryTime: '8 MINS', placeholderImages: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Cumin+Main`, `https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Cumin+Side`], tags: ['spice', 'cumin', 'jeera', 'masala'], description: 'Premium quality cumin seeds by Catch for authentic Indian flavors.', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Catch`, attributes: [{label: 'Form', value: 'Seeds'}, {label: 'Organic', value: 'No'}] },
  { id: 'h2', name: 'Whole Farm Grocery Makhana', category: 'Snacks', brand: 'Whole Farm', weight: '100 g', price: '₹159', oldPrice: '₹210', discount: '24% OFF', deliveryTime: '8 MINS', placeholderImages: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Makhana+Main`], tags: ['snack', 'makhana', 'fox nuts', 'healthy'], description: 'Healthy and delicious Makhana (fox nuts) from Whole Farm Grocery.', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=WF`, attributes: [{label: 'Pack Size', value: '100g Pouch'}, {label: 'Diet Type', value: 'Vegetarian'}] },
  { id: 'h3', name: 'Whole Farm Grocery Raisins', category: 'Dry Fruits', brand: 'Whole Farm', weight: '200 g', price: '₹88', oldPrice: '₹200', discount: '56% OFF', deliveryTime: '8 MINS', placeholderImages: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Raisins+Main`], tags: ['dry fruit', 'raisins', 'kishmish'], description: 'Sweet and nutritious raisins from Whole Farm Grocery, perfect for snacking.', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=WF`, attributes: [{label: 'Type', value: 'Seedless'}, {label: 'Added Sugar', value: 'No'}] },
  { id: 'd1', name: 'Sweet Corn - Packet', category: 'Vegetables', brand: 'Local', weight: '(180-200) g', price: '₹20', oldPrice: '₹45', discount: '56% OFF', deliveryTime: '8 MINS', placeholderImages: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Corn+Main`], tags: ['vegetable', 'corn', 'sweet corn'], description: 'Fresh and sweet corn kernels, ready to cook or eat.', brandLogoUrl: undefined, attributes: [{label: 'Form', value: 'Kernels'}, {label: 'Packaging', value: 'Packet'}] },
  { id: 'd2', name: 'Kiran Watermelon (Tarbuj)', category: 'Fruits', brand: 'Kiran', weight: '1 piece', price: '₹80', oldPrice: '₹100', discount: '23% OFF', deliveryTime: '8 MINS', placeholderImages: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Watermelon+Main`], tags: ['fruit', 'watermelon', 'tarbuj'], description: 'Juicy and refreshing Kiran watermelon, perfect for hot days.', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Kiran`, attributes: [{label: 'Variety', value: 'Kiran'}, {label: 'Origin', value: 'India'}] },
  { id: 'd3', name: 'Baby Banana', category: 'Fruits', brand: 'Local', weight: '4 pieces', price: '₹30', oldPrice: '₹35', discount: '21% OFF', deliveryTime: '8 MINS', placeholderImages: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Banana+Main`], tags: ['fruit', 'banana', 'baby banana'], description: 'Small, sweet, and convenient baby bananas.', brandLogoUrl: undefined, attributes: [{label: 'Pack Size', value: '4 Pieces'}, {label: 'Ripeness', value: 'Ripe'}] },
  { id: 'p1', name: 'Amul Gold Milk', category: 'Dairy & Breakfast', brand: 'Amul', weight: '1 Litre', price: '₹70', deliveryTime: '8 MINS', placeholderImages: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Milk+Main`], tags: ['dairy', 'milk', 'amul gold'], description: 'Amul Gold homogenized standardized milk, rich and creamy.', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Amul`, attributes: [{label: 'Type', value: 'Standardized'}, {label: 'Fat Content', value: '4.5%'}] },
  { id: 'p2', name: 'Britannia Brown Bread', category: 'Dairy & Breakfast', brand: 'Britannia', weight: '400g', price: '₹50', deliveryTime: '8 MINS', placeholderImages: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Bread+Main`], tags: ['bakery', 'bread', 'brown bread'], description: 'Healthy and wholesome brown bread from Britannia.', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Britannia`, attributes: [{label: 'Type', value: 'Brown Bread'}, {label: 'Main Ingredient', value: 'Whole Wheat'}] },
  { id: 'p3', name: 'Lays Classic Salted Chips', category: 'Munchies', brand: 'Lays', weight: '52g', price: '₹20', deliveryTime: '8 MINS', placeholderImages: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Chips+Main`], tags: ['snack', 'chips', 'lays', 'potato'], description: 'The classic, crispy, and irresistible salted potato chips from Lay\'s.', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Lays`, attributes: [{label: 'Flavour', value: 'Classic Salted'}, {label: 'Net Quantity', value: '52g'}] },
  { id: 'p4', name: 'Coca-Cola Can', category: 'Cold Drinks & Juices', brand: 'Coca-Cola', weight: '300ml', price: '₹40', deliveryTime: '8 MINS', placeholderImages: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Coke+Main`], tags: ['beverage', 'coke', 'soda', 'cold drink'], description: 'Refreshing Coca-Cola, the perfect thirst quencher.', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Coke`, attributes: [{label: 'Variant', value: 'Can'}, {label: 'Volume', value: '300ml'}] },
  { id: 'p5', name: 'Maggi 2-Minute Noodles', category: 'Instant & Frozen Food', brand: 'Maggi', weight: '70g', price: '₹14', deliveryTime: '8 MINS', placeholderImages: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Maggi+Main`], tags: ['instant food', 'noodles', 'maggi'], description: 'Your favorite Maggi noodles, ready in just 2 minutes!', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Maggi`, attributes: [{label: 'Flavour', value: 'Masala'}, {label: 'Cooking Time', value: '2 Minutes'}] },
];

const allProducts = rawProductsData.map(p => {
  const { imageFileNames, prompts } = generateProductImageAssets(p, p.placeholderImages);
  const { placeholderImages, ...rest } = p; // remove placeholderImages from final product object
  return {
    ...rest,
    imageFileNames,
    prompts,
  };
});
// --- End of data copied from data/products.ts ---


async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    // Ensure the agent is properly configured for HTTPS if needed, though usually not necessary for basic GET
    const request = https.get(url, response => {
      if (response.statusCode !== 200) {
        // Consume response data to free up memory
        response.resume();
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    });
    request.on('error', err => {
      // fs.unlink(filepath, () => {}); // Don't unlink if file was not created or write failed early
      if (fs.existsSync(filepath)) { // Only unlink if file was partially created
           fs.unlink(filepath, (unlinkErr) => {
               if (unlinkErr) console.error(`Error unlinking partially downloaded file ${filepath}:`, unlinkErr);
           });
      }
      reject(err);
    });
  });
}

async function processProducts() {
  console.log('Downloading Product Images using Node.js script...');

  for (const product of allProducts) {
    if (!product.imageFileNames || !product.prompts) {
        console.warn(`Skipping product ${product.id} due to missing imageFileNames or prompts.`);
        continue;
    }
    for (let i = 0; i < product.imageFileNames.length; i++) {
      const filename = product.imageFileNames[i];
      const prompt = product.prompts[i];
      if (!prompt || !filename) {
          console.warn(`Skipping image for product ${product.id} due to missing filename or prompt at index ${i}.`);
          continue;
      }

      const encodedPrompt = urlEncode(prompt);
      // Add a random seed to try and get different images if re-run, and specify desired dimensions
      const downloadUrl = `${BASE_URL}/${encodedPrompt}?width=400&height=400&seed=${Math.floor(Math.random() * 100000)}`;
      const outputPath = path.join(PRODUCTS_DIR, filename);

      console.log(`Downloading: ${filename} (Prompt: ${prompt.substring(0, 60)}...)`);
      try {
        await downloadImage(downloadUrl, outputPath);
        console.log(`Saved to: ${outputPath}`);
      } catch (error) {
        console.error(`Error downloading ${filename}:`, error.message);
      }
      // Delay to be polite to the API server
      await new Promise(resolve => setTimeout(resolve, 2000)); // Increased delay to 2 seconds
    }
  }
  console.log('Product image download process finished.');
}

processProducts().catch(err => {
  console.error("Error in processing products:", err);
});

console.log("\n--- Script Instructions ---");
console.log("This script attempts to download product images based on data embedded from 'data/products.ts'.");
console.log("1. Ensure Node.js is installed.");
console.log("2. Save this script (e.g., as downloadProductImages.js) in your project root (the directory containing 'assets' and 'utils').");
console.log("3. Run the script from your project root: `node downloadProductImages.js`");
console.log("4. Images will be saved to `assets/generated_images/products/`.");
console.log("5. Remember to also download category and banner images using the bash script or manually as their prompts are not in this Node.js script.");
