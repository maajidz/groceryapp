#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Pollinations API base URL
const BASE_URL = 'https://image.pollinations.ai/prompt';

// Output directory for generated images
const OUTPUT_DIR = path.join(__dirname, 'assets', 'generated_images', 'products');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Function to generate image filenames and prompts
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

// Raw product data
const rawProductsData = [
  // Spices
  { "id": "h1", "name": "Catch Cumin Seeds / Jeera Seeds", "category": "Spices", "brand": "Catch", "weight": "100 g", "price": "₹49", "oldPrice": "₹65", "discount": "24% OFF", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Cumin+Main", "https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Cumin+Side"], "tags": ["spice", "cumin", "jeera", "masala"], "description": "Premium quality cumin seeds by Catch for authentic Indian flavors.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Catch", "attributes": [{label: "Form", value: "Seeds"}, {label: "Organic", value: "No"}] },
  { "id": "sp2", "name": "Everest Turmeric Powder / Haldi", "category": "Spices", "brand": "Everest", "weight": "200 g", "price": "₹55", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Turmeric+Main"], "tags": ["spice", "turmeric", "haldi", "powder"], "description": "Pure and authentic turmeric powder for everyday cooking.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Everest", "attributes": [{label: "Form", value: "Powder"}, {label: "Organic", value: "No"}] },
  { "id": "sp3", "name": "Tata Sampann Coriander Powder / Dhania", "category": "Spices", "brand": "Tata Sampann", "weight": "100 g", "price": "₹30", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Coriander+Powder+Main"], "tags": ["spice", "coriander", "dhania", "powder"], "description": "Aromatic coriander powder to enhance your dishes.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Tata", "attributes": [{label: "Form", value: "Powder"}, {label: "Natural", value: "Yes"}] },
  { "id": "sp4", "name": "MDH Garam Masala", "category": "Spices", "brand": "MDH", "weight": "50 g", "price": "₹60", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Garam+Masala+Main"], "tags": ["spice", "garam masala", "blend"], "description": "Classic Garam Masala blend for rich Indian curries.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=MDH", "attributes": [{label: "Form", value: "Powder"}, {label: "Spice Blend", value: "Yes"}] },
  // Munchies
  { "id": "h2", "name": "Whole Farm Grocery Makhana", "category": "Munchies", "brand": "Whole Farm", "weight": "100 g", "price": "₹159", "oldPrice": "₹210", "discount": "24% OFF", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Makhana+Main"], "tags": ["snack", "makhana", "fox nuts", "healthy"], "description": "Healthy and delicious Makhana (fox nuts) from Whole Farm Grocery.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=WF", "attributes": [{label: "Pack Size", value: "100g Pouch"}, {label: "Diet Type", value: "Vegetarian"}] },
  { "id": "p3", "name": "Lays Classic Salted Chips", "category": "Munchies", "brand": "Lays", "weight": "52g", "price": "₹20", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Chips+Main"], "tags": ["snack", "chips", "lays", "potato"], "description": "The classic, crispy, and irresistible salted potato chips from Lay's.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Lays", "attributes": [{label: "Flavour", value: "Classic Salted"}, {label: "Net Quantity", value: "52g"}] },
  { "id": "mu2", "name": "Kurkure Masala Munch", "category": "Munchies", "brand": "Kurkure", "weight": "90g", "price": "₹20", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Kurkure+Main"], "tags": ["snack", "kurkure", "namkeen"], "description": "Spicy and tangy Kurkure Masala Munch for a flavorful snack time.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Kurkure", "attributes": [{label: "Flavour", value: "Masala Munch"}, {label: "Type", value: "Extruded Snack"}] },
  { "id": "mu3", "name": "Haldiram's Aloo Bhujia", "category": "Munchies", "brand": "Haldiram's", "weight": "200g", "price": "₹50", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Bhujia+Main"], "tags": ["snack", "bhujia", "namkeen", "haldirams"], "description": "Crispy and savory Aloo Bhujia, a classic Indian snack.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Haldirams", "attributes": [{label: "Main Ingredient", value: "Potato & Gram Flour"}, {label: "Pack Size", value: "200g"}] },
  // Dry Fruits
  { "id": "h3", "name": "Whole Farm Grocery Raisins", "category": "Dry Fruits", "brand": "Whole Farm", "weight": "200 g", "price": "₹88", "oldPrice": "₹200", "discount": "56% OFF", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Raisins+Main"], "tags": ["dry fruit", "raisins", "kishmish"], "description": "Sweet and nutritious raisins from Whole Farm Grocery, perfect for snacking.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=WF", "attributes": [{label: "Type", value: "Seedless"}, {label: "Added Sugar", value: "No"}] },
  { "id": "df2", "name": "Happilo Premium Almonds / Badam", "category": "Dry Fruits", "brand": "Happilo", "weight": "250 g", "price": "₹250", "oldPrice": "₹350", "discount": "28% OFF", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Almonds+Main"], "tags": ["dry fruit", "almonds", "badam"], "description": "High-quality California almonds, rich in nutrients.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Happilo", "attributes": [{label: "Variety", value: "California"}, {label: "Form", value: "Whole"}] },
  { "id": "df3", "name": "Nutraj Cashews / Kaju", "category": "Dry Fruits", "brand": "Nutraj", "weight": "200 g", "price": "₹220", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Cashews+Main"], "tags": ["dry fruit", "cashews", "kaju"], "description": "Creamy and delicious whole cashews.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Nutraj", "attributes": [{label: "Grade", value: "W320"}, {label: "Form", value: "Whole"}] },
  { "id": "df4", "name": "Lion Dates - Seedless", "category": "Dry Fruits", "brand": "Lion", "weight": "500 g", "price": "₹180", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Dates+Main"], "tags": ["dry fruit", "dates", "khajur"], "description": "Soft and sweet seedless dates.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Lion", "attributes": [{label: "Type", value: "Seedless"}, {label: "Origin", value: "Oman"}] },
  // Vegetables & Fruits
  { "id": "d1", "name": "Sweet Corn - Packet", "category": "Vegetables & Fruits", "brand": "Local", "weight": "(180-200) g", "price": "₹20", "oldPrice": "₹45", "discount": "56% OFF", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Corn+Main"], "tags": ["vegetable", "corn", "sweet corn"], "description": "Fresh and sweet corn kernels, ready to cook or eat.", "brandLogoUrl": undefined, "attributes": [{label: "Form", value: "Kernels"}, {label: "Packaging", value: "Packet"}] },
  { "id": "vf2", "name": "Onion / Pyaz", "category": "Vegetables & Fruits", "brand": "Local", "weight": "1 kg", "price": "₹40", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Onion+Main"], "tags": ["vegetable", "onion", "pyaz"], "description": "Fresh farm onions for everyday cooking.", "brandLogoUrl": undefined, "attributes": [{label: "Type", value: "Red Onion"}, {label: "Origin", value: "Nashik"}] },
  { "id": "vf3", "name": "Tomato / Tamatar", "category": "Vegetables & Fruits", "brand": "Local", "weight": "500 g", "price": "₹25", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Tomato+Main"], "tags": ["vegetable", "tomato", "tamatar"], "description": "Juicy red tomatoes, perfect for salads and curries.", "brandLogoUrl": undefined, "attributes": [{label: "Type", value: "Hybrid"}, {label: "Firmness", value: "Firm"}] },
  { "id": "vf4", "name": "Potato / Aloo", "category": "Vegetables & Fruits", "brand": "Local", "weight": "1 kg", "price": "₹30", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Potato+Main"], "tags": ["vegetable", "potato", "aloo"], "description": "Versatile potatoes for all your culinary needs.", "brandLogoUrl": undefined, "attributes": [{label: "Type", value: "Indori"}, {label: "Usage", value: "Curry/Fries"}] },
  { "id": "d2", "name": "Kiran Watermelon (Tarbuj)", "category": "Vegetables & Fruits", "brand": "Kiran", "weight": "1 piece", "price": "₹80", "oldPrice": "₹100", "discount": "23% OFF", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Watermelon+Main"], "tags": ["fruit", "watermelon", "tarbuj"], "description": "Juicy and refreshing Kiran watermelon, perfect for hot days.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Kiran", "attributes": [{label: "Variety", value: "Kiran"}, {label: "Origin", value: "India"}] },
  { "id": "d3", "name": "Baby Banana", "category": "Vegetables & Fruits", "brand": "Local", "weight": "4 pieces", "price": "₹30", "oldPrice": "₹35", "discount": "21% OFF", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Banana+Main"], "tags": ["fruit", "banana", "baby banana"], "description": "Small, sweet, and convenient baby bananas.", "brandLogoUrl": undefined, "attributes": [{label: "Pack Size", value: "4 Pieces"}, {label: "Ripeness", value: "Ripe"}] },
  { "id": "vf5", "name": "Royal Gala Apple", "category": "Vegetables & Fruits", "brand": "Imported", "weight": "4 pieces (approx. 500g)", "price": "₹120", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Apple+Main"], "tags": ["fruit", "apple", "gala"], "description": "Crisp and sweet Royal Gala apples.", "brandLogoUrl": undefined, "attributes": [{label: "Variety", value: "Royal Gala"}, {label: "Origin", value: "USA"}] },
  { "id": "vf6", "name": "Fresh Pomegranate / Anar", "category": "Vegetables & Fruits", "brand": "Local", "weight": "2 pieces (approx. 400g)", "price": "₹90", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Pomegranate+Main"], "tags": ["fruit", "pomegranate", "anar"], "description": "Juicy pomegranate with rich red arils.", "brandLogoUrl": undefined, "attributes": [{label: "Variety", value: "Bhagwa"}, {label: "Condition", value: "Fresh"}] },
  // Dairy & Breakfast
  { "id": "p1", "name": "Amul Gold Milk", "category": "Dairy & Breakfast", "brand": "Amul", "weight": "1 Litre", "price": "₹70", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Milk+Main"], "tags": ["dairy", "milk", "amul gold"], "description": "Amul Gold homogenized standardized milk, rich and creamy.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Amul", "attributes": [{label: "Type", value: "Standardized"}, {label: "Fat Content", value: "4.5%"}] },
  { "id": "p2", "name": "Britannia Brown Bread", "category": "Dairy & Breakfast", "brand": "Britannia", "weight": "400g", "price": "₹50", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Bread+Main"], "tags": ["bakery", "bread", "brown bread"], "description": "Healthy and wholesome brown bread from Britannia.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Britannia", "attributes": [{label: "Type", value: "Brown Bread"}, {label: "Main Ingredient", value: "Whole Wheat"}] },
  { "id": "db3", "name": "Nestle a+ Curd / Dahi", "category": "Dairy & Breakfast", "brand": "Nestle", "weight": "400g", "price": "₹45", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Curd+Main"], "tags": ["dairy", "curd", "dahi", "yogurt"], "description": "Thick and creamy curd from Nestle.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Nestle", "attributes": [{label: "Type", value: "Probiotic"}, {label: "Container", value: "Cup"}] },
  { "id": "db4", "name": "Kellogg's Corn Flakes Original", "category": "Dairy & Breakfast", "brand": "Kellogg's", "weight": "300g", "price": "₹150", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=CornFlakes+Main"], "tags": ["breakfast", "cereal", "corn flakes"], "description": "Classic Kellogg's Corn Flakes for a nutritious start to your day.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Kelloggs", "attributes": [{label: "Variant", value: "Original"}, {label: "Source", value: "Corn"}] },
  // Cold Drinks & Juices
  { "id": "p4", "name": "Coca-Cola Can", "category": "Cold Drinks & Juices", "brand": "Coca-Cola", "weight": "300ml", "price": "₹40", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Coke+Main"], "tags": ["beverage", "coke", "soda", "cold drink"], "description": "Refreshing Coca-Cola, the perfect thirst quencher.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Coke", "attributes": [{label: "Variant", value: "Can"}, {label: "Volume", value: "300ml"}] },
  { "id": "cd2", "name": "Real Fruit Power Mixed Fruit Juice", "category": "Cold Drinks & Juices", "brand": "Real", "weight": "1 Litre", "price": "₹110", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=RealJuice+Main"], "tags": ["juice", "mixed fruit", "real", "beverage"], "description": "Delicious and healthy mixed fruit juice with no added preservatives.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Real", "attributes": [{label: "Type", value: "Fruit Juice"}, {label: "Flavor", value: "Mixed Fruit"}] },
  { "id": "cd3", "name": "Pepsi Black Can - Zero Sugar", "category": "Cold Drinks & Juices", "brand": "Pepsi", "weight": "300ml", "price": "₹35", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=PepsiBlack+Main"], "tags": ["beverage", "pepsi", "soda", "zero sugar"], "description": "Bold taste of Pepsi with zero sugar.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Pepsi", "attributes": [{label: "Variant", value: "Zero Sugar Can"}, {label: "Volume", value: "300ml"}] },
  { "id": "cd4", "name": "Paper Boat Aamras Juice", "category": "Cold Drinks & Juices", "brand": "Paper Boat", "weight": "200ml", "price": "₹30", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Aamras+Main"], "tags": ["juice", "mango", "aamras", "paper boat"], "description": "Traditional Indian mango drink, a taste of nostalgia.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=PaperBoat", "attributes": [{label: "Type", value: "Fruit Drink"}, {label: "Flavor", value: "Mango"}] },
  // Instant & Frozen Food
  { "id": "p5", "name": "Maggi 2-Minute Noodles", "category": "Instant & Frozen Food", "brand": "Maggi", "weight": "70g", "price": "₹14", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Maggi+Main"], "tags": ["instant food", "noodles", "maggi"], "description": "Your favorite Maggi noodles, ready in just 2 minutes!", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Maggi", "attributes": [{label: "Flavour", value: "Masala"}, {label: "Cooking Time", value: "2 Minutes"}] },
  { "id": "if2", "name": "McCain Smiles - Crispy Potato Snack", "category": "Instant & Frozen Food", "brand": "McCain", "weight": "415g", "price": "₹99", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=McCainSmiles+Main"], "tags": ["frozen food", "snacks", "potato", "mccain"], "description": "Fun and crispy potato smiles, perfect for kids and parties.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=McCain", "attributes": [{label: "Type", value: "Frozen Snack"}, {label: "Base", value: "Potato"}] },
  { "id": "if3", "name": "Safal Frozen Green Peas", "category": "Instant & Frozen Food", "brand": "Safal", "weight": "500g", "price": "₹70", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=SafalPeas+Main"], "tags": ["frozen food", "vegetables", "peas", "safal"], "description": "Freshly frozen green peas, ready to use in your favorite dishes.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Safal", "attributes": [{label: "Type", value: "Frozen Vegetable"}, {label: "Variety", value: "Green Peas"}] },
  { "id": "if4", "name": "Gits Ready to Eat Dal Makhani", "category": "Instant & Frozen Food", "brand": "Gits", "weight": "300g", "price": "₹120", "deliveryTime": "8 MINS", "placeholderImages": ["https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=GitsDal+Main"], "tags": ["instant food", "ready to eat", "dal makhani", "gits"], "description": "Authentic Dal Makhani, just heat and eat.", "brandLogoUrl": "https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Gits", "attributes": [{label: "Type", value: "Ready to Eat Meal"}, {label: "Cuisine", value: "Indian"}] }
];

// Products with existing images
const productIdsWithImages = new Set(['h1', 'h2', 'h3', 'd1', 'd2', 'd3', 'p1', 'p2', 'p3', 'p4', 'p5']);

// Filter missing products
const missingProducts = rawProductsData.filter(p => !productIdsWithImages.has(p.id));

// Download image function
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, response => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`Failed to get '${url}' (${response.statusCode})`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', err => {
      if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      reject(err);
    });
  });
}

// Sleep function for rate limiting
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Main function
async function main() {
  console.log(`Found ${missingProducts.length} products missing images.`);
  const generatedImages = [];

  for (const product of missingProducts) {
    console.log(`Generating images for ${product.name}...`);
    const { imageFileNames, prompts } = generateProductImageAssets(product, product.placeholderImages);
    for (let i = 0; i < prompts.length; i++) {
      const prompt = prompts[i];
      const imageFileName = imageFileNames[i];
      const encodedPrompt = encodeURIComponent(prompt);
      const url = `${BASE_URL}/${encodedPrompt}?width=300&height=300&nologo=true`;
      const filepath = path.join(OUTPUT_DIR, imageFileName);

      if (fs.existsSync(filepath)) {
        console.log(`Image already exists: ${imageFileName}`);
      } else {
        try {
          await downloadImage(url, filepath);
          console.log(`Downloaded ${imageFileName}`);
          generatedImages.push(imageFileName);
        } catch (error) {
          console.error(`Failed to download ${imageFileName}: ${error.message}`);
        }
        await sleep(1000); // 1-second delay
      }
    }
  }

  console.log(`Generated ${generatedImages.length} images.`);
  if (generatedImages.length > 0) {
    console.log('Add the following lines to imagemap.ts under productImages:');
    generatedImages.forEach(imageFileName => {
      console.log(`  '${imageFileName}': require('@/assets/generated_images/products/${imageFileName}'),`);
    });
  }
}

// Run the script
main().catch(err => console.error('Error:', err));