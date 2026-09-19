import QRCode from 'qrcode';

export type LogoShape = 'circle' | 'square';

export interface QRLogoSettings {
  enabled: boolean;
  type: 'preset' | 'custom';
  presetId?: 'link' | 'globe' | 'sparkles' | 'shopping' | 'qr';
  customImage?: string; // base64 or image url
  bgColor: string;
  shape: LogoShape;
  sizePercent: number; // e.g. 22
  borderWidth: number; // e.g. 3
  borderColor: string;
}

// Preset definition
export interface LogoPreset {
  id: 'link' | 'globe' | 'sparkles' | 'shopping' | 'qr';
  label: string;
  defaultBg: string;
  svgIcon: string; // SVG path or inner content
}

// The Link preset precisely matches the user's provided green link icon
export const LOGO_PRESETS: LogoPreset[] = [
  {
    id: 'link',
    label: 'Link (Green)',
    defaultBg: '#059669', // Emerald/green
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
    </svg>`,
  },
  {
    id: 'globe',
    label: 'Website',
    defaultBg: '#2563eb', // Blue
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/>
      <path d="M2 12h20"/>
    </svg>`,
  },
  {
    id: 'sparkles',
    label: 'Special / Star',
    defaultBg: '#d97706', // Amber
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 3v3m0 12v3M3 12h3m12 0h3m-2.9-6.1-2.1 2.1m-8 8-2.1 2.1m0-12.2 2.1 2.1m8 8 2.1 2.1"/>
    </svg>`,
  },
  {
    id: 'shopping',
    label: 'Store / Shop',
    defaultBg: '#7c3aed', // Purple
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="8" cy="21" r="1"/>
      <circle cx="19" cy="21" r="1"/>
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
    </svg>`,
  },
  {
    id: 'qr',
    label: 'Scan Icon',
    defaultBg: '#0f172a', // Dark slate
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
      <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
      <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
      <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
      <rect x="7" y="7" width="10" height="10" rx="1"/>
    </svg>`,
  },
];

// Default settings matches the exact user screenshot: Green circle with white link icon
export const DEFAULT_LOGO_SETTINGS: QRLogoSettings = {
  enabled: true,
  type: 'preset',
  presetId: 'link',
  bgColor: '#059669', // Emerald green
  shape: 'circle',
  sizePercent: 22,
  borderWidth: 3,
  borderColor: '#ffffff',
};

// Cache loaded images to avoid reloading constantly
const imageCache = new Map<string, HTMLImageElement>();

function loadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache.has(src)) {
    const cached = imageCache.get(src)!;
    if (cached.complete && cached.naturalWidth !== 0) {
      return Promise.resolve(cached);
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Converts an SVG string into a data URL
 */
export function svgToDataUrl(svgString: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`;
}

/**
 * Gets image source for current logo settings
 */
export function getLogoSource(settings: QRLogoSettings): string | null {
  if (!settings.enabled) return null;

  if (settings.type === 'custom' && settings.customImage) {
    return settings.customImage;
  }

  const preset = LOGO_PRESETS.find((p) => p.id === (settings.presetId || 'link')) || LOGO_PRESETS[0];
  return svgToDataUrl(preset.svgIcon);
}

/**
 * Helper to draw a rounded rectangle on a 2D canvas context
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/**
 * Draws the logo badge on top of an already rendered QR canvas
 */
export async function drawLogoOnCanvas(
  canvas: HTMLCanvasElement,
  settings: QRLogoSettings
): Promise<void> {
  if (!settings.enabled) return;

  const src = getLogoSource(settings);
  if (!src) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const canvasWidth = canvas.width;
  const center = canvasWidth / 2;

  // Calculate logo dimensions proportional to canvas width
  const percent = Math.min(Math.max(settings.sizePercent || 22, 12), 32);
  const badgeSize = Math.round(canvasWidth * (percent / 100));
  const halfBadge = badgeSize / 2;

  // Scale border width relative to canvas size (based on default 220px size)
  const scale = canvasWidth / 220;
  const borderWidth = Math.max(2, Math.round((settings.borderWidth || 3) * scale));

  try {
    const img = await loadImage(src);

    ctx.save();

    // 1. Draw outer contrast border (usually clean white to separate logo from QR black squares)
    if (settings.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(center, center, halfBadge + borderWidth, 0, Math.PI * 2);
      ctx.fillStyle = settings.borderColor || '#ffffff';
      ctx.fill();

      // 2. Draw badge background
      ctx.beginPath();
      ctx.arc(center, center, halfBadge, 0, Math.PI * 2);
      ctx.fillStyle = settings.bgColor || '#059669';
      ctx.fill();

      // Clip inside badge for custom images
      ctx.beginPath();
      ctx.arc(center, center, halfBadge, 0, Math.PI * 2);
      ctx.clip();
    } else {
      const radius = Math.round(badgeSize * 0.22);
      // Outer border
      drawRoundedRect(
        ctx,
        center - halfBadge - borderWidth,
        center - halfBadge - borderWidth,
        badgeSize + borderWidth * 2,
        badgeSize + borderWidth * 2,
        radius + borderWidth
      );
      ctx.fillStyle = settings.borderColor || '#ffffff';
      ctx.fill();

      // Badge background
      drawRoundedRect(
        ctx,
        center - halfBadge,
        center - halfBadge,
        badgeSize,
        badgeSize,
        radius
      );
      ctx.fillStyle = settings.bgColor || '#059669';
      ctx.fill();

      // Clip inside badge
      drawRoundedRect(
        ctx,
        center - halfBadge,
        center - halfBadge,
        badgeSize,
        badgeSize,
        radius
      );
      ctx.clip();
    }

    // 3. Draw inner icon/image (preserving natural aspect ratio)
    const iconPadding = settings.type === 'preset' ? Math.round(badgeSize * 0.20) : Math.round(badgeSize * 0.12);
    const maxIconSize = badgeSize - iconPadding * 2;

    const naturalW = img.naturalWidth || 1;
    const naturalH = img.naturalHeight || 1;
    const aspect = naturalW / naturalH;

    let iconW = maxIconSize;
    let iconH = maxIconSize;
    if (aspect > 1) {
      iconH = maxIconSize / aspect;
    } else if (aspect < 1) {
      iconW = maxIconSize * aspect;
    }

    const iconX = center - iconW / 2;
    const iconY = center - iconH / 2;

    ctx.drawImage(img, iconX, iconY, iconW, iconH);

    ctx.restore();
  } catch (err) {
    console.error('Failed to draw logo on QR canvas:', err);
  }
}

/**
 * Generates a high-res (1024x1024) PNG Data URL with both QR code and center logo
 */
export async function generateHighResPNGWithLogo(
  text: string,
  options: {
    width?: number;
    margin?: number;
    darkColor?: string;
    lightColor?: string;
  },
  settings: QRLogoSettings
): Promise<string> {
  const width = options.width || 1024;
  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = width;
  offscreenCanvas.height = width;

  await QRCode.toCanvas(offscreenCanvas, text, {
    width,
    margin: options.margin || 2,
    color: {
      dark: options.darkColor || '#0f172a',
      light: options.lightColor || '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });

  if (settings.enabled) {
    await drawLogoOnCanvas(offscreenCanvas, settings);
  }

  return offscreenCanvas.toDataURL('image/png');
}

/**
 * Injects a vector center logo badge into a raw SVG string from QRCode.toString
 */
export function injectLogoIntoSVG(
  svgString: string,
  settings: QRLogoSettings
): string {
  if (!settings.enabled) return svgString;

  const src = getLogoSource(settings);
  if (!src) return svgString;

  // Extract viewBox width and height from SVG: viewBox="0 0 200 200"
  const viewBoxMatch = svgString.match(/viewBox="([^"]+)"/);
  let totalWidth = 200;
  if (viewBoxMatch) {
    const parts = viewBoxMatch[1].trim().split(/\s+/);
    if (parts.length === 4) {
      totalWidth = parseFloat(parts[2]);
    }
  }

  const center = totalWidth / 2;
  const percent = Math.min(Math.max(settings.sizePercent || 22, 12), 32);
  const badgeSize = totalWidth * (percent / 100);
  const halfBadge = badgeSize / 2;
  const borderWidth = totalWidth * 0.015;
  const borderColor = settings.borderColor || '#ffffff';
  const bgColor = settings.bgColor || '#059669';

  const iconPadding = settings.type === 'preset' ? badgeSize * 0.20 : badgeSize * 0.12;
  const iconSize = badgeSize - iconPadding * 2;
  const iconPos = center - iconSize / 2;

  let badgeMarkup = '';

  if (settings.shape === 'circle') {
    badgeMarkup = `
  <g id="center-logo-group">
    <!-- Outer Contrast Ring -->
    <circle cx="${center}" cy="${center}" r="${halfBadge + borderWidth}" fill="${borderColor}" />
    <!-- Badge Background -->
    <circle cx="${center}" cy="${center}" r="${halfBadge}" fill="${bgColor}" />
    <!-- Center Image / Icon -->
    <image href="${src}" x="${iconPos}" y="${iconPos}" width="${iconSize}" height="${iconSize}" preserveAspectRatio="xMidYMid meet" />
  </g>
    `;
  } else {
    const rx = badgeSize * 0.22;
    badgeMarkup = `
  <g id="center-logo-group">
    <!-- Outer Contrast Ring -->
    <rect x="${center - halfBadge - borderWidth}" y="${center - halfBadge - borderWidth}" width="${badgeSize + borderWidth * 2}" height="${badgeSize + borderWidth * 2}" rx="${rx + borderWidth}" fill="${borderColor}" />
    <!-- Badge Background -->
    <rect x="${center - halfBadge}" y="${center - halfBadge}" width="${badgeSize}" height="${badgeSize}" rx="${rx}" fill="${bgColor}" />
    <!-- Center Image / Icon -->
    <image href="${src}" x="${iconPos}" y="${iconPos}" width="${iconSize}" height="${iconSize}" preserveAspectRatio="xMidYMid meet" />
  </g>
    `;
  }

  // Insert before closing </svg>
  return svgString.replace('</svg>', `${badgeMarkup}\n</svg>`);
}
