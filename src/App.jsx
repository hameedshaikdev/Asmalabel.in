import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AppProvider, useApp } from './context/AppContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Toast from './components/common/Toast';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BottomNav from './components/layout/BottomNav';

// ── Direct Import for critical entry page (Instant 0ms homepage load) ──
import Home from './pages/Home';

// ── Resilient Lazy Imports with Auto-Refresh on Deployment Updates ──
function lazyRetry(importFn) {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      const isDynamicImportError =
        error?.message?.includes('Failed to fetch dynamically imported module') ||
        error?.message?.includes('Importing a module script failed') ||
        error?.message?.includes('error loading dynamically imported module') ||
        error?.name === 'ChunkLoadError';

      const lastReload = sessionStorage.getItem('last_chunk_reload');
      const now = Date.now();
      if (isDynamicImportError && (!lastReload || now - Number(lastReload) > 10000)) {
        sessionStorage.setItem('last_chunk_reload', String(now));
        window.location.reload();
        return new Promise(() => {}); // prevent throwing while reload is executing
      }
      throw error;
    }
  });
}

const ProductDetail  = lazyRetry(() => import('./pages/ProductDetail'));
const Cart           = lazyRetry(() => import('./pages/Cart'));
const Wishlist       = lazyRetry(() => import('./pages/Wishlist'));
const Checkout       = lazyRetry(() => import('./pages/Checkout'));
const Login          = lazyRetry(() => import('./pages/Login'));
const Signup         = lazyRetry(() => import('./pages/Signup'));
const Profile        = lazyRetry(() => import('./pages/Profile'));
const Orders         = lazyRetry(() => import('./pages/Orders'));
const AdminPanel     = lazyRetry(() => import('./pages/AdminPanel'));
const About          = lazyRetry(() => import('./pages/About'));
const ResetPassword  = lazyRetry(() => import('./pages/ResetPassword'));
const AuthCallback   = lazyRetry(() => import('./pages/AuthCallback'));
const OrderStatus    = lazyRetry(() => import('./pages/OrderStatus'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Sleek Flipkart/Amazon style micro-loader for lazy route transitions
function PageLoadingFallback() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '40px 20px'
    }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, #6B4F8A, #3B82F6, #D97706)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.2s infinite linear',
        zIndex: 99999
      }} />
      <div style={{
        width: '36px',
        height: '36px',
        border: '3px solid #E2E8F0',
        borderTop: '3px solid #6B4F8A',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite'
      }} />
      <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.5px' }}>
        Loading...
      </span>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>
    </div>
  );
}

// Inner app — has access to AppContext
function AppInner() {
  const { loading, toast, closeToast } = useApp();

  // Show initial brand splash screen only while checking auth
  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', gap:'20px' }}>
        <div style={{ width:'80px', height:'80px', borderRadius:'50%', border:'2px solid rgba(217, 119, 6, 0.4)', background:'#F5EBE0', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', padding:'6px', boxShadow:'0 10px 35px rgba(0,0,0,0.4)' }}>
          <img src="/logo.png" alt="Asmalabel" style={{ width:'100%', height:'100%', objectFit:'contain', borderRadius:'50%', background:'#F5EBE0' }} />
        </div>
        <h1 style={{ fontSize:'36px', fontWeight:900, color:'white', letterSpacing:'-0.5px', fontFamily:"'Playfair Display', Georgia, serif", margin:0 }}>Asmalabel</h1>
        <div style={{ width:'42px', height:'42px', border:'3.5px solid rgba(255,255,255,0.15)', borderTop:'3.5px solid #B88346', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', background:'var(--bg)', width:'100%' }}>
      <Header />
      <main style={{ flex:'1 0 auto', display:'flex', flexDirection:'column', width:'100%' }} id="main-content">
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/"                 element={<Home />} />
            <Route path="/product/:id"      element={<ProductDetail />} />
            <Route path="/cart"             element={<Cart />} />
            <Route path="/wishlist"         element={<Wishlist />} />
            <Route path="/checkout"         element={<Checkout />} />
            <Route path="/login"            element={<Login />} />
            <Route path="/signup"           element={<Signup />} />
            <Route path="/profile"          element={<Profile />} />
            <Route path="/orders"           element={<Orders />} />
            <Route path="/admin"            element={<AdminPanel />} />
            <Route path="/about"            element={<About />} />
            <Route path="/reset-password"   element={<ResetPassword />} />
            <Route path="/auth/callback"    element={<AuthCallback />} />
            <Route path="/order-status/:id" element={<OrderStatus />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <BottomNav />
      <Toast toast={toast} onClose={closeToast} />
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <ScrollToTop />
          <AppInner />
        </Router>
      </AppProvider>
      <Analytics />
    </ErrorBoundary>
  );
}

export default App;
