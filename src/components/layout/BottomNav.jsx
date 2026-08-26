import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShoppingCart, Heart, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function BottomNav() {
  const location = useLocation();
  const { getCartCount, user } = useApp();
  const count = getCartCount();

  const items = [
    { to:'/',                      icon:Home,         label:'Home'                 },
    { to:'/wishlist',              icon:Heart,        label:'Wishlist'             },
    { to:'/cart',        badge:count, icon:ShoppingCart, label:'Cart'              },
    { to:user?'/profile':'/login', icon:User,         label:user?'Profile':'Login' },
  ];

  // Hide on admin, checkout, login, signup
  const hide = location.pathname.startsWith('/admin') ||
    ['/checkout', '/login', '/signup'].includes(location.pathname);
  if (hide) return null;

  return (
    <nav style={{
      position:'fixed', bottom:0, left:0, right:0,
      height:'calc(60px + env(safe-area-inset-bottom, 0px))',
      minHeight:'60px',
      background:'rgba(255, 255, 255, 0.92)',
      backdropFilter:'blur(20px) saturate(180%)',
      WebkitBackdropFilter:'blur(20px) saturate(180%)',
      borderTop:'1px solid rgba(226, 232, 240, 0.8)',
      boxShadow:'0 -4px 25px rgba(15, 23, 42, 0.08)',
      display:'flex',
      alignItems:'center',
      justifyContent:'space-around',
      zIndex:998,
      paddingBottom:'env(safe-area-inset-bottom, 0px)',
      boxSizing:'border-box',
      transform:'translate3d(0, 0, 0)',
    }}>
      {items.map(({ to, icon:Icon, label, badge }) => {
        const active = location.pathname === to ||
          (to === '/' && location.pathname === '/');
        return (
          <Link key={to} to={to} style={{
            display:'flex', flexDirection:'column', alignItems:'center',
            justifyContent:'center',
            gap:'3px', padding:'6px 14px', borderRadius:'16px',
            textDecoration:'none', position:'relative',
            color: active ? 'var(--primary)' : '#94A3B8',
            fontWeight: active ? 800 : 600,
            fontSize:'10.5px',
            flex:1, maxWidth:'80px',
            touchAction:'manipulation',
            WebkitTapHighlightColor:'transparent',
          }}>
            <motion.div
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Icon
                size={21}
                strokeWidth={active ? 2.5 : 1.8}
                fill={active && (to === '/wishlist') ? 'var(--primary)' : 'none'}
                color={active ? 'var(--primary)' : '#94A3B8'}
              />
              {badge > 0 && (
                <motion.span
                  key={badge}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                  style={{
                    position:'absolute', top:'-6px', right:'-9px',
                    background:'#0F172A', color:'white',
                    fontSize:'9px', fontWeight:800,
                    minWidth:'17px', height:'17px', borderRadius:'99px',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    padding:'0 3px', border:'2px solid white',
                    boxShadow:'0 2px 6px rgba(0,0,0,0.2)'
                  }}>
                  {badge > 9 ? '9+' : badge}
                </motion.span>
              )}
            </motion.div>

            <span style={{ letterSpacing:'.15px', transition:'color 0.2s ease' }}>{label}</span>

            {/* Active spring indicator pill */}
            {active && (
              <motion.div
                layoutId="bottomNavPill"
                transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                style={{
                  position:'absolute', bottom:'2px',
                  width:'16px', height:'3px', borderRadius:'99px',
                  background:'var(--primary)',
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
