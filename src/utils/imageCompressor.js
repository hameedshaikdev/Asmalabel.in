/**
 * High-performance client-side image compressor.
 * Automatically resizes large camera/gallery photos (e.g. 5-15 MB raw PNG/JPEG)
 * to crisp, optimized WebP/JPEG format (< 120 KB) before uploading to Supabase.
 */

export async function compressImageFile(file, options = {}) {
  const {
    maxWidth = 1000,
    maxHeight = 1000,
    quality = 0.82,
    outputType = 'image/webp',
    fallbackType = 'image/jpeg'
  } = options;

  if (!file || !(file instanceof Blob)) {
    return file;
  }

  // If already small SVG or gif, return as is
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) {
          resolve(file); // Fallback
          return;
        }

        // Image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG if browser doesn't support WebP export
        const tryExport = (type) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                if (type === outputType && fallbackType) {
                  tryExport(fallbackType);
                } else {
                  resolve(file);
                }
                return;
              }

              // Create a replacement File with appropriate extension
              const ext = type === 'image/webp' ? '.webp' : '.jpg';
              const baseName = (file.name || 'image').replace(/\.[^/.]+$/, '');
              const compressedFile = new File([blob], `${baseName}${ext}`, {
                type,
                lastModified: Date.now()
              });

              resolve(compressedFile);
            },
            type,
            quality
          );
        };

        tryExport(outputType);
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
}
