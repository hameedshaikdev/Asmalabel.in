/**
 * Centralized Pricing, Minimum Order Value (MOV), & Coupon Safety Engine
 * Asmalabel.in Store Economics
 */

export const MIN_ORDER_VALUE = 299; // Cart subtotal must be at least ₹299 before coupons
export const SHIPPING_FEE = 0;      // 100% Free Shipping across India (₹0)

export const SAFE_DEFAULT_COUPONS = [
  {
    code: 'WELCOME10',
    desc: '10% OFF up to ₹50 on orders above ₹399',
    type: 'percent',
    val: 10,
    minCartTotal: 399,
    maxDiscount: 50,
    scope: 'ALL_PRODUCTS',
    active: true,
    hidden: false
  },
  {
    code: 'SAVE50',
    desc: 'Flat ₹50 OFF on orders above ₹499',
    type: 'flat',
    val: 50,
    minCartTotal: 499,
    maxDiscount: 50,
    scope: 'ALL_PRODUCTS',
    active: true,
    hidden: false
  },
  {
    code: 'SAVE100',
    desc: 'Flat ₹100 OFF on orders above ₹799',
    type: 'flat',
    val: 100,
    minCartTotal: 799,
    maxDiscount: 100,
    scope: 'ALL_PRODUCTS',
    active: true,
    hidden: false
  },
  {
    code: 'FESTIVE15',
    desc: '15% OFF up to ₹150 on orders above ₹999',
    type: 'percent',
    val: 15,
    minCartTotal: 999,
    maxDiscount: 150,
    scope: 'ALL_PRODUCTS',
    active: true,
    hidden: false
  }
];

export const getStoredCoupons = () => {
  try {
    const stored = localStorage.getItem('asmalabel_coupons_list');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading stored coupons:', e);
  }
  return SAFE_DEFAULT_COUPONS;
};

/**
 * Validates whether a coupon can be applied to the current cart
 */
export function validateCouponEligibility(targetCoupon, cart = [], rawSubtotal = 0) {
  if (!targetCoupon || targetCoupon.active === false) {
    return { valid: false, error: 'Invalid or inactive coupon code.' };
  }

  // 1. Minimum Cart Total Check
  const minCart = Number(targetCoupon.minCartTotal || 0);
  if (minCart > 0 && rawSubtotal < minCart) {
    return {
      valid: false,
      error: `Add ₹${(minCart - rawSubtotal).toFixed(0)} more to use code ${targetCoupon.code} (Min cart: ₹${minCart}).`
    };
  }

  // 2. Scope & Item Eligibility Check
  const eligibleItems = (cart || []).filter(item => {
    if (targetCoupon.scope === 'SPECIFIC_CATEGORY') {
      return (item.category || '').toLowerCase() === (targetCoupon.applicableCategory || '').toLowerCase();
    }
    if (targetCoupon.scope === 'SELECTED_PRODUCTS') {
      return Array.isArray(targetCoupon.applicableProductIds) && targetCoupon.applicableProductIds.includes(item.id);
    }
    if (targetCoupon.scope === 'MIN_PRICE_TAG') {
      return Number(item.price || 0) >= Number(targetCoupon.minItemPrice || 0);
    }
    return true; // ALL_PRODUCTS
  });

  const eligibleSubtotal = eligibleItems.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);

  if (eligibleSubtotal === 0) {
    return {
      valid: false,
      error: `No qualifying items in your cart for coupon ${targetCoupon.code}.`
    };
  }

  // 3. Discount Amount Calculation with Hard Max Cap
  let discountAmount = 0;
  if (targetCoupon.type === 'percent') {
    discountAmount = (eligibleSubtotal * Number(targetCoupon.val)) / 100;
    if (targetCoupon.maxDiscount && Number(targetCoupon.maxDiscount) > 0) {
      discountAmount = Math.min(discountAmount, Number(targetCoupon.maxDiscount));
    }
  } else {
    // Flat discount
    discountAmount = Math.min(Number(targetCoupon.val), eligibleSubtotal);
    if (targetCoupon.maxDiscount && Number(targetCoupon.maxDiscount) > 0) {
      discountAmount = Math.min(discountAmount, Number(targetCoupon.maxDiscount));
    }
  }

  return {
    valid: true,
    discountAmount: Math.round(discountAmount),
    eligibleSubtotal,
    coupon: targetCoupon
  };
}

/**
 * Deterministic Price Breakdown Calculator
 */
export function calculateOrderPricing(cart = [], appliedCoupon = null) {
  const safeCart = (cart || []).filter(Boolean);
  const rawSubtotal = safeCart.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);
  const originalSubtotal = safeCart.reduce((acc, item) => {
    const p = Number(item.price || 0);
    const op = Number(item.original_price || p);
    return acc + ((op > p ? op : p) * Number(item.quantity || 1));
  }, 0);

  const isMinOrderMet = rawSubtotal >= MIN_ORDER_VALUE;
  const minOrderDeficit = Math.max(0, MIN_ORDER_VALUE - rawSubtotal);
  const progressPercent = Math.min(100, Math.round((rawSubtotal / MIN_ORDER_VALUE) * 100));

  let couponDiscount = 0;
  if (appliedCoupon && appliedCoupon.discountAmount) {
    couponDiscount = Number(appliedCoupon.discountAmount);
  }

  const finalPayable = Math.max(0, rawSubtotal - couponDiscount);
  const totalSavings = Math.max(0, (originalSubtotal - rawSubtotal) + couponDiscount);

  return {
    rawSubtotal,
    originalSubtotal,
    isMinOrderMet,
    minOrderDeficit,
    progressPercent,
    couponDiscount,
    shippingFee: SHIPPING_FEE,
    finalPayable,
    totalSavings,
    minOrderValue: MIN_ORDER_VALUE
  };
}
