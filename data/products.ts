export type Product = {
  id: string;
  name: string;
  category: string;
  brand: string;
  weight: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  deliveryTime: string;
  images: string[];
  tags: string[];
  description?: string;
  brandLogoUrl?: string;
  attributes?: Array<{ label: string; value: string }>;
};

export const allProducts: Product[] = [
  { id: 'h1', name: 'Catch Cumin Seeds / Jeera Seeds', category: 'Spices', brand: 'Catch', weight: '100 g', price: '₹49', oldPrice: '₹65', discount: '24% OFF', deliveryTime: '8 MINS', images: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Cumin+Main`, `https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Cumin+Side`], tags: ['spice', 'cumin', 'jeera', 'masala'], description: 'Premium quality cumin seeds by Catch for authentic Indian flavors.', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Catch`, attributes: [{label: 'Form', value: 'Seeds'}, {label: 'Organic', value: 'No'}] },
  { id: 'h2', name: 'Whole Farm Grocery Makhana', category: 'Snacks', brand: 'Whole Farm', weight: '100 g', price: '₹159', oldPrice: '₹210', discount: '24% OFF', deliveryTime: '8 MINS', images: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Makhana+Main`], tags: ['snack', 'makhana', 'fox nuts', 'healthy'], description: 'Healthy and delicious Makhana (fox nuts) from Whole Farm Grocery.', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=WF`, attributes: [{label: 'Pack Size', value: '100g Pouch'}, {label: 'Diet Type', value: 'Vegetarian'}] },
  { id: 'h3', name: 'Whole Farm Grocery Raisins', category: 'Dry Fruits', brand: 'Whole Farm', weight: '200 g', price: '₹88', oldPrice: '₹200', discount: '56% OFF', deliveryTime: '8 MINS', images: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Raisins+Main`], tags: ['dry fruit', 'raisins', 'kishmish'], description: 'Sweet and nutritious raisins from Whole Farm Grocery, perfect for snacking.', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=WF`, attributes: [{label: 'Type', value: 'Seedless'}, {label: 'Added Sugar', value: 'No'}] },
  { id: 'd1', name: 'Sweet Corn - Packet', category: 'Vegetables', brand: 'Local', weight: '(180-200) g', price: '₹20', oldPrice: '₹45', discount: '56% OFF', deliveryTime: '8 MINS', images: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Corn+Main`], tags: ['vegetable', 'corn', 'sweet corn'], description: 'Fresh and sweet corn kernels, ready to cook or eat.', brandLogoUrl: undefined, attributes: [{label: 'Form', value: 'Kernels'}, {label: 'Packaging', value: 'Packet'}] },
  { id: 'd2', name: 'Kiran Watermelon (Tarbuj)', category: 'Fruits', brand: 'Kiran', weight: '1 piece', price: '₹80', oldPrice: '₹100', discount: '23% OFF', deliveryTime: '8 MINS', images: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Watermelon+Main`], tags: ['fruit', 'watermelon', 'tarbuj'], description: 'Juicy and refreshing Kiran watermelon, perfect for hot days.', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Kiran`, attributes: [{label: 'Variety', value: 'Kiran'}, {label: 'Origin', value: 'India'}] },
  { id: 'd3', name: 'Baby Banana', category: 'Fruits', brand: 'Local', weight: '4 pieces', price: '₹30', oldPrice: '₹35', discount: '21% OFF', deliveryTime: '8 MINS', images: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Banana+Main`], tags: ['fruit', 'banana', 'baby banana'], description: 'Small, sweet, and convenient baby bananas.', brandLogoUrl: undefined, attributes: [{label: 'Pack Size', value: '4 Pieces'}, {label: 'Ripeness', value: 'Ripe'}] },
  { id: 'p1', name: 'Amul Gold Milk', category: 'Dairy & Breakfast', brand: 'Amul', weight: '1 Litre', price: '₹70', deliveryTime: '8 MINS', images: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Milk+Main`], tags: ['dairy', 'milk', 'amul gold'], description: 'Amul Gold homogenized standardized milk, rich and creamy.', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Amul`, attributes: [{label: 'Type', value: 'Standardized'}, {label: 'Fat Content', value: '4.5%'}] },
  { id: 'p2', name: 'Britannia Brown Bread', category: 'Dairy & Breakfast', brand: 'Britannia', weight: '400g', price: '₹50', deliveryTime: '8 MINS', images: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Bread+Main`], tags: ['bakery', 'bread', 'brown bread'], description: 'Healthy and wholesome brown bread from Britannia.', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Britannia`, attributes: [{label: 'Type', value: 'Brown Bread'}, {label: 'Main Ingredient', value: 'Whole Wheat'}] },
  { id: 'p3', name: 'Lays Classic Salted Chips', category: 'Munchies', brand: 'Lays', weight: '52g', price: '₹20', deliveryTime: '8 MINS', images: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Chips+Main`], tags: ['snack', 'chips', 'lays', 'potato'], description: 'The classic, crispy, and irresistible salted potato chips from Lay\'s.', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Lays`, attributes: [{label: 'Flavour', value: 'Classic Salted'}, {label: 'Net Quantity', value: '52g'}] },
  { id: 'p4', name: 'Coca-Cola Can', category: 'Cold Drinks & Juices', brand: 'Coca-Cola', weight: '300ml', price: '₹40', deliveryTime: '8 MINS', images: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Coke+Main`], tags: ['beverage', 'coke', 'soda', 'cold drink'], description: 'Refreshing Coca-Cola, the perfect thirst quencher.', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Coke`, attributes: [{label: 'Variant', value: 'Can'}, {label: 'Volume', value: '300ml'}] },
  { id: 'p5', name: 'Maggi 2-Minute Noodles', category: 'Instant & Frozen Food', brand: 'Maggi', weight: '70g', price: '₹14', deliveryTime: '8 MINS', images: [`https://via.placeholder.com/300x300.png/EFEFEF/AAAAAA&text=Maggi+Main`], tags: ['instant food', 'noodles', 'maggi'], description: 'Your favorite Maggi noodles, ready in just 2 minutes!', brandLogoUrl: `https://via.placeholder.com/40x40.png/EFEFEF/AAAAAA&text=Maggi`, attributes: [{label: 'Flavour', value: 'Masala'}, {label: 'Cooking Time', value: '2 Minutes'}] },
];

import { ensureImage } from '@/services/imageService';

// New type that includes the URIs for locally cached/generated images
export type ProductWithLocalImages = Product & {
  localImages: (string | undefined)[]; // Array of local file URIs or undefined if an image failed
};

/**
 * Hydrates a single product with local image URIs using the imageService.
 * @param product The original product object.
 * @param imageWidth Optional width for the main product images.
 * @param imageHeight Optional height for the main product images.
 * @returns The product object augmented with localImage URIs.
 */
export async function hydrateProductWithLocalImages(
  product: Product, 
  imageWidth: number = 400, // Default width for product images
  imageHeight: number = 400 // Default height for product images
): Promise<ProductWithLocalImages> {
  const localImagesPromises = product.images.map((originalImageUrl, index) => {
    // Create a descriptive prompt for Pollinations
    let prompt = `Commercial product photo of ${product.name}, brand: ${product.brand}, category: ${product.category}, detailed, high quality, studio lighting`;
    if (product.images.length > 1) {
      if (index === 0) prompt += ', main front view';
      else if (index === 1) prompt += ', alternative angle view';
      else prompt += `, additional view ${index + 1}`;
    }
    if (product.description) prompt += `, ${product.description.substring(0, 50)}...`; // Add a bit of description

    return ensureImage(
      'product',          // type
      product.id,         // id
      prompt,             // prompt
      index,              // subId (for multiple images of the same product)
      imageWidth,         // width
      imageHeight,        // height
      originalImageUrl    // fallbackImageUrl (original placeholder or actual URL)
    );
  });

  const resolvedLocalImages = await Promise.all(localImagesPromises);
  return { ...product, localImages: resolvedLocalImages };
}

/**
 * Fetches all products and hydrates them with local image URIs.
 * @param imageWidth Optional width for the main product images.
 * @param imageHeight Optional height for the main product images.
 * @returns A promise that resolves to an array of products with localImage URIs.
 */
export async function getAllProductsWithLocalImages(
  imageWidth?: number, 
  imageHeight?: number
): Promise<ProductWithLocalImages[]> {
  // Note: allProducts is the existing array of Product objects
  const hydratedProductsPromises = allProducts.map(p => 
    hydrateProductWithLocalImages(p, imageWidth, imageHeight)
  );
  return Promise.all(hydratedProductsPromises);
}

/**
 * Fetches a single product by ID and hydrates it with local image URIs.
 * @param id The ID of the product to fetch.
 * @param imageWidth Optional width for the main product images.
 * @param imageHeight Optional height for the main product images.
 * @returns A promise that resolves to the product with localImage URIs, or undefined if not found.
 */
export async function getProductByIdWithLocalImages(
  id: string, 
  imageWidth?: number, 
  imageHeight?: number
): Promise<ProductWithLocalImages | undefined> {
  const product = allProducts.find(p => p.id === id);
  if (product) {
    return hydrateProductWithLocalImages(product, imageWidth, imageHeight);
  }
  return undefined;
}