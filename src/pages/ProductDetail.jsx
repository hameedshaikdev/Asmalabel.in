import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Heart, Minus, Plus, ShoppingCart, ArrowLeft,
  Truck, Star, Package, Scissors, Sparkles,
  ChevronRight, ChevronUp, ChevronDown, MessageCircle,
  Maximize2, X, Play, Tv, ExternalLink,
  ArrowDown, Zap, Clock, Calendar, CheckCircle2,
  Home, BadgeCheck, ShieldCheck, ArrowRight, ThumbsUp, ThumbsDown, Check, Send,
  MapPin, Trash2, Edit2, CheckCircle, Building, Briefcase
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../config/supabase';
import { getProductImage, parseProductTags, getOptimizedImageUrl } from '../utils/productImages';
import { getColorName, getColorSwatch } from '../utils/colorUtils';
import ProductDescription from '../components/products/ProductDescription';
import SEO from '../components/common/SEO';
import ProductVideoPlayer from '../components/products/ProductVideoPlayer';

export default function ProductDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist, showToast } = useApp();

  const [product,        setProduct]        = useState(null);
  const [related,        setRelated]        = useState([]);
  const [addons,         setAddons]         = useState([]);
  const [fbtAdded,       setFbtAdded]       = useState(false);
  const [cardAddedId,    setCardAddedId]    = useState(null);
  const [shared,         setShared]         = useState(false);
  const [loading,        setLoading]        = useState(true);
  const [quantity,       setQuantity]       = useState(1);
  const [added,          setAdded]          = useState(false);
  const [selImg,         setSelImg]         = useState(0);
  const [descOpen,       setDescOpen]       = useState(true);
  const [peaceOpen,      setPeaceOpen]      = useState(true);
  const [reviewsOpen,    setReviewsOpen]    = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [newReview,      setNewReview]      = useState({ name: '', rating: 5, comment: '', title: '' });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewLikes,    setReviewLikes]    = useState({ 0: 2, 1: 5, 2: 3 });

  // Dynamic color & size selection for variants
  const [selectedColor,  setSelectedColor]  = useState(null);
  const [selectedSize,   setSelectedSize]   = useState(null);

  // Touch & Mouse Drag Gesture Tracking
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragDistance = useRef(0);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomScale,    setZoomScale]    = useState(1);

  // ── Delivery Address Management System ──
  const DEFAULT_ADDRESSES = useMemo(() => [
    {
      id: 'addr_default_1',
      tag: 'HOME',
      fullName: 'Shaik Abdul Hameed',
      phone: '7013942909',
      houseNo: '25-2-1709',
      streetArea: 'Pragathi nagar, Podalkur Road',
      landmark: 'Near Little Flower School',
      city: 'Nellore',
      state: 'Andhra Pradesh',
      pincode: '524004',
      isDefault: true
    }
  ], []);

  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const stored = localStorage.getItem('asmalabel_saved_addresses');
      return stored ? JSON.parse(stored) : DEFAULT_ADDRESSES;
    } catch {
      return DEFAULT_ADDRESSES;
    }
  });

  const [activeAddressId, setActiveAddressId] = useState(() => {
    try {
      return localStorage.getItem('asmalabel_active_address_id') || 'addr_default_1';
    } catch {
      return 'addr_default_1';
    }
  });

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [showAddressForm,  setShowAddressForm]  = useState(false);
  const [editingAddress,   setEditingAddress]   = useState(null);
  const [addressForm, setAddressForm] = useState({
    tag: 'HOME', fullName: '', phone: '', houseNo: '',
    streetArea: '', landmark: '', city: 'Nellore', state: 'Andhra Pradesh', pincode: '524004'
  });

  const activeAddress = useMemo(() => {
    return savedAddresses.find(a => a.id === activeAddressId) || savedAddresses[0] || DEFAULT_ADDRESSES[0];
  }, [savedAddresses, activeAddressId, DEFAULT_ADDRESSES]);

  useEffect(() => {
    try {
      localStorage.setItem('asmalabel_saved_addresses', JSON.stringify(savedAddresses));
    } catch (e) { console.error(e); }
  }, [savedAddresses]);

  useEffect(() => {
    try {
      if (activeAddressId) {
        localStorage.setItem('asmalabel_active_address_id', activeAddressId);
      }
    } catch (e) { console.error(e); }
  }, [activeAddressId]);

  // Live Dispatch Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: '00', minutes: '23', seconds: '46' });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const diff = Math.max(0, endOfDay - now);

      const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      const minutes = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
      const seconds = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  // Delivery Dates formatted
  const deliveryDates = useMemo(() => {
    const now = new Date();
    const orderTodayStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const readyDate1 = new Date(now);
    readyDate1.setDate(readyDate1.getDate() + 1);
    const readyDate2 = new Date(now);
    readyDate2.setDate(readyDate2.getDate() + 2);
    const readyStr = `${readyDate1.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${readyDate2.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    const deliverDate = new Date(now);
    deliverDate.setDate(deliverDate.getDate() + 4);
    const deliverStr = deliverDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return { orderTodayStr, readyStr, deliverStr };
  }, []);

  const inWishlist = product ? isInWishlist(product.id) : false;
  
  // Memoize parsed tags & bundle to prevent infinite re-render loop (React Error #185)
  const parsedTags = useMemo(() => parseProductTags(product), [product]);
  const { cleanDesc, discount_tag, colors: parsedColors, bundle, variants: parsedVariants, images: parsedImages } = parsedTags;

  const [bundleCompanions, setBundleCompanions] = useState([]);

  // Compute a stable string key for bundle companions
  const bundleKey = useMemo(() => {
    if (!bundle?.enabled) return '';
    const cIds = bundle?.companionIds?.length
      ? bundle.companionIds
      : (bundle?.companionId ? [bundle.companionId] : []);
    return cIds.join(',');
  }, [bundle]);

  useEffect(() => {
    if (!bundleKey) {
      setBundleCompanions([]);
      return;
    }
    const cIds = bundleKey.split(',').filter(Boolean);
    if (cIds.length > 0) {
      (async () => {
        try {
          const { data } = await supabase.from('products').select('*').in('id', cIds);
          if (data && data.length > 0) {
            setBundleCompanions(data);
          }
        } catch (e) {
          console.error(e);
        }
      })();
    } else {
      setBundleCompanions([]);
    }
  }, [bundleKey]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error) throw error;
        setProduct(data);

        if (data) {
          const { data: rel } = await supabase.from('products').select('*')
            .eq('category', data.category).eq('active', true)
            .neq('id', id).limit(10);
          setRelated(rel || []);

          const { data: adds } = await supabase.from('products').select('*')
            .eq('active', true).neq('id', id).limit(2);
          setAddons(adds || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Dynamic variant detection
  const productVariants = useMemo(() => {
    if (product?.variants && Array.isArray(product.variants) && product.variants.length > 0) return product.variants;
    if (parsedVariants && Array.isArray(parsedVariants) && parsedVariants.length > 0) return parsedVariants;
    return [];
  }, [product, parsedVariants]);
  const hasVariants = productVariants.length > 0;
  const variants = productVariants;

  // Extract unique sizes from variants
  const availableSizes = useMemo(() => {
    if (!hasVariants) return [];
    const set = [];
    variants.forEach(v => {
      if (v.size && !set.includes(v.size)) set.push(v.size);
    });
    return set;
  }, [hasVariants, variants]);

  // Extract all available colors (aggregates variants + color options + parsed tags)
  const availableColors = useMemo(() => {
    const list = [];
    const seen = new Set();

    // 1. Variant-specific colors
    if (hasVariants && variants.length > 0) {
      variants.forEach(v => {
        if (v.color && typeof v.color === 'string' && v.color.trim()) {
          const cTrim = v.color.trim();
          const cName = getColorName(cTrim);
          const key = cName.toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            list.push({
              name: cName,
              value: v.color_value || getColorSwatch(cTrim),
              raw: v.color_value || cTrim,
            });
          }
        }
      });
    }

    // 2. Extra colors from parsed tags & DB colors
    const extraColors = [
      ...(Array.isArray(parsedColors) ? parsedColors : []),
      ...(Array.isArray(product?.colors) ? product.colors : []),
    ];

    extraColors.forEach(c => {
      if (c && typeof c === 'string' && c.trim()) {
        const cTrim = c.trim();
        const cName = getColorName(cTrim);
        const key = cName.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          list.push({
            name: cName,
            value: getColorSwatch(cTrim),
            raw: cTrim,
          });
        }
      }
    });

    return list;
  }, [hasVariants, variants, product, parsedColors]);

  // Set initial selected variant when product changes
  useEffect(() => {
    if (!product) return;
    if (hasVariants) {
      const defaultVar = variants.find(v => v.is_default) || variants[0];
      if (defaultVar) {
        setSelectedSize(defaultVar.size || null);
        setSelectedColor(defaultVar.color || null);
      }
    } else {
      setSelectedSize(null);
      if (availableColors.length > 0) {
        setSelectedColor(availableColors[0].name || availableColors[0].raw || availableColors[0]);
      } else {
        setSelectedColor(null);
      }
    }
  }, [hasVariants, variants, product?.id]);

  // Resolved active variant based on user selection
  const activeVariant = useMemo(() => {
    if (!hasVariants) return null;

    if (selectedSize && selectedColor) {
      const match = variants.find(v => v.size === selectedSize && v.color === selectedColor);
      if (match) return match;
    }

    if (selectedSize) {
      const match = variants.find(v => v.size === selectedSize && (!selectedColor || v.color === selectedColor));
      if (match) return match;
      const sizeMatch = variants.find(v => v.size === selectedSize);
      if (sizeMatch) return sizeMatch;
    }

    if (selectedColor) {
      const match = variants.find(v => v.color === selectedColor && (!selectedSize || v.size === selectedSize));
      if (match) return match;
      const colorMatch = variants.find(v => v.color === selectedColor);
      if (colorMatch) return colorMatch;
    }

    return variants.find(v => v.is_default) || variants[0] || null;
  }, [hasVariants, variants, selectedSize, selectedColor]);

  // Size click handler with smart color combination auto-switch
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setSelImg(0);

    const exactMatch = variants.some(v => v.size === size && v.color === selectedColor);
    if (!exactMatch) {
      const firstValidForSize = variants.find(v => v.size === size && v.color);
      if (firstValidForSize) {
        setSelectedColor(firstValidForSize.color);
      }
    }
  };

  // Color click handler with smart size combination auto-switch
  const handleColorSelect = (colorIdentifier) => {
    const colorName = typeof colorIdentifier === 'object' ? (colorIdentifier.name || colorIdentifier.raw) : colorIdentifier;
    setSelectedColor(colorName);
    setSelImg(0);

    if (hasVariants && selectedSize) {
      const exactMatch = variants.some(v => v.size === selectedSize && v.color === colorName);
      if (!exactMatch) {
        const firstValidForColor = variants.find(v => v.color === colorName);
        if (firstValidForColor && firstValidForColor.size) {
          setSelectedSize(firstValidForColor.size);
        }
      }
    }
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity, activeVariant);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity, activeVariant);
    navigate('/cart');
  };

  const handleWish = (e) => {
    if (e) e.stopPropagation();
    if (!product) return;
    inWishlist ? removeFromWishlist(product.id) : addToWishlist(product);
  };

  const handleShareProduct = async (e) => {
    if (e) e.stopPropagation();
    const shareData = {
      title: product?.name || 'Asmalabel Product',
      text: `Check out ${product?.name} at Asmalabel!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyProductLink();
        }
      }
    } else {
      copyProductLink();
    }
  };

  const copyProductLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setShared(true);
      if (showToast) {
        showToast('Link Copied to Clipboard!', product, 'wishlist');
      }
      setTimeout(() => setShared(false), 2200);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) return;
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
      setWriteReviewOpen(false);
      setNewReview({ name: '', rating: 5, comment: '', title: '' });
    }, 2000);
  };

  // Touch Handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (total) => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 30) setSelImg(i => Math.min(i + 1, total - 1));
    else if (diff < -30) setSelImg(i => Math.max(i - 1, 0));
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragDistance.current = 0;
  };

  const handlePrev = () => setSelImg(i => Math.max(i - 1, 0));
  const handleNext = (total) => setSelImg(i => Math.min(i + 1, total - 1));

  const priceNum = activeVariant
    ? (activeVariant.price !== undefined && activeVariant.price !== null && activeVariant.price !== '' ? Number(activeVariant.price) : Number(product?.price || 0))
    : Number(product?.price || 0);

  const origPriceNum = activeVariant
    ? (activeVariant.original_price !== undefined && activeVariant.original_price !== null && activeVariant.original_price !== '' ? Number(activeVariant.original_price) : null)
    : (product?.original_price ? Number(product.original_price) : null);

  const discount = origPriceNum > priceNum && origPriceNum > 0
    ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100)
    : null;

  const currentStock = activeVariant
    ? (activeVariant.stock !== undefined && activeVariant.stock !== null && activeVariant.stock !== '' ? Number(activeVariant.stock) : null)
    : (product?.stock !== undefined && product?.stock !== null ? Number(product.stock) : null);

  const isOutOfStock = currentStock === 0;

  // Single clean list of images for current variant (fallback to common product gallery)
  const allImages = useMemo(() => {
    if (!product) return [];

    // 1. Variant specific images
    if (activeVariant?.images && Array.isArray(activeVariant.images) && activeVariant.images.length > 0) {
      const valid = activeVariant.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
      if (valid.length > 0) return valid;
    }

    // 2. Common product images fallback (never another variant's images)
    const set = new Set();
    const commonMain = getProductImage(product);
    if (commonMain) set.add(commonMain);
    const rawImgs = (Array.isArray(product.images) && product.images.length > 0)
      ? product.images
      : (Array.isArray(parsedImages) ? parsedImages : []);
    rawImgs.forEach(img => {
      if (img && typeof img === 'string' && img.trim() !== '') set.add(img.trim());
    });
    return Array.from(set);
  }, [product, activeVariant, parsedImages]);

  const mainImage = allImages[0] || getProductImage(product);

  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (!isDragging.current) return;
      dragDistance.current = dragStartX.current - e.clientX;
    };

    const handleGlobalMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const total = allImages.length;
      if (dragDistance.current > 30) handleNext(total);
      else if (dragDistance.current < -30) handlePrev();
      dragDistance.current = 0;
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [allImages.length]);

  /* ── Luxury Brand Loading Spinner ── */
  if (loading) {
    return (
      <div style={{
        minHeight: '65vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', gap: '16px'
      }}>
        <div style={{
          position: 'relative', width: '56px', height: '56px',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            border: '3.5px solid #E2E8F0', borderTop: '3.5px solid #0F172A',
            animation: 'spin 0.85s linear infinite'
          }} />
          <Sparkles size={20} color="#B88346" />
        </div>
        <span style={{
          fontFamily: '"Playfair Display", "Cinzel", "Cormorant Garamond", Georgia, serif',
          fontSize: '20px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px'
        }}>
          Asmalabel
        </span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight:'60vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'16px', padding:'40px' }}>
        <Package size={56} color="#CBD5E1" />
        <p style={{ fontSize:'18px', fontWeight:800, color:'#475569' }}>Product not found</p>
        <button onClick={() => navigate('/')}
          style={{ padding:'12px 28px', borderRadius:'9999px', background:'var(--primary-grad)', color:'white', fontWeight:800, border:'none', cursor:'pointer', boxShadow:'0 6px 20px rgba(26,26,46,.25)' }}>
          Go Back
        </button>
      </div>
    );
  }

  const currentImg = allImages[selImg] || mainImage;
  const productColors = (product.colors && Array.isArray(product.colors) && product.colors.length > 0)
    ? product.colors
    : (parsedColors || []);

  const companionProduct = addons[0] || related[0] || null;

  // Curated list of verified buyer reviews matching Image 2
  const reviewsList = [
    {
      id: 0,
      rating: 5,
      title: 'Worth the money',
      date: '3 months ago',
      comment: 'Super sharp scissors and premium finish! Cuts through multiple layers of fabric very easily without any hand fatigue.',
      author: 'Pandu Kondru',
      verified: true
    },
    {
      id: 1,
      rating: 5,
      title: 'Very useful & pretty',
      date: '1 month ago',
      comment: 'Just 24 hours express delivery in Nellore AP and wonderful build quality according to description. Highly recommended!',
      author: 'Shariq P.',
      verified: true
    },
    {
      id: 2,
      rating: 4,
      title: 'A good investment',
      date: '2 months ago',
      comment: 'One of my favourite purchases from Asmalabel! Heavy duty, sharp blade and smooth action. Totally worth the price.',
      author: 'Deepika B.',
      verified: true
    },
    {
      id: 3,
      rating: 5,
      title: 'Flawless tailoring tools',
      date: '3 weeks ago',
      comment: 'I run a boutique tailoring shop and have ordered multiple tools from Asmalabel. All are 100% genuine and top notch.',
      author: 'Priya Sharma',
      verified: true
    }
  ];

  const displayedReviews = showAllReviews ? reviewsList : reviewsList.slice(0, 2);

  return (
    <div className="pd-page-wrapper">
      <SEO
        title={`${product.name} | Asmalabel`}
        description={cleanDesc ? cleanDesc.slice(0, 160) : `Buy ${product.name} at Asmalabel. Premium quality tailoring tools and women fashion in Nellore, Andhra Pradesh.`}
        canonical={`https://asmalabel.in/product/${product.id}`}
        ogType="product"
        ogImage={getProductImage(product)}
      />

      <div className="pd-content-container">

        {/* ── TOP BREADCRUMB / BACK LINK ── */}
        <div className="pd-top-breadcrumb-bar">
          <button onClick={() => navigate(-1)} className="pd-back-link">
            <ArrowLeft size={15} /> Back to Products
          </button>
          <span className="pd-breadcrumb-cat">
            {product.category === 'tailoring' ? '🪡 Tailoring Collection' : '👗 Fashion Collection'}
          </span>
        </div>

        {/* ── UNIFIED PRODUCT OVERVIEW CARD ── */}
        <div className="product-main-card">

          {/* ── GALLERY SECTION ── */}
          <div className="pd-gallery-section">
            {/* Main Image Frame with swipe and rating tag */}
            <div
              className="pd-image-frame"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(allImages.length)}
              onMouseDown={handleMouseDown}
              style={{ cursor: 'grab', userSelect: 'none' }}
              onClick={() => {
                if (Math.abs(dragDistance.current) < 15) {
                  setLightboxOpen(true);
                  setZoomScale(1);
                }
              }}>

              {/* Top-Left Rating Pill [ 4.3 ★ | 82 ] */}
              <div className="pd-flipkart-rating-tag">
                <span className="pd-rating-num">4.3</span>
                <Star size={11} fill="#10B981" color="#10B981" />
                <span className="pd-rating-divider">|</span>
                <span className="pd-rating-count">82</span>
              </div>

              {/* Free Shipping Tag */}
              <div className="pd-free-shipping-tag">
                <Truck size={12} color="#059669" />
                <span>Free Shipping</span>
              </div>

              <motion.img
                key={selImg}
                src={currentImg}
                alt={product.name}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                style={{ userSelect: 'none', WebkitUserDrag: 'none' }}
                fetchpriority="high"
                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&auto=format&fit=crop&q=85'; }}
              />

              {/* Prev Arrow (desktop) */}
              {allImages.length > 1 && selImg > 0 && (
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrev(); }}
                  className="pd-arrow-nav"
                  style={{ left: '10px' }}>
                  ‹
                </button>
              )}

              {/* Next Arrow (desktop) */}
              {allImages.length > 1 && selImg < allImages.length - 1 && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleNext(allImages.length); }}
                  className="pd-arrow-nav"
                  style={{ right: '10px' }}>
                  ›
                </button>
              )}

              {/* Dot indicators */}
              {allImages.length > 1 && (
                <div className="pd-image-dots-container">
                  {allImages.map((_, i) => (
                    <span
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setSelImg(i); }}
                      className={`pd-image-dot ${selImg === i ? 'active' : ''}`}
                    />
                  ))}
                </div>
              )}

              {/* Full Photo Button */}
              <button
                onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); setZoomScale(1); }}
                className="pd-full-photo-tag">
                <Maximize2 size={12} /> Full Photo
              </button>

              {/* Neutral Border Wishlist Button */}
              <motion.button onClick={(e) => { e.stopPropagation(); handleWish(e); }}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: .92 }}
                className="pd-wishlist-circle"
                title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}>
                <Heart size={18} fill={inWishlist ? '#EF4444' : 'none'} color={inWishlist ? '#EF4444' : '#475569'} />
              </motion.button>

              {/* Share Product Button (Paper Rocket pointing Right) */}
              <motion.button onClick={(e) => { e.stopPropagation(); handleShareProduct(e); }}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: .92 }}
                className="pd-share-circle"
                title="Share this product">
                {shared ? (
                  <Check size={16} color="#16A34A" />
                ) : (
                  <Send size={16} color="#475569" style={{ transform: 'rotate(45deg) translate(-1px, 1px)' }} />
                )}
              </motion.button>
            </div>

            {/* Compact Thumbnail strip (Only shown if multiple images exist) */}
            {allImages.length > 1 && (
              <div className="pd-thumbnails-strip sh-scroll-hide">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => setSelImg(i)}
                    className={`pd-thumb-item ${selImg === i ? 'active' : 'inactive'}`}>
                    <img
                      src={img}
                      alt={`view-${i}`}
                      loading="lazy"
                      decoding="async"
                      style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── DETAILS SECTION ── */}
          <div className="pd-details-section">

            {/* Product Title */}
            <h1 className="pd-title-heading">
              {product.name}
            </h1>

            {/* Price Presentation */}
            <div className="pd-price-overview-box">
              <div className="pd-price-headline-row">
                {discount && (
                  <span className="pd-discount-badge-green">
                    <ArrowDown size={14} strokeWidth={3} /> {discount}%
                  </span>
                )}
                {origPriceNum > priceNum && (
                  <span className="pd-mrp-strikethrough">
                    ₹{origPriceNum.toFixed(0)}
                  </span>
                )}
                <span className="pd-main-price-highlight">
                  ₹{priceNum.toFixed(0)}
                </span>
                {(discount_tag || discount) && (
                  <span className="pd-red-off-pill">
                    {discount_tag || `${discount}% OFF`}
                  </span>
                )}
              </div>

              <div className="pd-promise-fee-row">
                <span>Taxes included • Free delivery in Andhra Pradesh</span>
                <ChevronRight size={12} />
              </div>

              {/* Stock Status Indicator */}
              {currentStock !== null && (
                <div className="pd-stock-pill-box" style={{ background: isOutOfStock ? 'rgba(239,68,68,0.08)' : currentStock < 10 ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)' }}>
                  <div className="pd-live-pulse-dot" style={{ background: isOutOfStock ? '#EF4444' : currentStock < 10 ? '#F59E0B' : '#10B981' }} />
                  <span style={{ fontSize:'11.5px', fontWeight:800, color: isOutOfStock ? '#EF4444' : currentStock < 10 ? '#D97706' : '#059669' }}>
                    {isOutOfStock ? 'Out of Stock' : currentStock < 10 ? `Only ${currentStock} left in stock!` : `In Stock (${currentStock} units)`}
                  </span>
                </div>
              )}
            </div>

            {/* Dynamic Product Size Selector (shown when product has size variants) */}
            {availableSizes.length > 0 && (
              <div className="pd-variants-box" style={{ marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="pd-variant-label" style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    Size: <strong style={{ color: '#0F172A' }}>{selectedSize || availableSizes[0]}</strong>
                  </span>
                  {activeVariant?.sku && (
                    <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                      SKU: {activeVariant.sku}
                    </span>
                  )}
                </div>
                <div className="pd-sizes-row" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {availableSizes.map((size) => {
                    const isSelected = selectedSize === size;
                    // Check if this size has valid variants with current color
                    const matchingVariant = variants.find(v => v.size === size && (selectedColor ? v.color === selectedColor : true));
                    const isVariantOOS = matchingVariant && matchingVariant.stock === 0;

                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeSelect(size)}
                        className={`pd-size-pill ${isSelected ? 'active' : ''}`}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          border: isSelected ? '2px solid #0F172A' : '1.5px solid #E2E8F0',
                          background: isSelected ? '#0F172A' : '#FFFFFF',
                          color: isSelected ? '#FFFFFF' : '#0F172A',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 4px 12px rgba(15,23,42,0.12)' : 'none',
                          opacity: isVariantOOS ? 0.6 : 1,
                        }}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Dynamic Product Color Selector (shows human-readable name, NOT raw hex) */}
            {availableColors.length > 0 && (
              <div className="pd-variants-box" style={{ marginTop: availableSizes.length > 0 ? '4px' : '0' }}>
                <span className="pd-variant-label" style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '8px', display: 'block' }}>
                  Color: <strong style={{ color: '#0F172A' }}>
                    {getColorName(selectedColor || availableColors[0]?.name || availableColors[0]?.raw || '')}
                  </strong>
                </span>
                <div className="pd-swatches-row" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {availableColors.map((c, idx) => {
                    const colorIdentifier = c.name || c.raw;
                    const isSelected = selectedColor === colorIdentifier || selectedColor === c.name || selectedColor === c.raw;
                    const swatchColor = c.value || getColorSwatch(c.raw || c.name);
                    const colorDisplayName = getColorName(c.name || c.raw);

                    // Check if this color is available for currently selected size
                    const comboExists = hasVariants
                      ? variants.some(v => (!selectedSize || v.size === selectedSize) && v.color === c.name)
                      : true;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleColorSelect(colorIdentifier)}
                        className={`pd-swatch-circle ${isSelected ? 'active' : ''}`}
                        title={colorDisplayName}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: swatchColor,
                          border: isSelected ? '2px solid #FFFFFF' : '1.5px solid #E2E8F0',
                          outline: isSelected ? '2.5px solid #0F172A' : 'none',
                          outlineOffset: '2px',
                          cursor: 'pointer',
                          position: 'relative',
                          display: 'inline-block',
                          boxShadow: isSelected ? '0 0 0 2px #0F172A, 0 3px 8px rgba(0,0,0,0.15)' : '0 1px 4px rgba(0,0,0,0.08)',
                          transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                          transition: 'all 0.18s ease',
                          opacity: comboExists ? 1 : 0.45,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Quick Action Row */}
            {!isOutOfStock && (
              <div className="pd-qty-wish-row">
                <div className="pd-quantity-box">
                  <button onClick={() => setQuantity(q => Math.max(1, q-1))} className="pd-qty-btn" title="Decrease">
                    <Minus size={13} color="#0F172A" />
                  </button>
                  <span className="pd-qty-val">{quantity}</span>
                  <button onClick={() => setQuantity(q => currentStock ? Math.min(currentStock, q+1) : q+1)} className="pd-qty-btn" title="Increase">
                    <Plus size={13} color="#0F172A" />
                  </button>
                </div>
              </div>
            )}

            {/* High-Impact Action Buttons */}
            <div className="pd-cta-buttons-container">
              {!isOutOfStock ? (
                <>
                  <motion.button onClick={handleAddToCart}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: .99 }}
                    className="pd-cart-btn-primary"
                    style={{ background: added ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #1A1A2E, #0F3460)' }}>
                    <ShoppingCart size={16} strokeWidth={2.5} />
                    {added ? '✓ Added to Cart!' : 'Add to cart'}
                  </motion.button>

                  <motion.button onClick={handleBuyNow}
                    whileHover={{ scale: 1.01 }} whileTap={{ scale: .99 }}
                    className="pd-buy-btn-accent">
                    <Zap size={16} fill="#FFFFFF" />
                    <span>Buy it now</span>
                    <ChevronRight size={15} />
                  </motion.button>
                </>
              ) : (
                <div className="pd-out-of-stock-box" style={{ width: '100%', padding: '14px', borderRadius: '14px', background: '#F1F5F9', border: '1.5px solid #CBD5E1', textAlign: 'center', fontWeight: 800, color: '#64748B', fontSize: '14px' }}>
                  Currently Out of Stock
                </div>
              )}
            </div>

            {/* ── DELIVERY DETAILS & PINCODE / SELLER BLOCK ── */}
            <div className="pd-delivery-details-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="pd-card-heading-title" style={{ margin: 0 }}>Delivery details</span>
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(true)}
                  style={{
                    fontSize: '12px', fontWeight: 800, color: '#0F172A',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    textDecoration: 'underline'
                  }}
                >
                  Change
                </button>
              </div>
              
              <div
                className="pd-delivery-address-pill"
                onClick={() => setAddressModalOpen(true)}
                style={{ cursor: 'pointer', transition: 'all .15s ease' }}
                title="Click to select or edit delivery address"
              >
                <div style={{ display:'flex', alignItems:'center', gap:'8px', minWidth: 0, overflow:'hidden' }}>
                  {activeAddress?.tag === 'Office' ? (
                    <Briefcase size={16} color="#0F172A" style={{ flexShrink: 0 }} />
                  ) : activeAddress?.tag === 'Other' ? (
                    <Building size={16} color="#0F172A" style={{ flexShrink: 0 }} />
                  ) : (
                    <Home size={16} color="#0F172A" style={{ flexShrink: 0 }} />
                  )}
                  <span className="pd-address-line">
                    <strong>{activeAddress?.tag || 'HOME'}</strong> {activeAddress?.houseNo ? `${activeAddress.houseNo}, ` : ''}{activeAddress?.streetArea || 'Pragathi nagar, Podalkur Road'}, {activeAddress?.city || 'Nellore'}
                  </span>
                </div>
                <ChevronRight size={15} color="#94A3B8" style={{ flexShrink: 0 }} />
              </div>

              <div className="pd-seller-row">
                <div style={{ display:'flex', alignItems:'center', gap:'6px', minWidth: 0 }}>
                  <Package size={14} color="#64748B" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize:'12px', color:'#334155', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                    Seller: <strong>Asmalabel Official Store</strong>
                  </span>
                  <span className="pd-seller-rating" style={{ flexShrink: 0 }}>4.8 ★</span>
                </div>
                <span className="pd-seller-badge" style={{ flexShrink: 0 }}>Verified</span>
              </div>
            </div>

            {/* ── SHOP WITH PEACE OF MIND / 100% GENUINE & QUALITY ── */}
            <div className="pd-peace-mind-card">
              <div className="pd-peace-mind-header" onClick={() => setPeaceOpen(!peaceOpen)}>
                <span className="pd-card-heading-title" style={{ margin: 0 }}>Shop with peace of mind</span>
                <button className="pd-fbt-toggle-btn" type="button">
                  {peaceOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {peaceOpen && (
                <div className="pd-peace-mind-body">
                  <div className="pd-warranty-box">
                    <ShieldCheck size={18} color="#15803D" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize:'12px' }}>✨ 100% Genuine and Quality Product</span>
                  </div>

                  <div className="pd-peace-badges-row">
                    <div className="pd-peace-badge-item">
                      <div className="pd-peace-icon-wrap">
                        <MessageCircle size={16} color="#25D366" />
                      </div>
                      <span>24x7 WhatsApp Support</span>
                    </div>

                    <div className="pd-peace-badge-item">
                      <div className="pd-peace-icon-wrap">
                        <Zap size={16} color="#16A34A" />
                      </div>
                      <span>UPI</span>
                    </div>

                    <div className="pd-peace-badge-item">
                      <div className="pd-peace-icon-wrap">
                        <BadgeCheck size={16} color="#16A34A" />
                      </div>
                      <span>Asma label verified</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── LIVE DISPATCH COUNTDOWN & 3-STEP TIMELINE ── */}
            <div className="pd-dispatch-timeline-card">
              <div className="pd-dispatch-countdown-header">
                <div className="pd-countdown-title">
                  <Clock size={14} color="#FFFFFF" />
                  <span>Order within</span>
                </div>
                <div className="pd-timer-digits-wrap">
                  <span className="pd-digit-block">{timeLeft.hours}</span> :
                  <span className="pd-digit-block">{timeLeft.minutes}</span> :
                  <span className="pd-digit-block">{timeLeft.seconds}</span>
                </div>
                <span className="pd-same-day-text">for same-day dispatch</span>
                <span className="pd-live-red-dot" />
              </div>

              <div className="pd-timeline-steps-grid">
                <div className="pd-timeline-step active">
                  <div className="pd-step-icon-circle">
                    <Calendar size={14} color="#0F172A" />
                  </div>
                  <strong className="pd-step-date">{deliveryDates.orderTodayStr}</strong>
                  <span className="pd-step-name">Order Today</span>
                </div>

                <div className="pd-timeline-connector active" />

                <div className="pd-timeline-step">
                  <div className="pd-step-icon-circle">
                    <Package size={14} color="#0F172A" />
                  </div>
                  <strong className="pd-step-date">{deliveryDates.readyStr}</strong>
                  <span className="pd-step-name">Order Ready</span>
                </div>

                <div className="pd-timeline-connector" />

                <div className="pd-timeline-step">
                  <div className="pd-step-icon-circle">
                    <Truck size={14} color="#0F172A" />
                  </div>
                  <strong className="pd-step-date">{deliveryDates.deliverStr}</strong>
                  <span className="pd-step-name">Delivered</span>
                </div>
              </div>
            </div>

            {/* ── COLLAPSIBLE DESCRIPTION ACCORDION ── */}
            {cleanDesc && (
              <div className="pd-accordion-card">
                <div className="pd-accordion-header" onClick={() => setDescOpen(!descOpen)}>
                  <span className="pd-accordion-title">Description & Specifications</span>
                  <span className="pd-accordion-icon">{descOpen ? '−' : '+'}</span>
                </div>
                {descOpen && (
                  <div className="pd-accordion-body">
                    <ProductDescription description={cleanDesc} />
                  </div>
                )}
              </div>
            )}

            {/* ── PRODUCT VIDEOS & DEMOS ── */}
            <ProductVideoPlayer product={product} />

          </div>
        </div>

        {/* ── BUY MORE, SAVE MORE 💎 (Configurable from Admin Panel) ── */}
        {/* ── BUY MORE, SAVE MORE 💎 (Multi-Product Configurable from Admin Panel) ── */}
        {(bundle?.enabled !== false) && (() => {
          const discPct = bundle?.discountPct ? Number(bundle.discountPct) : 5;
          const bundleSubtitle = bundle?.subtitle || 'Collect both Asmalabel signatures and enjoy an exclusive discount ✨';

          const companions = bundleCompanions.length > 0
            ? bundleCompanions
            : (addons.slice(0, 1).length > 0 ? addons.slice(0, 1) : (related.slice(0, 1)));

          if (!companions || companions.length === 0) return null;

          const allItems = [product, ...companions];
          const totalOrig = allItems.reduce((acc, it) => {
            const price = Number(it.price || 0);
            const orig = Number(it.original_price || Math.round(price * 1.12));
            return acc + (orig > price ? orig : Math.round(price * 1.12));
          }, 0);
          const totalPrice = allItems.reduce((acc, it) => acc + Number(it.price || 0), 0);
          const totalBundle = totalPrice * ((100 - discPct) / 100);

          return (
            <div className="pd-materialism-bundle-section">
              <h3 className="pd-bundle-headline">Buy More, Save More 💎</h3>
              <p className="pd-bundle-subtitle">
                {bundleSubtitle}
              </p>

              {/* Products Bundle Row with connecting + badges */}
              <div className={`pd-bundle-pair-row ${allItems.length > 2 ? 'pd-bundle-scroller sh-scroll-hide' : ''}`}>
                {allItems.map((item, idx) => {
                  const isMain = idx === 0;
                  const itemPrice = Number(item.price || 0);
                  const itemOrig = Number(item.original_price || Math.round(itemPrice * 1.12));
                  const itemImg = isMain ? mainImage : getProductImage(item);

                  return (
                    <div key={item.id || idx} className="pd-bundle-item-wrapper">
                      {idx > 0 && (
                        <div className="pd-bundle-plus-badge">
                          +
                        </div>
                      )}
                      <div className="pd-bundle-card">
                        <div className="pd-bundle-img-wrap">
                          <img src={itemImg} alt={item.name} />
                        </div>
                        <p className="pd-bundle-prod-title">{item.name}</p>
                        <div className="pd-bundle-price-wrap">
                          <span className="pd-bundle-old-price">₹{itemOrig.toFixed(0)}</span>
                          <span className="pd-bundle-curr-price">₹{itemPrice.toFixed(0)}</span>
                          <span className="pd-bundle-discount-badge">
                            {itemOrig > itemPrice ? `${Math.round((1 - itemPrice / itemOrig) * 100)}% OFF` : `${discPct}% OFF`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Calculation Row */}
              <div className="pd-bundle-total-row">
                <span className="pd-bundle-total-label">Total:</span>
                <span className="pd-bundle-total-strikethrough">₹{totalOrig.toFixed(2)}</span>
                <span className="pd-bundle-total-highlight">₹{totalBundle.toFixed(2)}</span>
              </div>

              {/* Theme-Matched Add to Cart CTA */}
              <button
                type="button"
                onClick={() => {
                  allItems.forEach(it => addToCart(it, 1));
                  setFbtAdded(true);
                  setTimeout(() => setFbtAdded(false), 2200);
                }}
                className="pd-bundle-submit-pill-btn"
              >
                {fbtAdded ? '✓ Added to Cart!' : 'Add to cart'}
              </button>

              <p className="pd-bundle-disclaimer-text">
                Discount will be auto-applied at checkout.
              </p>
            </div>
          );
        })()}

        {/* ── SIMILAR PRODUCTS HORIZONTAL SCROLLER (Placed ABOVE Reviews as requested) ── */}
        {related.length > 0 && (
          <div className="pd-scroller-section" style={{ marginTop: '32px' }}>
            <div className="pd-scroller-header">
              <div>
                <span className="pd-scroller-kicker">Recommended For You</span>
                <h2 className="pd-scroller-title">Similar Products</h2>
              </div>
              <button onClick={() => navigate('/')} className="pd-scroller-arrow-btn" title="View All">
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="pd-horizontal-card-strip sh-scroll-hide">
              {related.map(p => {
                const pPrice = Number(p.price || 0);
                const pOrig = Number(p.original_price || 0);
                const pDisc = pOrig > pPrice ? Math.round(((pOrig - pPrice) / pOrig) * 100) : null;
                const pInWish = isInWishlist(p.id);

                return (
                  <div key={p.id} className="pd-swipe-product-card" onClick={() => navigate(`/product/${p.id}`)}>
                    <div className="pd-swipe-img-box">
                      <span className="pd-swipe-rating-tag">4.3 ★</span>
                      <img src={getProductImage(p)} alt={p.name} />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          pInWish ? removeFromWishlist(p.id) : addToWishlist(p);
                        }}
                        className="pd-swipe-wish-btn"
                        title={pInWish ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        <Heart size={12} fill={pInWish ? '#EF4444' : 'none'} color={pInWish ? '#EF4444' : '#475569'} />
                      </button>
                    </div>

                    <div className="pd-swipe-body">
                      <p className="pd-swipe-title">{p.name}</p>
                      
                      {pDisc && (
                        <span className="pd-swipe-disc-text">{pDisc}% OFF</span>
                      )}

                      <div className="pd-swipe-price-row">
                        {pOrig > pPrice && (
                          <span className="pd-swipe-old-price">₹{pOrig.toFixed(0)}</span>
                        )}
                        <span className="pd-swipe-price">₹{pPrice.toFixed(0)}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p, 1);
                        }}
                        className="pd-swipe-add-btn"
                      >
                        <ShoppingCart size={12} /> Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── RATINGS AND REVIEWS (Exact Flipkart / Myntra Image 2 Layout without photos) ── */}
        <div className="pd-fk-reviews-card" style={{ marginTop: '28px' }}>
          
          {/* Header Row */}
          <div className="pd-fk-reviews-header" onClick={() => setReviewsOpen(!reviewsOpen)}>
            <div>
              <h2 className="pd-fk-reviews-title">Ratings and reviews</h2>
              <div className="pd-fk-score-row">
                <span className="pd-fk-score-badge">
                  4.3 <Star size={12} fill="#FFFFFF" color="#FFFFFF" />
                </span>
                <span className="pd-fk-verdict-text">Very Good</span>
              </div>
              <p className="pd-fk-verified-subtext">
                based on 375 ratings by <span className="pd-fk-verified-check">✓ Verified Buyers</span>
              </p>
            </div>

            <button className="pd-fbt-toggle-btn" type="button">
              {reviewsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {reviewsOpen && (
            <div className="pd-fk-reviews-content">

              {/* Review Cards Grid / List */}
              <div className="pd-fk-reviews-grid">
                {displayedReviews.map((rev, index) => (
                  <div key={rev.id} className="pd-fk-review-card">
                    {/* Top Row: Rating Badge + Title + Date */}
                    <div className="pd-fk-card-top-row">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                        <span className="pd-fk-green-tag">
                          {rev.rating} <Star size={10} fill="#FFFFFF" color="#FFFFFF" />
                        </span>
                        <strong className="pd-fk-card-title">{rev.title}</strong>
                      </div>
                      <span className="pd-fk-card-date">{rev.date}</span>
                    </div>

                    {/* Review Body Comment */}
                    <p className="pd-fk-card-comment">{rev.comment}</p>

                    {/* Bottom Row: User Info & Helpful Thumb Actions */}
                    <div className="pd-fk-card-bottom-row">
                      <div className="pd-fk-author-wrap">
                        <span className="pd-fk-author-name">{rev.author}</span>
                        <span className="pd-fk-author-verified">
                          <CheckCircle2 size={12} color="#16A34A" /> Verified Buyer
                        </span>
                      </div>

                      <div className="pd-fk-helpful-actions">
                        <button
                          type="button"
                          className="pd-fk-thumb-btn"
                          onClick={() => setReviewLikes(p => ({ ...p, [index]: (p[index] || 0) + 1 }))}
                        >
                          <ThumbsUp size={13} />
                          <span>{reviewLikes[index] || 0}</span>
                        </button>
                        <button type="button" className="pd-fk-thumb-btn">
                          <ThumbsDown size={13} />
                          <span>0</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* "Show all reviews >" Toggle Button */}
              <button
                type="button"
                onClick={() => setShowAllReviews(!showAllReviews)}
                className="pd-fk-show-all-btn"
              >
                <span>{showAllReviews ? 'Show fewer reviews ⌃' : 'Show all reviews >'}</span>
              </button>

              {/* "Write a review" Button (Previous Style) */}
              <button
                type="button"
                onClick={() => setWriteReviewOpen(true)}
                className="pd-write-review-cta"
              >
                Write a review
              </button>

            </div>
          )}
        </div>

        {/* ── YOU MAY ALSO LIKE SCROLLER ── */}
        {related.length > 3 && (
          <div className="pd-scroller-section" style={{ marginTop: '28px' }}>
            <div className="pd-scroller-header">
              <div>
                <span className="pd-scroller-kicker">Frequently Explored</span>
                <h2 className="pd-scroller-title">You may also like</h2>
              </div>
              <button onClick={() => navigate('/')} className="pd-scroller-arrow-btn" title="View All">
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="pd-horizontal-card-strip sh-scroll-hide">
              {related.slice().reverse().map(p => {
                const pPrice = Number(p.price || 0);
                const pOrig = Number(p.original_price || 0);
                const pDisc = pOrig > pPrice ? Math.round(((pOrig - pPrice) / pOrig) * 100) : null;
                const pInWish = isInWishlist(p.id);

                return (
                  <div key={p.id} className="pd-swipe-product-card" onClick={() => navigate(`/product/${p.id}`)}>
                    <div className="pd-swipe-img-box">
                      <span className="pd-swipe-rating-tag">4.2 ★</span>
                      <span className="pd-trending-tag">Trending</span>
                      <img src={getProductImage(p)} alt={p.name} />

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          pInWish ? removeFromWishlist(p.id) : addToWishlist(p);
                        }}
                        className="pd-swipe-wish-btn"
                        title={pInWish ? "Remove from Wishlist" : "Add to Wishlist"}
                      >
                        <Heart size={12} fill={pInWish ? '#EF4444' : 'none'} color={pInWish ? '#EF4444' : '#475569'} />
                      </button>
                    </div>

                    <div className="pd-swipe-body">
                      <p className="pd-swipe-title">{p.name}</p>
                      
                      {pDisc && (
                        <span className="pd-swipe-disc-text">{pDisc}% OFF</span>
                      )}

                      <div className="pd-swipe-price-row">
                        {pOrig > pPrice && (
                          <span className="pd-swipe-old-price">₹{pOrig.toFixed(0)}</span>
                        )}
                        <span className="pd-swipe-price">₹{pPrice.toFixed(0)}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(p, 1);
                        }}
                        className="pd-swipe-add-btn"
                      >
                        <ShoppingCart size={12} /> Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* ══ COMPACT BRAND STORY CARD (Champagne Gold Luxury Card) ══ */}
        <div style={{
          marginTop: '20px',
          background: 'linear-gradient(135deg, #FFFDF7 0%, #FAF2E6 50%, #F5E8D3 100%)',
          borderRadius: '20px',
          border: '1.5px solid #EBDCCB',
          padding: '22px 18px',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(180, 130, 70, 0.06)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: '-30px', right: '-30px',
            width: '100px', height: '100px', borderRadius: '50%',
            background: 'rgba(235, 214, 187, 0.5)', filter: 'blur(25px)', pointerEvents: 'none'
          }} />

          {/* Official Storefront Tag */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '5px 12px', borderRadius: '99px',
            background: '#FFFFFF', border: '1px solid #E2D3BF',
            color: '#8A6133', fontSize: '10.5px', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '10px',
            boxShadow: '0 2px 6px rgba(138, 97, 51, 0.05)'
          }}>
            <Sparkles size={12} color="#B88346" />
            <span>Official Storefront · Nellore, AP</span>
          </div>

          <h3 style={{
            fontSize: 'clamp(16px, 2.5vw, 19px)', fontWeight: 900,
            color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.3px',
            lineHeight: 1.3
          }}>
            Asmalabel — Crafting Quality Tailoring &amp; Women's Fashion
          </h3>

          <p style={{
            fontSize: '12.5px', color: '#475569', lineHeight: 1.65,
            maxWidth: '680px', margin: '0 auto 16px', fontWeight: 500
          }}>
            <strong style={{ color: '#0F172A' }}>Asmalabel</strong> is a dedicated boutique small business based in Nellore, Andhra Pradesh. Built on trust, authenticity, and personal care, we bring you high-precision tailoring tools, premium sewing supplies, and curated women's fashion delivered directly to your doorstep across India.
          </p>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { icon: Scissors, text: '100% Genuine Tailoring Tools' },
              { icon: Sparkles, text: 'Curated Women\'s Fashion' },
              { icon: Truck, text: 'Fast Pan-India Delivery' },
              { icon: BadgeCheck, text: 'Based in Nellore, Andhra Pradesh' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '6px 14px', borderRadius: '99px',
                background: '#FFFFFF', border: '1px solid #E5D5C3',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                color: '#1E293B', fontSize: '11.5px', fontWeight: 700
              }}>
                <Icon size={12} color="#B88346" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── WRITE A REVIEW MODAL ── */}
      <AnimatePresence>
        {writeReviewOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="pd-review-modal-backdrop"
            onClick={() => setWriteReviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="pd-review-modal-card"
              onClick={e => e.stopPropagation()}
            >
              <div className="pd-modal-head">
                <h3>Write a Review</h3>
                <button type="button" onClick={() => setWriteReviewOpen(false)} className="pd-modal-close-btn">
                  <X size={18} />
                </button>
              </div>

              {reviewSubmitted ? (
                <div className="pd-modal-success">
                  <CheckCircle2 size={42} color="#10B981" />
                  <h4>Thank you for your review!</h4>
                  <p>Your feedback helps other buyers make informed decisions.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="pd-review-form">
                  <div className="pd-form-group">
                    <label>Rating</label>
                    <div className="pd-star-select-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={24}
                          fill={star <= newReview.rating ? '#10B981' : '#E2E8F0'}
                          color={star <= newReview.rating ? '#10B981' : '#E2E8F0'}
                          style={{ cursor: 'pointer' }}
                          onClick={() => setNewReview({ ...newReview, rating: star })}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pd-form-group">
                    <label>Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Sharma"
                      value={newReview.name}
                      onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                      className="pd-form-input"
                    />
                  </div>

                  <div className="pd-form-group">
                    <label>Review Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Excellent quality and smooth cuts!"
                      value={newReview.title}
                      onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                      className="pd-form-input"
                    />
                  </div>

                  <div className="pd-form-group">
                    <label>Your Review</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Share details about durability, sharpness, comfort, and performance..."
                      value={newReview.comment}
                      onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                      className="pd-form-textarea"
                    />
                  </div>

                  <button type="submit" className="pd-submit-review-btn">
                    Submit Review
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MOBILE STICKY BOTTOM BAR ── */}
      <div className="pd-mobile-sticky-bar">
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.3px' }}>
              ₹{priceNum.toFixed(0)}
            </span>
            {origPriceNum > priceNum && (
              <span style={{ fontSize: '11px', color: '#94A3B8', textDecoration: 'line-through' }}>
                MRP ₹{origPriceNum.toFixed(0)}
              </span>
            )}
          </div>
          {(discount_tag || discount) && (
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#16A34A' }}>
              {discount_tag || `${discount}% OFF`}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          style={{
            flex: 1,
            maxWidth: '240px',
            padding: '12px 18px',
            borderRadius: '12px',
            background: added
              ? 'linear-gradient(135deg, #10B981, #059669)'
              : isOutOfStock
                ? '#E2E8F0'
                : 'linear-gradient(135deg, #0F172A, #1E293B)',
            color: isOutOfStock ? '#94A3B8' : '#FFFFFF',
            fontSize: '13px',
            fontWeight: 800,
            letterSpacing: '0.5px',
            border: 'none',
            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: added ? '0 4px 14px rgba(16,185,129,0.35)' : '0 4px 16px rgba(15,23,42,0.25)',
            transition: 'all 0.2s ease'
          }}
        >
          <ShoppingCart size={15} strokeWidth={2.5} />
          {added ? '✓ Added' : 'Add to Cart'}
        </button>
      </div>

      {/* ── FULL SCREEN PHOTO LIGHTBOX VIEWER ── */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,0.94)', backdropFilter:'blur(12px)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'16px' }}
            onClick={() => setLightboxOpen(false)}>

            <div style={{ position:'absolute', top:'16px', left:'20px', right:'20px', display:'flex', justifyContent:'space-between', alignItems:'center', zIndex:10000 }} onClick={e=>e.stopPropagation()}>
              <span style={{ color:'white', fontSize:'14px', fontWeight:800, background:'rgba(255,255,255,0.15)', padding:'4px 12px', borderRadius:'9999px' }}>
                📷 {selImg + 1} / {allImages.length} Photo
              </span>
              <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                <button onClick={() => setZoomScale(s => Math.min(s + 0.5, 3))} title="Zoom In"
                  style={{ background:'rgba(255,255,255,0.18)', color:'white', border:'none', borderRadius:'50%', width:'38px', height:'38px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:800 }}>
                  +
                </button>
                <button onClick={() => setZoomScale(s => Math.max(s - 0.5, 1))} title="Zoom Out"
                  style={{ background:'rgba(255,255,255,0.18)', color:'white', border:'none', borderRadius:'50%', width:'38px', height:'38px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:800 }}>
                  -
                </button>
                <button onClick={() => setLightboxOpen(false)} title="Close"
                  style={{ background:'#EF4444', color:'white', border:'none', borderRadius:'50%', width:'38px', height:'38px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <X size={20} />
                </button>
              </div>
            </div>

            <motion.div style={{ position:'relative', maxWidth:'92vw', maxHeight:'75vh', overflow:'hidden', cursor:'zoom-in', display:'flex', alignItems:'center', justifyContent:'center' }}
              onClick={e => e.stopPropagation()}>
              <motion.img src={currentImg} alt="Full screen view"
                animate={{ scale: zoomScale }}
                transition={{ type:'spring', damping:25, stiffness:200 }}
                style={{ maxWidth:'100%', maxHeight:'75vh', objectFit:'contain', borderRadius:'14px', boxShadow:'0 20px 50px rgba(0,0,0,0.5)' }} />
            </motion.div>

            {allImages.length > 1 && (
              <div style={{ position:'absolute', bottom:'20px', display:'flex', gap:'8px', overflowX:'auto', maxWidth:'90vw', padding:'6px', background:'rgba(0,0,0,0.5)', borderRadius:'16px', backdropFilter:'blur(8px)' }}
                onClick={e => e.stopPropagation()} className="sh-scroll-hide">
                {allImages.map((img, i) => (
                  <button key={i} onClick={() => { setSelImg(i); setZoomScale(1); }}
                    style={{ width:'52px', height:'52px', borderRadius:'10px', overflow:'hidden', border: selImg === i ? '2.5px solid #38BDF8' : '1px solid rgba(255,255,255,0.3)', cursor:'pointer', flexShrink:0, padding:0, background:'#1E293B', transition:'all .2s' }}>
                    <img src={img} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── ADDRESS SELECTION & MANAGEMENT MODAL ── */}
      <AnimatePresence>
        {addressModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 10000,
              background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', padding: '16px', boxSizing: 'border-box'
            }}
            onClick={() => { setAddressModalOpen(false); setShowAddressForm(false); setEditingAddress(null); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              style={{
                width: '100%', maxWidth: '520px', background: '#FFFFFF',
                borderRadius: '24px', padding: '24px', boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
                border: '1px solid #E2E8F0', maxHeight: '90vh', overflowY: 'auto',
                boxSizing: 'border-box'
              }}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                    {showAddressForm ? (editingAddress ? 'Edit Address' : 'Add New Address') : 'Select Delivery Address'}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0', fontWeight: 500 }}>
                    {showAddressForm ? 'Fill details to save address' : 'Choose or add a delivery location'}
                  </p>
                </div>
                <button
                  onClick={() => { setAddressModalOpen(false); setShowAddressForm(false); setEditingAddress(null); }}
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%', background: '#F8FAFC',
                    border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', color: '#64748B'
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* VIEW 1: Address List */}
              {!showAddressForm && (
                <div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                    {savedAddresses.map((addr) => {
                      const isSelected = addr.id === activeAddressId;
                      return (
                        <div
                          key={addr.id}
                          onClick={() => setActiveAddressId(addr.id)}
                          style={{
                            background: isSelected ? '#F8FAFC' : '#FFFFFF',
                            borderRadius: '16px',
                            border: isSelected ? '2px solid #0F172A' : '1px solid #E2E8F0',
                            padding: '16px',
                            cursor: 'pointer',
                            transition: 'all .15s ease',
                            position: 'relative'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{
                                fontSize: '10.5px', fontWeight: 900, textTransform: 'uppercase',
                                padding: '3px 8px', borderRadius: '6px',
                                background: addr.tag === 'Office' ? '#EFF6FF' : addr.tag === 'Other' ? '#F5F3FF' : '#FEF3C7',
                                color: addr.tag === 'Office' ? '#1D4ED8' : addr.tag === 'Other' ? '#6D28D9' : '#D97706',
                                letterSpacing: '0.5px'
                              }}>
                                {addr.tag || 'HOME'}
                              </span>
                              <strong style={{ fontSize: '14px', color: '#0F172A' }}>{addr.fullName}</strong>
                              <span style={{ fontSize: '13px', color: '#64748B' }}>• {addr.phone}</span>
                            </div>

                            {isSelected && (
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                fontSize: '11px', fontWeight: 900, color: '#16A34A', background: '#DCFCE7',
                                padding: '3px 8px', borderRadius: '99px'
                              }}>
                                <CheckCircle size={12} color="#16A34A" /> Selected
                              </span>
                            )}
                          </div>

                          <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.5, margin: '0 0 12px' }}>
                            {addr.houseNo ? `${addr.houseNo}, ` : ''}{addr.streetArea}
                            {addr.landmark ? `, Near ${addr.landmark}` : ''}<br />
                            <strong>{addr.city}, {addr.state} - {addr.pincode}</strong>
                          </p>

                          {/* Action Bar */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingAddress(addr);
                                setAddressForm(addr);
                                setShowAddressForm(true);
                              }}
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '4px',
                                fontSize: '12px', fontWeight: 800, color: '#0F172A',
                                background: 'none', border: 'none', cursor: 'pointer', padding: 0
                              }}
                            >
                              <Edit2 size={13} /> Edit
                            </button>

                            {savedAddresses.length > 1 && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const updated = savedAddresses.filter(a => a.id !== addr.id);
                                  setSavedAddresses(updated);
                                  if (activeAddressId === addr.id && updated.length > 0) {
                                    setActiveAddressId(updated[0].id);
                                  }
                                }}
                                style={{
                                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                                  fontSize: '12px', fontWeight: 800, color: '#EF4444',
                                  background: 'none', border: 'none', cursor: 'pointer', padding: 0
                                }}
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add New Address Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAddress(null);
                      setAddressForm({
                        tag: 'HOME', fullName: '', phone: '', houseNo: '',
                        streetArea: '', landmark: '', city: 'Nellore', state: 'Andhra Pradesh', pincode: '524004'
                      });
                      setShowAddressForm(true);
                    }}
                    style={{
                      width: '100%', padding: '13px', borderRadius: '14px',
                      background: '#FFFFFF', border: '1.5px dashed #CBD5E1', color: '#0F172A',
                      fontWeight: 800, fontSize: '13.5px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      transition: 'all .15s ease'
                    }}
                  >
                    <Plus size={16} /> Add New Address
                  </button>
                </div>
              )}

              {/* VIEW 2: Add / Edit Address Form */}
              {showAddressForm && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!addressForm.fullName || !addressForm.phone || !addressForm.streetArea || !addressForm.pincode) {
                      alert('Please fill out all required address fields.');
                      return;
                    }

                    if (editingAddress) {
                      const updated = savedAddresses.map(a => a.id === editingAddress.id ? { ...addressForm, id: editingAddress.id } : a);
                      setSavedAddresses(updated);
                      setActiveAddressId(editingAddress.id);
                    } else {
                      const newId = `addr_${Date.now()}`;
                      const newAddr = { ...addressForm, id: newId };
                      const updated = [...savedAddresses, newAddr];
                      setSavedAddresses(updated);
                      setActiveAddressId(newId);
                    }

                    setShowAddressForm(false);
                    setEditingAddress(null);
                    if (showToast) showToast('Delivery address saved!');
                  }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
                >
                  {/* Tag Selector */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '6px' }}>
                      Address Tag / Type
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['HOME', 'OFFICE', 'OTHER'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setAddressForm({ ...addressForm, tag })}
                          style={{
                            flex: 1, padding: '8px 0', borderRadius: '10px',
                            background: addressForm.tag === tag ? '#0F172A' : '#F8FAFC',
                            color: addressForm.tag === tag ? '#FFFFFF' : '#475569',
                            fontWeight: 800, fontSize: '12px', border: '1px solid #E2E8F0', cursor: 'pointer'
                          }}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Full Name *</label>
                      <input
                        required
                        value={addressForm.fullName}
                        onChange={e => setAddressForm({ ...addressForm, fullName: e.target.value })}
                        placeholder="e.g. Shaik Abdul Hameed"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Mobile Number *</label>
                      <input
                        required
                        value={addressForm.phone}
                        onChange={e => setAddressForm({ ...addressForm, phone: e.target.value })}
                        placeholder="10-digit phone"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Flat / House No. / Building</label>
                    <input
                      value={addressForm.houseNo}
                      onChange={e => setAddressForm({ ...addressForm, houseNo: e.target.value })}
                      placeholder="e.g. D.No 25-2-1709"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Street Address / Area *</label>
                    <input
                      required
                      value={addressForm.streetArea}
                      onChange={e => setAddressForm({ ...addressForm, streetArea: e.target.value })}
                      placeholder="e.g. Pragathi nagar, Podalkur Road"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Landmark (Optional)</label>
                      <input
                        value={addressForm.landmark}
                        onChange={e => setAddressForm({ ...addressForm, landmark: e.target.value })}
                        placeholder="e.g. Near Little Flower School"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>Pincode *</label>
                      <input
                        required
                        value={addressForm.pincode}
                        onChange={e => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        placeholder="e.g. 524004"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>City *</label>
                      <input
                        required
                        value={addressForm.city}
                        onChange={e => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="Nellore"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 800, color: '#334155', marginBottom: '4px' }}>State *</label>
                      <input
                        required
                        value={addressForm.state}
                        onChange={e => setAddressForm({ ...addressForm, state: e.target.value })}
                        placeholder="Andhra Pradesh"
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#F1F5F9', border: 'none', color: '#475569', fontWeight: 800, fontSize: '13px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#0F172A', border: 'none', color: '#FFFFFF', fontWeight: 900, fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.15)' }}
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .pd-page-wrapper {
          min-height: 100vh;
          background: #F8FAFC;
          padding-bottom: 0px;
          width: 100%;
          max-width: 100vw;
          overflow-x: hidden;
          box-sizing: border-box;
        }
        .pd-content-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 12px 14px 16px;
          box-sizing: border-box;
          width: 100%;
        }
        .product-main-card {
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.04);
          padding: 24px;
          display: grid;
          grid-template-columns: 46% 1fr;
          gap: 32px;
          align-items: start;
          box-sizing: border-box;
          width: 100%;
        }
        .pd-gallery-section {
          display: flex;
          flex-direction: column;
          gap: 14px;
          width: 100%;
          box-sizing: border-box;
          position: sticky;
          top: 68px;
        }
        .pd-image-frame {
          border-radius: 18px;
          overflow: hidden;
          background: #F8FAFC;
          aspect-ratio: 1 / 1;
          width: 100%;
          position: relative;
          border: 1px solid #E2E8F0;
          cursor: grab;
          user-select: none;
          box-sizing: border-box;
        }
        .pd-image-frame img {
          width: 100%;
          height: 100%;
          object-fit: contain !important;
          display: block;
        }
        .pd-details-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
          width: 100%;
          box-sizing: border-box;
          min-width: 0;
        }
        .pd-peace-badges-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          width: 100%;
          box-sizing: border-box;
        }
        .pd-peace-badge-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 4px;
          font-size: 10px;
          font-weight: 700;
          color: #334155;
          min-width: 0;
          word-break: break-word;
          line-height: 1.2;
        }
        .pd-peace-icon-wrap {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: #F1F5F9;
          border: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pd-dispatch-timeline-card {
          border: 1px solid #0F172A;
          border-radius: 14px;
          overflow: hidden;
          background: #FFFFFF;
          width: 100%;
          box-sizing: border-box;
        }
        .pd-dispatch-countdown-header {
          background: #0F172A;
          color: #FFFFFF;
          padding: 8px 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          flex-wrap: wrap;
          font-size: 11px;
          text-align: center;
          box-sizing: border-box;
          width: 100%;
        }
        .pd-timeline-steps-grid {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 6px;
          background: #FFFFFF;
          gap: 2px;
          width: 100%;
          box-sizing: border-box;
        }
        .pd-timeline-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 2px;
          flex: 1;
          min-width: 0;
        }
        .pd-step-icon-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #F1F5F9;
          border: 1px solid #0F172A;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pd-step-date {
          font-size: 9.5px;
          color: #DC2626;
          font-weight: 800;
          white-space: nowrap;
        }
        .pd-step-name {
          font-size: 9px;
          color: #64748B;
          font-weight: 700;
          white-space: nowrap;
        }
        .pd-timeline-connector {
          flex: 0.4;
          height: 2px;
          background: #E2E8F0;
          margin-top: -16px;
        }
        .pd-delivery-details-card {
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 14px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
          box-sizing: border-box;
        }
        .pd-delivery-address-pill {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 10px;
          padding: 8px 10px;
          cursor: pointer;
          width: 100%;
          box-sizing: border-box;
          min-width: 0;
        }
        .pd-address-line {
          font-size: 11.5px;
          color: #1E293B;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          min-width: 0;
          display: block;
        }

        /* ── DESCRIPTION & ACCORDION STYLES ── */
        .pd-accordion-card {
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          background: #FFFFFF;
          overflow: hidden;
          width: 100%;
          box-sizing: border-box;
        }
        .pd-accordion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 14px;
          background: #F8FAFC;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 800;
          color: #0F172A;
          user-select: none;
        }
        .pd-accordion-icon {
          font-size: 18px;
          font-weight: 700;
          color: #64748B;
        }
        .pd-accordion-body {
          padding: 16px 14px;
          border-top: 1px solid #F1F5F9;
          background: #FFFFFF;
          box-sizing: border-box;
          width: 100%;
        }
        .pd-description-text {
          white-space: pre-line;
          word-break: break-word;
          overflow-wrap: break-word;
          font-size: 13.5px;
          line-height: 1.7;
          color: #334155;
          margin: 0;
          font-family: inherit;
        }

        /* ── MATERIALISM BUY MORE SAVE MORE STYLES ── */
        .pd-materialism-bundle-section {
          margin: 32px 0 16px;
          text-align: center;
          width: 100%;
          box-sizing: border-box;
          background: #FFFFFF;
          border-radius: 20px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 20px rgba(15, 23, 42, 0.03);
          padding: 24px 16px;
        }
        .pd-bundle-headline {
          font-size: clamp(18px, 3vw, 22px);
          font-weight: 900;
          color: #0F172A;
          margin: 0 0 6px;
          letter-spacing: -0.4px;
        }
        .pd-bundle-subtitle {
          font-size: 13px;
          color: #64748B;
          margin: 0 0 20px;
          font-weight: 500;
          line-height: 1.4;
        }
        .pd-bundle-pair-row {
          display: flex;
          gap: 10px;
          align-items: stretch;
          justify-content: center;
          position: relative;
          width: 100%;
          max-width: 540px;
          margin: 0 auto 16px;
        }
        .pd-bundle-pair-row.pd-bundle-scroller {
          overflow-x: auto !important;
          scroll-snap-type: x mandatory !important;
          justify-content: flex-start !important;
          padding: 4px 6px 14px !important;
          scrollbar-width: none !important;
          -webkit-overflow-scrolling: touch !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
        }
        .pd-bundle-item-wrapper {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }
        .pd-bundle-scroller .pd-bundle-item-wrapper {
          flex: 0 0 155px !important;
          min-width: 155px !important;
          scroll-snap-align: start !important;
        }
        @media (max-width: 640px) {
          .pd-bundle-scroller .pd-bundle-item-wrapper {
            flex: 0 0 140px !important;
            min-width: 140px !important;
          }
        }
        .pd-bundle-card {
          flex: 1;
          min-width: 0;
          background: #FFFFFF;
          border-radius: 16px;
          border: 1.5px solid #E2E8F0;
          padding: 12px;
          display: flex;
          flex-direction: column;
          text-align: left;
          box-shadow: 0 2px 10px rgba(15,23,42,0.02);
          box-sizing: border-box;
        }
        .pd-bundle-img-wrap {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 12px;
          overflow: hidden;
          background: #F8FAFC;
          margin-bottom: 10px;
          border: 1px solid #F1F5F9;
        }
        .pd-bundle-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .pd-bundle-plus-badge {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #0F172A;
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 900;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(15,23,42,0.25);
          border: 2px solid #FFFFFF;
          margin-left: -5px;
          margin-right: -5px;
          z-index: 5;
        }
        .pd-bundle-prod-title {
          font-size: 13px;
          font-weight: 800;
          color: #0F172A;
          margin: 0 0 6px;
          line-height: 1.3;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .pd-bundle-price-wrap {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-top: auto;
          flex-wrap: wrap;
        }
        .pd-bundle-old-price {
          font-size: 12px;
          color: #94A3B8;
          text-decoration: line-through;
          font-weight: 600;
        }
        .pd-bundle-curr-price {
          font-size: 14px;
          font-weight: 900;
          color: #0F172A;
        }
        .pd-bundle-discount-badge {
          font-size: 10.5px;
          font-weight: 800;
          color: #16A34A;
          background: #DCFCE7;
          padding: 2px 6px;
          border-radius: 6px;
          margin-left: auto;
          letter-spacing: -0.2px;
        }
        .pd-bundle-total-row {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 8px;
          margin-bottom: 14px;
        }
        .pd-bundle-total-label {
          font-size: 14px;
          font-weight: 800;
          color: #475569;
        }
        .pd-bundle-total-strikethrough {
          font-size: 14px;
          color: #94A3B8;
          text-decoration: line-through;
          font-weight: 700;
        }
        .pd-bundle-total-highlight {
          font-size: 18px;
          font-weight: 900;
          color: #0F172A;
        }
        .pd-bundle-submit-pill-btn {
          width: 100%;
          max-width: 480px;
          margin: 0 auto;
          display: block;
          padding: 14px 20px;
          border-radius: 14px;
          background: linear-gradient(135deg, #1A1A2E 0%, #0F3460 100%);
          color: #FFFFFF;
          border: none;
          font-size: 14.5px;
          font-weight: 800;
          cursor: pointer;
          transition: all .2s;
          box-shadow: 0 4px 16px rgba(15,23,42,0.2);
        }
        .pd-bundle-submit-pill-btn:hover {
          background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(15,23,42,0.28);
        }
        .pd-bundle-disclaimer-text {
          font-size: 11.5px;
          color: #64748B;
          margin-top: 8px;
          font-weight: 500;
        }

        /* ── FLIPKART / MYNTRA RATINGS & REVIEWS STYLES (IMAGE 2) ── */
        .pd-fk-reviews-card {
          background: #FFFFFF;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 4px 20px rgba(15,23,42,0.03);
          padding: 20px;
          width: 100%;
          box-sizing: border-box;
        }
        .pd-fk-reviews-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          cursor: pointer;
          padding-bottom: 12px;
          border-bottom: 1px solid #F1F5F9;
        }
        .pd-fk-reviews-title {
          font-size: 17px;
          font-weight: 900;
          color: #0F172A;
          margin: 0 0 8px;
          letter-spacing: -0.3px;
        }
        .pd-fk-score-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .pd-fk-score-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #16A34A;
          color: #FFFFFF;
          font-size: 12.5px;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .pd-fk-verdict-text {
          font-size: 12.5px;
          font-weight: 800;
          color: #0F766E;
          background: #CCFBF1;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .pd-fk-verified-subtext {
          font-size: 12px;
          color: #64748B;
          margin: 0;
          font-weight: 500;
        }
        .pd-fk-verified-check {
          color: #334155;
          font-weight: 700;
        }
        .pd-fk-reviews-content {
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .pd-fk-reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 12px;
        }
        .pd-fk-review-card {
          background: #F8FAFC;
          border-radius: 14px;
          border: 1px solid #E2E8F0;
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .pd-fk-card-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .pd-fk-green-tag {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          background: #16A34A;
          color: #FFFFFF;
          font-size: 11px;
          font-weight: 800;
          padding: 2px 6px;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .pd-fk-card-title {
          font-size: 13.5px;
          font-weight: 800;
          color: #0F172A;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .pd-fk-card-date {
          font-size: 11px;
          color: #94A3B8;
          font-weight: 500;
          flex-shrink: 0;
        }
        .pd-fk-card-comment {
          font-size: 12.5px;
          color: #334155;
          line-height: 1.55;
          margin: 0;
          font-weight: 500;
        }
        .pd-fk-card-bottom-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: 6px;
          border-top: 1px solid #EDEFEF;
        }
        .pd-fk-author-wrap {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .pd-fk-author-name {
          font-size: 12px;
          font-weight: 800;
          color: #0F172A;
        }
        .pd-fk-author-verified {
          font-size: 10.5px;
          color: #64748B;
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-weight: 600;
        }
        .pd-fk-helpful-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pd-fk-thumb-btn {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 11px;
          color: #64748B;
          font-weight: 700;
          cursor: pointer;
          transition: all .2s;
        }
        .pd-fk-thumb-btn:hover {
          color: #0F172A;
          border-color: #CBD5E1;
        }
        .pd-fk-show-all-btn {
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          border: 1.5px solid #CBD5E1;
          background: #FFFFFF;
          color: #0F172A;
          font-size: 13.5px;
          font-weight: 800;
          cursor: pointer;
          text-align: center;
          transition: all .2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .pd-fk-show-all-btn:hover {
          background: #F8FAFC;
          border-color: #94A3B8;
        }
        .pd-fk-write-action-wrap {
          display: flex;
          justify-content: center;
          margin-top: 4px;
        }
        .pd-fk-write-review-btn {
          padding: 12px 24px;
          border-radius: 99px;
          background: #0F172A;
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 800;
          border: none;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(15,23,42,0.15);
          transition: all .2s;
        }
        .pd-fk-write-review-btn:hover {
          background: #1E293B;
          transform: translateY(-1px);
        }

        @media (max-width: 991px) {
          .pd-content-container {
            padding: 8px 8px 16px 8px !important;
            width: 100% !important;
            max-width: 100vw !important;
            overflow-x: hidden !important;
          }
          .product-main-card {
            grid-template-columns: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 14px !important;
            padding: 12px !important;
            border-radius: 16px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            overflow-x: hidden !important;
          }
          .pd-gallery-section {
            position: static !important;
            width: 100% !important;
          }
          .pd-image-frame {
            aspect-ratio: 1 / 1 !important;
            width: 100% !important;
            max-height: 350px !important;
          }
          .pd-details-section {
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .pd-price-overview-box {
            padding: 10px 12px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .pd-main-price-highlight {
            font-size: 22px !important;
          }
          .pd-peace-badges-row {
            grid-template-columns: repeat(3, 1fr) !important;
            gap: 4px !important;
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .pd-peace-badge-item {
            font-size: 9.5px !important;
            line-height: 1.15 !important;
          }
          .pd-peace-icon-wrap {
            width: 32px !important;
            height: 32px !important;
          }
          .pd-fk-reviews-card {
            border-radius: 14px !important;
            margin-top: 14px !important;
            padding: 14px !important;
            width: 100% !important;
            box-sizing: border-box !important;
            overflow-x: hidden !important;
          }
          .pd-fk-reviews-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
