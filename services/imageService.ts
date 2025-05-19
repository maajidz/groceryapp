import * as FileSystem from 'expo-file-system';
// Platform import might not be used here, can be removed if not needed elsewhere in this file.
// import { Platform } from 'react-native'; 

const POLLINATIONS_API_BASE_URL = 'https://image.pollinations.ai/prompt';
const CACHE_DIR_NAME = 'imageCache';
const imageCacheDir = `${FileSystem.cacheDirectory}${CACHE_DIR_NAME}/`;

// Helper function to ensure the cache directory exists
const ensureDirExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(imageCacheDir);
  if (!dirInfo.exists) {
    console.log('Image cache directory does not exist, creating...');
    await FileSystem.makeDirectoryAsync(imageCacheDir, { intermediates: true });
  }
};

// Generates a unique filename for caching based on an identifier
const getFilename = (identifier: string) => {
  const safeIdentifier = identifier.replace(/[^a-zA-Z0-9_]/g, '_');
  return `${safeIdentifier}.jpg`; // Assuming jpg. Pollinations might allow specifying format.
};

/**
 * Generates an identifier string for various entities.
 * @param type - 'product', 'category', 'banner', etc.
 * @param id - Main ID of the entity (e.g., product.id, category.name)
 * @param subId - Optional sub-identifier (e.g., image index for a product, specific banner variant)
 * @returns A unique string identifier.
 */
export const generateIdentifier = (type: string, id: string, subId?: string | number): string => {
  return `${type}_${id}${subId !== undefined ? '_' + subId : ''}`;
};

/**
 * Checks if an image for the given identifier exists in the local cache.
 * @param identifier - A unique string identifying the image.
 * @returns The local file URI if found, otherwise null.
 */
export const getLocalImageUri = async (identifier: string): Promise<string | null> => {
  await ensureDirExists();
  const filename = getFilename(identifier);
  const localUri = `${imageCacheDir}${filename}`;
  const fileInfo = await FileSystem.getInfoAsync(localUri);
  if (fileInfo.exists) {
    return localUri;
  }
  return null;
};

/**
 * Fetches an image from Pollinations API based on a prompt and caches it locally.
 * @param identifier - A unique string to identify and name the cached image.
 * @param prompt - The text prompt to send to the Pollinations API.
 * @param width - Optional width for the image.
 * @param height - Optional height for the image.
 * @returns The local file URI of the cached image, or null if fetching/caching fails.
 */
export const fetchAndCacheImage = async (
  identifier: string, 
  prompt: string, 
  width?: number, 
  height?: number
): Promise<string | null> => {
  await ensureDirExists();
  const filename = getFilename(identifier);
  const localUri = `${imageCacheDir}${filename}`;

  try {
    const encodedPrompt = encodeURIComponent(prompt);
    let remoteUrl = `${POLLINATIONS_API_BASE_URL}/${encodedPrompt}`;
    
    // Append width and height if provided - using common query param names as placeholders
    // These parameter names (width, height) are educated guesses. Replace with actual API params from APIDOCS.md.
    const queryParams = new URLSearchParams();
    if (width) queryParams.append('width', width.toString());
    if (height) queryParams.append('height', height.toString());
    // Example for other potential params: if (seed) queryParams.append('seed', seed.toString());
    
    const queryString = queryParams.toString();
    if (queryString) {
      remoteUrl += `?${queryString}`;
    }
    
    console.log(`Fetching image from Pollinations: ${remoteUrl}`);

    const downloadResult = await FileSystem.downloadAsync(remoteUrl, localUri);

    if (downloadResult.status === 200) {
      console.log(`Image cached successfully: ${localUri}`);
      return downloadResult.uri;
    } else {
      console.error(`Failed to download image. Status: ${downloadResult.status}, Message: ${downloadResult.headers?.['X-Error-Message'] || 'No error message header.'} URI: ${remoteUrl}`);
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(localUri);
      }
      return null;
    }
  } catch (error) {
    console.error(`Error fetching or caching image for prompt "${prompt}":`, error);
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    if (fileInfo.exists) {
      await FileSystem.deleteAsync(localUri);
    }
    return null;
  }
};

/**
 * Ensures an image is available, either from cache or by fetching and caching it.
 * @param type - Type of the entity (e.g., 'product', 'category').
 * @param id - Main ID of the entity.
 * @param prompt - Text prompt for image generation if not cached.
 * @param subId - Optional sub-identifier.
 * @param width - Optional width for the image.
 * @param height - Optional height for the image.
 * @param fallbackImageUrl - Optional fallback URL if everything fails.
 * @returns The local image URI or a fallback URL.
 */
export const ensureImage = async (
  type: string, 
  id: string, 
  prompt: string, 
  subId?: string | number,
  width?: number,
  height?: number,
  fallbackImageUrl?: string
): Promise<string | undefined> => {
  const identifier = generateIdentifier(type, id, subId);
  let localUri = await getLocalImageUri(identifier);

  if (!localUri) {
    console.log(`Image for ${identifier} (w:${width},h:${height}) not in cache. Fetching...`);
    localUri = await fetchAndCacheImage(identifier, prompt, width, height);
  } else {
    console.log(`Image for ${identifier} found in cache: ${localUri}`);
  }

  return localUri || fallbackImageUrl;
};

/**
 * Clears the entire image cache directory.
 */
export const clearImageCache = async () => {
  await ensureDirExists();
  console.log(`Clearing image cache at ${imageCacheDir}`);
  await FileSystem.deleteAsync(imageCacheDir, { idempotent: true });
  await ensureDirExists();
  console.log('Image cache cleared and directory recreated.');
}; 