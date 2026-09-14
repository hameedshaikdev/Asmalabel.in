/* ── Default Homepage CMS Structure & Fallbacks ── */

export const DEFAULT_CMS_DATA = {
  hero: {
    tailoring: {
      title: 'Master Your',
      titleAccent: 'Craft.',
      titleLine2: 'Professional Tailoring Tools',
      sub: 'Premium tools engineered for craftsmen who demand the best. Every stitch, perfected.',
      grad: 'linear-gradient(135deg, #F3EEFA 0%, #E5D9F4 50%, #D4C3ED 100%)',
      accentColor: '#6B4F8A',
      illustration: '/images/tailoring_hero.jpg',
      illustrationAlt: 'Luxury professional tailoring tools atelier',
      badgeText: 'New Collection 2026',
      btn1Text: 'Shop Now',
      btn1Link: '#products',
      btn2Text: 'Explore',
      btn2Link: '#filter',
    },
    fashion: {
      title: 'Define Your',
      titleAccent: 'Style.',
      titleLine2: "Women's Fashion Collection",
      sub: 'Curated fashion for the modern woman. Elegance meets everyday comfort.',
      grad: 'linear-gradient(135deg, #134676 0%, #17548C 45%, #1E66AA 80%, #2574BD 100%)',
      accentColor: '#60A5FA',
      illustration: '/images/women_fashion_hero_collage.jpg',
      illustrationAlt: "Women's Fashion Collection Collage",
      badgeText: 'Trending 2026',
      btn1Text: 'Shop Collection',
      btn1Link: '#products',
      btn2Text: 'Lookbook',
      btn2Link: '#filter',
    },
    slides: [
      {
        id: 'slide-1',
        title: 'Master Your',
        titleAccent: 'Craft.',
        titleLine2: 'Professional Tailoring Tools',
        sub: 'Premium tools engineered for craftsmen who demand the best.',
        illustration: '/images/tailoring_hero.png',
        badgeText: 'New Collection 2026',
        btn1Text: 'Shop Now',
        btn1Link: '#products',
        active: true,
        category: 'tailoring',
      },
      {
        id: 'slide-2',
        title: 'Define Your',
        titleAccent: 'Style.',
        titleLine2: "Women's Fashion Collection",
        sub: 'Curated fashion for the modern woman. Elegance meets everyday comfort.',
        illustration: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=640&auto=format&fit=crop&q=80',
        badgeText: 'Trending 2026',
        btn1Text: 'Shop Collection',
        btn1Link: '#products',
        active: true,
        category: 'fashion',
      }
    ],
    carouselSettings: {
      autoplay: true,
      slideDuration: 5000,
      pauseOnHover: true,
      transitionStyle: 'fade',
    }
  },

  flashDeals: {
    enabled: true,
    title: 'Flash Deals',
    subtitle: 'Limited time offers. Grab them before stock runs out!',
    badge: '⚡ Limited Time Offer',
    endTime: new Date(Date.now() + 86400000 * 3).toISOString(),
    autoHideExpired: false,
    selectedProductIds: [],
    maxDisplay: 6,
    sliderEnabled: true,
    showDiscount: true,
    showStock: true,
    showRatings: true,
    showQuickView: true,
    showAddToCart: true,
  },

  collections: {
    tailoring: [
      { id: 'machines', label: 'Tailoring Kit', emoji: '🧰', desc: 'Complete atelier set', active: true, image: '/images/collections/sewing_machines.png' },
      { id: 'scissors', label: 'Scissors & Blades', emoji: '✂️', desc: 'Precision cut', active: true, image: '/images/collections/scissors.png' },
      { id: 'threads', label: 'Threads & Yarn', emoji: '🧵', desc: 'Premium quality', active: true, image: '/images/collections/threads.png' },
      { id: 'presser_feet', label: 'Presser Feet', emoji: '🦶', desc: 'Precision machine feet', active: true, image: '/images/collections/all_tools.png' },
      { id: 'needles', label: 'Needles', emoji: '🪡', desc: 'Sharp & durable', active: true, image: '/images/collections/needles.png' },
      { id: 'measuring', label: 'Measuring Tools', emoji: '📏', desc: 'Accurate tools', active: true, image: '/images/collections/measuring.png' },
      { id: 'other_tools', label: 'Other Tools', emoji: '🛠️', desc: 'Crafting essentials', active: true, image: '/images/collections/kit_atelier_real.jpg' },
    ],
    fashion: [
      { id: 'dresses', label: 'Dresses', emoji: '👗', desc: 'Latest trends', active: true, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=80' },
      { id: 'tops', label: 'Tops & Blouses', emoji: '👚', desc: 'Casual & formal', active: true, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=500&auto=format&fit=crop&q=80' },
      { id: 'ethnic', label: 'Ethnic Wear', emoji: '🥻', desc: 'Traditional beauty', active: true, image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80' },
      { id: 'accessories', label: 'Accessories', emoji: '👜', desc: 'Complete the look', active: true, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&auto=format&fit=crop&q=80' },
    ]
  },

  newArrivals: {
    enabled: true,
    title: 'New Arrivals',
    subtitle: 'Check out the freshest additions to our catalog.',
    mode: 'auto',
    selectedProductIds: [],
    maxDisplay: 8,
    displayStyle: 'grid',
    sortBy: 'newest',
    showBadges: true,
    showRatings: true,
    showQuickView: true,
  },

  topPicks: {
    enabled: true,
    title: 'Top Picks For You',
    subtitle: 'Handpicked products loved by our customers.',
    selectedProductIds: [],
    maxDisplay: 6,
    displayStyle: 'slider',
  },

  banners: [],

  footer: {
    aboutText: 'Asmalabel — Premium Tailoring Tools & Women Fashion Store in Nellore, Andhra Pradesh.',
    phone: '7013942909',
    email: 'as.businezzz@gmail.com',
    address: 'D.No. 25-2-1709, Pragathi Nagar, Podalkur Road, Nellore - 524004',
    copyright: '© 2026 Asmalabel. All rights reserved. Crafted for excellence.',
    socials: {
      whatsapp: '917013942909',
      instagram: '',
      facebook: '',
    }
  },

  seo: {
    metaTitle: "Asmalabel | Premium Tailoring Tools & Women's Fashion",
    metaDescription: "Shop premium tailoring tools, sewing supplies, textiles and modern women's fashion at Asmalabel. Based in Nellore, Andhra Pradesh.",
    ogTitle: "Asmalabel | Quality Tailoring Tools & Women's Fashion",
    ogDescription: "Discover top quality sewing tools, tailoring accessories & modern women's fashion at Asmalabel.",
    ogImage: "https://asmalabel.in/logo.png",
    keywords: "tailoring tools, sewing machine, scissors, fashion, dresses, Asmalabel, Nellore",
    canonicalUrl: "https://asmalabel.in/",
  },

  subcategories: {
    tailoring: [
      { id: 'all',          label: 'All',           icon: 'Sparkles',          active: true },
      { id: 'machines',     label: 'Tailoring Kit',  icon: 'Package',           active: true },
      { id: 'scissors',     label: 'Scissors',       icon: 'Scissors',          active: true },
      { id: 'threads',      label: 'Threads',        icon: 'CircleDot',         active: true },
      { id: 'presser_feet', label: 'Presser Feet',   icon: 'SlidersHorizontal', active: true },
      { id: 'needles',      label: 'Needles',        icon: 'Pin',               active: true },
      { id: 'measuring',    label: 'Measuring',      icon: 'Ruler',             active: true },
      { id: 'other_tools',  label: 'Other Tools',    icon: 'Wrench',            active: true },
    ],
    fashion: [
      { id: 'all',         label: 'All',         icon: 'Sparkles',    active: true },
      { id: 'dresses',     label: 'Dresses',     icon: 'Crown',       active: true },
      { id: 'tops',        label: 'Tops',        icon: 'Shirt',       active: true },
      { id: 'bottoms',     label: 'Bottoms',     icon: 'Layers',      active: true },
      { id: 'ethnic',      label: 'Ethnic',      icon: 'Sparkles',    active: true },
      { id: 'accessories', icon: 'ShoppingBag', active: true },
    ]
  },

  announcementBar: {
    enabled: false,
    text: "✨ Free Express Delivery on orders above ₹499 | Direct Atelier Quality | COD & UPI Accepted",
    bgColor: "#0F172A",
    textColor: "#FFFFFF",
    badge: "OFFER",
    badgeBg: "#2563EB",
    link: "#products",
    speed: 25,
  },

  trustBadges: {
    enabled: false,
    items: [
      { id: '1', icon: 'Truck', title: 'Free Delivery', desc: 'On orders above ₹499 across India', active: true },
      { id: '2', icon: 'Shield', title: '100% Genuine Atelier', desc: 'Direct factory & artisan sourcing', active: true },
      { id: '3', icon: 'Zap', title: '24-48h Fast Dispatch', desc: 'Trackable express delivery', active: true },
      { id: '4', icon: 'Heart', title: 'Dedicated Support', desc: 'WhatsApp sizing & order help', active: true },
    ]
  },

  mediaLibrary: [],
  isWomenLocked: true,
};

export const normalizeCategoryKey = (str) => {
  if (!str) return '';
  return str.toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
};
