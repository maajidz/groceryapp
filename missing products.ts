import axios from 'axios';
import fs from 'fs';
import path from 'path';

// List of missing products
const missingProducts = [
  { id: "sp2", name: "Everest Turmeric Powder / Haldi" },
  { id: "sp3", name: "Tata Sampann Coriander Powder / Dhania" },
  { id: "sp4", name: "MDH Garam Masala" },
  { id: "mu2", name: "Kurkure Masala Munch" },
  { id: "mu3", name: "Haldiram's Aloo Bhujia" },
  { id: "df2", name: "Happilo Premium Almonds / Badam" },
  { id: "df3", name: "Nutraj Cashews / Kaju" },
  { id: "df4", name: "Lion Dates - Seedless" },
  { id: "vf2", name: "Onion / Pyaz" },
  { id: "vf3", name: "Tomato / Tamatar" },
  { id: "vf4", name: "Potato / Aloo" },
  { id: "vf5", name: "Royal Gala Apple" },
  { id: "vf6", name: "Fresh Pomegranate / Anar" },
  { id: "db3", name: "Nestle a+ Curd / Dahi" },
  { id: "db4", name: "Kellogg's Corn Flakes Original" },
  { id: "cd2", name: "Real Fruit Power Mixed Fruit Juice" },
  { id: "cd3", name: "Pepsi Black Can - Zero Sugar" },
  { id: "cd4", name: "Paper Boat Aamras Juice" },
  { id: "if2", name: "McCain Smiles - Crispy Potato Snack" },
  { id: "if3", name: "Safal Frozen Green Peas" },
  { id: "if4", name: "Gits Ready to Eat Dal Makhani" }
];

// Output directory
const outputDir = './assets/generated_images/products';

// Ensure the output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to generate and save images
async function generateImages() {
  for (const product of missingProducts) {
    const prompt = `A product image of ${product.name} on a white background`;
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=300&height=300&nologo=true`;

    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const filePath = path.join(outputDir, `product_${product.id}_0.png`);
      fs.writeFileSync(filePath, Buffer.from(response.data));
      console.log(`Generated image for ${product.id}: ${filePath}`);
    } catch (error) {
      console.error(`Failed to generate image for ${product.id}:`, error);
    }
  }
}

// Run the image generation process
generateImages();