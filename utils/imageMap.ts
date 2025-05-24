/**
 * Image Map for local static assets.
 * This allows React Native's Metro bundler to correctly include images
 * when their paths are determined dynamically in the code.
 */

// It is crucial that the paths in require() are static strings.

export const categoryImages = {
  "cat_veg_fruits.png": require("@/assets/generated_images/categories/cat_veg_fruits.png"),
  "cat_dairy_breakfast.png": require("@/assets/generated_images/categories/cat_dairy_breakfast.png"),
  "cat_munchies.png": require("@/assets/generated_images/categories/cat_munchies.png"),
  "cat_drinks_juices.png": require("@/assets/generated_images/categories/cat_drinks_juices.png"),
  "cat_instant_frozen.png": require("@/assets/generated_images/categories/cat_instant_frozen.png"),
  "cat_spices.png": require("@/assets/generated_images/categories/cat_spices.png"),
};

export const bannerImages = {
  "main_banner.png": require("@/assets/generated_images/banners/main_banner.png"),
};

export const productImages = {
  // Product: h1 - Catch Cumin Seeds / Jeera Seeds
  "product_h1_0.png": require("@/assets/generated_images/products/product_h1_0.png"),
  "product_h1_1.png": require("@/assets/generated_images/products/product_h1_1.png"),
  // Product: h2 - Whole Farm Grocery Makhana
  "product_h2_0.png": require("@/assets/generated_images/products/product_h2_0.png"),
  // Product: h3 - Whole Farm Grocery Raisins
  "product_h3_0.png": require("@/assets/generated_images/products/product_h3_0.png"),
  // Product: d1 - Sweet Corn - Packet
  "product_d1_0.png": require("@/assets/generated_images/products/product_d1_0.png"),
  // Product: d2 - Kiran Watermelon (Tarbuj)
  "product_d2_0.png": require("@/assets/generated_images/products/product_d2_0.png"),
  // Product: d3 - Baby Banana
  "product_d3_0.png": require("@/assets/generated_images/products/product_d3_0.png"),
  // Product: p1 - Amul Gold Milk
  "product_p1_0.png": require("@/assets/generated_images/products/product_p1_0.png"),
  // Product: p2 - Britannia Brown Bread
  "product_p2_0.png": require("@/assets/generated_images/products/product_p2_0.png"),
  // Product: p3 - Lays Classic Salted Chips
  "product_p3_0.png": require("@/assets/generated_images/products/product_p3_0.png"),
  // Product: p4 - Coca-Cola Can
  "product_p4_0.png": require("@/assets/generated_images/products/product_p4_0.png"),
  // Product: p5 - Maggi 2-Minute Noodles
  "product_p5_0.png": require("@/assets/generated_images/products/product_p5_0.png"),
  // Add more product images here as they are generated and added to data/products.ts
  "product_sp3_0.png": require("@/assets/generated_images/products/product_sp3_0.png"),
  "product_sp4_0.png": require("@/assets/generated_images/products/product_sp4_0.png"),
  "product_mu2_0.png": require("@/assets/generated_images/products/product_mu2_0.png"),
  "product_mu3_0.png": require("@/assets/generated_images/products/product_mu3_0.png"),
  "product_df2_0.png": require("@/assets/generated_images/products/product_df2_0.png"),
  "product_df3_0.png": require("@/assets/generated_images/products/product_df3_0.png"),
  "product_df4_0.png": require("@/assets/generated_images/products/product_df4_0.png"),
  "product_vf2_0.png": require("@/assets/generated_images/products/product_vf2_0.png"),
  "product_cd2_0.png": require("@/assets/generated_images/products/product_cd2_0.png"),
  "product_cd3_0.png": require("@/assets/generated_images/products/product_cd3_0.png"),
  "product_cd4_0.png": require("@/assets/generated_images/products/product_cd4_0.png"),
  "product_if2_0.png": require("@/assets/generated_images/products/product_if2_0.png"),
  "product_if3_0.png": require("@/assets/generated_images/products/product_if3_0.png"),
  "product_if4_0.png": require("@/assets/generated_images/products/product_if4_0.png"),
};

// Helper type for safety, can be expanded
export type CategoryImageKeys = keyof typeof categoryImages;
export type BannerImageKeys = keyof typeof bannerImages;
export type ProductImageKeys = keyof typeof productImages;

// You might want to combine them or keep them separate based on usage.
// Example of a combined map (optional):
// export const allLocalImages = {
//   ...categoryImages,
//   ...bannerImages,
//   ...productImages,
// };
