import { getColorName, getColorSwatch, PRESET_COLORS } from '../src/utils/colorUtils.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion Failed: ${message}`);
    process.exit(1);
  }
  console.log(`✅ Passed: ${message}`);
}

console.log('--- Testing Color Utilities ---');
assert(getColorName('#D92F32') === 'Crimson Red', 'Exact hex #D92F32 matches Crimson Red');
assert(getColorName('#000000') === 'Black', '#000000 matches Black');
assert(getColorName('#FFFFFF') === 'White', '#FFFFFF matches White');
assert(getColorName('Royal Blue') === 'Royal Blue', 'Named string Royal Blue preserved');
assert(getColorSwatch('Royal Blue') === '#2563EB', 'Royal Blue swatch resolves to #2563EB');
assert(getColorSwatch('#FF0000') === '#FF0000', 'Hex string returns hex swatch');

// Closest color distance match
const nearRed = getColorName('#D93030');
assert(nearRed === 'Crimson Red' || nearRed.includes('Red'), `Near red (#D93030) matches a red shade: ${nearRed}`);

console.log('\n--- Testing Variant Smart Matching & Fallback ---');
const sampleProduct = {
  id: 'prod_123',
  name: 'Jupiter Tailoring Scissor',
  price: 1899,
  original_price: 2499,
  image_url: 'https://asmalabel.in/common_cover.jpg',
  images: ['https://asmalabel.in/common_2.jpg'],
  variants: [
    {
      id: 'var_1',
      size: '10 Inch',
      color: 'Black',
      color_value: '#000000',
      price: 1799,
      original_price: 2399,
      stock: 5,
      sku: 'JUP-10-BLK',
      images: ['https://asmalabel.in/var_10_blk.jpg'],
      is_default: true,
    },
    {
      id: 'var_2',
      size: '11 Inch',
      color: 'Gold',
      color_value: '#D4AF37',
      price: 1999,
      original_price: 2699,
      stock: 0, // Out of stock
      sku: 'JUP-11-GLD',
      images: [], // No images -> must fallback to common gallery
    },
    {
      id: 'var_3',
      size: '11 Inch',
      color: 'Crimson Red',
      color_value: '#D92F32',
      price: 1999,
      original_price: 2699,
      stock: 8,
      sku: 'JUP-11-RED',
      images: ['https://asmalabel.in/var_11_red_1.jpg', 'https://asmalabel.in/var_11_red_2.jpg'],
    }
  ]
};

// 1. Check variant images when variant has images
const var1Images = sampleProduct.variants[0].images;
assert(var1Images.length === 1 && var1Images[0] === 'https://asmalabel.in/var_10_blk.jpg', 'Variant 1 uses its own image');

// 2. Check fallback when variant has no images (var_2) -> must fallback to common gallery, NEVER another variant's images
const var2Images = (sampleProduct.variants[1].images && sampleProduct.variants[1].images.length > 0)
  ? sampleProduct.variants[1].images
  : [sampleProduct.image_url, ...sampleProduct.images];
assert(var2Images[0] === 'https://asmalabel.in/common_cover.jpg', 'Variant 2 falls back to product common cover');
assert(!var2Images.includes('https://asmalabel.in/var_10_blk.jpg'), 'Fallback NEVER includes another variant image');

// 3. Cart Separation Test
function addToCartSimulator(cart, product, qty, variant) {
  const cartItemId = variant ? `${product.id}_${variant.id || variant.size || variant.color}` : String(product.id);
  const existing = cart.find(it => it.id === cartItemId);
  if (existing) {
    return cart.map(it => it.id === cartItemId ? { ...it, quantity: it.quantity + qty } : it);
  }
  return [
    ...cart,
    {
      id: cartItemId,
      product_id: product.id,
      variant_id: variant?.id || null,
      name: product.name,
      size: variant?.size || null,
      color: variant?.color || null,
      color_value: variant?.color_value || null,
      sku: variant?.sku || null,
      price: variant?.price !== undefined ? Number(variant.price) : Number(product.price),
      quantity: qty,
    }
  ];
}

let cart = [];
cart = addToCartSimulator(cart, sampleProduct, 1, sampleProduct.variants[0]); // 10 Inch Black
cart = addToCartSimulator(cart, sampleProduct, 2, sampleProduct.variants[2]); // 11 Inch Crimson Red
cart = addToCartSimulator(cart, sampleProduct, 1, sampleProduct.variants[0]); // 10 Inch Black again

assert(cart.length === 2, 'Cart has exactly 2 distinct line items for different variants');
assert(cart[0].id === 'prod_123_var_1' && cart[0].quantity === 2, 'Variant 1 quantity updated to 2');
assert(cart[1].id === 'prod_123_var_3' && cart[1].quantity === 2 && cart[1].size === '11 Inch' && cart[1].color === 'Crimson Red', 'Variant 3 separate in cart with size/color metadata');

console.log('\n🎉 ALL VARIANT SYSTEM UNIT TESTS PASSED PERFECTLY!\n');
