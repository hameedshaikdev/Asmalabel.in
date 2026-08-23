import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { AppProvider, useApp } from './context/AppContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import Toast from './components/common/Toast';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BottomNav from './components/layout/BottomNav';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import AdminPanel from './pages/AdminPanel';
import About from './pages/About';
import ResetPassword from './pages/ResetPassword';
import AuthCallback from './pages/AuthCallback';
import OrderStatus from './pages/OrderStatus';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Inner app — has access to AppContext
function AppInner() {
  const { loading, toast, closeToast } = useApp();

  // Show loading spinner
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
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/product/:id"   element={<ProductDetail />} />
          <Route path="/cart"          element={<Cart />} />
          <Route path="/wishlist"      element={<Wishlist />} />
          <Route path="/checkout"      element={<Checkout />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/signup"        element={<Signup />} />
          <Route path="/profile"       element={<Profile />} />
          <Route path="/orders"        element={<Orders />} />
          <Route path="/admin"         element={<AdminPanel />} />
          <Route path="/about"         element={<About />} />
          <Route path="/reset-password"  element={<ResetPassword />} />
          <Route path="/auth/callback"   element={<AuthCallback />} />
          <Route path="/order-status/:id" element={<OrderStatus />} />
        </Routes>
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
