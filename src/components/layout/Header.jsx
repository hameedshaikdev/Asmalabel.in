import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, User, LogOut, Shield, Menu, X, ChevronRight, Heart, Package, Info, MessageCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { supabase } from '../../config/supabase';
import { WhatsAppIcon } from '../common/UpiIcons';
import { SewingMachineIcon, FrockIcon, ChainedLock3D } from '../common/CategoryIcons';
import ComingSoonModal from '../common/ComingSoonModal';

const TAILORING_BG = '#9C80AA';
const FASHION_BG   = 'linear-gradient(180deg,#B8D4F0 0%,#DCEEFF 100%)';

const CATS = [
  { id:'tailoring', label:'Tailoring Tools', icon: SewingMachineIcon },
  { id:'fashion',   label:"Women's Fashion",  icon: FrockIcon },
];

/* ── Sliding switcher ── */
function SwitcherPills({ activeCategory, setActiveCategory, isWomenSectionLocked, onLockedClick }) {
  const containerRef = useRef(null);
  const btn0Ref      = useRef(null);
  const btn1Ref      = useRef(null);
  const btnRefs      = [btn0Ref, btn1Ref];
  const [slider, setSlider] = useState({ left:5, width:100 });

  // Recalculate slider position whenever active changes or on mount or lock state changes
  useEffect(() => {
    const idx = CATS.findIndex(c => c.id === activeCategory);
    const btn = btnRefs[idx]?.current;
    const wrap = containerRef.current;
    if (!btn || !wrap) return;
    const wRect = wrap.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    setSlider({
      left:  bRect.left - wRect.left,
      width: bRect.width,
    });
  }, [activeCategory, isWomenSectionLocked]);

  const handleTabClick = (catId) => {
    if (catId === 'fashion' && isWomenSectionLocked) {
      if (onLockedClick) onLockedClick();
      return;
    }
    setActiveCategory(catId);
  };

  return (
    <div ref={containerRef} className="sh-switcher">
      {/* The white sliding pill */}
      <div className="sh-switcher-slider" style={{ left: slider.left, width: slider.width }} />

      {CATS.map((cat, i) => {
        const IconComp = cat.icon;
        const isLocked = cat.id === 'fashion' && isWomenSectionLocked;
        const isActive = activeCategory === cat.id;

        return (
          <button
            key={cat.id}
            ref={btnRefs[i]}
            type="button"
            className={`sh-switcher-btn${isActive ? ' active' : ''}${isLocked ? ' sh-switcher-btn-locked' : ''}`}
            onClick={() => handleTabClick(cat.id)}
            title={isLocked ? "Women's Fashion (Chained & Locked - Coming Soon)" : cat.label}
            aria-label={isLocked ? "Women's Fashion - Coming Soon" : cat.label}
          >
            {isLocked ? (
              <img
                src="/chained_womens_fashion_pill.png"
                alt="Women's Fashion (Chained & Locked)"
                className="sh-chained-pill-img"
              />
            ) : (
              <>
                <span className="sh-switcher-icon-wrap">
                  <IconComp
                    size={20}
                    color={isActive ? (cat.id === 'tailoring' ? '#0284C7' : '#DB2777') : (cat.id === 'tailoring' ? '#38BDF8' : '#F472B6')}
                  />
                </span>
                <span className="sh-switcher-label">{cat.label}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default function Header() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const isHome    = location.pathname === '/';
  const isAdmin   = location.pathname.startsWith('/admin');

  const { activeCategory, setActiveCategory, isWomenSectionLocked, getCartCount, user, setUser, cmsData, cmsDraft } = useApp();
  const activeCms = cmsDraft || cmsData;
  const [q,              setQ]              = useState('');
  const [dropdown,       setDropdown]       = useState(false);
  const [drawer,         setDrawer]         = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    const h = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Close drawer on route change
  useEffect(() => { setDrawer(false); }, [location.pathname]);

  // Don't render header on admin pages - admin has its own header (MUST be after all hooks!)
  if (isAdmin) return null;

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null); navigate('/'); setDropdown(false); setDrawer(false);
  };

  const search = (e) => {
    e.preventDefault();
    if (q.trim()) { navigate(`/?q=${encodeURIComponent(q)}`); setQ(''); }
  };

  return (
    <>
      {/* ── Top Announcement Ticker Bar (Fully Customizable from Admin CMS) ── */}
      {activeCms?.announcementBar?.enabled === true && activeCms?.announcementBar?.text && (
        <div
          className="sh-announcement-bar"
          style={{
            background: activeCms.announcementBar.bgColor || '#0F172A',
            color: activeCms.announcementBar.textColor || '#FFFFFF',
            fontSize: '11.5px',
            fontWeight: 700,
            padding: '6px 14px',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            letterSpacing: '0.2px',
            position: 'relative',
            zIndex: 101,
            overflow: 'hidden',
          }}
        >
          {activeCms.announcementBar.badge && (
            <span
              style={{
                background: activeCms.announcementBar.badgeBg || '#2563EB',
                color: '#FFFFFF',
                fontSize: '9px',
                fontWeight: 900,
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.6px',
                textTransform: 'uppercase',
              }}
            >
              {activeCms.announcementBar.badge}
            </span>
          )}
          {activeCms.announcementBar.link ? (
            <a
              href={activeCms.announcementBar.link}
              style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>{activeCms.announcementBar.text}</span>
            </a>
          ) : (
            <span>{activeCms.announcementBar.text}</span>
          )}
        </div>
      )}

      <header className="sh-header">
        <div className="sh-container">
          <nav className="sh-navbar">

            {/* ── Logo ── */}
            <Link to="/" style={{ display:'flex', alignItems:'center', gap:'8px',
              flexShrink:0, textDecoration:'none', minWidth:0 }}>
              <div style={{ width:'44px', height:'44px', borderRadius:'50%',
                border:'1.5px solid #E2E8F0', overflow:'hidden', flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(15,23,42,0.06)', background:'#F5EBE0' }}>
                <img src="/logo.png" alt="Asmalabel"
                  style={{ width:'100%', height:'100%', objectFit:'contain', borderRadius:'50%', background:'#F5EBE0' }}
                  onError={e => { e.target.style.display='none'; }} />
              </div>
              <span style={{ fontSize:'19px', fontWeight:900, color:'#0F172A',
                fontFamily: "'Playfair Display', Georgia, serif",
                letterSpacing:'-0.5px', whiteSpace:'nowrap' }}>Asmalabel</span>
            </Link>

            {/* ── Desktop Nav Links ── */}
            <div className="sh-desktop-only" style={{ display:'flex', gap:'4px', alignItems:'center' }}>
              {[['/', 'Home'], ['/about', 'About']].map(([p, l]) => (
                <Link key={p} to={p}
                  className={`sh-nav-link${location.pathname === p ? ' active' : ''}`}>{l}
                </Link>
              ))}
            </div>

            {/* ── Search ── */}
            <form onSubmit={search} className="sh-desktop-only" style={{ flex:1, maxWidth:'480px', margin:'0 auto' }}>
              <div className="sh-search-wrap">
                <Search size={17} color="#64748B" />
                <input value={q} onChange={e => setQ(e.target.value)}
                  placeholder={activeCategory === 'tailoring' ? 'Search tailoring tools…' : "Search women's fashion…"} />
              </div>
            </form>

            {/* Mobile search — inline in navbar */}
            <form onSubmit={search} className="sh-mobile-search-inline sh-mobile-only" style={{ flex:1, minWidth:0 }}>
              <div className="sh-search-wrap" style={{ width:'100%', height:'38px', borderRadius:'99px', padding:'0 10px' }}>
                <Search size={14} color="#64748B" style={{ flexShrink:0 }} />
                <input value={q} onChange={e => setQ(e.target.value)}
                  placeholder="Search…"
                  style={{ fontSize:'13px', minWidth:0, width:'100%' }} />
              </div>
            </form>

            {/* ── Actions ── */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0, marginLeft:'auto' }}>

              {/* Wishlist button — desktop (always visible for all users) */}
              <Link to="/wishlist" className="sh-icon-btn sh-desktop-only" title="Wishlist" style={{ borderRadius:'14px' }}>
                <Heart size={18} color="#0F172A" />
              </Link>

              {/* Cart button — desktop (always visible for all users) */}
              <Link to="/cart" className="sh-icon-btn sh-desktop-only" title="Cart" style={{ position:'relative', borderRadius:'14px' }}>
                <ShoppingCart size={18} color="#0F172A" />
                {getCartCount() > 0 && (
                  <span className="sh-badge">{getCartCount() > 9 ? '9+' : getCartCount()}</span>
                )}
              </Link>

              {/* Profile / Account — desktop (square shape) */}
              {user ? (
                <div className="sh-desktop-only" style={{ position:'relative' }} ref={dropRef}>
                  <button className="sh-icon-btn" onClick={() => setDropdown(!dropdown)} style={{ borderRadius:'14px' }} title="Account Profile">
                    <User size={18} color="#0F172A" />
                  </button>
                  {dropdown && (
                    <div style={{
                      position:'absolute', right:0, top:'calc(100% + 10px)',
                      width:'240px', zIndex:9999,
                      background:'#FFFFFF',
                      borderRadius:'16px',
                      border:'1px solid #E2E8F0',
                      boxShadow:'0 16px 48px -8px rgba(15,23,42,0.22), 0 4px 14px rgba(0,0,0,0.08)',
                      overflow:'hidden',
                      animation:'sh-scaleIn .2s ease-out'
                    }}>
                      {/* Header */}
                      <div style={{ padding:'14px 16px', borderBottom:'1px solid #F1F5F9', background:'#F8FAFC' }}>
                        <p style={{ fontSize:'14px', fontWeight:800, color:'#111827', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                          {user.user_metadata?.full_name || 'My Account'}
                        </p>
                        <p style={{ fontSize:'11px', color:'#6B7280', margin:'3px 0 0 0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{user.email}</p>
                      </div>
                      {/* Menu rows */}
                      <div style={{ padding:'6px' }}>
                        {[
                          { to:'/profile', label:'My Profile',  icon:<User size={15} color="#4B5563" /> },
                          { to:'/orders',  label:'My Orders',   icon:<Package size={15} color="#4B5563" /> },
                          { to:'/wishlist',label:'Wishlist',    icon:<Heart size={15} color="#4B5563" /> },
                        ].map(({ to, label, icon }) => (
                          <Link key={to} to={to} onClick={() => setDropdown(false)}
                            style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', fontSize:'13px', fontWeight:700, color:'#1F2937', borderRadius:'10px', textDecoration:'none', transition:'background 150ms' }}
                            onMouseEnter={e => e.currentTarget.style.background='#F1F5F9'}
                            onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                            {icon} {label}
                          </Link>
                        ))}
                        {user.email === 'as.businezzz@gmail.com' && (
                          <Link to="/admin" onClick={() => setDropdown(false)}
                            style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', marginTop:'2px', fontSize:'13px', fontWeight:800, color:'#DC2626', borderRadius:'10px', textDecoration:'none', background:'rgba(239,68,68,0.07)', transition:'background 150ms' }}
                            onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.14)'}
                            onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.07)'}>
                            <Shield size={15} color="#DC2626" /> Admin Panel
                          </Link>
                        )}
                        <div style={{ height:'1px', background:'#F1F5F9', margin:'6px 0' }} />
                        <button onClick={() => { logout(); setDropdown(false); }}
                          style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px', padding:'10px 12px', fontSize:'13px', fontWeight:800, color:'#EF4444', background:'transparent', border:'none', borderRadius:'10px', cursor:'pointer', transition:'background 150ms' }}
                          onMouseEnter={e => e.currentTarget.style.background='#FEF2F2'}
                          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                          <LogOut size={15} color="#EF4444" /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="sh-btn sh-btn-sm sh-desktop-only">Login</Link>
              )}

              {/* Hamburger — mobile only */}
              <button className="sh-icon-btn sh-mobile-only" onClick={() => setDrawer(true)} style={{ borderRadius:'14px' }} title="Menu">
                <Menu size={20} color="#0F172A" />
              </button>
            </div>
          </nav>

          {/* Mobile search below nav — hidden, search is now inline */}
        </div>

        {/* ── Category Switcher (home only) ── */}
        {isHome && (
          <div className="sh-switcher-wrap"
            style={{ background: activeCategory === 'tailoring' ? TAILORING_BG : FASHION_BG }}>
            <div className="sh-container sh-switcher-container">
              <SwitcherPills
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                isWomenSectionLocked={isWomenSectionLocked}
                onLockedClick={() => setShowComingSoon(true)}
              />
            </div>
          </div>
        )}
      </header>

      {/* ══ Mobile Side Utility Drawer ══════════════════════════════════════════════ */}
      <AnimatePresence>
        {drawer && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawer(false)}
              style={{
                position:'fixed', inset:0, background:'rgba(0, 0, 0, 0.45)',
                zIndex:1000, backdropFilter:'blur(8px)', WebkitBackdropFilter:'blur(8px)'
              }}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 27, stiffness: 280 }}
              style={{
                position:'fixed', top:0, right:0, bottom:0, width:'84vw', maxWidth:'340px',
                background:'#FFFFFF', zIndex:1001, overflowY:'auto', display:'flex', flexDirection:'column',
                boxShadow:'-8px 0 36px rgba(0, 0, 0, 0.16)',
                borderTopLeftRadius:'24px', borderBottomLeftRadius:'24px',
              }}>

            {/* ── HEADER CARD ── */}
            <div style={{
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              color: '#FFFFFF', padding: '24px 20px 20px 20px',
              borderTopLeftRadius: '24px', position: 'relative'
            }}>
              {/* Close Button */}
              <button onClick={() => setDrawer(false)}
                style={{
                  position:'absolute', top:'16px', right:'16px',
                  width:'34px', height:'34px', borderRadius:'50%',
                  background:'rgba(255, 255, 255, 0.15)', backdropFilter:'blur(8px)',
                  border:'1px solid rgba(255, 255, 255, 0.2)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  cursor:'pointer'
                }}>
                <X size={18} color="#FFFFFF" />
              </button>

              {/* Profile Details */}
              {user ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginTop:'8px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
                    <div style={{
                      width:'52px', height:'52px', borderRadius:'50%',
                      background:'linear-gradient(135deg, #3B82F6, #1D4ED8)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color:'#FFFFFF', fontWeight:900, fontSize:'22px',
                      boxShadow:'0 4px 14px rgba(59, 130, 246, 0.4)',
                      border:'2px solid rgba(255, 255, 255, 0.8)'
                    }}>
                      {(user.user_metadata?.full_name || user.email)?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ flex:1, overflow:'hidden' }}>
                      <p style={{ fontSize:'16px', fontWeight:800, color:'#FFFFFF', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {user.user_metadata?.full_name || 'User Account'}
                      </p>
                      <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.7)', margin:'2px 0 0 0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Link to="/profile" onClick={() => setDrawer(false)}
                    style={{
                      display:'inline-flex', alignItems:'center', gap:'6px',
                      background:'rgba(255, 255, 255, 0.15)', backdropFilter:'blur(10px)',
                      border:'1px solid rgba(255, 255, 255, 0.25)',
                      padding:'6px 14px', borderRadius:'9999px',
                      color:'#FFFFFF', fontSize:'12px', fontWeight:700,
                      textDecoration:'none', marginTop:'4px',
                      alignSelf:'flex-start'
                    }}>
                    <User size={13} /> View Profile
                  </Link>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginTop:'8px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                    <img src="/logo.png" alt="Asmalabel"
                      style={{ width:'44px', height:'44px', borderRadius:'50%', background:'#F5EBE0', objectFit:'contain', border:'1.5px solid rgba(255,255,255,0.3)', boxShadow:'0 2px 8px rgba(0,0,0,0.15)' }} />
                    <div>
                      <p style={{ fontSize:'18px', fontWeight:900, color:'#FFFFFF', margin:0 }}>Asmalabel</p>
                      <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.7)', margin:'2px 0 0 0' }}>Tailoring Tools & Fashion</p>
                    </div>
                  </div>
                  <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.85)', margin:'4px 0 0 0' }}>
                    Sign in to track orders, manage your account, and access exclusive offers.
                  </p>
                </div>
              )}
            </div>

            {/* ── UTILITY CARDS BODY ── */}
            <div style={{ padding:'20px 16px', display:'flex', flexDirection:'column', gap:'10px', flex:1 }}>

              <p style={{ fontSize:'11px', fontWeight:800, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'1px', margin:'0 0 4px 4px' }}>
                Account Utilities
              </p>

              {/* My Orders */}
              {user && (
                <Link to="/orders" onClick={() => setDrawer(false)}
                  className="sh-drawer-card-item">
                  <div className="sh-drawer-icon-box" style={{ background:'rgba(59, 130, 246, 0.1)', color:'#2563EB' }}>
                    <Package size={18} />
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:'14px', fontWeight:700, color:'#111827', margin:0 }}>My Orders</p>
                    <p style={{ fontSize:'11px', color:'#6B7280', margin:0 }}>Track, return, or view past purchases</p>
                  </div>
                  <ChevronRight size={16} color="#9CA3AF" />
                </Link>
              )}

              {/* About Asmalabel */}
              <Link to="/about" onClick={() => setDrawer(false)}
                className="sh-drawer-card-item">
                <div className="sh-drawer-icon-box" style={{ background:'rgba(16, 185, 129, 0.1)', color:'#059669' }}>
                  <Info size={18} />
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:'14px', fontWeight:700, color:'#111827', margin:0 }}>About Asmalabel</p>
                  <p style={{ fontSize:'11px', color:'#6B7280', margin:0 }}>Our story, craftsmanship & values</p>
                </div>
                <ChevronRight size={16} color="#9CA3AF" />
              </Link>

              {/* WhatsApp Support */}
              <a href="https://wa.me/917013942909?text=Hi!%20I%20need%20help%20with%20Asmalabel"
                target="_blank" rel="noopener noreferrer" onClick={() => setDrawer(false)}
                className="sh-drawer-card-item">
                <div className="sh-drawer-icon-box" style={{ background:'rgba(34, 197, 94, 0.12)' }}>
                  <WhatsAppIcon size={20} />
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:'14px', fontWeight:700, color:'#111827', margin:0 }}>WhatsApp Support</p>
                  <p style={{ fontSize:'11px', color:'#6B7280', margin:0 }}>Direct chat with our customer team</p>
                </div>
                <ChevronRight size={16} color="#9CA3AF" />
              </a>

              {/* Admin Section (if admin) */}
              {user?.email === 'as.businezzz@gmail.com' && (
                <div style={{ marginTop:'6px' }}>
                  <p style={{ fontSize:'11px', fontWeight:800, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'1px', margin:'0 0 4px 4px' }}>
                    Management
                  </p>
                  <Link to="/admin" onClick={() => setDrawer(false)}
                    className="sh-drawer-card-item"
                    style={{ background:'linear-gradient(135deg, rgba(239, 68, 68, 0.06), rgba(245, 158, 11, 0.06))', border:'1px solid rgba(239, 68, 68, 0.2)' }}>
                    <div className="sh-drawer-icon-box" style={{ background:'linear-gradient(135deg, #EF4444, #F59E0B)', color:'#FFFFFF' }}>
                      <Shield size={18} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                        <p style={{ fontSize:'14px', fontWeight:800, color:'#991B1B', margin:0 }}>Admin Panel</p>
                        <span style={{ fontSize:'10px', fontWeight:800, background:'#EF4444', color:'white', padding:'1px 6px', borderRadius:'9999px' }}>PRO</span>
                      </div>
                      <p style={{ fontSize:'11px', color:'#7F1D1D', margin:0 }}>Manage products, orders & inventory</p>
                    </div>
                    <ChevronRight size={16} color="#EF4444" />
                  </Link>
                </div>
              )}

            </div>

            {/* ── FOOTER / AUTH ACTION ── */}
            <div style={{ padding:'16px 20px', borderTop:'1px solid #F1F5F9', background:'#F8FAFC' }}>
              {user ? (
                <button onClick={() => { logout(); setDrawer(false); }}
                  style={{
                    width:'100%', padding:'15px', borderRadius:'14px',
                    background:'linear-gradient(135deg, #FEF2F2, #FFE4E6)',
                    color:'#DC2626', fontWeight:800, fontSize:'14px',
                    border:'1px solid #FECACA', cursor:'pointer',
                    display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                    boxShadow:'0 2px 8px rgba(220, 38, 38, 0.08)'
                  }}>
                  <LogOut size={16} /> Sign Out
                </button>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  <Link to="/login" onClick={() => setDrawer(false)}
                    style={{
                      display:'block', textAlign:'center', padding:'14px', borderRadius:'14px',
                      background:'linear-gradient(135deg, #1E293B, #0F172A)',
                      color:'#FFFFFF', fontWeight:800, fontSize:'14px', textDecoration:'none',
                      boxShadow:'0 4px 14px rgba(15, 23, 42, 0.2)'
                    }}>
                    Log In
                  </Link>
                  <Link to="/signup" onClick={() => setDrawer(false)}
                    style={{
                      display:'block', textAlign:'center', padding:'13px', borderRadius:'14px',
                      border:'1.5px solid #1E293B', color:'#1E293B',
                      fontWeight:800, fontSize:'14px', textDecoration:'none', background:'#FFFFFF'
                    }}>
                    Create Account
                  </Link>
                </div>
              )}
            </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .sh-mobile-only  { display: flex !important; }
        .sh-desktop-only { display: none !important; }
        @media(min-width: 768px) {
          .sh-mobile-only  { display: none !important; }
          .sh-desktop-only { display: flex !important; }
        }

        /* ── Mobile header — single row: logo | search | menu ── */
        @media(max-width: 767px) {
          .sh-navbar {
            height: 56px !important;
            gap: 10px !important;
          }
          .sh-logo { font-size: 20px !important; }

          /* Mobile search: inline in navbar, flex:1 */
          .sh-mobile-search-inline {
            flex: 1;
            display: flex !important;
            align-items: center;
          }
          .sh-mobile-search-inline .sh-search-wrap {
            width: 100% !important;
            height: 36px !important;
            border-radius: 99px !important;
            padding: 0 12px !important;
          }
          /* Hide the below-nav search div on mobile */
          .sh-mobile-search-below {
            display: none !important;
          }
        }

        @keyframes sh-slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      {/* ══ Coming Soon Modal for Locked Women Section ══════════════════════ */}
      <ComingSoonModal
        isOpen={showComingSoon}
        onClose={() => setShowComingSoon(false)}
        onExploreTailoring={() => {
          setActiveCategory('tailoring');
          setShowComingSoon(false);
        }}
      />
    </>
  );
}
