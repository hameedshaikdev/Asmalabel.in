import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trash2, Plus, Minus, ArrowRight, Tag,
  ShoppingCart, ShieldCheck, Sparkles, Heart,
  Scissors, Truck, BadgeCheck, ChevronUp, ChevronDown, Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../config/supabase';
import { getProductImage } from '../utils/productImages';
import SEO from '../components/common/SEO';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateCartQuantity, addToCart, getCartTotal, user, isInWishlist, addToWishlist, removeFromWishlist } = useApp();

  const [recommended, setRecommended] = useState([]);
  const [fbtExpanded, setFbtExpanded] = useState(true);
  const [selectedFBT, setSelectedFBT] = useState({});
  const [fbtAddedMsg, setFbtAddedMsg] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('products').select('*').eq('active', true).limit(10);
        setRecommended(data || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const handleCheckout = () => {
    if (!user) navigate('/login?redirect=/checkout');
    else navigate('/checkout');
  };

  const safeCart = (cart || []).filter(Boolean);

  const cartProductIds = new Set(safeCart.map(i => i.id || i.product_id));
  const fbtCandidates = recommended.filter(p => !cartProductIds.has(p.id)).slice(0, 2);

  useEffect(() => {
    if (fbtCandidates.length > 0) {
      setSelectedFBT(prev => {
        const initial = { ...prev };
        fbtCandidates.forEach(p => {
          if (initial[p.id] === undefined) {
            initial[p.id] = true;
          }
        });
        return initial;
      });
    }
  }, [recommended, cart]);

  const toggleFBT = (id) => {
    setSelectedFBT(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const selectedFbtItems = fbtCandidates.filter(p => selectedFBT[p.id]);
  const selectedFbtCount = selectedFbtItems.length;

  const handleAddFbtToCart = () => {
    if (selectedFbtCount === 0) return;
    selectedFbtItems.forEach(p => {
      addToCart(p, 1);
    });
    setFbtAddedMsg(true);
    setTimeout(() => setFbtAddedMsg(false), 2500);
  };

  const savings = safeCart.reduce((acc, item) => {
    const p = Number(item?.price || 0);
    const op = Number(item?.original_price || 0);
    const q = Number(item?.quantity || 1);
    if (op > p) return acc + (op - p) * q;
    return acc;
  }, 0);

  const cartTotal = Number(getCartTotal() || 0);

  if (safeCart.length === 0) {
    const recentlyViewedProducts = recommended.slice(0, 6);
    const suggestedProducts = recommended.slice(2, 10);

    return (
      <div style={{ background:'radial-gradient(circle at 50% 0%, #F1F5F9 0%, #F8FAFC 60%, #EEF2F6 100%)', minHeight:'100vh', padding:'24px 0 64px' }}>
        <SEO title="Shopping Cart | Asmalabel" robots="noindex, nofollow" canonical="https://asmalabel.in/cart" />
        <div className="sh-container">

          {/* Empty Cart Banner (Matching Image 5) */}
          <div style={{ background:'white', borderRadius:'24px', padding:'36px 20px', textAlign:'center', border:'1px solid var(--border)', boxShadow:'var(--shadow-sm)', marginBottom:'28px' }}>
            <div style={{ width:'88px', height:'88px', borderRadius:'50%', background:'#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', border:'1px solid #E2E8F0' }}>
              <ShoppingCart size={40} color="#94A3B8" strokeWidth={1.75} />
            </div>
            <h2 style={{ fontSize:'22px', fontWeight:900, color:'#0F172A', marginBottom:'6px', letterSpacing:'-0.4px' }}>Your cart is empty!</h2>
            <p style={{ color:'#64748B', marginBottom:'20px', fontSize:'14px', fontWeight:500 }}>Explore our curated tailoring tools and women's fashion to get started.</p>
            <button className="sh-btn" onClick={() => navigate('/')} style={{ margin:'0 auto' }}>
              Explore Collection <ArrowRight size={16} />
            </button>
          </div>

          {/* ── SCROLLER 1: SUGGESTED FOR YOU (Matching Image 5) ── */}
          {suggestedProducts.length > 0 && (
            <div style={{ marginBottom:'32px' }}>
              <div style={{ marginBottom:'12px' }}>
                <h3 style={{ fontSize:'18px', fontWeight:900, color:'#0F172A', margin:'0 0 2px', letterSpacing:'-0.3px' }}>
                  Suggested for You
                </h3>
                <p style={{ fontSize:'12px', color:'#64748B', margin:0, fontWeight:500 }}>
                  Based on Your Activity
                </p>
              </div>

              <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px', WebkitOverflowScrolling:'touch', scrollSnapType:'x mandatory', scrollbarWidth:'none' }}>
                {suggestedProducts.map(p => {
                  const pPrice = Number(p.price || 0);
                  const pOrig = Number(p.original_price || Math.round(pPrice * 1.3));
                  const pDisc = pOrig > pPrice ? Math.round((1 - pPrice / pOrig) * 100) : 20;

                  return (
                    <div key={p.id} style={{
                      width:'175px', flexShrink:0, scrollSnapAlign:'start',
                      background:'#FFFFFF', borderRadius:'14px', border:'1px solid #E2E8F0',
                      padding:'10px', display:'flex', flexDirection:'column', boxShadow:'0 2px 8px rgba(15,23,42,0.03)',
                      boxSizing:'border-box'
                    }}>
                      <div style={{ width:'100%', aspectRatio:'1', borderRadius:'10px', overflow:'hidden', background:'#F8FAFC', marginBottom:'8px', position:'relative' }}>
                        <img src={getProductImage(p)} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        {p.category && (
                          <span style={{ position:'absolute', top:'6px', left:'6px', background:'#0F172A', color:'white', fontSize:'8.5px', fontWeight:800, padding:'2px 6px', borderRadius:'4px', textTransform:'uppercase', letterSpacing:'.4px' }}>
                            {p.category === 'tailoring' ? 'TAILORING' : 'POPULAR'}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize:'12.5px', fontWeight:800, color:'#0F172A', margin:'0 0 6px', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', lineHeight:1.3, minHeight:'32px' }}>
                        {p.name}
                      </p>
                      <div style={{ display:'flex', alignItems:'baseline', gap:'6px', marginBottom:'4px' }}>
                        <span style={{ fontSize:'14px', fontWeight:900, color:'#0F172A' }}>₹{pPrice.toFixed(0)}</span>
                        {pOrig > pPrice && (
                          <span style={{ fontSize:'11.5px', color:'#94A3B8', textDecoration:'line-through', fontWeight:500 }}>₹{pOrig.toFixed(0)}</span>
                        )}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'10px' }}>
                        <span style={{ fontSize:'11px', fontWeight:800, color:'#16A34A' }}>{pDisc}% off</span>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:'2px', fontSize:'9.5px', fontWeight:800, color:'#334155', background:'#F1F5F9', padding:'1px 5px', borderRadius:'4px', border:'1px solid #E2E8F0' }}>
                          <BadgeCheck size={10} color="#0F172A" /> Assured
                        </span>
                      </div>
                      <button
                        onClick={() => addToCart(p, 1)}
                        style={{
                          marginTop:'auto', width:'100%', padding:'8px 0', borderRadius:'8px',
                          background:'#0F172A', border:'1px solid #0F172A', color:'#FFFFFF',
                          fontWeight:800, fontSize:'12px', cursor:'pointer', transition:'all .2s'
                        }}
                      >
                        Add to cart
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── SCROLLER 2: RECENTLY VIEWED (Matching Image 4) ── */}
          {recentlyViewedProducts.length > 0 && (
            <div style={{ marginBottom:'32px' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
                <h3 style={{ fontSize:'18px', fontWeight:900, color:'#0F172A', margin:0, letterSpacing:'-0.3px' }}>
                  Recently Viewed
                </h3>
              </div>

              <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px', WebkitOverflowScrolling:'touch', scrollSnapType:'x mandatory', scrollbarWidth:'none' }}>
                {recentlyViewedProducts.map(p => {
                  const pPrice = Number(p.price || 0);
                  const pOrig = Number(p.original_price || Math.round(pPrice * 1.25));
                  const pDisc = pOrig > pPrice ? Math.round((1 - pPrice / pOrig) * 100) : 14;

                  return (
                    <div key={p.id} style={{
                      width:'175px', flexShrink:0, scrollSnapAlign:'start',
                      background:'#FFFFFF', borderRadius:'14px', border:'1px solid #E2E8F0',
                      padding:'10px', display:'flex', flexDirection:'column', boxShadow:'0 2px 8px rgba(15,23,42,0.03)',
                      boxSizing:'border-box'
                    }}>
                      {/* Image Box with Subtle Badge */}
                      <div style={{ width:'100%', aspectRatio:'1', borderRadius:'10px', overflow:'hidden', background:'#F8FAFC', position:'relative', marginBottom:'8px' }}>
                        <img src={getProductImage(p)} alt={p.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        {p.category && (
                          <span style={{ position:'absolute', top:'6px', left:'6px', background:'#0F172A', color:'white', fontSize:'8.5px', fontWeight:800, padding:'2px 6px', borderRadius:'4px', textTransform:'uppercase', letterSpacing:'.4px' }}>
                            {p.category === 'tailoring' ? 'NEW ARRIVAL' : 'FEATURED'}
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <p style={{ fontSize:'12.5px', fontWeight:800, color:'#0F172A', margin:'0 0 6px', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', lineHeight:1.3, minHeight:'32px' }}>
                        {p.name}
                      </p>

                      {/* Price & Discount Tag */}
                      <div style={{ display:'flex', alignItems:'baseline', gap:'6px', flexWrap:'wrap', marginBottom:'4px' }}>
                        <span style={{ fontSize:'14px', fontWeight:900, color:'#0F172A' }}>₹{pPrice.toFixed(0)}</span>
                        {pOrig > pPrice && (
                          <span style={{ fontSize:'11.5px', color:'#94A3B8', textDecoration:'line-through', fontWeight:500 }}>₹{pOrig.toFixed(0)}</span>
                        )}
                      </div>

                      {/* Green Tag & Verified Assured Badge */}
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'10px' }}>
                        <span style={{ fontSize:'11px', fontWeight:800, color:'#16A34A' }}>{pDisc}% off</span>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:'2px', fontSize:'9.5px', fontWeight:800, color:'#334155', background:'#F1F5F9', padding:'1px 5px', borderRadius:'4px', border:'1px solid #E2E8F0' }}>
                          <BadgeCheck size={10} color="#0F172A" /> Assured
                        </span>
                      </div>

                      {/* Add to Cart Button (Theme matched) */}
                      <button
                        onClick={() => addToCart(p, 1)}
                        style={{
                          marginTop:'auto', width:'100%', padding:'8px 0', borderRadius:'8px',
                          background:'#0F172A', border:'1px solid #0F172A', color:'#FFFFFF',
                          fontWeight:800, fontSize:'12px', cursor:'pointer', transition:'all .2s'
                        }}
                      >
                        Add to cart
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Why is Cash on Delivery (COD) Not Available? (Matching Image 1) ── */}
          <div style={{
            marginTop: '24px',
            background: 'linear-gradient(135deg, #FFFDF7 0%, #FAF2E6 50%, #F5E8D3 100%)',
            borderRadius: '24px',
            border: '1.5px solid #EBDCCB',
            padding: '28px 24px',
            boxShadow: '0 8px 24px rgba(180, 130, 70, 0.08)',
            position: 'relative',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '5px 14px', borderRadius: '99px',
                background: '#FFFFFF', border: '1px solid #E2D3BF',
                color: '#8A6133', fontSize: '11px', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.8px'
              }}>
                <Sparkles size={13} color="#B88346" />
                <span>COMING SOON</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#8A6133' }}>
                COD Policy Notice
              </span>
            </div>

            <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '0 0 10px', letterSpacing: '-0.3px', lineHeight: 1.3, textAlign: 'left' }}>
              Why is Cash on Delivery (COD) Not Available?
            </h2>

            <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.75, margin: 0, fontWeight: 500, textAlign: 'left' }}>
              To ensure <strong style={{ color: '#0F172A' }}>100% genuine products</strong>, fast 24–hour dispatch without delivery delays, and prevent fraudulent returns on custom tailoring tools, we currently accept secure instant UPI/Online payments only. Cash on Delivery verification support is coming soon!
            </p>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div style={{ background:'radial-gradient(circle at 50% 0%, #F1F5F9 0%, #F8FAFC 60%, #EEF2F6 100%)', minHeight:'100vh', padding:'32px 0 64px' }}>
      <SEO title="Shopping Cart | Asmalabel" robots="noindex, nofollow" canonical="https://asmalabel.in/cart" />
      <div className="sh-container">

        {/* Header */}
        <div style={{ marginBottom:'28px' }}>
          <span style={{ fontSize:'11px', fontWeight:800, textTransform:'uppercase', letterSpacing:'1.5px', color:'#0F172A', background:'rgba(15,23,42,0.08)', padding:'4px 12px', borderRadius:'9999px' }}>
            Shopping Bag
          </span>
          <h1 style={{ fontSize:'30px', fontWeight:900, color:'#0F172A', letterSpacing:'-.8px', marginTop:'8px' }}>
            Review Your Order
          </h1>
          <p style={{ color:'#64748B', marginTop:'4px', fontSize:'14px', fontWeight:600 }}>{safeCart.length} item{safeCart.length !== 1 ? 's' : ''} in your cart</p>
        </div>

        {/* Two Column Layout: Cart Items & Order Summary */}
        <div style={{ display:'grid', gap:'28px', gridTemplateColumns: 'minmax(0,1fr)' }} id="cart-layout">

          {/* Left Column: Cart Items */}
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {safeCart.map(item => {
              const itemPrice = Number(item?.price || 0);
              const itemOrigPrice = Number(item?.original_price || 0);
              const itemQty = Number(item?.quantity || 1);

              return (
                <div key={item.id || Math.random()} className="cart-item-row" style={{ background:'rgba(255, 255, 255, 0.82)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', borderRadius:'20px', padding:'14px', display:'flex', gap:'12px', boxShadow:'0 10px 32px rgba(15,23,42,0.06)', border:'1px solid rgba(255, 255, 255, 0.9)', alignItems:'flex-start', position:'relative', boxSizing:'border-box', width:'100%' }}>
                  {/* Image */}
                  <div className="cart-item-img" style={{ width:'80px', height:'80px', borderRadius:'16px', overflow:'hidden', background:'rgba(241,245,249,0.8)', flexShrink:0, boxShadow:'0 4px 14px rgba(0,0,0,0.06)' }}>
                    <img src={getProductImage(item)} alt={item.name || 'Item'}
                      style={{ width:'100%', height:'100%', objectFit:'cover', borderRadius:'20px' }} />
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0, overflow:'hidden' }}>
                    <p style={{ fontWeight:800, fontSize:'14px', color:'#0F172A', marginBottom:'4px', overflow:'hidden', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', letterSpacing:'-0.2px', lineHeight:1.3 }}>{item.name}</p>
                    
                    {/* Variant Info Badge */}
                    {(item.size || item.color) && (
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'6px', flexWrap:'wrap' }}>
                        {item.size && (
                          <span style={{ fontSize:'11px', fontWeight:700, color:'#0F172A', background:'#F1F5F9', border:'1px solid #E2E8F0', padding:'2px 7px', borderRadius:'6px' }}>
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span style={{ display:'inline-flex', alignItems:'center', gap:'5px', fontSize:'11px', fontWeight:700, color:'#0F172A', background:'#F1F5F9', border:'1px solid #E2E8F0', padding:'2px 7px', borderRadius:'6px' }}>
                            {item.color_value && (
                              <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:item.color_value, border:'1px solid rgba(0,0,0,0.2)' }} />
                            )}
                            Color: {item.color}
                          </span>
                        )}
                      </div>
                    )}

                    {item.unit && !item.size && <p style={{ fontSize:'12px', color:'#64748B', marginBottom:'8px', fontWeight:500 }}>{item.unit}</p>}
                    <div style={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
                      <span style={{ fontWeight:900, fontSize:'18px', color:'#0F172A' }}>₹{itemPrice.toFixed(0)}</span>
                      {itemOrigPrice > itemPrice && (
                        <span style={{ fontSize:'13px', color:'#94A3B8', textDecoration:'line-through', fontWeight:500 }}>₹{itemOrigPrice.toFixed(0)}</span>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'10px', flexShrink:0, minWidth:0 }}>
                    <button onClick={() => removeFromCart(item.id)}
                      title="Remove item"
                      style={{ padding:'8px', borderRadius:'9999px', background:'rgba(239,68,68,0.1)', color:'#EF4444', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .2s' }}>
                      <Trash2 size={16} />
                    </button>

                    <div style={{ display:'flex', alignItems:'center', background:'rgba(241,245,249,0.8)', borderRadius:'9999px', border:'1px solid rgba(226,232,240,0.8)', padding:'4px 8px' }}>
                      <button onClick={() => updateCartQuantity(item.id, itemQty - 1)}
                        style={{ padding:'4px 8px', background:'none', border:'none', cursor:'pointer', color:'#0F172A', display:'flex', alignItems:'center' }}>
                        <Minus size={14} />
                      </button>
                      <span style={{ padding:'0 6px', fontWeight:900, fontSize:'14px', color:'#0F172A', minWidth:'24px', textAlign:'center' }}>{itemQty}</span>
                      <button onClick={() => updateCartQuantity(item.id, itemQty + 1)}
                        style={{ padding:'4px 8px', background:'none', border:'none', cursor:'pointer', color:'#0F172A', display:'flex', alignItems:'center' }}>
                        <Plus size={14} />
                      </button>
                    </div>

                    <span style={{ fontSize:'14px', fontWeight:900, color:'#0F172A' }}>
                      ₹{(itemPrice * itemQty).toFixed(0)}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* ── FREQUENTLY BOUGHT TOGETHER (Matching Image 2) ── */}
            {fbtCandidates.length > 0 && safeCart.length > 0 && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                    Frequently Bought Together
                  </h3>
                  <button
                    type="button"
                    onClick={() => setFbtExpanded(!fbtExpanded)}
                    style={{
                      width: '32px', height: '32px', borderRadius: '10px',
                      background: '#FFFFFF', border: '1px solid #E2E8F0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#0F172A', transition: 'all .2s'
                    }}
                    title={fbtExpanded ? "Collapse" : "Expand"}
                  >
                    {fbtExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {fbtExpanded && (
                  <div style={{
                    background: '#FFFFFF',
                    borderRadius: '20px',
                    border: '1.5px solid #E2E8F0',
                    overflow: 'hidden',
                    boxShadow: '0 6px 20px rgba(15,23,42,0.04)'
                  }}>

                    {/* 1. Primary Product in Cart (Image 2 Row 1) */}
                    {safeCart[0] && (
                      <div style={{
                        padding: '14px 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: '12px', background: '#FAFCFF', borderBottom: '1px solid #F1F5F9'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                          <div style={{
                            width: '64px', height: '64px', borderRadius: '12px',
                            overflow: 'hidden', background: '#F1F5F9', flexShrink: 0,
                            border: '1px solid #E2E8F0'
                          }}>
                            <img
                              src={getProductImage(safeCart[0])}
                              alt={safeCart[0].name || 'Product'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>

                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 700, margin: '0 0 2px' }}>
                              Asmalabel • <span style={{ color: '#0F172A' }}>This product</span>
                            </p>
                            <p style={{
                              fontSize: '13.5px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                              {safeCart[0].name}
                            </p>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                              {safeCart[0].original_price > safeCart[0].price && (
                                <span style={{ fontSize: '12px', fontWeight: 800, color: '#16A34A' }}>
                                  ↓ {Math.round(((safeCart[0].original_price - safeCart[0].price) / safeCart[0].original_price) * 100)}%
                                </span>
                              )}
                              {safeCart[0].original_price > safeCart[0].price && (
                                <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through' }}>
                                  ₹{Number(safeCart[0].original_price).toFixed(0)}
                                </span>
                              )}
                              <span style={{ fontSize: '14.5px', fontWeight: 900, color: '#0F172A' }}>
                                ₹{Number(safeCart[0].price).toFixed(0)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Locked In-Cart Checkbox */}
                        <div style={{
                          width: '22px', height: '22px', borderRadius: '6px',
                          background: '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#FFFFFF', flexShrink: 0
                        }}>
                          <Check size={14} strokeWidth={3} />
                        </div>
                      </div>
                    )}

                    {/* 2. Frequently Bought Bundle Candidates (Image 2 Rows 2+) */}
                    {fbtCandidates.map((p, idx) => {
                      const pPrice = Number(p.price || 0);
                      const pOrig = Number(p.original_price || 0);
                      const pDisc = pOrig > pPrice ? Math.round(((pOrig - pPrice) / pOrig) * 100) : null;
                      const isChecked = !!selectedFBT[p.id];

                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleFBT(p.id)}
                          style={{
                            padding: '14px 16px',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            gap: '12px', cursor: 'pointer',
                            borderBottom: idx < fbtCandidates.length - 1 ? '1px solid #F1F5F9' : 'none',
                            background: isChecked ? '#FFFFFF' : '#FAFAFA',
                            transition: 'background .15s'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                            <div style={{
                              width: '64px', height: '64px', borderRadius: '12px',
                              overflow: 'hidden', background: '#F8FAFC', flexShrink: 0,
                              border: '1px solid #E2E8F0'
                            }}>
                              <img
                                src={getProductImage(p)}
                                alt={p.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>

                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: '12px', color: '#64748B', fontWeight: 600, margin: '0 0 2px' }}>
                                {p.category === 'tailoring' ? 'Tailoring Supplies' : 'Asmalabel Special'}
                              </p>
                              <p style={{
                                fontSize: '13.5px', fontWeight: 800, color: '#0F172A', margin: '0 0 4px',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                              }}>
                                {p.name}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                {pDisc && (
                                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#16A34A' }}>
                                    ↓ {pDisc}%
                                  </span>
                                )}
                                {pOrig > pPrice && (
                                  <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through' }}>
                                    ₹{pOrig.toFixed(0)}
                                  </span>
                                )}
                                <span style={{ fontSize: '14.5px', fontWeight: 900, color: '#0F172A' }}>
                                  ₹{pPrice.toFixed(0)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Interactive Checkbox */}
                          <div style={{
                            width: '22px', height: '22px', borderRadius: '6px',
                            border: isChecked ? '2px solid #0F172A' : '2px solid #CBD5E1',
                            background: isChecked ? '#0F172A' : '#FFFFFF',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#FFFFFF', flexShrink: 0, transition: 'all .15s'
                          }}>
                            {isChecked && <Check size={14} strokeWidth={3} />}
                          </div>
                        </div>
                      );
                    })}

                    {/* 3. Bottom Action Button */}
                    <div style={{ padding: '12px 16px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
                      {fbtAddedMsg ? (
                        <div style={{
                          width: '100%', padding: '12px', borderRadius: '12px',
                          background: '#DCFCE7', color: '#166534', fontWeight: 800,
                          fontSize: '13.5px', textAlign: 'center', border: '1px solid #86EFAC'
                        }}>
                          ✓ Added to Cart Successfully!
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleAddFbtToCart}
                          disabled={selectedFbtCount === 0}
                          style={{
                            width: '100%', padding: '12px', borderRadius: '12px',
                            background: selectedFbtCount > 0 ? '#0F172A' : '#F1F5F9',
                            color: selectedFbtCount > 0 ? '#FFFFFF' : '#94A3B8',
                            fontWeight: 900, fontSize: '13.5px', border: 'none',
                            cursor: selectedFbtCount > 0 ? 'pointer' : 'not-allowed',
                            transition: 'all .15s',
                            boxShadow: selectedFbtCount > 0 ? '0 4px 12px rgba(15,23,42,0.15)' : 'none'
                          }}
                        >
                          Add {selectedFbtCount} {selectedFbtCount === 1 ? 'item' : 'items'} to cart
                        </button>
                      )}
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Order Summary Glass Card */}
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

            <div className="cart-summary-card" style={{ background:'rgba(255, 255, 255, 0.85)', backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)', borderRadius:'28px', padding:'24px', boxShadow:'0 20px 48px -8px rgba(15,23,42,0.12)', border:'1px solid rgba(255, 255, 255, 0.95)', height:'fit-content' }}>
              <h2 style={{ fontWeight:900, fontSize:'20px', color:'#0F172A', marginBottom:'20px', letterSpacing:'-0.4px' }}>Order Summary</h2>

              {savings > 0 && (
                <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'rgba(48,209,88,0.12)', border:'1px solid rgba(48,209,88,0.3)', borderRadius:'9999px', padding:'10px 16px', marginBottom:'20px' }}>
                  <Tag size={16} color="#16A34A" />
                  <span style={{ fontSize:'13px', fontWeight:800, color:'#166534' }}>You save ₹{savings.toFixed(0)} on this order!</span>
                </div>
              )}

              <div style={{ display:'flex', flexDirection:'column', gap:'14px', marginBottom:'24px' }}>
                {[
                  ['Subtotal', `₹${cartTotal.toFixed(0)}`],
                  ['Express Delivery', 'FREE', '#30D158'],
                  ...(savings > 0 ? [['Discount Savings', `-₹${savings.toFixed(0)}`, '#30D158']] : []),
                ].map(([label, value, color]) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ fontSize:'14px', color:'#64748B', fontWeight:600 }}>{label}</span>
                    <span style={{ fontSize:'14px', fontWeight:800, color: color || '#0F172A' }}>{value}</span>
                  </div>
                ))}
                <div style={{ borderTop:'1px solid rgba(226,232,240,0.8)', paddingTop:'14px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontWeight:800, fontSize:'16px', color:'#0F172A' }}>Total Payable</span>
                  <span style={{ fontWeight:900, fontSize:'24px', color:'#0F172A', letterSpacing:'-0.5px' }}>₹{cartTotal.toFixed(0)}</span>
                </div>
              </div>

              <button className="sh-btn" style={{ width:'100%', justifyContent:'center', height:'52px' }} onClick={handleCheckout}>
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <button onClick={() => navigate('/')}
                style={{ width:'100%', marginTop:'12px', padding:'13px', borderRadius:'9999px', border:'1px solid rgba(226,232,240,0.8)', background:'rgba(255,255,255,0.8)', fontWeight:800, fontSize:'14px', color:'#475569', cursor:'pointer' }}>
                Continue Shopping
              </button>

              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px', marginTop:'20px', fontSize:'12px', color:'#64748B', fontWeight:600 }}>
                <ShieldCheck size={16} color="#30D158" /> Guaranteed 100% Encrypted Payment
              </div>
            </div>

          </div>
        </div>

        {/* ── YOU MAY ALSO LIKE SCROLLER (In Cart Tab) ── */}
        {recommended.length > 0 && (
          <div className="pd-scroller-section" style={{ marginTop: '40px' }}>
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
              {recommended.map(p => {
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

        {/* ── Why is Cash on Delivery (COD) Not Available? (Matching Image 1) ── */}
        <div style={{
          marginTop: '36px',
          background: 'linear-gradient(135deg, #FFFDF7 0%, #FAF2E6 50%, #F5E8D3 100%)',
          borderRadius: '24px',
          border: '1.5px solid #EBDCCB',
          padding: '28px 24px',
          boxShadow: '0 8px 24px rgba(180, 130, 70, 0.08)',
          position: 'relative',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '5px 14px', borderRadius: '99px',
              background: '#FFFFFF', border: '1px solid #E2D3BF',
              color: '#8A6133', fontSize: '11px', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.8px'
            }}>
              <Sparkles size={13} color="#B88346" />
              <span>COMING SOON</span>
            </div>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#8A6133' }}>
              COD Policy Notice
            </span>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', margin: '0 0 10px', letterSpacing: '-0.3px', lineHeight: 1.3, textAlign: 'left' }}>
            Why is Cash on Delivery (COD) Not Available?
          </h2>

          <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.75, margin: 0, fontWeight: 500, textAlign: 'left' }}>
            To ensure <strong style={{ color: '#0F172A' }}>100% genuine products</strong>, fast 24–hour dispatch without delivery delays, and prevent fraudulent returns on custom tailoring tools, we currently accept secure instant UPI/Online payments only. Cash on Delivery verification support is coming soon!
          </p>
        </div>

      </div>

      <style>{`
        @media(min-width:768px) {
          #cart-layout {
            grid-template-columns: minmax(0,1.6fr) 380px !important;
          }
        }
        @media(max-width:640px) {
          .cart-item-row {
            border-radius: 16px !important;
            padding: 12px !important;
            gap: 10px !important;
          }
          .cart-item-img {
            width: 68px !important;
            height: 68px !important;
            border-radius: 12px !important;
            flex-shrink: 0 !important;
          }
          .cart-summary-card {
            padding: 16px !important;
            border-radius: 20px !important;
          }
        }
        @media(max-width:360px) {
          .cart-item-img {
            width: 56px !important;
            height: 56px !important;
          }
        }
      `}</style>
    </div>
  );
}
