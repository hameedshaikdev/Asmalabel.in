/**
 * Color utility: maps color names & hex values, provides human-friendly names
 * and ensures viewers see descriptive color names instead of raw hex codes.
 */

export const PRESET_COLORS = [
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Crimson Red', hex: '#D92F32' },
  { name: 'Ruby Red', hex: '#E11D48' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Sky Blue', hex: '#38BDF8' },
  { name: 'Emerald Green', hex: '#059669' },
  { name: 'Forest Green', hex: '#166534' },
  { name: 'Olive Green', hex: '#65A30D' },
  { name: 'Golden Yellow', hex: '#EAB308' },
  { name: 'Amber Orange', hex: '#F97316' },
  { name: 'Deep Purple', hex: '#7E22CE' },
  { name: 'Lavender', hex: '#A855F7' },
  { name: 'Rose Pink', hex: '#EC4899' },
  { name: 'Blush Pink', hex: '#F472B6' },
  { name: 'Maroon / Wine', hex: '#881337' },
  { name: 'Coffee Brown', hex: '#78350F' },
  { name: 'Charcoal Grey', hex: '#334155' },
  { name: 'Silver / Grey', hex: '#94A3B8' },
  { name: 'Beige / Cream', hex: '#F5F5DC' },
  { name: 'Teal', hex: '#0D9488' },
  { name: 'Gold / Metallic', hex: '#D4AF37' },
  { name: 'Copper / Rust', hex: '#B45309' },
];

const KNOWN_HEX_NAMES = {
  '#000000': 'Black',
  '#ffffff': 'White',
  '#d92f32': 'Crimson Red',
  '#e11d48': 'Ruby Red',
  '#ef4444': 'Red',
  '#dc2626': 'Deep Red',
  '#b91c1c': 'Dark Red',
  '#1e3a8a': 'Navy Blue',
  '#1e40af': 'Navy Blue',
  '#2563eb': 'Royal Blue',
  '#3b82f6': 'Blue',
  '#60a5fa': 'Light Blue',
  '#38bdf8': 'Sky Blue',
  '#0ea5e9': 'Ocean Blue',
  '#0284c7': 'Cerulean',
  '#059669': 'Emerald Green',
  '#10b981': 'Green',
  '#16a34a': 'Green',
  '#166534': 'Forest Green',
  '#65a30d': 'Olive Green',
  '#84cc16': 'Lime Green',
  '#eab308': 'Golden Yellow',
  '#f59e0b': 'Amber Gold',
  '#d97706': 'Mustard Yellow',
  '#f97316': 'Orange',
  '#ea580c': 'Rust Orange',
  '#7e22ce': 'Deep Purple',
  '#9333ea': 'Purple',
  '#a855f7': 'Lavender',
  '#c084fc': 'Soft Lilac',
  '#ec4899': 'Rose Pink',
  '#f472b6': 'Blush Pink',
  '#db2777': 'Hot Pink',
  '#881337': 'Maroon',
  '#9f1239': 'Wine Red',
  '#4c0519': 'Burgundy',
  '#78350f': 'Coffee Brown',
  '#92400e': 'Chocolate Brown',
  '#b45309': 'Tan Brown',
  '#0f172a': 'Midnight Slate',
  '#1e293b': 'Dark Slate',
  '#334155': 'Charcoal Grey',
  '#475569': 'Slate Grey',
  '#64748b': 'Steel Grey',
  '#94a3b8': 'Silver Grey',
  '#cbd5e1': 'Light Grey',
  '#f1f5f9': 'Off White',
  '#f5f5dc': 'Beige / Cream',
  '#fffbeb': 'Ivory / Cream',
  '#0d9488': 'Teal',
  '#0f766e': 'Deep Teal',
  '#06b6d4': 'Cyan',
  '#d4af37': 'Metallic Gold',
};

/**
 * Converts a hex string or color name to a human-friendly readable name.
 */
export function getColorName(val) {
  if (!val || typeof val !== 'string') return '';
  const trimmed = val.trim();
  if (!trimmed) return '';

  // If it's not a hex code (e.g., "Red", "Navy Blue", "Dark Green"), return it capitalized
  if (!trimmed.startsWith('#')) {
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  }

  const normalized = trimmed.toLowerCase();
  if (KNOWN_HEX_NAMES[normalized]) {
    return KNOWN_HEX_NAMES[normalized];
  }

  // If 3-character hex e.g. #fff
  if (normalized.length === 4) {
    const full = '#' + normalized[1] + normalized[1] + normalized[2] + normalized[2] + normalized[3] + normalized[3];
    if (KNOWN_HEX_NAMES[full]) return KNOWN_HEX_NAMES[full];
  }

  // Find closest preset color by RGB Euclidean distance
  try {
    const r = parseInt(normalized.slice(1, 3), 16) || 0;
    const g = parseInt(normalized.slice(3, 5), 16) || 0;
    const b = parseInt(normalized.slice(5, 7), 16) || 0;

    let closestName = 'Custom Color';
    let minDistance = Infinity;

    PRESET_COLORS.forEach(preset => {
      const pr = parseInt(preset.hex.slice(1, 3), 16);
      const pg = parseInt(preset.hex.slice(3, 5), 16);
      const pb = parseInt(preset.hex.slice(5, 7), 16);
      const dist = Math.sqrt(
        Math.pow(r - pr, 2) +
        Math.pow(g - pg, 2) +
        Math.pow(b - pb, 2)
      );
      if (dist < minDistance) {
        minDistance = dist;
        closestName = preset.name;
      }
    });

    return closestName;
  } catch {
    return 'Custom Color';
  }
}

/**
 * Returns a valid CSS color value for rendering swatches.
 */
export function getColorSwatch(val) {
  if (!val || typeof val !== 'string') return '#CBD5E1';
  const trimmed = val.trim();
  if (trimmed.startsWith('#') || trimmed.startsWith('rgb')) {
    return trimmed;
  }

  // Check if it matches a preset by name
  const match = PRESET_COLORS.find(p => p.name.toLowerCase() === trimmed.toLowerCase());
  if (match) return match.hex;

  // Common CSS named colors
  return trimmed.toLowerCase();
}
