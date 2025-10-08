import { Artwork } from '../types';
import { normalizeTags } from './tags';

interface GalleryShareOptions {
  width?: number;
  paddingX?: number;
  paddingY?: number;
  background?: string;
  panelColor?: string;
  accentColor?: string;
  title?: string;
  subtitle?: string;
}

const DEFAULT_OPTIONS: Required<Omit<GalleryShareOptions, 'title' | 'subtitle'>> = {
  width: 1080,
  paddingX: 64,
  paddingY: 80,
  background: '#0f172a',
  panelColor: 'rgba(15, 23, 42, 0.75)',
  accentColor: '#38bdf8'
};

const wrapText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number => {
  const words = text.split(/\s+/);
  let line = '';
  let currentY = y;

  for (let i = 0; i < words.length; i += 1) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    const { width } = ctx.measureText(testLine);
    if (width > maxWidth && line) {
      ctx.fillText(line, x, currentY);
      line = words[i];
      currentY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) {
    ctx.fillText(line, x, currentY);
    currentY += lineHeight;
  }

  return currentY;
};

const normalizeImageUrl = (url: string): string => {
  if (!url) return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol === 'http:') {
      parsed.protocol = 'https:';
    }
    return parsed.toString();
  } catch {
    if (url.startsWith('http://')) {
      return `https://${url.slice('http://'.length)}`;
    }
    return url;
  }
};

const loadImageElement = async (originalUrl: string): Promise<HTMLImageElement | null> => {
  const url = normalizeImageUrl(originalUrl);
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error('Failed to fetch image');
    }
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(img);
      };
      img.onerror = (error) => {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      };
      img.src = objectUrl;
    });
  } catch (error) {
    console.warn('Failed to load image for sharing', error);
    return null;
  }
};

export const generateGalleryShareImage = async (
  artworks: Artwork[],
  opts: GalleryShareOptions = {}
): Promise<Blob> => {
  if (typeof window === 'undefined') {
    throw new Error('Gallery share is only available in the browser');
  }

  if (!artworks.length) {
    throw new Error('No artworks to share');
  }

  const options = { ...DEFAULT_OPTIONS, ...opts };
  const width = options.width;
  const paddingX = options.paddingX;
  const paddingY = options.paddingY;
  const cardSpacing = 36;
  const headerHeight = 140;
  const cardHeight = 240;
  const imageSize = 200;
  const textOffset = 32;
  const canvasHeight =
    paddingY * 2 +
    headerHeight +
    artworks.length * (cardHeight + cardSpacing) -
    cardSpacing;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }

  // Background
  ctx.fillStyle = options.background;
  ctx.fillRect(0, 0, width, canvasHeight);

  // Header
  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 54px "Inter", "Helvetica Neue", Arial, sans-serif';
  ctx.fillText(options.title ?? 'History in Art — Gallery', paddingX, paddingY + 40);

  ctx.font = '400 28px "Inter", "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#cbd5f5';
  const subtitle =
    options.subtitle ??
    `${artworks.length} selected ${artworks.length === 1 ? 'artwork' : 'artworks'}`;
  ctx.fillText(subtitle, paddingX, paddingY + 90);

  // Draw cards
  ctx.textBaseline = 'top';

  for (let index = 0; index < artworks.length; index += 1) {
    const artwork = artworks[index];
    const top =
      paddingY + headerHeight + index * (cardHeight + cardSpacing);
    const left = paddingX;
    const rightContentWidth =
      width - paddingX * 2 - imageSize - textOffset;

    // Panel background
    ctx.fillStyle = options.panelColor;
    const radius = 24;
    const panelWidth = width - paddingX * 2;

    ctx.beginPath();
    ctx.moveTo(left + radius, top);
    ctx.lineTo(left + panelWidth - radius, top);
    ctx.quadraticCurveTo(left + panelWidth, top, left + panelWidth, top + radius);
    ctx.lineTo(left + panelWidth, top + cardHeight - radius);
    ctx.quadraticCurveTo(
      left + panelWidth,
      top + cardHeight,
      left + panelWidth - radius,
      top + cardHeight
    );
    ctx.lineTo(left + radius, top + cardHeight);
    ctx.quadraticCurveTo(left, top + cardHeight, left, top + cardHeight - radius);
    ctx.lineTo(left, top + radius);
    ctx.quadraticCurveTo(left, top, left + radius, top);
    ctx.closePath();
    ctx.fill();

    // Artwork image
    const imageX = left + 24;
    const imageY = top + (cardHeight - imageSize) / 2;
    const image = artwork.imageUrl ? await loadImageElement(artwork.imageUrl) : null;

    if (image) {
      const scale = Math.min(imageSize / image.width, imageSize / image.height);
      const drawWidth = image.width * scale;
      const drawHeight = image.height * scale;
      const offsetX = imageX + (imageSize - drawWidth) / 2;
      const offsetY = imageY + (imageSize - drawHeight) / 2;

      ctx.save();
      ctx.beginPath();
      ctx.rect(imageX, imageY, imageSize, imageSize);
      ctx.clip();
      ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
      ctx.restore();
    } else {
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(imageX, imageY, imageSize, imageSize);
      ctx.fillStyle = '#64748b';
      ctx.font = '500 18px "Inter", "Helvetica Neue", Arial, sans-serif';
      ctx.fillText('Image unavailable', imageX + 20, imageY + imageSize / 2 - 10);
    }

    const textX = imageX + imageSize + textOffset;
    let currentY = top + 36;

    ctx.fillStyle = '#f8fafc';
    ctx.font = '700 30px "Inter", "Helvetica Neue", Arial, sans-serif';
    currentY = wrapText(ctx, artwork.title, textX, currentY, rightContentWidth, 36);

    ctx.fillStyle = options.accentColor;
    ctx.font = '600 22px "Inter", "Helvetica Neue", Arial, sans-serif';
    const metaParts = [
      artwork.artist,
      artwork.year ? artwork.year.toString() : undefined,
      artwork.location?.country
    ].filter(Boolean);
    if (metaParts.length) {
      ctx.fillText(metaParts.join(' • '), textX, currentY);
      currentY += 32;
    }

    ctx.fillStyle = '#cbd5f5';
    ctx.font = '400 20px "Inter", "Helvetica Neue", Arial, sans-serif';
    const description = artwork.description?.trim()
      ? artwork.description
      : 'No description provided.';
    currentY = wrapText(ctx, description, textX, currentY, rightContentWidth, 28);

    const tags = normalizeTags(artwork.tags);

    if (tags.length) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '500 18px "Inter", "Helvetica Neue", Arial, sans-serif';
      const tagText = tags.slice(0, 6).join(' · ');
      ctx.fillText(tagText, textX, currentY);
    }
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error('Failed to convert canvas to Blob'));
      }
    }, 'image/png', 0.95);
  });

  return blob;
};
