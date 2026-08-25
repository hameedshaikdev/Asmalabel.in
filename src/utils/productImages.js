import { supabase } from '../config/supabase';

// Map of categories and subcategories to reliable Unsplash fallback images
const FALLBACK_IMAGES = {
  tailoring: {
    scissors: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&auto=format&fit=crop&q=80',
    threads: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?w=800&auto=format&fit=crop&q=80',
    needles: 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=800&auto=format&fit=crop&q=80',
    measuring: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&auto=format&fit=crop&q=80',
    machines: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
    presser_feet: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80',
    default: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80'
  },
  fashion: {
    dresses: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
    tops: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
    bottoms: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
    ethnic: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
    accessories: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&auto=format&fit=crop&q=80',
    default: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80'
  }
};

/**
 * Returns a guaranteed valid image URL for a product.
 * Checks:
 * 1. product.image_url
 * 2. product.images array (first element)
 * 3. Fallback based on category/subcategory
 */
export function getProductImage(product) {
  if (!product) return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80';

  if (product.image_url && typeof product.image_url === 'string' && product.image_url.trim() !== '') {
    return product.image_url.trim();
  }

  if (Array.isArray(product.images) && product.images.length > 0) {
    const firstImg = product.images[0];
    if (firstImg && typeof firstImg === 'string' && firstImg.trim() !== '') {
      return firstImg.trim();
    }
  }

  const category = (product.category || 'tailoring').toLowerCase();
  const subCategory = (product.sub_category || '').toLowerCase();

  if (FALLBACK_IMAGES[category]) {
    if (FALLBACK_IMAGES[category][subCategory]) {
      return FALLBACK_IMAGES[category][subCategory];
    }
    return FALLBACK_IMAGES[category].default;
  }

  return product.category === 'tailoring'
    ? 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&auto=format&fit=crop&q=80'
    : 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80';
}

function safeDecodeJSON(encodedStr, defaultValue = []) {
  if (!encodedStr || typeof encodedStr !== 'string') return defaultValue;
  const trimmed = encodedStr.trim();
  if (!trimmed) return defaultValue;

  // 1. Try URI decoded JSON
  try {
    const val = JSON.parse(decodeURIComponent(trimmed));
    if (val !== null && val !== undefined) return val;
  } catch {}

  // 2. Try Direct JSON
  try {
    const val = JSON.parse(trimmed);
    if (val !== null && val !== undefined) return val;
  } catch {}

  // 3. Try Base64 decoded JSON
  try {
    if (typeof atob === 'function') {
      const decoded = atob(trimmed);
      const val = JSON.parse(decoded);
      if (val !== null && val !== undefined) return val;
    }
  } catch {}

  return defaultValue;
}

export function parseProductTags(product) {
  if (!product) return {
    cleanDesc: '', badge: '', discount_tag: '', colors: [],
    bundle: { enabled: true, companionIds: [], companionId: '', discountPct: 5, subtitle: '' },
    variants: [], images: [], video_links: []
  };

  let desc = product.description || '';
  let badge = product.badge || product.tag || '';
  let discount_tag = product.discount_tag || '';
  let colors = Array.isArray(product.colors) ? product.colors : [];
  let bundle = { enabled: true, companionIds: [], companionId: '', discountPct: 5, subtitle: '' };
  let variants = Array.isArray(product.variants) ? product.variants : [];
  let images = Array.isArray(product.images) ? product.images : [];
  let video_links = Array.isArray(product.video_links) ? product.video_links : [];

  // Parse [BUNDLE:enabled|compIds|discount|subtitle]
  const bundleMatch = desc.match(/\[BUNDLE:([^\]]*)\]/i);
  if (bundleMatch) {
    const bParts = bundleMatch[1].split('|');
    const compStr = bParts[1] || '';
    const companionIds = compStr ? compStr.split(',').filter(Boolean) : [];
    bundle = {
      enabled: bParts[0] !== 'false',
      companionIds,
      companionId: companionIds[0] || '',
      discountPct: bParts[2] ? Number(bParts[2]) : 5,
      subtitle: bParts[3] || ''
    };
    desc = desc.replace(/\s*\[BUNDLE:[^\]]*\]/gi, '').trim();
  }

  // Parse [TAG:badge|discount|colors]
  const tagMatch = desc.match(/\[TAG:([^\]]*)\]/i);
  if (tagMatch) {
    const parts = tagMatch[1].split('|');
    if (parts[0]) badge = parts[0];
    if (parts[1]) discount_tag = parts[1];
    if (parts[2]) colors = parts[2].split(',').filter(Boolean);
    desc = desc.replace(/\s*\[TAG:[^\]]*\]/gi, '').trim();
  } else if (badge && typeof badge === 'string' && badge.includes('|')) {
    const parts = badge.split('|');
    badge = parts[0] || '';
    discount_tag = parts[1] || '';
    if (parts[2]) colors = parts[2].split(',').filter(Boolean);
  }

  // Parse [VARIANTS:<json_or_encoded>]
  const variantsMatch = desc.match(/\[VARIANTS:([^\]]*)\]/i);
  if (variantsMatch) {
    const parsedV = safeDecodeJSON(variantsMatch[1], []);
    if (Array.isArray(parsedV) && parsedV.length > 0 && variants.length === 0) {
      variants = parsedV;
    }
    desc = desc.replace(/\s*\[VARIANTS:[^\]]*\]/gi, '').trim();
  }

  // Parse [IMAGES:<json_or_encoded>]
  const imagesMatch = desc.match(/\[IMAGES:([^\]]*)\]/i);
  if (imagesMatch) {
    const parsedImg = safeDecodeJSON(imagesMatch[1], []);
    if (Array.isArray(parsedImg) && parsedImg.length > 0 && images.length === 0) {
      images = parsedImg;
    }
    desc = desc.replace(/\s*\[IMAGES:[^\]]*\]/gi, '').trim();
  }

  // Parse [VIDEOS:<json_or_encoded>]
  const videosMatch = desc.match(/\[VIDEOS:([^\]]*)\]/i);
  if (videosMatch) {
    const parsedVid = safeDecodeJSON(videosMatch[1], []);
    if (Array.isArray(parsedVid) && parsedVid.length > 0 && video_links.length === 0) {
      video_links = parsedVid;
    }
    desc = desc.replace(/\s*\[VIDEOS:[^\]]*\]/gi, '').trim();
  }

  return { cleanDesc: desc, badge, discount_tag, colors, bundle, variants, images, video_links };
}

export function getProductVariants(product) {
  if (!product) return [];
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants;
  }
  const parsed = parseProductTags(product);
  return Array.isArray(parsed.variants) ? parsed.variants : [];
}

export function getProductGalleryImages(product) {
  if (!product) return [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    return product.images;
  }
  const parsed = parseProductTags(product);
  return Array.isArray(parsed.images) ? parsed.images : [];
}

export function getProductVideoLinks(product) {
  if (!product) return [];
  if (Array.isArray(product.video_links) && product.video_links.length > 0) {
    return product.video_links;
  }
  const parsed = parseProductTags(product);
  return Array.isArray(parsed.video_links) ? parsed.video_links : [];
}

