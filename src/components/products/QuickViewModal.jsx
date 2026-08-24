import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, ShoppingCart, Star, ShieldCheck, Truck, Sparkles, Plus, Minus, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getProductImage, parseProductTags } from '../../utils/productImages';
import { getColorName, getColorSwatch } from '../../utils/colorUtils';
import ProductVideoPlayer from './ProductVideoPlayer';

export default function QuickViewModal({ product, onClose }) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();
  const [qty, setQty] = useState(1);
  const [selImg, setSelImg] = useState(0);
  const [imgError, setImgError] = useState(false);
  const [added, setAdded] = useState(false);

  // Variant State
  const hasVariants = Boolean(product?.variants && Array.isArray(product.variants) && product.variants.length > 0);
  const variants = useMemo(() => (hasVariants ? product.variants : []), [hasVariants, product]);

  const availableSizes = useMemo(() => {
    if (!hasVariants) return [];
    const sizes = [];
    variants.forEach(v => {
      if (v.size && !sizes.includes(v.size)) sizes.push(v.size);
    });
    return sizes;
  }, [hasVariants, variants]);

  const parsedTags = useMemo(() => parseProductTags(product || {}), [product]);
  const { cleanDesc, discount_tag, colors: parsedColors } = parsedTags;

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

  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);

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
  }, [hasVariants, variants, product]);

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

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    setSelImg(0);
    const exactExists = variants.some(v => v.size === size && v.color === selectedColor);
    if (!exactExists) {
      const firstValid = variants.find(v => v.size === size && v.color);
      if (firstValid) setSelectedColor(firstValid.color);
    }
  };

  const handleColorSelect = (colorIdentifier) => {
    const colorName = typeof colorIdentifier === 'object' ? (colorIdentifier.name || colorIdentifier.raw) : colorIdentifier;
    setSelectedColor(colorName);
    setSelImg(0);
    if (hasVariants && selectedSize) {
      const exactExists = variants.some(v => v.size === selectedSize && v.color === colorName);
      if (!exactExists) {
        const firstValid = variants.find(v => v.color === colorName);
        if (firstValid && firstValid.size) setSelectedSize(firstValid.size);
      }
    }
  };

  // Price & Stock
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

  // Images for variant
  const allImages = useMemo(() => {
    if (!product) return [];
    if (activeVariant?.images && Array.isArray(activeVariant.images) && activeVariant.images.length > 0) {
      const valid = activeVariant.images.filter(img => img && typeof img === 'string' && img.trim() !== '');
      if (valid.length > 0) return valid;
    }
    const set = new Set();
    const commonMain = getProductImage(product);
    if (commonMain) set.add(commonMain);
    if (Array.isArray(product.images)) {
      product.images.forEach(img => {
        if (img && typeof img === 'string' && img.trim() !== '') set.add(img.trim());
      });
    }
    return Array.from(set);
  }, [product, activeVariant]);

  const mainImage = allImages[0] || getProductImage(product);
  const currentImg = imgError ? 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80' : (allImages[selImg] || mainImage);

  // Touch Swipe & Desktop Mouse Drag Gesture Tracking
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragDistance = useRef(0);

  const inWL = product ? isInWishlist(product.id) : false;

  // Mobile Touch Gestures
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 30) setSelImg(i => Math.min(i + 1, allImages.length - 1));
    else if (diff < -30) setSelImg(i => Math.max(i - 1, 0));
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Desktop Mouse Drag Gestures
  const handleMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    dragStartX.current = e.clientX;
    dragDistance.current = 0;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      dragDistance.current = dragStartX.current - e.clientX;
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const diff = dragDistance.current;
      if (diff > 30) {
        setSelImg(i => Math.min(i + 1, allImages.length - 1));
      } else if (diff < -30) {
        setSelImg(i => Math.max(i - 1, 0));
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [allImages.length]);

  if (!product) return null;

  const handleAddToCart = () => {
    setAdded(true);
    addToCart(product, qty);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  const handleWishlistToggle = () => {
    inWL ? removeFromWishlist(product.id) : addToWishlist(product);
  };

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)'
          }}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: '820px',
            background: 'rgba(255, 255, 255, 0.88)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            borderRadius: '32px',
            boxShadow: '0 28px 64px -12px rgba(15, 23, 42, 0.28), 0 0 32px rgba(233, 69, 96, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.95)',
            overflow: 'hidden',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column'
          }}>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              zIndex: 10,
              width: '38px',
              height: '38px',
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
            }}>
            <X size={18} color="#0F172A" />
          </button>

          {/* Body content grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            overflowY: 'auto'
          }}>

            {/* Left Image Section */}
            <div style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'rgba(241, 245, 249, 0.5)',
              position: 'relative'
            }}>
              <div
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onMouseDown={handleMouseDown}
                style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
                  background: '#FAF8FC',
                  cursor: 'grab',
                  userSelect: 'none'
                }}>
                <img
                  src={currentImg}
                  alt={product.name}
                  draggable={false}
                  onDragStart={(e) => e.preventDefault()}
                  onError={() => setImgError(true)}
                  style={{ width: '100%', height: '100%', objectFit: 'contain', userSelect: 'none', WebkitUserDrag: 'none' }}
                />

                {discount && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    background: 'linear-gradient(135deg, #10B981, #059669)',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)'
                  }}>
                    -{discount}% OFF
                  </div>
                )}

                {/* Prev Arrow */}
                {allImages.length > 1 && selImg > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelImg(prev => Math.max(0, prev - 1)); }}
                    style={{
                      position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.9)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                    <ChevronLeft size={18} color="#0F172A" />
                  </button>
                )}

                {/* Next Arrow */}
                {allImages.length > 1 && selImg < allImages.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelImg(prev => Math.min(allImages.length - 1, prev + 1)); }}
                    style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.9)', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                    }}>
                    <ChevronRight size={18} color="#0F172A" />
                  </button>
                )}

                {/* Dot indicators */}
                {allImages.length > 1 && (
                  <div style={{ position:'absolute', bottom:'12px', left:'50%', transform:'translateX(-50%)', display:'flex', alignItems:'center', gap:'6px', zIndex:3, background:'rgba(15,23,42,0.7)', backdropFilter:'blur(12px)', padding:'4px 10px', borderRadius:'9999px' }}>
                    {allImages.map((_, i) => (
                      <span
                        key={i}
                        onClick={() => setSelImg(i)}
                        style={{
                          display: 'inline-block',
                          width: selImg === i ? '14px' : '6px',
                          height: '6px',
                          minHeight: '6px',
                          maxHeight: '6px',
                          minWidth: selImg === i ? '14px' : '6px',
                          maxWidth: selImg === i ? '14px' : '6px',
                          borderRadius: '9999px',
                          background: selImg === i ? '#FFFFFF' : 'rgba(255,255,255,0.45)',
                          cursor: 'pointer',
                          transition: 'all 250ms ease',
                          flexShrink: 0
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails strip */}
              {allImages.length > 1 && (
                <div className="sh-scroll-hide" style={{ display:'flex', gap:'8px', overflowX:'auto', marginTop:'12px', width:'100%', justifyContent:'center' }}>
                  {allImages.map((img, i) => (
                    <button key={i} onClick={() => setSelImg(i)}
                      style={{
                        width:'44px', height:'44px', borderRadius:'10px', overflow:'hidden',
                        border: selImg === i ? '2px solid #2563EB' : '1px solid #E2E8F0',
                        padding:0, cursor:'pointer', flexShrink:0, background:'#FAF8FC'
                      }}>
                      <img src={img} alt={`thumb-${i}`} style={{ width:'100%', height:'100%', objectFit:'contain' }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Details Section */}
            <div style={{ padding: '32px 28px', display: 'flex', flexDirection: 'column' }}>

              {/* Tag & Category */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: '#0F172A',
                  background: 'rgba(15, 23, 42, 0.08)',
                  padding: '4px 10px',
                  borderRadius: '9999px'
                }}>
                  <Sparkles size={11} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                  {product.category || 'Featured'}
                </span>
                {product.sub_category && (
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>
                    • {product.sub_category}
                  </span>
                )}
              </div>

              {/* Product Title */}
              <h2 style={{
                fontSize: '22px',
                fontWeight: 900,
                color: '#0F172A',
                letterSpacing: '-0.5px',
                lineHeight: 1.25,
                marginBottom: '8px'
              }}>
                {product.name}
              </h2>

              {/* Rating */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill={i < 4 ? '#FFB800' : 'none'} color={i < 4 ? '#FFB800' : '#D1D5DB'} />
                ))}
                <span style={{ fontSize: '12px', color: '#64748B', marginLeft: '4px', fontWeight: 700 }}>4.8 / 5.0</span>
              </div>

              {/* Price Row */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '16px' }}>
                <span style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
                  ₹{priceNum.toFixed(0)}
                </span>
                {origPriceNum > priceNum && (
                  <span style={{ fontSize: '15px', color: '#94A3B8', textDecoration: 'line-through', fontWeight: 500 }}>
                    ₹{origPriceNum.toFixed(0)}
                  </span>
                )}
                {(discount_tag || discount) && (
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#388E3C' }}>
                    {discount_tag || `-${discount}% off`}
                  </span>
                )}
                {currentStock !== null && (
                  <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 800, color: isOutOfStock ? '#EF4444' : currentStock < 10 ? '#D97706' : '#059669', background: isOutOfStock ? '#FEE2E2' : currentStock < 10 ? '#FEF3C7' : '#DCFCE7', padding: '2px 8px', borderRadius: '6px' }}>
                    {isOutOfStock ? 'Out of Stock' : currentStock < 10 ? `Only ${currentStock} left` : 'In Stock'}
                  </span>
                )}
              </div>

              {/* Dynamic Size Selector */}
              {availableSizes.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                    Size: <strong>{selectedSize || availableSizes[0]}</strong>
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {availableSizes.map(size => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSizeSelect(size)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 800,
                            border: isSelected ? '2px solid #0F172A' : '1px solid #E2E8F0',
                            background: isSelected ? '#0F172A' : '#FFFFFF',
                            color: isSelected ? '#FFFFFF' : '#0F172A',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Color Selector (shows human-readable name) */}
              {availableColors.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                    Color: <strong>{getColorName(selectedColor || availableColors[0]?.name || availableColors[0]?.raw || '')}</strong>
                  </span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {availableColors.map((c, idx) => {
                      const colorIdentifier = c.name || c.raw;
                      const isSelected = selectedColor === colorIdentifier || selectedColor === c.name || selectedColor === c.raw;
                      const swatchColor = c.value || getColorSwatch(c.raw || c.name);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleColorSelect(colorIdentifier)}
                          title={getColorName(c.name || c.raw)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: swatchColor,
                            border: isSelected ? '2px solid #FFFFFF' : '1px solid #CBD5E1',
                            outline: isSelected ? '2px solid #0F172A' : 'none',
                            outlineOffset: '2px',
                            cursor: 'pointer',
                            display: 'inline-block',
                            boxShadow: isSelected ? '0 0 0 2px #0F172A, 0 2px 6px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.08)',
                            transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                            transition: 'all 0.18s ease',
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Description preview */}
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, marginBottom: '16px', whiteSpace: 'pre-line', wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                {cleanDesc || 'Engineered for exceptional performance and longevity. Designed with high-grade premium materials for superior craftsmanship.'}
              </p>

              {/* ── PRODUCT VIDEOS & DEMOS ── */}
              <ProductVideoPlayer product={product} compact={true} />

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>Quantity:</span>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'rgba(241, 245, 249, 0.8)',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    border: '1px solid rgba(226, 232, 240, 0.8)'
                  }}>
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Minus size={14} color="#0F172A" />
                    </button>
                    <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A', minWidth: '18px', textAlign: 'center' }}>{qty}</span>
                    <button
                      onClick={() => setQty(qty + 1)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Plus size={14} color="#0F172A" />
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                <motion.button
                  whileHover={{ scale: isOutOfStock ? 1 : 1.02 }}
                  whileTap={{ scale: isOutOfStock ? 1 : 0.97 }}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  style={{
                    flex: 1,
                    height: '48px',
                    borderRadius: '9999px',
                    background: added
                      ? 'linear-gradient(135deg, #30D158, #25B046)'
                      : isOutOfStock
                        ? '#E2E8F0'
                        : 'linear-gradient(135deg, #1A1A2E, #0F3460)',
                    color: isOutOfStock ? '#94A3B8' : 'white',
                    fontWeight: 800,
                    fontSize: '14px',
                    border: 'none',
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: isOutOfStock ? 'none' : '0 8px 24px rgba(26, 26, 46, 0.25)'
                  }}>
                  <ShoppingCart size={16} />
                  {added ? 'Added to Cart!' : isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={handleWishlistToggle}
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '9999px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '1px solid rgba(226, 232, 240, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
                  }}>
                  <Heart size={18} fill={inWL ? '#E94560' : 'none'} color={inWL ? '#E94560' : '#475569'} />
                </motion.button>
              </div>

              {/* Trust highlights */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(226, 232, 240, 0.6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  <ShieldCheck size={14} color="#30D158" /> 100% Genuine
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                  <Truck size={14} color="#3B82F6" /> Express Shipping
                </div>
              </div>

            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
