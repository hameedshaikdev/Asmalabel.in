/**
 * Utility for parsing and sorting product sizes / measurements in ascending order.
 * Handles mm, inches (fractional & decimal), cm, meters, multi-dimensional (12 x 22"),
 * packs (Pack of 1, 3, 5), standard apparel (XS, S, M, L, XL, 2XL...), and numeric sizes (28, 30, 32...).
 */

export function parseSizeToNumber(sizeStr) {
  if (!sizeStr || typeof sizeStr !== 'string') return 999999;
  const s = sizeStr.trim().toLowerCase();

  // 1. Standard apparel size ordering
  const apparelOrder = {
    'xxs': 10,
    'xs': 20,
    'extra small': 20,
    's': 30,
    'small': 30,
    'm': 40,
    'medium': 40,
    'l': 50,
    'large': 50,
    'xl': 60,
    'extra large': 60,
    '1xl': 60,
    'xxl': 70,
    '2xl': 70,
    'double xl': 70,
    'xxxl': 80,
    '3xl': 80,
    '4xl': 90,
    '5xl': 100,
    'free size': 500,
    'unstitched': 600,
    'standard': 700
  };
  if (apparelOrder[s] !== undefined) {
    return apparelOrder[s];
  }

  // 2. Multi-dimensional: e.g. "12 x 22 inches", "10 x 15 cm", "12*22"
  const multiMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:["']|\s)?\s*[xX*×]\s*(\d+(?:\.\d+)?)/);
  if (multiMatch) {
    const dim1 = parseFloat(multiMatch[1]);
    const dim2 = parseFloat(multiMatch[2]);
    let unitMultiplier = 1;
    if (s.includes('inch') || s.includes('"')) unitMultiplier = 25.4;
    else if (s.includes('cm')) unitMultiplier = 10;
    else if (s.includes('meter') || s.includes('m\b')) unitMultiplier = 1000;
    return (dim1 * dim2) * unitMultiplier;
  }

  // 3. Fractional inches: e.g. 1/16", 3/32", 1/8", 5/32", 3/16", 1/4", 5/16", 3/8", 1/2", 3/4"
  const fracMatch = s.match(/(\d+)\/(\d+)\s*(?:["']|inch|inches|in)?/);
  if (fracMatch) {
    const num = parseFloat(fracMatch[1]);
    const den = parseFloat(fracMatch[2]);
    if (den > 0) {
      return (num / den) * 25.4; // Convert inch fraction to mm for accurate scale
    }
  }

  // 4. Millimeters: e.g. 1.6mm, 2.4 mm, 10mm
  const mmMatch = s.match(/(\d+(?:\.\d+)?)\s*mm/);
  if (mmMatch) {
    return parseFloat(mmMatch[1]);
  }

  // 5. Inches: e.g. 0.5 Inch, 1.5", 60 inch
  const inchMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:inch|inches|in|")/);
  if (inchMatch) {
    return parseFloat(inchMatch[1]) * 25.4; // mm
  }

  // 6. Centimeters: e.g. 150 cm, 10cm
  const cmMatch = s.match(/(\d+(?:\.\d+)?)\s*cm/);
  if (cmMatch) {
    return parseFloat(cmMatch[1]) * 10; // mm
  }

  // 7. Meters: e.g. 5m, 10 meters
  const mMatch = s.match(/(\d+(?:\.\d+)?)\s*(?:meters|meter|m\b)/);
  if (mMatch) {
    return parseFloat(mMatch[1]) * 1000; // mm
  }

  // 8. Packs: e.g. Pack of 1, Pack of 3, 5 pcs
  const packMatch = s.match(/(?:pack\s*of\s*|set\s*of\s*)?(\d+)\s*(?:pcs|pack|pack\b|piece|pieces)?/);
  if (packMatch) {
    return parseFloat(packMatch[1]);
  }

  // 9. Pure numbers: e.g. "28", "30", "32", "34"
  const pureNum = parseFloat(s);
  if (!isNaN(pureNum)) {
    return pureNum;
  }

  return 999999;
}

/**
 * Compare two size strings in ascending order.
 */
export function compareSizesAscending(aStr, bStr) {
  const valA = parseSizeToNumber(aStr);
  const valB = parseSizeToNumber(bStr);
  if (valA !== valB) {
    return valA - valB;
  }
  return String(aStr || '').localeCompare(String(bStr || ''), undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Sort a list of variants in ascending order by their size / measurement type.
 */
export function sortVariantsAscending(variants) {
  if (!Array.isArray(variants) || variants.length <= 1) return variants || [];
  return [...variants].sort((a, b) => {
    const sizeA = a.size || a.title || '';
    const sizeB = b.size || b.title || '';
    return compareSizesAscending(sizeA, sizeB);
  });
}
