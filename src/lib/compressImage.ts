export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 - 1
}

/**
 * Compress an image file in the browser using a canvas.
 * Returns a base64 data-URL string (JPEG by default).
 */
export const compressImage = (
  file: File,
  { maxWidth = 1024, maxHeight = 1024, quality = 0.8 }: CompressOptions = {}
): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!window.FileReader) {
      // Browser doesn’t support compression fallback – just return original file as data URL
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        const aspectRatio = width / height;

        // Resize proportionally if the image exceeds max dimensions
        if (width > maxWidth || height > maxHeight) {
          if (aspectRatio > 1) {
            // Landscape
            width = maxWidth;
            height = Math.round(maxWidth / aspectRatio);
          } else {
            // Portrait or square
            height = maxHeight;
            width = Math.round(maxHeight * aspectRatio);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG; quality between 0 (worst) and 1 (best)
        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}; 