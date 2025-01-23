import ColorThief from 'colorthief';

// Convert RGB array to hex color
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Extract dominant colors from an image URL
export async function extractColors(imageUrl: string, colorCount: number = 5): Promise<string[]> {
  try {
    // Create a new image element
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    // Wait for the image to load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = imageUrl;
    });

    // Create a canvas element to draw the image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Extract colors using ColorThief
    const colorThief = new ColorThief();
    const palette = colorThief.getPalette(img, colorCount);

    // Convert RGB arrays to hex colors
    return palette.map(([r, g, b]) => rgbToHex(r, g, b));
  } catch (error) {
    console.error('Error extracting colors:', error);
    return [];
  }
}
