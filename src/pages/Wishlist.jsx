import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, ArrowRight, X, ShoppingCart, BadgeCheck, Sparkles, Truck, ShieldCheck, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../config/supabase';
import { getProductImage } from '../utils/productImages';
import SEO from '../components/common/SEO';

export default function Wishlist() {
  const navigate = useNavigate();
  const { wishlist, removeFromWishlist, addToCart } = useApp();
  const [suggested, setSuggested] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('products').select('*').eq('active', true).limit(10);
        setSuggested(data || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  const validWishlist = (wishlist || []).filter(p => p && p.id);

  /* ── 1. EMPTY WISHLIST STATE ── */
  if (validWishlist.length === 0) {
    return (
      <div style={{ background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)', minHeight: '100vh', padding: '40px 0 80px' }}>
        <SEO title="My Wishlist Collection | Asmalabel" robots="noindex, nofollow" canonical="https://asmalabel.in/wishlist" />
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>

          {/* Empty Hero Card */}
          <div style={{
            background: '#FFFFFF', borderRadius: '28px', padding: '56px 24px',
            textAlign: 'center', border: '1.5px solid #E2E8F0',
            boxShadow: '0 20px 45px rgba(15, 23, 42, 0.05)', marginBottom: '48px',
            maxWidth: '680px', margin: '0 auto 48px'
          }}>
            <div style={{
              width: '90px', height: '90px', borderRadius: '50%', background: '#F8FAFC',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
              border: '1px solid #E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
            }}>
              <Heart size={42} color="#0F172A" strokeWidth={1.5} />
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Your Wishlist is Empty
            </h2>
            <p style={{ color: '#64748B', marginBottom: '28px', fontSize: '15px', fontWeight: 500, lineHeight: 1.6 }}>
              Explore our boutique collection and tap the ♡ icon on any item to save your favorites for later.
            </p>
            <button
              onClick={() => navigate('/')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 28px', borderRadius: '16px', background: '#0F172A',
                color: '#FFFFFF', fontWeight: 900, fontSize: '14.5px', border: 'none',
                cursor: 'pointer', boxShadow: '0 4px 14px rgba(15,23,42,0.15)', transition: 'all .2s ease'
              }}
            >
              <span>Explore Collection</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {/* ── SUGGESTED FOR YOU SCROLLER ── */}
          {suggested.length > 0 && (
            <div style={{ marginBottom: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '18px' }}>
                <div>
                  <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.4px' }}>
                    Suggested for You
                  </h3>
                  <p style={{ fontSize: '13px', color: '#64748B', margin: 0, fontWeight: 500 }}>
                    Handpicked tailored essentials &amp; trending boutique items
                  </p>
                </div>
                <Link to="/" style={{ color: '#0F172A', fontWeight: 800, fontSize: '13px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  View All <ChevronRight size={14} />
                </Link>
              </div>

              <div style={{
                display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px',
                WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory', scrollbarWidth: 'none'
              }}>
                {suggested.map(p => {
                  const pPrice = Number(p.price || 0);
                  const pOrig = Number(p.original_price || 0);
                  const pDisc = pOrig > pPrice ? Math.round((1 - pPrice / pOrig) * 100) : 0;

                  return (
                    <div key={p.id} style={{
                      width: '210px', flexShrink: 0, scrollSnapAlign: 'start',
                      background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0',
                      padding: '12px', display: 'flex', flexDirection: 'column',
                      boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)', boxSizing: 'border-box',
                      transition: 'all .2s ease'
                    }}>
                      <div style={{ width: '100%', aspectRatio: '1', borderRadius: '14px', overflow: 'hidden', background: '#F8FAFC', marginBottom: '10px', position: 'relative' }}>
                        <img src={getProductImage(p)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {p.category && (
                          <span style={{ position: 'absolute', top: '8px', left: '8px', background: '#0F172A', color: 'white', fontSize: '9px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '.4px' }}>
                            {p.category === 'tailoring' ? 'TAILORING' : 'POPULAR'}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.35, minHeight: '36px' }}>
                        {p.name}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                        <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>₹{pPrice.toFixed(0)}</span>
                        {pOrig > pPrice && (
                          <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through', fontWeight: 500 }}>₹{pOrig.toFixed(0)}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#16A34A' }}>{pDisc}% off</span>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '10px', fontWeight: 800, color: '#334155', background: '#F1F5F9', padding: '2px 6px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          <BadgeCheck size={11} color="#0F172A" /> Assured
                        </span>
                      </div>
                      <button
                        onClick={() => addToCart(p, 1)}
                        style={{
                          marginTop: 'auto', width: '100%', padding: '10px 0', borderRadius: '10px',
                          background: '#0F172A', border: 'none', color: '#FFFFFF',
                          fontWeight: 800, fontSize: '13px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                          boxShadow: '0 2px 8px rgba(15,23,42,0.1)', transition: 'all .2s'
                        }}
                      >
                        <ShoppingCart size={14} />
                        <span>Add to cart</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── LUXURY QUALITY BANNER ── */}
          <div style={{
            background: 'linear-gradient(135deg, #FFFDF7 0%, #FAF2E6 50%, #F5E8D3 100%)',
            borderRadius: '28px', border: '1.5px solid #EBDCCB', padding: '36px 28px',
            textAlign: 'center', boxShadow: '0 12px 32px rgba(180, 130, 70, 0.08)'
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', borderRadius: '99px',
              background: '#FFFFFF', border: '1px solid #E2D3BF',
              color: '#8A6133', fontSize: '11px', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '14px'
            }}>
              <Sparkles size={12} color="#B88346" />
              <span>Official Storefront · Nellore, AP</span>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginBottom: '10px', letterSpacing: '-0.3px' }}>
              Asmalabel — Crafting Quality Tailoring &amp; Women's Fashion
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.7, maxWidth: '720px', margin: '0 auto', fontWeight: 500 }}>
              Handpicked boutique supplies, high-precision tailoring tools, and fashion essentials delivered across India.
            </p>
          </div>

        </div>
      </div>
    );
  }

  /* ── 2. ACTIVE WISHLIST VIEW (SPACIOUS LUXURY GRID) ── */
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)', padding: '40px 0 80px' }}>
      <SEO title="My Wishlist Collection | Asmalabel" robots="noindex, nofollow" canonical="https://asmalabel.in/wishlist" />
      
      <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 24px', boxSizing: 'border-box' }}>

        {/* ── Page Header ── */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 style={{
            fontSize: 'clamp(26px, 4vw, 36px)',
            fontWeight: 900,
            color: '#0F172A',
            margin: '0 0 6px',
            letterSpacing: '-0.8px',
            fontFamily: '"Playfair Display", "Cinzel", "Cormorant Garamond", Georgia, serif'
          }}>
            My Wishlist Collection
          </h1>
          <p style={{ fontSize: '14.5px', color: '#64748B', fontWeight: 600, margin: 0 }}>
            {validWishlist.length} {validWishlist.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {/* ── Responsive Spacious Grid Layout ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '24px',
          width: '100%',
          boxSizing: 'border-box',
          marginBottom: '48px'
        }}>
          {validWishlist.map(product => {
            const price = Number(product.price || 0);
            const orig = Number(product.original_price || 0);
            const disc = orig > price ? Math.round((1 - price / orig) * 100) : 0;

            return (
              <div
                key={product.id}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '24px',
                  border: '1.5px solid #E2E8F0',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.04)',
                  position: 'relative',
                  boxSizing: 'border-box',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 18px 40px rgba(15, 23, 42, 0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(15, 23, 42, 0.04)';
                }}
              >
                {/* Image Box */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '1',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  background: '#F8FAFC',
                  marginBottom: '14px'
                }}>
                  <Link to={`/product/${product.id}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    />
                  </Link>

                  {/* Circular Rust-Red Discount Badge (like img1) */}
                  {disc > 0 && (
                    <div style={{
                      position: 'absolute', top: '8px', left: '8px',
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: '#C23A0B', color: '#FFFFFF',
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      lineHeight: '1.05', boxShadow: '0 2px 8px rgba(194, 58, 11, 0.35)',
                      zIndex: 2, pointerEvents: 'none'
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 900, letterSpacing: '-0.2px' }}>{disc}%</span>
                      <span style={{ fontSize: '8.5px', fontWeight: 800, textTransform: 'lowercase' }}>off</span>
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={(e) => { e.preventDefault(); removeFromWishlist(product.id); }}
                    title="Remove from wishlist"
                    style={{
                      position: 'absolute', top: '8px', right: '8px',
                      width: '28px', height: '28px', borderRadius: '50%',
                      background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)', transition: 'all 0.2s ease',
                      zIndex: 10
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.95)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(15, 23, 42, 0.7)'}
                  >
                    <X size={14} color="#FFFFFF" strokeWidth={2.5} />
                  </button>
                </div>

                {/* Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', marginBottom: '14px' }}>
                  <Link to={`/product/${product.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{
                      fontSize: '14.5px',
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: '0 0 6px',
                      lineHeight: 1.35,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '38px'
                    }}>
                      {product.name}
                    </h3>
                  </Link>

                  {product.category && (
                    <p style={{ fontSize: '11.5px', color: '#64748B', margin: '0 0 8px', fontWeight: 600, textTransform: 'capitalize' }}>
                      {product.category === 'tailoring' ? 'Tailoring Tools' : 'Boutique Fashion'}
                    </p>
                  )}

                  {/* Price Row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: 'auto' }}>
                    <span style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', whiteSpace: 'nowrap' }}>
                      ₹{price.toFixed(0)}
                    </span>
                    {orig > price && (
                      <span style={{ fontSize: '12.5px', color: '#94A3B8', textDecoration: 'line-through', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        ₹{orig.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => {
                    addToCart(product, 1);
                    removeFromWishlist(product.id);
                  }}
                  style={{
                    width: '100%', padding: '11px 0', borderRadius: '12px',
                    background: '#0F172A', color: '#FFFFFF', fontWeight: 800,
                    fontSize: '13.5px', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: '0 4px 12px rgba(15,23,42,0.12)', transition: 'all .2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#1E293B'}
                  onMouseLeave={e => e.currentTarget.style.background = '#0F172A'}
                >
                  <ShoppingCart size={15} />
                  <span>Add to cart</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* ── Suggested for You Scroller Below Active Wishlist ── */}
        {suggested.length > 0 && (
          <div style={{ marginTop: '56px', marginBottom: '40px' }}>
            <div style={{ marginBottom: '18px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', margin: '0 0 4px', letterSpacing: '-0.4px' }}>
                Suggested for You
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, fontWeight: 500 }}>
                Based on your shopping activity
              </p>
            </div>

            <div style={{
              display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px',
              WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory', scrollbarWidth: 'none'
            }}>
              {suggested.map(p => {
                const pPrice = Number(p.price || 0);
                const pOrig = Number(p.original_price || 0);
                const pDisc = pOrig > pPrice ? Math.round((1 - pPrice / pOrig) * 100) : 0;

                return (
                  <div key={p.id} style={{
                    width: '210px', flexShrink: 0, scrollSnapAlign: 'start',
                    background: '#FFFFFF', borderRadius: '18px', border: '1px solid #E2E8F0',
                    padding: '12px', display: 'flex', flexDirection: 'column',
                    boxShadow: '0 4px 16px rgba(15, 23, 42, 0.04)', boxSizing: 'border-box'
                  }}>
                    <div style={{ width: '100%', aspectRatio: '1', borderRadius: '14px', overflow: 'hidden', background: '#F8FAFC', marginBottom: '10px', position: 'relative' }}>
                      <img src={getProductImage(p)} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <p style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.35, minHeight: '36px' }}>
                      {p.name}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A' }}>₹{pPrice.toFixed(0)}</span>
                      {pOrig > pPrice && (
                        <span style={{ fontSize: '12px', color: '#94A3B8', textDecoration: 'line-through', fontWeight: 500 }}>₹{pOrig.toFixed(0)}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 800, color: '#16A34A' }}>{pDisc}% off</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '10px', fontWeight: 800, color: '#334155', background: '#F1F5F9', padding: '2px 6px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        <BadgeCheck size={11} color="#0F172A" /> Assured
                      </span>
                    </div>
                    <button
                      onClick={() => addToCart(p, 1)}
                      style={{
                        marginTop: 'auto', width: '100%', padding: '10px 0', borderRadius: '10px',
                        background: '#0F172A', border: 'none', color: '#FFFFFF',
                        fontWeight: 800, fontSize: '13px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        boxShadow: '0 2px 8px rgba(15,23,42,0.1)', transition: 'all .2s'
                      }}
                    >
                      <ShoppingCart size={14} />
                      <span>Add to cart</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
