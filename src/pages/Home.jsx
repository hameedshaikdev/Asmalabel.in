import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Scissors, Package, Sparkles, ArrowRight, ChevronDown,
  Star, Truck, Users, Shield, Heart, ShoppingCart,
  Zap, TrendingUp, ChevronLeft, ChevronRight, Clock,
  Eye, BadgeCheck, SlidersHorizontal, ArrowUpDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../config/supabase';
import ProductCard from '../components/products/ProductCard';
import CategoryFilter from '../components/products/CategoryFilter';
import QuickViewModal from '../components/products/QuickViewModal';
import { getProductImage, parseProductTags } from '../utils/productImages';
import { normalizeCategoryKey, DEFAULT_CMS_DATA } from '../utils/cmsDefaults';
import SEO from '../components/common/SEO';

const TRUST_ICON_MAP = {
  Truck, Shield, Zap, Heart, Star, Users, Clock, Package, Sparkles
};

/* ─── Content ─────────────────────────────────────────────── */
const CONTENT = {
  tailoring: {
    title: 'Master Your', titleAccent: 'Craft.',
    titleLine2: 'Professional Tailoring Tools',
    sub: 'Premium tools engineered for craftsmen who demand the best. Every stitch, perfected.',
    grad: 'linear-gradient(180deg, #9C80AA 0%, #D1B6D5 18%, #D1B6D5 100%)',
    accentColor: '#6B4F8A',
    illustration: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1000&auto=format&fit=crop&q=80',
    illustrationAlt: 'Luxury professional tailoring tools atelier',
    collections: [
      { id:'machines',     label:'Tailoring Kit',     emoji:'🧰', desc:'Complete atelier set', image: '/images/collections/sewing_machines.png' },
      { id:'scissors',     label:'Scissors & Blades',  emoji:'✂️', desc:'Precision cut',      image: '/images/collections/scissors.png' },
      { id:'threads',      label:'Threads & Yarn',    emoji:'🧵', desc:'Premium quality',    image: '/images/collections/threads.png' },
      { id:'presser_feet', label:'Presser Feet',      emoji:'🦶', desc:'Precision machine feet', image: '/images/collections/all_tools.png' },
      { id:'needles',      label:'Needles',           emoji:'🪡', desc:'Sharp & durable',    image: '/images/collections/needles.png' },
      { id:'measuring',    label:'Measuring Tools',   emoji:'📏', desc:'Accurate tools',     image: '/images/collections/measuring.png' },
      { id:'other_tools',  label:'Other Tools',       emoji:'🛠️', desc:'Crafting essentials', image: '/images/collections/kit_atelier_real.jpg' },
    ],
    subs: [
      { id: 'all',          icon: 'Sparkles',          label: 'All' },
      { id: 'machines',     icon: 'Package',           label: 'Tailoring Kit' },
      { id: 'scissors',     icon: 'Scissors',          label: 'Scissors' },
      { id: 'threads',      icon: 'CircleDot',         label: 'Threads' },
      { id: 'presser_feet', icon: 'SlidersHorizontal', label: 'Presser Feet' },
      { id: 'needles',      icon: 'Pin',               label: 'Needles' },
      { id: 'measuring',    icon: 'Ruler',             label: 'Measuring' },
      { id: 'other_tools',  icon: 'Wrench',            label: 'Other Tools' },
    ],
  },
  fashion: {
    title: 'Define Your', titleAccent: 'Style.',
    titleLine2: "Women's Fashion Collection",
    sub: 'Curated fashion for the modern woman. Elegance meets everyday comfort.',
    grad: 'linear-gradient(135deg, #134676 0%, #17548C 45%, #1E66AA 80%, #2574BD 100%)',
    accentColor: '#60A5FA',
    illustration: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=640&auto=format&fit=crop&q=80',
    illustrationAlt: 'Women fashion',
    collections: [
      { id:'dresses',     label:'Dresses',          emoji:'👗', desc:'Latest trends'    },
      { id:'tops',        label:'Tops & Blouses',   emoji:'👚', desc:'Casual & formal' },
      { id:'ethnic',      label:'Ethnic Wear',      emoji:'🥻', desc:'Traditional beauty'},
      { id:'accessories', label:'Accessories',      emoji:'👜', desc:'Complete the look'},
    ],
    subs: [
      { id: 'all',         icon: 'Sparkles',    label: 'All' },
      { id: 'dresses',     icon: 'Crown',       label: 'Dresses' },
      { id: 'tops',        icon: 'Shirt',       label: 'Tops' },
      { id: 'bottoms',     icon: 'Layers',      label: 'Bottoms' },
      { id: 'ethnic',      icon: 'Sparkles',    label: 'Ethnic' },
      { id: 'accessories', icon: 'ShoppingBag', label: 'Accessories' },
    ],
  },
};

/* ─── Variants ────────────────────────────────────────────── */
const fu = {hidden:{opacity:0,y:28},visible:{opacity:1,y:0,transition:{duration:.55,ease:[.22,1,.36,1]}}};
const fuNoY = {hidden:{opacity:0,y:0},visible:{opacity:1,y:0,transition:{duration:.55,ease:[.22,1,.36,1]}}};
const fl = {hidden:{opacity:0,x:-24},visible:{opacity:1,x:0,transition:{duration:.55,ease:[.22,1,.36,1]}}};
const sg = {visible:{transition:{staggerChildren:.08}}};
const sc = {hidden:{opacity:0,scale:.95},visible:{opacity:1,scale:1,transition:{duration:.5,ease:[.22,1,.36,1]}}};

/* ─── Section ─────────────────────────────────────────────── */
function Reveal({ children, style={}, v=fu }) {
  const ref = useRef(null);
  const ok  = useInView(ref, { once:true, margin:'-60px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={ok?'visible':'hidden'} variants={v} style={style}>
      {children}
    </motion.div>
  );
}
function StaggerReveal({ children, style={} }) {
  const ref = useRef(null);
  const ok  = useInView(ref, { once:true, margin:'-60px' });
  return (
    <motion.div ref={ref} initial="hidden" animate={ok?'visible':'hidden'} variants={sg} style={style}>
      {children}
    </motion.div>
  );
}

/* ─── Animated counter ────────────────────────────────────── */
function Counter({ value, suffix='' }) {
  const ref    = useRef(null);
  const ok     = useInView(ref, { once:true });
  const [n, setN] = useState(0);
  const num = parseInt(String(value).replace(/[^0-9]/g,'')) || 0;
  useEffect(() => {
    if (!ok) return;
    let cur = 0; const steps = 40; const inc = num / steps;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= num) { setN(num); clearInterval(t); } else setN(Math.floor(cur));
    }, 1400 / steps);
    return () => clearInterval(t);
  }, [ok, num]);
  return <span ref={ref}>{num >= 1000 ? n.toLocaleString('en-IN') : n}{suffix}</span>;
}

/* ─── Deal Timer ──────────────────────────────────────────── */
function DealTimer() {
  const [time, setTime] = useState({ h:4, m:32, s:17 });
  useEffect(() => {
    const t = setInterval(() => {
      setTime(p => {
        let {h,m,s} = p;
        s--; if (s < 0) { s=59; m--; } if (m < 0) { m=59; h--; } if (h < 0) h=0;
        return {h,m,s};
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  const pad = n => String(n).padStart(2,'0');
  return (
    <div style={{display:'flex',alignItems:'center',gap:'6px'}} className="flash-deal-timer-wrap">
      {[time.h, time.m, time.s].map((v,i) => (
        <span key={i} style={{display:'flex',alignItems:'center',gap:'6px'}}>
          <div className="flash-timer-card" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.06))',
            border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            color: 'white',
            fontWeight: 900,
            fontSize: '16px',
            padding: '6px 10px',
            borderRadius: '10px',
            minWidth: '40px',
            textAlign: 'center',
            fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
            letterSpacing: '0.5px'
          }}>
            {pad(v)}
          </div>
          {i < 2 && <span style={{color:'white',fontWeight:900,fontSize:'16px'}}>:</span>}
        </span>
      ))}
    </div>
  );
}

/* ─── Mini Card (for carousels) ───────────────────────────── */
const MiniCard = memo(function MiniCardComponent({ product, badge: customBadge }) {
  const { addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();
  if (!product || !product.id) return null;

  const inWL = isInWishlist(product.id);
  const { badge: parsedBadge, discount_tag: customDisc } = parseProductTags(product);

  let badge = null;
  if (customBadge && typeof customBadge === 'object') {
    badge = customBadge;
  } else if (typeof customBadge === 'string' && customBadge.trim()) {
    badge = { bg: '#6318EB', color: '#fff', label: customBadge };
  } else if (parsedBadge) {
    badge = { bg: '#6318EB', color: '#fff', label: parsedBadge };
  }

  const pPrice = Number(product.price || 0);
  const pOrig = Number(product.original_price || 0);
  const discount = pOrig > pPrice && pOrig > 0 ? Math.round(((pOrig - pPrice) / pOrig) * 100) : null;
  const imgUrl = getProductImage(product);

  return (
    <Link to={`/product/${product.id}`}
      style={{textDecoration:'none',display:'flex',flexDirection:'column',minWidth:'210px',maxWidth:'210px',flexShrink:0,height:'100%'}}>
      <motion.div
        whileHover={{
          y: -8,
          scale: 1.02,
          boxShadow: '0 20px 48px -8px rgba(0, 0, 0, 0.16)',
          borderColor: 'rgba(255, 255, 255, 0.95)'
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: '#FFFFFF',
          borderRadius: '24px',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'space-between'
        }}>
        <div style={{position:'relative',height:'150px',background:'#F8FAFC',overflow:'hidden',margin:'6px 6px 0 6px',borderRadius:'18px',flexShrink:0}}>
          <img
            src={imgUrl}
            alt={product.name || 'Product'}
            loading="lazy"
            decoding="async"
            style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'18px'}}
            onError={e=>{e.target.src='https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80';}}
          />
          {/* Circular Rust-Red Discount Badge (like img1) */}
          {discount && (
            <div style={{
              position: 'absolute', top: '8px', left: '8px',
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

          {/* Badge tag on home page cards (like img3 in vibrant purple) */}
          {badge && (
            <div style={{
              position:'absolute', top:'8px', left: discount ? '48px' : '8px',
              background: '#6318EB', color: '#FFFFFF',
              fontSize:'8.5px', fontWeight:800, padding:'3px 8px',
              borderRadius:'5px', display:'flex', alignItems:'center', gap:'3px',
              boxShadow:'0 2px 6px rgba(99, 24, 235, 0.3)',
              maxWidth:'60%', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
              textTransform: 'uppercase'
            }}>
              {badge.label || badge}
            </div>
          )}
          <button
            onClick={e => { e.preventDefault(); inWL ? removeFromWishlist(product.id) : addToWishlist(product); }}
            className="sh-card-wish-btn"
            style={{
              position: 'absolute', bottom: '8px', right: '8px',
              width: '32px', height: '32px', minHeight: '32px', maxHeight: '32px', minWidth: '32px', maxWidth: '32px',
              borderRadius: '50%', background: 'rgba(255,255,255,0.92)',
              border: '1px solid rgba(255,255,255,0.9)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)', padding: 0, boxSizing: 'border-box'
            }}
            title={inWL ? "Remove from Wishlist" : "Add to Wishlist"}>
            <Heart size={13} fill={inWL ? '#E94560' : 'none'} color={inWL ? '#E94560' : '#555'} />
          </button>
        </div>
        <div style={{padding:'12px 14px 14px',flex:1,display:'flex',flexDirection:'column',justify:'space-between'}}>
          <div>
            <p style={{fontSize:'13px',fontWeight:700,color:'#0F172A',marginBottom:'4px',
              overflow:'hidden',display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',lineHeight:1.3,minHeight:'36px'}}>
              {product.name}
            </p>
            <div style={{display:'flex',alignItems:'center',gap:'5px',marginBottom:'8px',minHeight:'20px',flexWrap:'wrap'}}>
              <span style={{fontSize:'15px',fontWeight:900,color:'#0F172A'}}>₹{pPrice.toFixed(0)}</span>
              {pOrig > pPrice &&
                <span style={{fontSize:'11px',color:'#94A3B8',textDecoration:'line-through'}}>
                  ₹{pOrig.toFixed(0)}
                </span>}
              {customDisc && (
                <span style={{fontSize:'10px',fontWeight:700,color:'#388E3C'}}>
                  {customDisc}
                </span>
              )}
            </div>
          </div>
          <button onClick={e=>{e.preventDefault();addToCart(product,1);}}
            style={{width:'100%',padding:'8px',borderRadius:'9999px',
              background:'linear-gradient(135deg,#1A1A2E,#0F3460)',color:'white',
              fontWeight:800,fontSize:'11px',border:'none',cursor:'pointer',
              display:'flex',alignItems:'center',justifyContent:'center',gap:'5px',
              boxShadow:'0 4px 14px rgba(26,26,46,.25)',marginTop:'auto'}}>
            <ShoppingCart size={12}/> Add to Cart
          </button>
        </div>
      </motion.div>
    </Link>
  );
});

/* ─── Horizontal carousel ─────────────────────────────────── */
function Carousel({ children }) {
  const ref = useRef(null);
  const scroll = (dir) => {
    if (ref.current) ref.current.scrollBy({left: dir * 220, behavior:'smooth'});
  };
  return (
    <div className="carousel-outer" style={{position:'relative', overflow:'hidden'}}>
      <button onClick={()=>scroll(-1)}
        className="carousel-arrow carousel-arrow-left"
        style={{position:'absolute',left:'4px',top:'50%',transform:'translateY(-50%)',
          width:'36px',height:'36px',borderRadius:'9999px',background:'#FFFFFF',
          border:'1px solid #E2E8F0',
          boxShadow:'0 4px 16px rgba(0,0,0,.12)',
          cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2,flexShrink:0}}>
        <ChevronLeft size={16} color="#475569"/>
      </button>
      <div ref={ref} style={{
        display:'flex',gap:'16px',overflowX:'auto',alignItems:'stretch',
        padding:'6px 48px 16px',
        scrollbarWidth:'none',msOverflowStyle:'none',
        WebkitOverflowScrolling:'touch',
        touchAction:'pan-x pan-y',
        overscrollBehaviorX:'contain'
      }}>
        {children}
      </div>
      <button onClick={()=>scroll(1)}
        className="carousel-arrow carousel-arrow-right"
        style={{position:'absolute',right:'4px',top:'50%',transform:'translateY(-50%)',
          width:'36px',height:'36px',borderRadius:'9999px',background:'#FFFFFF',
          border:'1px solid #E2E8F0',
          boxShadow:'0 4px 16px rgba(0,0,0,.12)',
          cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',zIndex:2,flexShrink:0}}>
        <ChevronRight size={16} color="#475569"/>
      </button>
    </div>
  );
}

/* ─── Full-Width Hardware-Accelerated Sliding Collections Banner Slider ─── */
const FullWidthCollectionBannerSlider = memo(function FullWidthCollectionBannerSliderComponent({ items, onSelectCategory, category }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Desktop Mouse Drag & Mobile Touch Swipe State
  const isDragging = useRef(false);
  const startX = useRef(0);
  const dragDistance = useRef(0);

  // Touch handlers
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Smooth Auto Scroll loop (4.5 seconds per slide)
  useEffect(() => {
    if (!items || items.length === 0) return;

    const interval = setInterval(() => {
      if (!isDragging.current && !touchStartX.current) {
        setCurrentIndex((prev) => (prev + 1) % items.length);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [items]);

  // Preload images for instant 0-delay rendering
  useEffect(() => {
    if (!items) return;
    items.forEach(item => {
      const src = item.image || item.img;
      if (src) {
        const img = new Image();
        img.src = src;
      }
    });
  }, [items]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  // Mobile Touch Gestures
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current && touchEndX.current) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 30) handleNext();
      else if (diff < -30) handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleTouchCancel = () => {
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Desktop Mouse Drag Events
  const handleMouseDown = (e) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    dragDistance.current = 0;
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current) return;
      dragDistance.current = startX.current - e.clientX;
    };

    const handleMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const diff = dragDistance.current;
      if (diff > 30) handleNext();
      else if (diff < -30) handlePrev();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [items]);

  const handleBannerClick = (id) => {
    if (Math.abs(dragDistance.current) < 15) {
      onSelectCategory(id);
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Top Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <p style={{ fontSize: '11px', fontWeight: 800, color: '#8E8E93', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>
            {category === 'tailoring' ? 'Browse by category' : 'Shop by Style'}
          </p>
          <h2 style={{ fontSize: 'clamp(20px, 4vw, 32px)', fontWeight: 900, color: '#0A0A0A', letterSpacing: '-1px', margin: 0 }}>
            {category === 'tailoring' ? 'Our Collections' : 'Find Your Look'}
          </h2>
        </div>

        {/* Counter & Nav Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', letterSpacing: '1px' }}>
            {String(currentIndex + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
          </span>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handlePrev}
              style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: '#FFFFFF', border: '1px solid #E2E8F0',
                boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              aria-label="Previous collection banner"
            >
              <ChevronLeft size={18} color="#0F172A" />
            </button>
            <button
              onClick={handleNext}
              style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: '#FFFFFF', border: '1px solid #E2E8F0',
                boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              aria-label="Next collection banner"
            >
              <ChevronRight size={18} color="#0F172A" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Full-Width Widescreen Sliding Banner Container with Manual Touch & Mouse Drag */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        style={{
          position: 'relative',
          width: '100%',
          height: 'clamp(180px, 28vw, 400px)',
          borderRadius: '24px',
          overflow: 'hidden',
          background: '#FAFAFA',
          boxShadow: '0 16px 40px rgba(0,0,0,0.08)',
          border: '1px solid #E2E8F0',
          cursor: 'grab',
          userSelect: 'none'
        }}
      >
        {/* Hardware-Accelerated Continuous Track */}
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            transform: `translate3d(-${currentIndex * 100}%, 0, 0)`,
            transition: 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)',
            willChange: 'transform'
          }}
        >
          {items.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => handleBannerClick(item.id)}
              style={{
                position: 'relative',
                flex: '0 0 100%',
                width: '100%',
                height: '100%',
                cursor: 'pointer'
              }}
            >
              {/* Full-width Image */}
              <img
                src={item.image || item.img}
                alt={item.label || item.title}
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  userSelect: 'none',
                  WebkitUserDrag: 'none'
                }}
              />

              {/* Bottom-Left Overlay Text Directly on Image */}
              <div
                style={{
                  position: 'absolute',
                  left: 'clamp(14px, 4vw, 32px)',
                  bottom: 'clamp(14px, 4vw, 32px)',
                  maxWidth: '520px',
                  zIndex: 3,
                  pointerEvents: 'none'
                }}
              >
                <h3
                  style={{
                    fontSize: 'clamp(18px, 3.5vw, 34px)',
                    fontWeight: 900,
                    color: '#FFFFFF',
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    margin: '2px 0 4px 0',
                    letterSpacing: '-0.5px',
                    textShadow: '0 2px 12px rgba(0,0,0,0.7)'
                  }}
                >
                  {item.label || item.title}
                </h3>

                {item.desc && (
                  <p
                    style={{
                      fontSize: 'clamp(11px, 1.6vw, 14px)',
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.95)',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      margin: '0 0 10px 0',
                      textShadow: '0 2px 8px rgba(0,0,0,0.7)'
                    }}
                  >
                    {item.desc}
                  </p>
                )}

                <div
                  className="banner-explore-tag"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 15px',
                    borderRadius: '9999px',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(12px)',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: 800,
                    border: '1px solid rgba(255,255,255,0.3)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                    fontFamily: "'Plus Jakarta Sans', sans-serif"
                  }}
                >
                  Explore Collection <ArrowRight size={13} color="#FFFFFF" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Desktop Edge Arrows (Hidden on Mobile via Inline Media Query or flex) */}
        <button
          className="desktop-banner-arrow"
          onClick={(e) => { e.stopPropagation(); handlePrev(); }}
          style={{
            position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
            width: '42px', height: '42px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
            border: '1px solid #E2E8F0',
            color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 6, boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
          }}
          aria-label="Previous banner"
        >
          <ChevronLeft size={18} color="#0F172A" />
        </button>

        <button
          className="desktop-banner-arrow"
          onClick={(e) => { e.stopPropagation(); handleNext(); }}
          style={{
            position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)',
            width: '42px', height: '42px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)',
            border: '1px solid #E2E8F0',
            color: '#0F172A', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 6, boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
          }}
          aria-label="Next banner"
        >
          <ChevronRight size={18} color="#0F172A" />
        </button>

        {/* Bottom Center Indicator Dots Bar */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            zIndex: 6,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(12px)',
            padding: '5px 12px',
            borderRadius: '9999px',
            border: '1px solid rgba(255,255,255,0.25)',
            maxWidth: '90%',
            whiteSpace: 'nowrap'
          }}
        >
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              style={{
                width: currentIndex === idx ? '20px' : '6px',
                height: '6px',
                minWidth: currentIndex === idx ? '20px' : '6px',
                minHeight: '6px',
                borderRadius: '9999px',
                background: currentIndex === idx ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                padding: 0,
                flexShrink: 0
              }}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

/* ─── Collection Card ─────────────────────────────────────── */
function CollectionCard({ cls='', label, title, count, img, onClick, dark=false }) {
  return (
    <Reveal style={{ display:'contents' }}>
      <motion.div className={`col-card ${cls}`}
        whileHover={{
          y: -8,
          scale: 1.01,
          boxShadow: '0 24px 50px -10px rgba(0,0,0,.35), 0 0 20px rgba(255,255,255,.2)',
          borderColor: 'rgba(255, 255, 255, 0.45)'
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={onClick}
        style={{ position:'relative', overflow:'hidden', borderRadius:'28px',
          cursor:'pointer', background:'#1A1A2E',
          boxShadow:'0 8px 32px rgba(0,0,0,.12)', border:'1px solid rgba(255,255,255,.15)' }}>

        <motion.div whileHover={{ scale:1.06 }}
          transition={{ duration:.5, ease:[0.16, 1, 0.3, 1] }}
          style={{ position:'absolute', inset:0 }}>
          <img src={img} alt={title} loading="lazy"
            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}
            onError={e => { e.target.style.display='none'; }}/>
        </motion.div>

        {/* Overlay removed per user request */}

        <div className="col-card-padding" style={{ position:'absolute', inset:0, padding:'18px 20px',
          display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'6px' }}>
            {count && <span className="col-card-count" style={{ fontSize:'11px', fontWeight:800, fontFamily: "'Plus Jakarta Sans', sans-serif", color:'rgba(255, 255, 255, 0.95)', whiteSpace:'nowrap' }}>{count}</span>}
          </div>
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:'8px' }}>
            <h3 className="col-card-title" style={{ fontSize:'clamp(15px,1.9vw,22px)', fontWeight:700,
              fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
              color: '#FFFFFF',
              letterSpacing:'-.025em', lineHeight:1.15, margin:0, overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{title}</h3>
            <motion.div whileHover={{ x:4, scale:1.1 }}
              style={{ width:'36px', height:'36px', borderRadius:'9999px', flexShrink:0,
                background: 'rgba(255, 255, 255, 0.22)',
                backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)',
                display:'flex', alignItems:'center', justifyContent:'center',
                border: '1px solid rgba(255, 255, 255, 0.45)',
                boxShadow:'0 4px 16px rgba(0,0,0,0.12)' }}>
              <ArrowRight size={15} color="#FFFFFF"/>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}

/* ─── Main Home Component ─────────────────────────────────── */
export default function Home() {
  const { activeCategory, setActiveCategory, isWomenSectionLocked, cmsData, cmsDraft, addToCart } = useApp();
  const [searchParams]          = useSearchParams();
  const searchQuery              = searchParams.get('q') || '';
  const isPreviewMode            = searchParams.get('preview') === 'draft';
  const activeCms                = isPreviewMode ? (cmsDraft || cmsData) : cmsData;

  const [sortBy,           setSortBy]           = useState('featured');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [loading,  setLoading]        = useState(true);
  const [sub,      setSub]            = useState('all');
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [flashDeals,  setFlashDeals]  = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  const productsRef = useRef(null);
  const filterRef   = useRef(null);

  const [isMobileMarqueeActive, setIsMobileMarqueeActive] = useState(false);

  useEffect(() => {
    if (isWomenSectionLocked && activeCategory === 'fashion') {
      setActiveCategory('tailoring');
    }
  }, [isWomenSectionLocked, activeCategory, setActiveCategory]);

  useEffect(() => {
    setIsMobileMarqueeActive(false);
    // Entrance animations (~1.3s) + 1.5s wait = 2.8s total delay before horizontal loop starts
    const timer = setTimeout(() => {
      setIsMobileMarqueeActive(true);
    }, 2800);
    return () => clearTimeout(timer);
  }, [activeCategory]);

  // Dynamic CMS resolution — grad & accentColor are ALWAYS taken from CONTENT
  // (never CMS/localStorage) so each tab has its fixed identity:
  //   tailoring = lavender  |  fashion = dark navy
  const cmsHero = activeCms?.hero?.[activeCategory] || CONTENT[activeCategory];
  const c = {
    ...CONTENT[activeCategory],
    title: cmsHero.title || CONTENT[activeCategory].title,
    titleAccent: cmsHero.titleAccent || CONTENT[activeCategory].titleAccent,
    titleLine2: cmsHero.titleLine2 || CONTENT[activeCategory].titleLine2,
    sub: cmsHero.sub || CONTENT[activeCategory].sub,
    // grad and accentColor are LOCKED to CONTENT — CMS cannot change them
    grad: CONTENT[activeCategory].grad,
    accentColor: CONTENT[activeCategory].accentColor,
    illustration: cmsHero.illustration || CONTENT[activeCategory].illustration,
    badgeText: cmsHero.badgeText || 'New Collection 2026',
    btn1Text: cmsHero.btn1Text || 'Shop Now',
    btn2Text: cmsHero.btn2Text || 'Explore',
    collections: activeCms?.collections?.[activeCategory] || CONTENT[activeCategory].collections,
  };
  // true when hero background is dark (fashion = dark navy)
  const isDark = activeCategory === 'fashion';

  // SEO Update
  useEffect(() => {
    if (activeCms?.seo?.metaTitle) document.title = activeCms.seo.metaTitle;
  }, [activeCms]);

  const [allCategoryProducts, setAllCategoryProducts] = useState([]);
  const productsCache = useRef({});
  const featuredCache = useRef({});

  useEffect(() => { setSub('all'); }, [activeCategory]);

  // Fetch all active products for the current active category with SWR Instant Caching
  useEffect(() => {
    let isCancelled = false;

    // 1. Instant Cache Hit (0ms delay)
    if (productsCache.current[activeCategory]) {
      setAllCategoryProducts(productsCache.current[activeCategory]);
      setLoading(false);
    } else {
      setLoading(true);
    }

    (async () => {
      try {
        const { data } = await supabase
          .from('products')
          .select('*')
          .eq('category', activeCategory)
          .eq('active', true)
          .order('created_at', { ascending: false });

        if (!isCancelled && data) {
          productsCache.current[activeCategory] = data;
          setAllCategoryProducts(data);
        }
      } catch (e) {
        console.error('Error loading products for category:', e);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    })();

    // Background prefetch the alternative category after initial paint
    const prefetchTimer = setTimeout(() => {
      const altCategory = activeCategory === 'tailoring' ? 'fashion' : 'tailoring';
      if (!productsCache.current[altCategory]) {
        supabase
          .from('products')
          .select('*')
          .eq('category', altCategory)
          .eq('active', true)
          .order('created_at', { ascending: false })
          .then(({ data }) => {
            if (data) productsCache.current[altCategory] = data;
          })
          .catch(() => {});
      }
    }, 1200);

    return () => {
      isCancelled = true;
      clearTimeout(prefetchTimer);
    };
  }, [activeCategory]);

  // Compute dynamic subcategories: merged from CMS settings + defaults + any custom product subcategories
  const activeSubcategories = (() => {
    const cmsList = activeCms?.subcategories?.[activeCategory]
      || CONTENT[activeCategory]?.subs
      || DEFAULT_CMS_DATA.subcategories[activeCategory];

    const list = [...(cmsList || [])];
    const seen = new Set(list.map(s => normalizeCategoryKey(s.id || s.key)));

    // Ensure 'all' chip is always at index 0
    if (!seen.has('all')) {
      list.unshift({ id: 'all', label: 'All', icon: 'Sparkles', active: true });
      seen.add('all');
    }

    // Dynamic scan: append any active product subcategory not present in the list
    (allCategoryProducts || []).forEach(p => {
      const raw = (p.sub_category || '').trim();
      const norm = normalizeCategoryKey(raw);
      if (norm && !seen.has(norm)) {
        seen.add(norm);
        const label = raw.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
        list.push({ id: norm, label, icon: 'Tag', active: true });
      }
    });

    return list.filter(s => s.active !== false);
  })();

  // Filter products by subcategory and search query with resilient normalization
  const products = (allCategoryProducts || []).filter(p => {
    const s = searchQuery.trim().toLowerCase();
    if (s && !(p.name || '').toLowerCase().includes(s) && !(p.sub_category || '').toLowerCase().includes(s)) {
      return false;
    }
    if (sub === 'all') return true;
    const normSub = normalizeCategoryKey(sub);
    const prodNorm = normalizeCategoryKey(p.sub_category);
    return prodNorm === normSub || (p.sub_category || '').trim().toLowerCase() === sub.trim().toLowerCase();
  });

  // Fetch featured sections according to CMS configuration with SWR cache
  useEffect(() => {
    const cacheKey = `${activeCategory}_${JSON.stringify(activeCms?.flashDeals || {})}_${JSON.stringify(activeCms?.newArrivals || {})}`;
    
    if (featuredCache.current[cacheKey]) {
      const cached = featuredCache.current[cacheKey];
      setNewArrivals(cached.newArrivals || []);
      setBestSellers(cached.bestSellers || []);
      setFlashDeals(cached.flashDeals || []);
    }

    (async () => {
      try {
        const cmsFlash = activeCms?.flashDeals || {};
        const cmsNew = activeCms?.newArrivals || {};
        const cmsPicks = activeCms?.topPicks || {};

        let flashQuery = supabase.from('products').select('*').eq('category', activeCategory).eq('active', true);
        if (cmsFlash.selectedProductIds?.length > 0) {
          flashQuery = flashQuery.in('id', cmsFlash.selectedProductIds);
        } else {
          flashQuery = flashQuery.not('original_price', 'is', null).order('created_at', { ascending: false }).limit(cmsFlash.maxDisplay || 12);
        }

        let newQuery = supabase.from('products').select('*').eq('category', activeCategory).eq('active', true);
        if (cmsNew.selectedProductIds?.length > 0 && cmsNew.mode === 'manual') {
          newQuery = newQuery.in('id', cmsNew.selectedProductIds);
        } else {
          newQuery = newQuery.order('created_at', { ascending: false }).limit(cmsNew.maxDisplay || 8);
        }

        let picksQuery = supabase.from('products').select('*').eq('category', activeCategory).eq('active', true);
        if (cmsPicks.selectedProductIds?.length > 0) {
          picksQuery = picksQuery.in('id', cmsPicks.selectedProductIds);
        } else {
          picksQuery = picksQuery.order('price', { ascending: false }).limit(cmsPicks.maxDisplay || 8);
        }

        const [n, b, f] = await Promise.all([newQuery, picksQuery, flashQuery]);

        const nData = n.data || [];
        const bData = b.data || [];
        const fData = (f.data || []).filter(p => cmsFlash.selectedProductIds?.length > 0 || Number(p.original_price) > Number(p.price));

        featuredCache.current[cacheKey] = { newArrivals: nData, bestSellers: bData, flashDeals: fData };
        setNewArrivals(nData);
        setBestSellers(bData);
        setFlashDeals(fData);
      } catch(err) { console.error('Featured fetch error:', err); }
    })();
  }, [activeCategory, activeCms]);

  // Track recently viewed
  useEffect(() => {
    try {
      const rv = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
      if (rv.length > 0) {
        supabase.from('products').select('*').in('id', rv.slice(0,6))
          .then(({ data }) => setRecentlyViewed(data || []));
      }
    } catch(e) {}
  }, []);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior:'smooth', block:'start' });

  return (
    <div style={{ background:'#FAFAFA', minHeight:'100vh' }}>
      <SEO
        title="Asmalabel | Premium Tailoring Tools & Women's Fashion"
        description="Shop premium tailoring tools, sewing accessories, textiles and women's fashion at Asmalabel. Based in Nellore, Andhra Pradesh."
        canonical="https://asmalabel.in/"
        schema={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Asmalabel",
          "alternateName": "Asma Label",
          "url": "https://asmalabel.in/"
        }}
      />

      {/* ══ HERO ═════════════════════════════════════════════════ */}
      <div className="hero-container-wrap hero-compact" style={{ background:c.grad, position:'relative', overflow:'hidden',
        display:'flex', flexDirection:'column', justifyContent:'center', transition:'background .6s ease',
        marginTop: '-1px', borderTop: 'none' }}>

        {/* ── Tailoring: 100% full-bleed hero image (desktop) ── */}
        {!isDark && (
          <div className="sh-desktop-bg" style={{position:'absolute',inset:0,zIndex:0,overflow:'hidden',pointerEvents:'none'}}>
            <img src={`${c.illustration}?v=2560`} alt={c.illustrationAlt}
              style={{width:'100%',height:'100%',objectFit:'cover',
                objectPosition:'right center',display:'block',userSelect:'none',
                imageRendering:'-webkit-optimize-contrast'}}
              onError={e=>{e.target.src='/images/tailoring_hero.jpg';}}
            />
          </div>
        )}

        <div className="sh-container hero-inner-wrap" style={{paddingTop:'28px',paddingBottom:'30px',position:'relative',zIndex:1}}>
          <div className="hero-combined-wrapper" style={{position:'relative',width:'100%',display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:'32px',maxWidth:'100%'}}>

            {/* LEFT — Hero Text Content */}
            <motion.div key={`text-${activeCategory}`} className="hero-content-box" style={{maxWidth:'440px',minWidth:'300px',zIndex:2,flex:'0 0 42%'}} initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.25}}>
              {/* Badge */}
              <div style={{marginBottom:'20px'}}>
                <span style={{display:'inline-flex',alignItems:'center',gap:'7px',
                  padding:'7px 18px',borderRadius:'99px',
                  background: isDark ? 'rgba(255,255,255,.13)' : 'rgba(255,255,255,.75)',
                  backdropFilter:'blur(12px)',
                  WebkitBackdropFilter:'blur(12px)',
                  border: isDark ? '1px solid rgba(255,255,255,.2)' : '1px solid rgba(139,115,168,.25)',
                  boxShadow: isDark ? '0 4px 16px rgba(0,0,0,.12)' : '0 4px 16px rgba(107,79,138,.08)',
                  fontSize:'11px',fontWeight:800,
                  color: isDark ? 'rgba(255,255,255,.9)' : '#4A3563',
                  letterSpacing:'1.2px',textTransform:'uppercase'}}>
                  <Sparkles size={13} strokeWidth={2.5} color={isDark ? 'rgba(255,255,255,.8)' : '#6B4F8A'}/> New Collection 2026
                </span>
              </div>

              {/* Heading */}
              <div>
                <h1 style={{fontSize:'clamp(38px,6vw,68px)',
                  fontWeight: isDark ? 900 : 700,
                  fontFamily: isDark ? 'inherit' : "'Playfair Display', Georgia, serif",
                  color: isDark ? 'rgba(255,255,255,.95)' : '#252329',
                  lineHeight:1.05,
                  letterSpacing: isDark ? '-2.5px' : '-0.8px',
                  margin:0}}>
                  {c.title}
                </h1>
                <h1 style={{fontSize:'clamp(38px,6vw,68px)',
                  fontWeight: isDark ? 900 : 700,
                  fontFamily: isDark ? 'inherit' : "'Playfair Display', Georgia, serif",
                  color: isDark ? c.accentColor : '#634780',
                  lineHeight:1.05,
                  letterSpacing: isDark ? '-2.5px' : '-0.8px',
                  marginBottom:'8px',transition:'color .6s'}}>
                  {c.titleAccent}
                </h1>
                <p style={{fontSize:'clamp(15px,1.9vw,18px)',fontWeight:700,
                  color: isDark ? 'rgba(255,255,255,.55)' : '#3E3846',
                  letterSpacing:'-.2px',marginBottom:'16px'}}>
                  {c.titleLine2}
                </p>
              </div>

              <p style={{fontSize:'clamp(13px,1.5vw,15px)',
                color: isDark ? 'rgba(255,255,255,.6)' : '#554E60',
                maxWidth:'440px',lineHeight:1.75,marginBottom:'32px',fontWeight:400}}>
                {c.sub}
              </p>

              {/* CTAs */}
              <div style={{display:'flex',gap:'12px',flexWrap:'wrap',marginBottom:'36px'}}>
                <motion.button onClick={() => scrollTo(productsRef)}
                  whileHover={{scale:1.04,boxShadow:'0 12px 32px rgba(37,35,41,.28)'}}
                  whileTap={{scale:.97}}
                  style={{display:'inline-flex',alignItems:'center',gap:'9px',padding:'14px 30px',
                    borderRadius:'14px',
                    background: isDark ? 'white' : '#252329',
                    color: isDark ? '#0A2540' : '#FAF8F4',
                    fontSize:'14px',fontWeight:800,border:'none',cursor:'pointer',
                    boxShadow:'0 8px 24px rgba(37,35,41,.22)'}}>
                  <Package size={16} strokeWidth={2.5} color={isDark ? '#0A2540' : '#FAF8F4'}/> Shop Now
                </motion.button>
                <motion.button onClick={() => scrollTo(filterRef)}
                  whileHover={{scale:1.04}}
                  whileTap={{scale:.97}}
                  style={{display:'inline-flex',alignItems:'center',gap:'9px',padding:'14px 24px',
                    borderRadius:'14px',
                    background: isDark ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.75)',
                    backdropFilter:'blur(12px)',
                    WebkitBackdropFilter:'blur(12px)',
                    border: isDark ? '1.5px solid rgba(255,255,255,.25)' : '1.5px solid #8C789F',
                    color: isDark ? 'white' : '#252329',
                    fontSize:'14px',fontWeight:800,cursor:'pointer',
                    boxShadow:'0 4px 16px rgba(107,79,138,.08)'}}>
                  Explore
                  <motion.span animate={{x:[0,4,0]}} transition={{duration:1.5,repeat:Infinity}}>
                    <ArrowRight size={16} strokeWidth={2.5} color={isDark ? 'white' : '#252329'}/>
                  </motion.span>
                </motion.button>
              </div>

              {/* Trust badges */}
              <div style={{display:'flex',gap:'18px',flexWrap:'wrap'}}>
                {[
                  {icon:Truck,     text:'Fast Delivery'},
                  {icon:Shield,    text:'Secure Pay'},
                  {icon:BadgeCheck,text:'100% Genuine'},
                ].map(({icon:Icon,text})=>(
                  <div key={text} style={{display:'flex',alignItems:'center',gap:'6px'}}>
                    <Icon size={14} strokeWidth={2.2} color={c.accentColor}/>
                    <span style={{fontSize:'12px',fontWeight:700,color: isDark ? 'rgba(255,255,255,.7)' : '#4A4354'}}>{text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* RIGHT — Photo Column (image-column) */}
            <motion.div className="hero-photo-column" key={`illus-${activeCategory}`}
              initial={{opacity:0}} animate={{opacity:1}} transition={{duration:0.25}}
              style={{position:'relative',flex:'0 0 58%',minWidth:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {isDark ? (
                  <>
                    {/* ── DESKTOP COLLAGE — 100% Untouched original layout ── */}
                    <div className="hero-image-collage sh-desktop-only" style={{
                      position: 'relative',
                      width: '760px',
                      height: '500px',
                      boxSizing: 'border-box',
                      userSelect: 'none',
                      overflow: 'visible',
                      margin: '0 auto',
                      flex: 'none',
                      transformOrigin: 'center center',
                    }}>
                      {/* ① CARD 1 — NAVY FLORAL DRESS */}
                      <motion.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.0, ease: [0.22, 1, 0.36, 1] }} whileHover={{ scale: 1.02, zIndex: 20 }} style={{ position: 'absolute', zIndex: 1, left: '0px', top: '0px', width: '255px', height: '355px', borderRadius: '26px', overflow: 'hidden', boxSizing: 'border-box', border: '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 16px 40px rgba(0,0,0,0.22)' }}>
                        <img src="/images/fashion_photo_1.jpg" alt="Navy Floral Dress" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </motion.div>
                      {/* ② CARD 2 — LAVENDER OUTFIT */}
                      <motion.div initial={{ opacity: 0, y: -60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }} whileHover={{ scale: 1.02, zIndex: 20 }} style={{ position: 'absolute', zIndex: 1, left: '265px', top: '0px', width: '278px', height: '225px', borderRadius: '26px', overflow: 'hidden', boxSizing: 'border-box', border: '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 14px 32px rgba(0,0,0,0.18)' }}>
                        <img src="/images/fashion_photo_2.jpg" alt="Lavender Outfit" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </motion.div>
                      {/* ③ CARD 3 — BEIGE BLAZER */}
                      <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }} whileHover={{ scale: 1.02, zIndex: 20 }} style={{ position: 'absolute', zIndex: 1, left: '555px', top: '40px', width: '200px', height: '360px', borderRadius: '26px', overflow: 'hidden', boxSizing: 'border-box', border: '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 14px 38px rgba(0,0,0,0.22)' }}>
                        <img src="/images/fashion_photo_3.jpg" alt="Beige Blazer" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </motion.div>
                      {/* ④ CARD 4 — CREAM DRESS */}
                      <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} whileHover={{ scale: 1.02, zIndex: 20 }} style={{ position: 'absolute', zIndex: 2, left: '228px', top: '240px', width: '195px', height: '242px', borderRadius: '26px', overflow: 'hidden', boxSizing: 'border-box', border: '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 16px 42px rgba(0,0,0,0.22)' }}>
                        <img src="/images/fashion_photo_4.jpg" alt="Cream Dress" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </motion.div>
                      {/* ⑤ CARD 5 — GREEN DRESS */}
                      <motion.div initial={{ opacity: 0, x: -40, y: 40 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} whileHover={{ scale: 1.02, zIndex: 20 }} style={{ position: 'absolute', zIndex: 3, left: '43px', top: '345px', width: '175px', height: '137px', borderRadius: '26px', overflow: 'hidden', boxSizing: 'border-box', border: '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 12px 30px rgba(0,0,0,0.22)' }}>
                        <img src="/images/fashion_photo_5.jpg" alt="Green Dress" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </motion.div>
                      {/* ⑥ CARD 6 — PINK DRESS */}
                      <motion.div initial={{ opacity: 0, x: 40, y: 40 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }} whileHover={{ scale: 1.02, zIndex: 20 }} style={{ position: 'absolute', zIndex: 3, left: '425px', top: '300px', width: '160px', height: '180px', borderRadius: '26px', overflow: 'hidden', boxSizing: 'border-box', border: '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 12px 30px rgba(0,0,0,0.22)' }}>
                        <img src="/images/fashion_photo_6.jpg" alt="Pink Dress" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </motion.div>
                    </div>

                    {/* ── MOBILE COLLAGE CAROUSEL — Active ONLY on Mobile ── */}
                    <div className="sh-mobile-only" style={{
                      width: '100%',
                      maxWidth: '100vw',
                      overflow: 'hidden',
                      marginTop: '16px',
                      position: 'relative',
                    }}>
                      <div style={{
                        display: 'flex',
                        width: 'max-content',
                        transform: 'translate3d(0,0,0)',
                        animation: isMobileMarqueeActive ? 'mobileCollageMarqueeLoop 16s linear infinite' : 'none',
                        willChange: isMobileMarqueeActive ? 'transform' : 'auto',
                      }}>

                        {/* ── COMPLETE COLLAGE COPY A (With 6 original card entrance animations) ── */}
                        <div style={{
                          position: 'relative',
                          width: 'calc(100vw - 32px)',
                          maxWidth: '420px',
                          aspectRatio: '760 / 500',
                          flexShrink: 0,
                          boxSizing: 'border-box',
                          userSelect: 'none',
                          margin: '0 auto',
                        }}>
                          {/* ① CARD 1 — NAVY FLORAL DRESS */}
                          <motion.div
                            key={`mc1-${activeCategory}`}
                            initial={{ opacity: 0, x: -60 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.0, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                              position: 'absolute', zIndex: 1,
                              left: '0%', top: '0%',
                              width: '33.55%', height: '71%',
                              borderRadius: 'clamp(10px, 3.4vw, 26px)',
                              overflow: 'hidden', boxSizing: 'border-box',
                              border: '1.5px solid rgba(255,255,255,0.35)',
                              boxShadow: '0 16px 40px rgba(0,0,0,0.22)'
                            }}
                          >
                            <img src="/images/fashion_photo_1.jpg" alt="Navy Floral Dress" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </motion.div>

                          {/* ② CARD 2 — LAVENDER OUTFIT */}
                          <motion.div
                            key={`mc2-${activeCategory}`}
                            initial={{ opacity: 0, y: -60 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                              position: 'absolute', zIndex: 1,
                              left: '34.87%', top: '0%',
                              width: '36.58%', height: '45%',
                              borderRadius: 'clamp(10px, 3.4vw, 26px)',
                              overflow: 'hidden', boxSizing: 'border-box',
                              border: '1.5px solid rgba(255,255,255,0.35)',
                              boxShadow: '0 14px 32px rgba(0,0,0,0.18)'
                            }}
                          >
                            <img src="/images/fashion_photo_2.jpg" alt="Lavender Outfit" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </motion.div>

                          {/* ③ CARD 3 — BEIGE BLAZER */}
                          <motion.div
                            key={`mc3-${activeCategory}`}
                            initial={{ opacity: 0, x: 60 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                              position: 'absolute', zIndex: 1,
                              left: '73.03%', top: '8%',
                              width: '26.32%', height: '72%',
                              borderRadius: 'clamp(10px, 3.4vw, 26px)',
                              overflow: 'hidden', boxSizing: 'border-box',
                              border: '1.5px solid rgba(255,255,255,0.35)',
                              boxShadow: '0 14px 38px rgba(0,0,0,0.22)'
                            }}
                          >
                            <img src="/images/fashion_photo_3.jpg" alt="Beige Blazer" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </motion.div>

                          {/* ④ CARD 4 — CREAM DRESS */}
                          <motion.div
                            key={`mc4-${activeCategory}`}
                            initial={{ opacity: 0, y: 60 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                              position: 'absolute', zIndex: 2,
                              left: '30%', top: '48%',
                              width: '25.66%', height: '48.4%',
                              borderRadius: 'clamp(10px, 3.4vw, 26px)',
                              overflow: 'hidden', boxSizing: 'border-box',
                              border: '1.5px solid rgba(255,255,255,0.35)',
                              boxShadow: '0 16px 42px rgba(0,0,0,0.22)'
                            }}
                          >
                            <img src="/images/fashion_photo_4.jpg" alt="Cream Dress" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </motion.div>

                          {/* ⑤ CARD 5 — GREEN DRESS */}
                          <motion.div
                            key={`mc5-${activeCategory}`}
                            initial={{ opacity: 0, x: -40, y: 40 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                              position: 'absolute', zIndex: 3,
                              left: '5.66%', top: '69%',
                              width: '23.03%', height: '27.4%',
                              borderRadius: 'clamp(10px, 3.4vw, 26px)',
                              overflow: 'hidden', boxSizing: 'border-box',
                              border: '1.5px solid rgba(255,255,255,0.35)',
                              boxShadow: '0 12px 30px rgba(0,0,0,0.22)'
                            }}
                          >
                            <img src="/images/fashion_photo_5.jpg" alt="Green Dress" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </motion.div>

                          {/* ⑥ CARD 6 — PINK DRESS */}
                          <motion.div
                            key={`mc6-${activeCategory}`}
                            initial={{ opacity: 0, x: 40, y: 40 }}
                            animate={{ opacity: 1, x: 0, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                            style={{
                              position: 'absolute', zIndex: 3,
                              left: '55.92%', top: '60%',
                              width: '21.05%', height: '36%',
                              borderRadius: 'clamp(10px, 3.4vw, 26px)',
                              overflow: 'hidden', boxSizing: 'border-box',
                              border: '1.5px solid rgba(255,255,255,0.35)',
                              boxShadow: '0 12px 30px rgba(0,0,0,0.22)'
                            }}
                          >
                            <img src="/images/fashion_photo_6.jpg" alt="Pink Dress" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          </motion.div>
                        </div>

                        {/* ── COMPLETE COLLAGE COPY B — Mounted adjacent with 0px gap, unmounted/hidden during entrance ── */}
                        {isMobileMarqueeActive && (
                          <div style={{
                            position: 'relative',
                            width: 'calc(100vw - 32px)',
                            maxWidth: '420px',
                            aspectRatio: '760 / 500',
                            flexShrink: 0,
                            boxSizing: 'border-box',
                            userSelect: 'none',
                          }}>
                            {/* ① CARD 1 — NAVY FLORAL DRESS */}
                            <div style={{ position: 'absolute', zIndex: 1, left: '0%', top: '0%', width: '33.55%', height: '71%', borderRadius: 'clamp(10px, 3.4vw, 26px)', overflow: 'hidden', boxSizing: 'border-box', border: '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 16px 40px rgba(0,0,0,0.22)' }}>
                              <img src="/images/fashion_photo_1.jpg" alt="Navy Floral Dress" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>

                            {/* ② CARD 2 — LAVENDER OUTFIT */}
                            <div style={{ position: 'absolute', zIndex: 1, left: '34.87%', top: '0%', width: '36.58%', height: '45%', borderRadius: 'clamp(10px, 3.4vw, 26px)', overflow: 'hidden', boxSizing: 'border-box', border: '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 14px 32px rgba(0,0,0,0.18)' }}>
                              <img src="/images/fashion_photo_2.jpg" alt="Lavender Outfit" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>

                            {/* ③ CARD 3 — BEIGE BLAZER */}
                            <div style={{ position: 'absolute', zIndex: 1, left: '73.03%', top: '8%', width: '26.32%', height: '72%', borderRadius: 'clamp(10px, 3.4vw, 26px)', overflow: 'hidden', boxSizing: 'border-box', border: '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 14px 38px rgba(0,0,0,0.22)' }}>
                              <img src="/images/fashion_photo_3.jpg" alt="Beige Blazer" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>

                            {/* ④ CARD 4 — CREAM DRESS */}
                            <div style={{ position: 'absolute', zIndex: 2, left: '30%', top: '48%', width: '25.66%', height: '48.4%', borderRadius: 'clamp(10px, 3.4vw, 26px)', overflow: 'hidden', boxSizing: 'border-box', border: '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 16px 42px rgba(0,0,0,0.22)' }}>
                              <img src="/images/fashion_photo_4.jpg" alt="Cream Dress" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>

                            {/* ⑤ CARD 5 — GREEN DRESS */}
                            <div style={{ position: 'absolute', zIndex: 3, left: '5.66%', top: '69%', width: '23.03%', height: '27.4%', borderRadius: 'clamp(10px, 3.4vw, 26px)', overflow: 'hidden', boxSizing: 'border-box', border: '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 12px 30px rgba(0,0,0,0.22)' }}>
                              <img src="/images/fashion_photo_5.jpg" alt="Green Dress" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>

                            {/* ⑥ CARD 6 — PINK DRESS */}
                            <div style={{ position: 'absolute', zIndex: 3, left: '55.92%', top: '60%', width: '21.05%', height: '36%', borderRadius: 'clamp(10px, 3.4vw, 26px)', overflow: 'hidden', boxSizing: 'border-box', border: '1.5px solid rgba(255,255,255,0.35)', boxShadow: '0 12px 30px rgba(0,0,0,0.22)' }}>
                              <img src="/images/fashion_photo_6.jpg" alt="Pink Dress" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                            </div>
                          </div>
                        )}

                      </div>
                    </div>
                  </>
                ) : (
                  /* Mobile Tailoring Photo Card */
                  <div className="sh-mobile-only" style={{
                    width: '100%', marginTop: '20px', borderRadius: '24px', overflow: 'hidden',
                    boxShadow: '0 16px 40px -8px rgba(107,79,138,0.22)', border: '1.5px solid rgba(255,255,255,0.6)'
                  }}>
                    <img src={c.illustration} alt={c.illustrationAlt}
                      style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none', maxHeight: '320px', objectFit: 'cover' }}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1000&auto=format&fit=crop&q=80'; }}
                    />
                  </div>
                )}
                </motion.div>
            </div>
          </div>

        {/* Stats bar */}
        <div className="hero-stats-bar" style={{
          background: isDark ? 'rgba(0,0,0,.28)' : 'rgba(255,255,255,.65)',
          backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)',
          borderTop: isDark ? '1px solid rgba(255,255,255,.08)' : '1px solid rgba(255,255,255,.8)',
          borderBottom: isDark ? '1px solid rgba(255,255,255,.06)' : '1px solid rgba(139,115,168,.15)'}}>
          <div className="sh-container" style={{padding:'14px 0'}}>
            <div className="hero-stats-inner" style={{display:'flex',justifyContent:'space-around',flexWrap:'wrap',gap:'10px 16px'}}>
              {[
                {icon:Star,   val:'4.9', suf:' ★', label:'Rating',   isStatic:true},
                {icon:Package,val:500,   suf:'+',  label:'Products',  isStatic:false},
                {icon:Users,  val:2400,  suf:'+',  label:'Customers', isStatic:false},
                {icon:Truck,  val:null,  suf:'',   label:'Pan India Delivery', isStatic:true},
              ].map(({icon:Icon,val,suf,label,isStatic})=>(
                <div key={label} style={{display:'flex',alignItems:'center',gap:'7px',flexShrink:0}}>
                  <Icon size={14} strokeWidth={2.2} color={c.accentColor}/>
                  <span style={{fontSize:'14px',fontWeight:900,
                    color: isDark ? 'white' : '#252329',whiteSpace:'nowrap'}}>
                    {isStatic
                      ? (val === null ? null : val + suf)
                      : <><Counter value={val} suffix={suf}/></>}
                  </span>
                  {val !== null && <span style={{fontSize:'12px',fontWeight:600,
                    color: isDark ? 'rgba(255,255,255,.45)' : '#635B70',whiteSpace:'nowrap'}}>{label}</span>}
                  {val === null && <span style={{fontSize:'14px',fontWeight:900,
                    color: isDark ? 'white' : '#252329',whiteSpace:'nowrap'}}>{label}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll hint */}
        <motion.div animate={{y:[0,7,0]}} transition={{duration:2,repeat:Infinity}}
          onClick={() => scrollTo(filterRef)}
          style={{position:'absolute',bottom:'64px',left:'50%',transform:'translateX(-50%)',
            cursor:'pointer',zIndex:1,opacity:0.6,
            display:'flex',flexDirection:'column',alignItems:'center',gap:'3px'}}>
          <span style={{fontSize:'9px',fontWeight:700,letterSpacing:'1.5px',
            textTransform:'uppercase',
            color: isDark ? 'rgba(255,255,255,.5)' : '#6B4F8A'}}>scroll</span>
          <ChevronDown size={18} strokeWidth={2} color={isDark ? 'rgba(255,255,255,.5)' : '#6B4F8A'}/>
        </motion.div>
      </div>

      {/* ══ TRUST BADGES / VALUE PROPS HORIZONTAL STRIP (Fully Customizable from CMS) ════════════════════ */}
      {activeCms?.trustBadges?.enabled === true && (
        <div style={{ background: '#FFFFFF', borderBottom: '1px solid #F1F5F9', padding: '16px 0', overflow: 'hidden' }}>
          <div className="sh-container">
            <div
              className="sh-trust-strip sh-scroll-hide"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '12px',
                alignItems: 'center',
              }}
            >
              {(activeCms?.trustBadges?.items || DEFAULT_CMS_DATA.trustBadges?.items || []).filter(item => item.active !== false).map((item) => {
                const IconComp = TRUST_ICON_MAP[item.icon] || Shield;
                return (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: '#FFFFFF',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0F172A',
                        flexShrink: 0,
                      }}
                    >
                      <IconComp size={18} color="#0F172A" />
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </h4>
                      <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ══ FLASH DEALS (if enabled & has discounted/selected products) ═════════ */}
      {activeCms?.flashDeals?.enabled !== false && flashDeals.length > 0 && (
        <div style={{background:'linear-gradient(135deg,#1A1A2E,#0F3460)',padding:'80px 0'}}>
          <div className="sh-container">
            <Reveal>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
                marginBottom:'24px',flexWrap:'wrap',gap:'12px'}}>
                <div style={{display:'flex',alignItems:'center',gap:'14px',flexWrap:'wrap'}}>
                  <div className="flash-deals-badge-glow" style={{
                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)',
                    color:'white',fontSize:'11px',fontWeight:900,
                    padding:'7px 16px',borderRadius:'9999px',display:'flex',alignItems:'center',
                    gap:'6px', letterSpacing:'1px', textTransform:'uppercase'
                  }}>
                    <Zap size={14} fill="white" className="zap-flash-icon"/> {activeCms?.flashDeals?.badge || 'FLASH DEALS'}
                  </div>
                  <DealTimer/>
                </div>
                <span style={{fontSize:'12px',fontWeight:700,color:'rgba(255,255,255,.5)'}}>
                  {activeCms?.flashDeals?.subtitle || 'Limited time offers'}
                </span>
              </div>
            </Reveal>
            <Carousel>
              {flashDeals.map(p => (
                <MiniCard key={p.id} product={p}
                  badge={{label:'SALE',icon:'🔥',bg:'#FEF2F2',color:'#EF4444'}}/>
              ))}
            </Carousel>
          </div>
        </div>
      )}


      {/* ══ FEATURED COLLECTIONS (FULL-WIDTH AUTO-SCROLLING BANNER SLIDER) ════════════════════ */}
      {c.collections && c.collections.length > 0 && (
        <div className="collections-section" style={{padding:'32px 0 12px',background:'#FAFAFA',overflow:'hidden'}}>
          <div className="sh-container">
            <FullWidthCollectionBannerSlider
              items={c.collections.filter(item => item.active !== false)}
              category={activeCategory}
              onSelectCategory={(id) => { setSub(id); scrollTo(productsRef); }}
            />
          </div>
        </div>
      )}


      {/* ══ NEW ARRIVALS ════════════════════════════════════ */}
      {activeCms?.newArrivals?.enabled !== false && newArrivals.length > 0 && (
        <div className="new-arrivals-section" style={{padding:'20px 0 20px',background:'#F8F9FA'}}>
          <div className="sh-container">
            <Reveal>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
                <div style={{background:'#1A1A2E',color:'white',fontSize:'10px',fontWeight:900,
                  padding:'4px 10px',borderRadius:'6px',letterSpacing:'1px',
                  animation:'pulse 2s infinite'}}>NEW</div>
                <h2 style={{fontSize:'clamp(20px,3vw,28px)',fontWeight:900,color:'#0A0A0A',
                  letterSpacing:'-0.5px'}}>{activeCms?.newArrivals?.title || 'New Arrivals'}</h2>
              </div>
            </Reveal>
            <Carousel>
              {newArrivals.map(p => (
                <MiniCard key={p.id} product={p}
                  badge={{label:'NEW',icon:'✨',bg:'#F0FDF4',color:'#16A34A'}}/>
              ))}
            </Carousel>
          </div>
        </div>
      )}

      {/* ══ ALL PRODUCTS ════════════════════════════════════ */}
      <div ref={productsRef} className="sh-container products-section-container" style={{padding:'48px 0 0'}}>
        {/* Unified Category & Sort Toolbar */}
        <div ref={filterRef} className="sh-products-toolbar">
          {/* Row 1: Subcategory filter chips */}
          <CategoryFilter categories={activeSubcategories} selected={sub} onSelect={setSub} />

          {/* Row 2: Inline minimalist Sort controls (Left-aligned) */}
          {!loading && products.length > 0 && (
            <div className="sh-sort-row sh-scroll-hide">
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', fontWeight: 800, color: '#64748B', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                <ArrowUpDown size={12} color="#64748B" />
                <span>Sort:</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
                {[
                  ['featured', 'Featured'],
                  ['price-low', 'Price: Low to High'],
                  ['price-high', 'Price: High to Low'],
                  ['rating', 'Top Rated']
                ].map(([val, label]) => (
                  <button
                    key={val}
                    onClick={() => setSortBy(val)}
                    className="sh-sort-btn"
                    style={{
                      background: sortBy === val ? 'linear-gradient(135deg, #1A1A2E, #0F3460)' : '#F8FAFC',
                      color: sortBy === val ? '#FFFFFF' : '#475569',
                      border: sortBy === val ? 'none' : '1px solid #E2E8F0',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {searchQuery && (
          <div style={{ marginBottom: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0A0A0A', margin: 0 }}>
              Results for "{searchQuery}"
            </h2>
          </div>
        )}

        {loading && (
          <div className="sh-grid-products">
            {[...Array(8)].map((_,i) => (
              <div key={i} style={{borderRadius:'20px',overflow:'hidden',background:'white',boxShadow:'var(--shadow-sm)',minWidth:0,width:'100%'}}>
                <div className="sh-skel" style={{height:'180px',borderRadius:0}}/>
                <div style={{padding:'14px',display:'flex',flexDirection:'column',gap:'8px'}}>
                  <div className="sh-skel" style={{height:'13px',width:'80%'}}/>
                  <div className="sh-skel" style={{height:'11px',width:'50%'}}/>
                  <div className="sh-skel" style={{height:'18px',width:'38%',marginTop:'4px'}}/>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && products.length > 0 && (
          <StaggerReveal>
            <div className="sh-grid-products">
              {[...products].sort((a, b) => {
                if (sortBy === 'price-low') return a.price - b.price;
                if (sortBy === 'price-high') return b.price - a.price;
                if (sortBy === 'rating') return (b.rating || 4.8) - (a.rating || 4.8);
                return 0;
              }).map((p, idx) => (
                <motion.div key={p.id} variants={sc} style={{ height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                  <ProductCard product={p} onQuickView={setQuickViewProduct} priority={idx < 6} />
                </motion.div>
              ))}
            </div>
          </StaggerReveal>
        )}

        {!loading && products.length === 0 && (
          <Reveal>
            <div style={{textAlign:'center',padding:'80px 20px'}}>
              <Scissors size={48} strokeWidth={1} color="#D0D0D0" style={{margin:'0 auto 20px'}}/>
              <h3 style={{fontSize:'20px',fontWeight:800,color:'#0A0A0A',marginBottom:'8px'}}>
                {searchQuery?`No results for "${searchQuery}"`:'No products yet'}
              </h3>
              <p style={{color:'#8E8E93',fontSize:'14px'}}>
                {searchQuery?'Try a different search term':'Check back soon for new arrivals'}
              </p>
            </div>
          </Reveal>
        )}
      </div>

      {/* ══ PROMOTIONAL BANNER STRIP (Fully Customizable from CMS) ════════════════════ */}
      {activeCms?.banners && activeCms.banners.filter(b => b.active !== false).length > 0 && !searchQuery && (
        <div style={{ padding: '24px 0', background: '#FAFAFA' }}>
          <div className="sh-container">
            {activeCms.banners.filter(b => b.active !== false).map((b) => (
              <div
                key={b.id}
                style={{
                  position: 'relative',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  minHeight: '180px',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '32px 36px',
                  color: '#FFFFFF',
                  background: 'linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.7) 100%)',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.08)',
                  marginBottom: '16px',
                }}
              >
                {b.imageUrl && (
                  <img
                    src={b.imageUrl}
                    alt={b.title}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      zIndex: 0,
                    }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.65) 60%, rgba(15,23,42,0.2) 100%)', zIndex: 1 }} />
                <div style={{ position: 'relative', zIndex: 2, maxWidth: '540px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px', color: '#60A5FA', display: 'block', marginBottom: '8px' }}>
                    Special Promotion
                  </span>
                  <h3 style={{ fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, margin: '0 0 8px', color: '#FFFFFF', lineHeight: 1.2 }}>
                    {b.title}
                  </h3>
                  {b.subtitle && (
                    <p style={{ fontSize: '13px', color: '#E2E8F0', margin: '0 0 16px', lineHeight: 1.5 }}>
                      {b.subtitle}
                    </p>
                  )}
                  {b.btnText && (
                    <a
                      href={b.btnLink || '#products'}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '9px 18px',
                        borderRadius: '9999px',
                        background: '#FFFFFF',
                        color: '#0F172A',
                        fontWeight: 900,
                        fontSize: '12.5px',
                        textDecoration: 'none',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <span>{b.btnText}</span>
                      <ArrowRight size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ BEST SELLERS / TOP PICKS ════════════════════════════════════ */}
      {activeCms?.topPicks?.enabled !== false && bestSellers.length > 0 && !searchQuery && (
        <div className="top-picks-section" style={{padding:'48px 0 24px',background:'white',marginTop:'48px'}}>
          <div className="sh-container">
            <Reveal>
              <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
                <div style={{background:'linear-gradient(135deg,#F59E0B,#D97706)',color:'white',
                  fontSize:'10px',fontWeight:900,padding:'4px 10px',borderRadius:'6px',
                  display:'flex',alignItems:'center',gap:'4px'}}>
                  <TrendingUp size={11}/> BEST SELLERS
                </div>
                <h2 style={{fontSize:'clamp(20px,3vw,28px)',fontWeight:900,color:'#0A0A0A',
                  letterSpacing:'-0.5px'}}>{activeCms?.topPicks?.title || 'Top Picks'}</h2>
              </div>
            </Reveal>
            <Carousel>
              {bestSellers.map(p => (
                <MiniCard key={p.id} product={p}
                  badge={{label:'TOP',icon:'⭐',bg:'#FFFBEB',color:'#D97706'}}/>
              ))}
            </Carousel>
          </div>
        </div>
      )}

      {/* ══ RECENTLY VIEWED ═════════════════════════════════ */}
      {recentlyViewed.length > 0 && (
        <div style={{padding:'88px 0',background:'#F8F9FA'}}>
          <div className="sh-container">
            <Reveal>
              <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'28px'}}>
                <Clock size={18} color="#8E8E93"/>
                <h2 style={{fontSize:'clamp(18px,3vw,24px)',fontWeight:900,color:'#0A0A0A',
                  letterSpacing:'-0.5px'}}>Recently Viewed</h2>
              </div>
            </Reveal>
            <Carousel>
              {recentlyViewed.map(p => <MiniCard key={p.id} product={p}/>)}
            </Carousel>
          </div>
        </div>
      )}

      {/* ══ BRAND OVERVIEW / SEO CONTENT ══════════════════ */}
      <div className="sh-container" style={{ margin: '48px auto 36px', padding: '0 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #FFFDF7 0%, #F7EFE3 100%)',
          borderRadius: '24px',
          border: '1.5px solid #EBDCCB',
          padding: '40px 30px',
          textAlign: 'center',
          boxShadow: '0 10px 28px rgba(180, 130, 70, 0.07)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle ambient glows */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '150px', height: '150px', borderRadius: '50%',
            background: 'rgba(235, 220, 203, 0.45)', filter: 'blur(35px)', pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute', bottom: '-40px', left: '-40px',
            width: '150px', height: '150px', borderRadius: '50%',
            background: 'rgba(247, 239, 227, 0.65)', filter: 'blur(35px)', pointerEvents: 'none'
          }} />

          {/* Top Pill Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 16px', borderRadius: '99px',
            background: '#FFFFFF', border: '1px solid #E2D3BF',
            color: '#8A6133', fontSize: '11px', fontWeight: 800,
            textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '16px',
            boxShadow: '0 2px 6px rgba(138, 97, 51, 0.05)'
          }}>
            <Sparkles size={13} color="#B88346" />
            <span>Official Storefront · Nellore, AP</span>
          </div>

          {/* Heading */}
          <h2 style={{
            fontSize: 'clamp(20px,3.5vw,25px)', fontWeight: 900,
            color: '#0F172A', marginBottom: '14px', letterSpacing: '-0.4px',
            lineHeight: 1.3
          }}>
            Asmalabel — Crafting Quality Tailoring &amp; Women's Fashion
          </h2>

          {/* Text Description */}
          <p style={{
            fontSize: '14px', color: '#475569', lineHeight: 1.85,
            maxWidth: '820px', margin: '0 auto 24px', fontWeight: 500
          }}>
            <strong style={{ color: '#0F172A' }}>Asmalabel</strong> is a dedicated boutique small business based in Nellore, Andhra Pradesh. Built on trust, authenticity, and personal care, we bring you high-precision tailoring tools, premium sewing supplies, and curated women's fashion delivered directly to your doorstep across India.
          </p>

          {/* Feature Badges Grid */}
          <div style={{
            display: 'flex', gap: '10px 14px', justifyContent: 'center', flexWrap: 'wrap'
          }}>
            {[
              { icon: Scissors, text: '100% Genuine Tailoring Tools' },
              { icon: Sparkles, text: 'Curated Women\'s Fashion' },
              { icon: Truck, text: 'Fast Pan-India Delivery' },
              { icon: BadgeCheck, text: 'Based in Nellore, Andhra Pradesh' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '8px 18px', borderRadius: '99px',
                background: '#FFFFFF', border: '1px solid #E5D5C3',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
                color: '#1E293B', fontSize: '12.5px', fontWeight: 750
              }}>
                <Icon size={14} color="#B88346" />
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.7} }

        @keyframes mobileCollageMarqueeLoop {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }

        /* Hero responsive */
        @media (max-width: 768px) {
          .hero-combined-wrapper { flex-direction: column !important; gap: 24px !important; }
          .hero-content-box { flex: 1 1 100% !important; max-width: 100% !important; text-align: center !important; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 0 !important; }
          .hero-illustration { display: none !important; }
        }
        @media (min-width: 769px) { .hero-illustration { display: flex !important; } }

        /* Desktop collage uniform scaling */
        @media (min-width: 769px) and (max-width: 1199px) {
          .hero-image-collage { transform: scale(0.72) !important; }
        }
        @media (min-width: 1200px) and (max-width: 1399px) {
          .hero-image-collage { transform: scale(0.82) !important; }
        }
        @media (min-width: 1400px) and (max-width: 1599px) {
          .hero-image-collage { transform: scale(0.95) !important; }
        }
        @media (min-width: 1600px) {
          .hero-image-collage { transform: scale(1) !important; }
        }

        @media (max-width: 640px) {
          .desktop-banner-arrow { display: none !important; }
        }

        /* ── Carousel: edge-to-edge scroller on mobile ── */
        .carousel-outer { width: 100% !important; position: relative !important; }
        @media (max-width: 767px) {
          .carousel-outer {
            margin-left: -12px !important;
            margin-right: -12px !important;
            width: calc(100% + 24px) !important;
            overflow: visible !important;
          }
          .carousel-arrow {
            display: none !important;
          }
          .carousel-outer > div {
            padding-left: 12px !important;
            padding-right: 12px !important;
            scroll-padding-left: 12px !important;
            scroll-padding-right: 12px !important;
          }
        }
        @media (min-width: 641px) and (max-width: 767px) {
          .carousel-outer {
            margin-left: -20px !important;
            margin-right: -20px !important;
            width: calc(100% + 40px) !important;
          }
          .carousel-outer > div {
            padding-left: 20px !important;
            padding-right: 20px !important;
            scroll-padding-left: 20px !important;
            scroll-padding-right: 20px !important;
          }
        }
        @media (min-width: 768px) {
          .carousel-outer { overflow: hidden !important; }
          .carousel-arrow-left  { left: -4px !important; }
          .carousel-arrow-right { right: -4px !important; }
        }

        /* ── Hero stats — 2×2 grid on 360px and below ── */
        @media (max-width: 360px) {
          .hero-stats-inner {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
            justify-items: start !important;
          }
        }

        /* ── Collections Grid ────────────────────────── */
        .collections-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-auto-rows: 150px;
          gap: 10px;
        }

        /* Desktop layout */
        .col-card { min-height: 130px; }
        .cg-featured { grid-column: span 5; grid-row: span 2; }
        .cg-med      { grid-column: span 4; grid-row: span 1; }
        .cg-small    { grid-column: span 3; grid-row: span 1; }
        .cg-wide     { grid-column: span 7; grid-row: span 1; }
        .cg-row3     { grid-column: span 4; grid-row: span 1; }

        /* Tablet */
        @media (max-width: 900px) and (min-width: 561px) {
          .collections-grid { grid-auto-rows: 130px; gap: 8px; }
          .cg-featured { grid-column: span 6; grid-row: span 2; }
          .cg-med      { grid-column: span 6; grid-row: span 1; }
          .cg-small    { grid-column: span 4; grid-row: span 1; }
          .cg-wide     { grid-column: span 8; grid-row: span 1; }
        }

        /* Mobile */
        @media (max-width: 560px) {
          .collections-grid {
            grid-template-columns: 1fr 1fr;
            grid-auto-rows: 120px;
            gap: 8px;
          }
          .cg-featured { grid-column: 1 / -1; grid-row: span 1; }
          .cg-med      { grid-column: span 1; grid-row: span 1; }
          .cg-small    { grid-column: span 1; grid-row: span 1; }
          .cg-wide     { grid-column: 1 / -1; grid-row: span 1; }
        }
      `}</style>

      {/* Quick View Glass Modal */}
      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
    </div>
  );
}
