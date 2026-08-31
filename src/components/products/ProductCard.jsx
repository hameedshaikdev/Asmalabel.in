import { useState, memo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star, Eye, Plus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getProductImage, parseProductTags } from '../../utils/productImages';

function ProductCardComponent({ product, onQuickView, priority = false }) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  if (!product) return null;

  const inWishlist = product.id ? isInWishlist(product.id) : false;
  const { badge, discount_tag } = parseProductTags(product);

  const priceNum = Number(product.price || 0);
  const origPriceNum = Number(product.original_price || 0);
  const discount = origPriceNum > priceNum && origPriceNum > 0
    ? Math.round(((origPriceNum - priceNum) / origPriceNum) * 100)
    : null;

  const handleAdd = (e) => {
    e.preventDefault();
    setAdded(true);
    addToCart(product, 1);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleWish = (e) => {
    e.preventDefault();
    if (!product.id) return;
    inWishlist ? removeFromWishlist(product.id) : addToWishlist(product);
  };

  const handleQuickViewClick = (e) => {
    e.preventDefault();
    if (onQuickView) onQuickView(product);
  };

  const imageUrl = imgError
    ? 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&auto=format&fit=crop&q=85'
    : getProductImage(product);

  return (
    <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', height: '100%', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      <motion.div
        whileHover={{
          y: -5,
          boxShadow: '0 16px 32px -10px rgba(15, 23, 42, 0.12)',
          borderColor: '#CBD5E1'
        }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)',
          border: '1px solid #E2E8F0',
          cursor: 'pointer',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          transform: 'translateZ(0)',
          contain: 'content',
        }}>

        {/* Image area with progressive shimmer loading & embedded rating pill */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1.02', overflow: 'hidden', background: '#F8FAFC', flexShrink: 0 }}>
          {/* Shimmer skeleton placeholder while image loads */}
          {!imgLoaded && !imgError && (
            <div
              className="sh-img-shimmer"
              style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(90deg, #F1F5F9 0%, #E2E8F0 50%, #F1F5F9 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                zIndex: 1
              }}
            />
          )}

          <motion.img
            src={imageUrl}
            alt={product.name || 'Product'}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            fetchpriority={priority ? 'high' : 'low'}
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              background: '#FAF8FC',
              display: 'block',
              opacity: imgLoaded ? 1 : 0,
              transition: 'opacity 0.25s ease-in-out',
            }}
          />

          {/* Top-Left Circular Discount Badge (like img1) */}
          {discount && (
            <div style={{
              position: 'absolute', top: '7px', left: '7px',
              width: '36px', height: '36px', borderRadius: '50%',
              background: '#C23A0B', color: '#FFFFFF',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              lineHeight: '1.05', boxShadow: '0 2px 8px rgba(194, 58, 11, 0.35)',
              zIndex: 2, pointerEvents: 'none'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '-0.2px' }}>{discount}%</span>
              <span style={{ fontSize: '8.5px', fontWeight: 800, textTransform: 'lowercase' }}>off</span>
            </div>
          )}

          {/* Top Badge (e.g. NEW ARRIVAL, BESTSELLER - like img3 in vibrant purple) */}
          {badge && (
            <div style={{
              position: 'absolute', top: '7px',
              left: discount ? '48px' : '7px',
              background: '#6318EB', color: '#FFFFFF',
              fontSize: '8.5px', fontWeight: 800, letterSpacing: '.4px',
              padding: '3px 8px', borderRadius: '5px',
              boxShadow: '0 2px 6px rgba(99, 24, 235, 0.3)',
              zIndex: 2, maxWidth: '55%', whiteSpace: 'nowrap',
              overflow: 'hidden', textOverflow: 'ellipsis',
              textTransform: 'uppercase'
            }}>
              {badge}
            </div>
          )}

          {/* Bottom-Left Embedded Rating Pill (Solid Green Flipkart Style) */}
          <div style={{
            position: 'absolute', bottom: '6px', left: '6px',
            background: '#16A34A', color: '#FFFFFF',
            padding: '2px 6px', borderRadius: '4px',
            display: 'flex', alignItems: 'center', gap: '3px', zIndex: 2,
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }}>
            <span style={{ fontSize: '10.5px', fontWeight: 900, color: '#FFFFFF' }}>4.8</span>
            <Star size={9} fill="#FFFFFF" color="#FFFFFF" />
          </div>

          {/* Out of Stock Overlay */}
          {product.stock === 0 && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4 }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#555', padding: '3px 8px', background: 'white', borderRadius: '4px', border: '1px solid #eee' }}>
                Out of Stock
              </span>
            </div>
          )}

          {/* Top-Right Wishlist Button */}
          <motion.button
            onClick={handleWish}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            className="card-action-btn card-wish-btn"
            style={{
              position: 'absolute', top: '6px', right: '6px', zIndex: 3,
              width: '28px', height: '28px', minWidth: '28px', minHeight: '28px',
              aspectRatio: '1 / 1', borderRadius: '50%', padding: 0,
              background: 'rgba(255, 255, 255, 0.95)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(226, 232, 240, 0.9)',
              cursor: 'pointer', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
              boxSizing: 'border-box', flexShrink: 0
            }}>
            <Heart size={13} fill={inWishlist ? '#EF4444' : 'none'} color={inWishlist ? '#EF4444' : '#475569'} />
          </motion.button>

          {/* Top-Right Quick View Button */}
          {onQuickView && (
            <motion.button
              onClick={handleQuickViewClick}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              title="Quick View"
              className="card-action-btn card-quickview-btn"
              style={{
                position: 'absolute', top: '38px', right: '6px', zIndex: 3,
                width: '28px', height: '28px', minWidth: '28px', minHeight: '28px',
                aspectRatio: '1 / 1', borderRadius: '50%', padding: 0,
                background: 'rgba(255, 255, 255, 0.95)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(226, 232, 240, 0.9)',
                cursor: 'pointer', boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
                boxSizing: 'border-box', flexShrink: 0
              }}>
              <Eye size={13} color="#475569" />
            </motion.button>
          )}
        </div>

        {/* Compact Info Section (Zero Wasted Vertical Height) */}
        <div style={{ padding: '8px 10px 10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '4px' }}>
          <div>
            {/* Product Name — 1 line truncated */}
            <p style={{
              fontSize: '12.5px', fontWeight: 700, color: '#0F172A', lineHeight: 1.3,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0
            }}>
              {product.name}
            </p>

            {/* Price row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px', flexWrap: 'nowrap' }}>
              <span style={{ fontSize: '14.5px', fontWeight: 900, color: '#0F172A', whiteSpace: 'nowrap' }}>
                ₹{priceNum.toFixed(0)}
              </span>
              {origPriceNum > priceNum && (
                <span style={{ fontSize: '10.5px', color: '#94A3B8', textDecoration: 'line-through', whiteSpace: 'nowrap' }}>
                  ₹{origPriceNum.toFixed(0)}
                </span>
              )}
              {(discount_tag || discount) && (
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#16A34A', whiteSpace: 'nowrap' }}>
                  {discount_tag || `${discount}% off`}
                </span>
              )}
            </div>
          </div>

          {/* Compact Full-Width Add to Cart Button */}
          <motion.button
            onClick={handleAdd}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            disabled={product.stock === 0}
            className="card-full-add-btn"
            style={{
              width: '100%',
              marginTop: '4px',
              padding: '6px 8px',
              height: '30px',
              borderRadius: '7px',
              background: added
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : product.stock === 0
                  ? '#F1F5F9'
                  : 'linear-gradient(135deg, #1A1A2E, #0F3460)',
              color: product.stock === 0 ? '#94A3B8' : '#FFFFFF',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              border: 'none',
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              boxShadow: added ? '0 3px 10px rgba(16,185,129,.3)' : '0 2px 8px rgba(26,26,46,.2)',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
          >
            {added ? (
              <span>✓ Added</span>
            ) : product.stock === 0 ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <ShoppingCart size={12} strokeWidth={2.2} /> Add to Cart
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </Link>
  );
}

const ProductCard = memo(ProductCardComponent);
export default ProductCard;
