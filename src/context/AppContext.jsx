import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';
import { DEFAULT_CMS_DATA } from '../utils/cmsDefaults';
import { MIN_ORDER_VALUE, SHIPPING_FEE } from '../utils/pricing';

const AppContext = createContext(null);

// ── Hook ────────────────────────────────────────────────────────────────────
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [activeCategory, setActiveCategory] = useState('tailoring');
  const [cart,           setCart]           = useState([]);
  const [wishlist,       setWishlist]       = useState([]);
  const [user,           setUser]           = useState(null);
  const [loading,        setLoading]        = useState(true);

  // Toast notification state
  const [toast, setToast] = useState({ visible: false, title: '', product: null, type: 'cart' });

  const showToast = (title, product, type = 'cart') => {
    setToast({ visible: true, title, product, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3200);
  };

  const closeToast = () => setToast(prev => ({ ...prev, visible: false }));

  // Load cart + wishlist from localStorage
  useEffect(() => {
    try {
      const c = localStorage.getItem('cart');
      const w = localStorage.getItem('wishlist');
      if (c) setCart(JSON.parse(c));
      if (w) setWishlist(JSON.parse(w));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { localStorage.setItem('cart',     JSON.stringify(cart));    }, [cart]);
  useEffect(() => { localStorage.setItem('wishlist', JSON.stringify(wishlist)); }, [wishlist]);

  // Auth — handles page refresh, Google OAuth redirect, normal login
  useEffect(() => {
    let isMounted = true;

    // 1. Get initial session immediately from storage
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    }).catch(err => {
      console.error('Session fetch error:', err);
      if (isMounted) setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    const fallback = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 2000);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(fallback);
    };
  }, []);

  // Cart
  const addToCart = (product, quantity = 1, selectedVariant = null) => {
    if (!product) return;
    const variant = selectedVariant || product.selectedVariant || null;
    const variantId = variant?.id || product.selected_variant_id || null;
    const cartItemId = variantId ? `${product.id}_${variantId}` : String(product.id);

    const price = (variant?.price !== undefined && variant?.price !== null && variant?.price !== '')
      ? Number(variant.price)
      : Number(product.price || 0);

    const original_price = (variant?.original_price !== undefined && variant?.original_price !== null && variant?.original_price !== '')
      ? Number(variant.original_price)
      : (product.original_price ? Number(product.original_price) : null);

    const image_url = (variant?.images && variant.images.length > 0)
      ? variant.images[0]
      : (product.image_url || (Array.isArray(product.images) && product.images[0]) || null);

    const itemPayload = {
      ...product,
      id: cartItemId,
      product_id: product.id,
      variant_id: variantId,
      size: variant?.size || product.selected_size || null,
      color: variant?.color || product.selected_color || null,
      color_value: variant?.color_value || product.selected_color_value || null,
      sku: variant?.sku || product.sku || null,
      price,
      original_price,
      image_url,
      stock: (variant?.stock !== undefined && variant?.stock !== null && variant?.stock !== '')
        ? Number(variant.stock)
        : product.stock,
    };

    setCart(prev => {
      const foundIndex = prev.findIndex(i => i.id === cartItemId);
      if (foundIndex >= 0) {
        return prev.map((i, idx) => idx === foundIndex ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { ...itemPayload, quantity }];
    });

    showToast('Added to Cart', itemPayload, 'cart');
  };

  const removeFromCart     = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const clearCart          = ()   => setCart([]);
  const updateCartQuantity = (id, qty) => {
    if (qty <= 0) { removeFromCart(id); return; }
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };
  const getCartTotal = () => cart.reduce((t, i) => t + Number(i.price || 0) * Number(i.quantity || 1), 0);
  const getCartCount = () => cart.reduce((t, i) => t + Number(i.quantity || 1), 0);
  const isMinOrderMet = () => getCartTotal() >= MIN_ORDER_VALUE;
  const getMinOrderDeficit = () => Math.max(0, MIN_ORDER_VALUE - getCartTotal());

  // Wishlist
  const addToWishlist = (p) => {
    setWishlist(prev => prev.find(i => i.id === p.id) ? prev : [...prev, p]);
    showToast('Saved to Wishlist', p, 'wishlist');
  };
  const removeFromWishlist = (id) => {
    setWishlist(prev => prev.filter(i => i.id !== id));
  };
  const isInWishlist = (id) => wishlist.some(i => i.id === id);

  // ── CMS State Management ──
  const getSanitizedCms = (data) => {
    if (!data) return DEFAULT_CMS_DATA;
    
    const seoData = { ...DEFAULT_CMS_DATA.seo, ...(data.seo || {}) };
    if (!seoData.canonicalUrl || seoData.canonicalUrl.includes('ashub.com')) {
      seoData.canonicalUrl = 'https://asmalabel.in/';
    }

    const heroTailoring = { ...DEFAULT_CMS_DATA.hero.tailoring, ...(data.hero?.tailoring || {}) };
    if (heroTailoring.illustration?.includes('tailoring_hero.png')) {
      heroTailoring.illustration = '/images/tailoring_hero.jpg';
    }

    let mediaLib = Array.isArray(data.mediaLibrary) ? data.mediaLibrary : [];
    // Purge fake unsplash mock media items if present from old cache
    mediaLib = mediaLib.filter(m => !m.url?.includes('images.unsplash.com/photo-1617606002806'));

    const tailoringCols = Array.isArray(data.collections?.tailoring) && data.collections.tailoring.length > 0
      ? data.collections.tailoring
      : DEFAULT_CMS_DATA.collections.tailoring;

    const subcategoriesData = {
      tailoring: Array.isArray(data.subcategories?.tailoring) && data.subcategories.tailoring.length > 0
        ? data.subcategories.tailoring
        : DEFAULT_CMS_DATA.subcategories.tailoring,
      fashion: Array.isArray(data.subcategories?.fashion) && data.subcategories.fashion.length > 0
        ? data.subcategories.fashion
        : DEFAULT_CMS_DATA.subcategories.fashion,
    };

    const updated = {
      hero: {
        tailoring: heroTailoring,
        fashion: { ...DEFAULT_CMS_DATA.hero.fashion, ...(data.hero?.fashion || {}) }
      },
      flashDeals: { ...DEFAULT_CMS_DATA.flashDeals, ...(data.flashDeals || {}) },
      collections: {
        tailoring: tailoringCols,
        fashion: Array.isArray(data.collections?.fashion) ? data.collections.fashion : DEFAULT_CMS_DATA.collections.fashion
      },
      subcategories: subcategoriesData,
      announcementBar: { ...DEFAULT_CMS_DATA.announcementBar, ...(data.announcementBar || {}) },
      trustBadges: { ...DEFAULT_CMS_DATA.trustBadges, ...(data.trustBadges || {}) },
      newArrivals: { ...DEFAULT_CMS_DATA.newArrivals, ...(data.newArrivals || {}) },
      topPicks: { ...DEFAULT_CMS_DATA.topPicks, ...(data.topPicks || {}) },
      banners: Array.isArray(data.banners) ? data.banners : DEFAULT_CMS_DATA.banners,
      footer: { ...DEFAULT_CMS_DATA.footer, ...(data.footer || {}) },
      seo: seoData,
      mediaLibrary: mediaLib,
      isWomenLocked: typeof data.isWomenLocked === 'boolean' ? data.isWomenLocked : false
    };

    return updated;
  };

  const [cmsData, setCmsData]   = useState(() => {
    try {
      const saved = localStorage.getItem('ashub_homepage_cms');
      return saved ? getSanitizedCms(JSON.parse(saved)) : DEFAULT_CMS_DATA;
    } catch { return DEFAULT_CMS_DATA; }
  });

  const [cmsDraft, setCmsDraft] = useState(() => {
    try {
      const draft = localStorage.getItem('ashub_homepage_cms_draft');
      return draft ? getSanitizedCms(JSON.parse(draft)) : cmsData;
    } catch { return cmsData; }
  });

  const [cmsHistory, setCmsHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // ── Women Section Lock State ──
  const [isWomenSectionLocked, setIsWomenSectionLockedState] = useState(() => {
    try {
      const cms = localStorage.getItem('ashub_homepage_cms');
      if (cms) {
        const parsed = JSON.parse(cms);
        if (typeof parsed.isWomenLocked === 'boolean') return parsed.isWomenLocked;
      }
      const stored = localStorage.getItem('asmalabel_women_locked');
      if (stored !== null) return stored === 'true';
    } catch { /* ignore */ }
    return false;
  });

  const setWomenSectionLocked = async (locked) => {
    const isLocked = Boolean(locked);
    setIsWomenSectionLockedState(isLocked);
    try {
      localStorage.setItem('asmalabel_women_locked', isLocked ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('women_lock_changed', { detail: { locked: isLocked } }));
    } catch (e) {
      console.error(e);
    }

    updateCmsDraft(draft => ({ ...draft, isWomenLocked: isLocked }));
    setCmsData(prev => ({ ...prev, isWomenLocked: isLocked }));

    try {
      const currentCms = JSON.parse(localStorage.getItem('ashub_homepage_cms') || '{}');
      currentCms.isWomenLocked = isLocked;
      localStorage.setItem('ashub_homepage_cms', JSON.stringify(currentCms));
      await supabase.from('homepage_cms').upsert({
        id: 'published',
        content: currentCms,
        updated_at: new Date().toISOString()
      });
    } catch (err) {
      /* local fallback active */
    }

    if (isLocked && activeCategory === 'fashion') {
      setActiveCategory('tailoring');
    }
  };

  useEffect(() => {
    const handleLockEvent = (e) => {
      const locked = e.detail?.locked ?? (localStorage.getItem('asmalabel_women_locked') === 'true');
      setIsWomenSectionLockedState(locked);
      if (locked && activeCategory === 'fashion') {
        setActiveCategory('tailoring');
      }
    };
    window.addEventListener('women_lock_changed', handleLockEvent);
    window.addEventListener('storage', handleLockEvent);
    return () => {
      window.removeEventListener('women_lock_changed', handleLockEvent);
      window.removeEventListener('storage', handleLockEvent);
    };
  }, [activeCategory]);

  // Sync CMS from Supabase if available
  useEffect(() => {
    async function loadRemoteCms() {
      try {
        const { data, error } = await supabase.from('homepage_cms').select('*').eq('id', 'published').single();
        if (!error && data?.content) {
          const clean = getSanitizedCms(data.content);
          setCmsData(clean);
          localStorage.setItem('ashub_homepage_cms', JSON.stringify(clean));

          // Published Supabase CMS is the definitive single source of truth across all devices
          const remoteLocked = typeof clean.isWomenLocked === 'boolean' ? clean.isWomenLocked : false;
          setIsWomenSectionLockedState(remoteLocked);
          try {
            localStorage.setItem('asmalabel_women_locked', remoteLocked ? 'true' : 'false');
          } catch {}

          if (remoteLocked && activeCategory === 'fashion') {
            setActiveCategory('tailoring');
          }
        }
      } catch { /* use local */ }
    }
    loadRemoteCms();
  }, [activeCategory]);

  // Realtime Supabase subscription for instant cross-device updates (e.g. Admin -> Mobile storefront)
  useEffect(() => {
    const channel = supabase
      .channel('public:homepage_cms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'homepage_cms' }, (payload) => {
        if (payload?.new?.id === 'published' && payload.new?.content) {
          const clean = getSanitizedCms(payload.new.content);
          setCmsData(clean);
          try {
            localStorage.setItem('ashub_homepage_cms', JSON.stringify(clean));
          } catch {}
          if (typeof clean.isWomenLocked === 'boolean') {
            setIsWomenSectionLockedState(clean.isWomenLocked);
            try {
              localStorage.setItem('asmalabel_women_locked', clean.isWomenLocked ? 'true' : 'false');
            } catch {}
            if (clean.isWomenLocked && activeCategory === 'fashion') {
              setActiveCategory('tailoring');
            }
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeCategory]);

  const updateCmsDraft = (updater) => {
    setCmsDraft(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      localStorage.setItem('ashub_homepage_cms_draft', JSON.stringify(next));
      
      // History tracking
      setCmsHistory(h => [...h.slice(0, historyIndex + 1), next]);
      setHistoryIndex(i => i + 1);
      
      return next;
    });
  };

  const publishCms = async () => {
    setCmsData(cmsDraft);
    localStorage.setItem('ashub_homepage_cms', JSON.stringify(cmsDraft));
    try {
      await supabase.from('homepage_cms').upsert({ id: 'published', content: cmsDraft, updated_at: new Date().toISOString() });
    } catch { /* local fallback active */ }
  };

  const resetCmsDraft = () => {
    setCmsData(DEFAULT_CMS_DATA);
    setCmsDraft(DEFAULT_CMS_DATA);
    localStorage.setItem('ashub_homepage_cms', JSON.stringify(DEFAULT_CMS_DATA));
    localStorage.setItem('ashub_homepage_cms_draft', JSON.stringify(DEFAULT_CMS_DATA));
  };

  const undoCms = () => {
    if (historyIndex > 0) {
      setHistoryIndex(i => i - 1);
      setCmsDraft(cmsHistory[historyIndex - 1]);
    }
  };

  const redoCms = () => {
    if (historyIndex < cmsHistory.length - 1) {
      setHistoryIndex(i => i + 1);
      setCmsDraft(cmsHistory[historyIndex + 1]);
    }
  };

  const value = {
    activeCategory, setActiveCategory,
    isWomenSectionLocked, setWomenSectionLocked,
    cart, addToCart, removeFromCart, updateCartQuantity, clearCart, getCartTotal, getCartCount,
    MIN_ORDER_VALUE, SHIPPING_FEE, isMinOrderMet, getMinOrderDeficit,
    wishlist, addToWishlist, removeFromWishlist, isInWishlist,
    user, setUser, loading,
    toast, showToast, closeToast,
    cmsData, cmsDraft, updateCmsDraft, publishCms, resetCmsDraft, undoCms, redoCms, canUndo: historyIndex > 0, canRedo: historyIndex < cmsHistory.length - 1
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
