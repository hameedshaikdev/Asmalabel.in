import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Package, Heart, LogOut, ChevronRight, Shield, Sparkles,
  Gift, Headphones, User, MapPin, Edit3, HelpCircle, FileText,
  X, Check, Copy, Plus, Trash2, Home, Building
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../config/supabase';
import { getStoredCoupons } from '../utils/pricing';
import SEO from '../components/common/SEO';

const ADMIN_EMAIL = 'as.businezzz@gmail.com';
const SHOP_WA = '917013942909';

export default function Profile() {
  const navigate = useNavigate();
  const { user, setUser, loading, showToast } = useApp();

  const [activeModal, setActiveModal] = useState(null); // 'edit_profile', 'coupons', 'addresses', 'address_form', 'plus', 'reviews', 'faqs', 'policies'
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState('');

  // ── Saved Addresses State & Storage ──
  const [addresses, setAddresses] = useState([]);
  const [editingAddress, setEditingAddress] = useState(null); // null = new, or address object
  const [addrForm, setAddrForm] = useState({
    id: '',
    fullName: '',
    phone: '',
    houseNo: '',
    streetArea: '',
    landmark: '',
    city: '',
    state: 'Andhra Pradesh',
    pincode: '',
    type: 'Home',
    isDefault: false
  });

  // ── User Reviews State & Storage ──
  const [userReviews, setUserReviews] = useState([]);
  const [writeReviewModal, setWriteReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    productName: 'Professional Tailoring Fabric Scissors (9.5in)',
    rating: 5,
    title: 'Superb quality and razor sharp!',
    comment: 'The cuts are extremely smooth on heavy silk and denim fabrics. Worth every rupee!'
  });

  useEffect(() => {
    if (!loading && !user) navigate('/login');
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setPhone(user.user_metadata?.phone || '');

      // Load saved addresses from localStorage
      try {
        const saved = localStorage.getItem(`asma_saved_addresses_${user.id}`);
        if (saved) {
          setAddresses(JSON.parse(saved));
        } else {
          // Initialize with a default profile address if none exists
          const defaultAddr = {
            id: 'addr_default_1',
            fullName: user.user_metadata?.full_name || 'Shaik Asmath',
            phone: user.user_metadata?.phone || '7013942909',
            houseNo: 'D.No 14-2-120',
            streetArea: 'Gandhi Nagar, Main Road',
            landmark: 'Near Clock Tower',
            city: 'Nellore',
            state: 'Andhra Pradesh',
            pincode: '524001',
            type: 'Home',
            isDefault: true
          };
          setAddresses([defaultAddr]);
          localStorage.setItem(`asma_saved_addresses_${user.id}`, JSON.stringify([defaultAddr]));
        }

        // Load saved reviews from localStorage
        const savedRev = localStorage.getItem(`asma_user_reviews_${user.id}`);
        if (savedRev) {
          setUserReviews(JSON.parse(savedRev));
        } else {
          const sampleRev = [
            {
              id: 'rev_sample_1',
              productName: 'Professional Tailoring Fabric Scissors (9.5in)',
              rating: 5,
              title: 'Superb quality and razor sharp!',
              comment: 'The cuts are extremely smooth on heavy silk and denim fabrics. Authentic Japanese steel quality!',
              date: '12 Aug 2026'
            }
          ];
          setUserReviews(sampleRev);
          localStorage.setItem(`asma_user_reviews_${user.id}`, JSON.stringify(sampleRev));
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
      }
    }
  }, [user, loading, navigate]);

  const [couponsList, setCouponsList] = useState([]);

  useEffect(() => {
    const loadCoupons = () => {
      setCouponsList(getStoredCoupons());
    };

    loadCoupons();
    window.addEventListener('storage', loadCoupons);
    return () => window.removeEventListener('storage', loadCoupons);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName, phone: phone }
      });
      if (error) throw error;
      if (showToast) showToast('Profile updated successfully!', null, 'wishlist');
      setActiveModal(null);
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  /* ── Address CRUD Operations ── */
  function openAddAddress() {
    setEditingAddress(null);
    setAddrForm({
      id: `addr_${Date.now()}`,
      fullName: fullName || '',
      phone: phone || '',
      houseNo: '',
      streetArea: '',
      landmark: '',
      city: 'Nellore',
      state: 'Andhra Pradesh',
      pincode: '524001',
      type: 'Home',
      isDefault: addresses.length === 0
    });
    setActiveModal('address_form');
  }

  function openEditAddress(addr) {
    setEditingAddress(addr);
    setAddrForm({ ...addr });
    setActiveModal('address_form');
  }

  function handleSaveAddress(e) {
    e.preventDefault();
    if (!addrForm.fullName || !addrForm.phone || !addrForm.houseNo || !addrForm.streetArea || !addrForm.pincode) {
      alert('Please fill in all required address fields.');
      return;
    }

    let updatedList;
    if (editingAddress) {
      // Edit existing
      updatedList = addresses.map(a => a.id === editingAddress.id ? { ...addrForm } : a);
    } else {
      // Add new
      if (addrForm.isDefault) {
        updatedList = addresses.map(a => ({ ...a, isDefault: false }));
        updatedList.push(addrForm);
      } else {
        updatedList = [...addresses, addrForm];
      }
    }

    setAddresses(updatedList);
    localStorage.setItem(`asma_saved_addresses_${user.id}`, JSON.stringify(updatedList));
    if (showToast) showToast(editingAddress ? 'Address updated!' : 'Address saved!', null, 'wishlist');
    setActiveModal('addresses');
  }

  function handleDeleteAddress(id) {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const updatedList = addresses.filter(a => a.id !== id);
      setAddresses(updatedList);
      localStorage.setItem(`asma_saved_addresses_${user.id}`, JSON.stringify(updatedList));
      if (showToast) showToast('Address deleted', null, 'wishlist');
    }
  }

  function handleSetDefaultAddress(id) {
    const updatedList = addresses.map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    setAddresses(updatedList);
    localStorage.setItem(`asma_saved_addresses_${user.id}`, JSON.stringify(updatedList));
    if (showToast) showToast('Default address updated!', null, 'wishlist');
  }

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Member';

  // Filter coupons: ONLY show Active & NON-hidden coupons in Profile page!
  const visibleCoupons = couponsList.filter(c => c.active !== false && c.hidden !== true);

  function copyCouponCode(code) {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(''), 2000);
  }

  function openWhatsAppHelp() {
    const msg = `Hello Asmalabel Support! 👋 I need assistance with my account / order.`;
    window.open(`https://wa.me/${SHOP_WA}?text=${encodeURIComponent(msg)}`, '_blank');
  }

  if (loading || !user) return null;

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', padding: '20px 16px 80px' }}>
      <SEO title="My Account | Asmalabel" robots="noindex, nofollow" canonical="https://asmalabel.in/profile" />

      <div style={{ maxWidth: '580px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* ── 1. Top User Card with Image 4 Deep Blue Gradient ── */}
        <div style={{
          background: 'linear-gradient(135deg, #1A1A2E 0%, #0F3460 100%)',
          borderRadius: '22px',
          padding: '24px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.18)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle glowing radial blur overlay */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-40px',
            width: '180px', height: '180px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(233,69,96,0.3) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{
              fontSize: '22px',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: '0 0 4px',
              letterSpacing: '-0.4px',
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif'
            }}>
              {displayName}
            </h1>
            <div
              onClick={() => setActiveModal('plus')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#93C5FD', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              <span>Explore</span>
              <span style={{ color: '#FDE68A', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                ✦ Plus Silver
              </span>
              <ChevronRight size={14} color="#93C5FD" />
            </div>
          </div>

          {/* SuperCoins / Reward Badge */}
          <div style={{
            background: 'rgba(254, 243, 199, 0.15)',
            border: '1.5px solid rgba(253, 230, 138, 0.4)',
            backdropFilter: 'blur(10px)',
            borderRadius: '99px',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            position: 'relative',
            zIndex: 1
          }}>
            <span style={{ fontSize: '14px' }}>⚡</span>
            <span style={{ fontSize: '15px', fontWeight: 900, color: '#FDE68A' }}>0</span>
          </div>
        </div>

        {/* ── 2. 2x2 Quick Action Grid (Orders, Wishlist, Coupons, Help Center) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {/* Orders */}
          <Link
            to="/orders"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              transition: 'all .2s'
            }}
          >
            <Package size={22} color="#2563EB" />
            <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>Orders</span>
          </Link>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              transition: 'all .2s'
            }}
          >
            <Heart size={22} color="#2563EB" />
            <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>Wishlist</span>
          </Link>

          {/* Coupons */}
          <div
            onClick={() => setActiveModal('coupons')}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              transition: 'all .2s'
            }}
          >
            <Gift size={22} color="#2563EB" />
            <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>Coupons</span>
          </div>

          {/* Help Center */}
          <div
            onClick={openWhatsAppHelp}
            style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              transition: 'all .2s'
            }}
          >
            <Headphones size={22} color="#2563EB" />
            <span style={{ fontSize: '14.5px', fontWeight: 800, color: '#0F172A' }}>Help Center</span>
          </div>
        </div>

        {/* ── 3. Account Settings Section (Cleaned up: Edit Profile, Saved Addresses, Plus, Admin) ── */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '18px 0 8px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px', padding: '0 18px', letterSpacing: '-0.3px' }}>
            Account Settings
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { icon: Sparkles, label: 'Asmalabel Plus', onClick: () => setActiveModal('plus') },
              { icon: User, label: 'Edit Profile', onClick: () => setActiveModal('edit_profile') },
              { icon: MapPin, label: 'Saved Addresses', onClick: () => setActiveModal('addresses'), count: addresses.length },
              ...(user.email === ADMIN_EMAIL ? [{ icon: Shield, label: 'Admin Dashboard', onClick: () => navigate('/admin'), isSpecial: true }] : []),
            ].map(({ icon: Icon, label, onClick, isSpecial, count }) => (
              <div
                key={label}
                onClick={onClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '13px 18px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #F8FAFC',
                  transition: 'background .2s'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Icon size={19} color={isSpecial ? '#10B981' : '#2563EB'} />
                  <span style={{ fontSize: '14px', fontWeight: isSpecial ? 900 : 700, color: isSpecial ? '#10B981' : '#1E293B' }}>
                    {label}
                  </span>
                  {count !== undefined && (
                    <span style={{ fontSize: '11px', fontWeight: 800, background: '#F1F5F9', color: '#475569', padding: '2px 8px', borderRadius: '99px' }}>
                      {count}
                    </span>
                  )}
                </div>
                <ChevronRight size={16} color="#94A3B8" />
              </div>
            ))}
          </div>
        </div>

        {/* ── 4. My Activity Section (Reviews) ── */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '18px 0 8px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px', padding: '0 18px', letterSpacing: '-0.3px' }}>
            My Activity
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              onClick={() => setActiveModal('reviews')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '13px 18px',
                cursor: 'pointer',
                borderBottom: '1px solid #F8FAFC'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Edit3 size={19} color="#2563EB" />
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>Reviews</span>
              </div>
              <ChevronRight size={16} color="#94A3B8" />
            </div>
          </div>
        </div>

        {/* ── 5. Feedback & Information Section (Policies & FAQs) ── */}
        <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '18px 0 8px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: '0 0 12px', padding: '0 18px', letterSpacing: '-0.3px' }}>
            Feedback &amp; Information
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { icon: FileText, label: 'Terms, Policies and Licenses', onClick: () => setActiveModal('policies') },
              { icon: HelpCircle, label: 'Browse FAQs', onClick: () => setActiveModal('faqs') },
            ].map(({ icon: Icon, label, onClick }) => (
              <div
                key={label}
                onClick={onClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '13px 18px',
                  cursor: 'pointer',
                  borderBottom: '1px solid #F8FAFC'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <Icon size={19} color="#2563EB" />
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#1E293B' }}>{label}</span>
                </div>
                <ChevronRight size={16} color="#94A3B8" />
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. Log Out Button ── */}
        <button
          onClick={handleLogout}
          style={{
            width: '100%',
            padding: '14px',
            background: '#FFFFFF',
            border: '1.5px solid #E2E8F0',
            borderRadius: '14px',
            color: '#2563EB',
            fontSize: '15px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            transition: 'all .2s',
            marginTop: '4px'
          }}
        >
          Log Out
        </button>

      </div>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* ── INTERACTIVE MODALS (Saved Addresses, Profile, Coupons) ── */}
      {/* ══════════════════════════════════════════════════════════════ */}
      {activeModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '480px',
            padding: '24px', boxShadow: '0 20px 48px rgba(0,0,0,0.25)', position: 'relative',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <button
              onClick={() => setActiveModal(null)}
              style={{ position: 'absolute', top: '16px', right: '16px', background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={16} color="#0F172A" />
            </button>

            {/* ── 1. SAVED ADDRESSES LIST MODAL ── */}
            {activeModal === 'addresses' && (
              <div>
                <div style={{ marginBottom: '16px', paddingRight: '36px' }}>
                  <h3 style={{ fontSize: '19px', fontWeight: 900, margin: '0 0 2px', color: '#0F172A', letterSpacing: '-0.3px' }}>
                    Saved Addresses
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
                    Manage delivery locations for quick 1-click checkout
                  </p>
                </div>

                {/* Prominent Add Address Button */}
                <button
                  onClick={openAddAddress}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '14px',
                    background: '#EFF6FF',
                    border: '1.5px dashed #3B82F6',
                    color: '#2563EB',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    marginBottom: '16px',
                    transition: 'all .2s'
                  }}
                >
                  <Plus size={16} /> Add a New Address
                </button>

                {addresses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '28px 0' }}>
                    <MapPin size={36} color="#94A3B8" style={{ margin: '0 auto 10px' }} />
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>No saved addresses yet</p>
                    <button onClick={openAddAddress} style={{ marginTop: '10px', padding: '9px 18px', borderRadius: '10px', background: '#2563EB', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                      Add Your First Address
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        style={{
                          background: addr.isDefault ? '#F8FCF9' : '#FFFFFF',
                          border: addr.isDefault ? '1.5px solid #86EFAC' : '1px solid #E2E8F0',
                          borderRadius: '16px',
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          boxShadow: '0 2px 8px rgba(15,23,42,0.03)'
                        }}
                      >
                        {/* Name & Badges Row */}
                        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14.5px', fontWeight: 900, color: '#0F172A' }}>
                            {addr.fullName}
                          </span>
                          <span style={{ fontSize: '10px', fontWeight: 800, background: '#F1F5F9', color: '#475569', padding: '2px 7px', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
                            {addr.type || 'HOME'}
                          </span>
                          {addr.isDefault && (
                            <span style={{ fontSize: '10px', fontWeight: 900, background: '#DCFCE7', color: '#166534', padding: '2px 7px', borderRadius: '4px' }}>
                              DEFAULT
                            </span>
                          )}
                        </div>

                        {/* Phone Number */}
                        <p style={{ fontSize: '12.5px', fontWeight: 600, color: '#64748B', margin: '0 0 6px' }}>
                          📱 +91 {addr.phone}
                        </p>

                        {/* Full Address Text */}
                        <p style={{ fontSize: '13px', color: '#334155', lineHeight: 1.45, margin: '0 0 12px' }}>
                          {addr.houseNo}, {addr.streetArea}{addr.landmark ? `, Near ${addr.landmark}` : ''}, {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                        </p>

                        {/* Action Buttons Row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap' }}>
                          <button
                            onClick={() => openEditAddress(addr)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              padding: '6px 12px', borderRadius: '8px',
                              background: '#EFF6FF', border: '1px solid #DBEAFE',
                              color: '#2563EB', fontSize: '12px', fontWeight: 800, cursor: 'pointer'
                            }}
                          >
                            <Edit3 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '4px',
                              padding: '6px 12px', borderRadius: '8px',
                              background: '#FEF2F2', border: '1px solid #FEE2E2',
                              color: '#EF4444', fontSize: '12px', fontWeight: 800, cursor: 'pointer'
                            }}
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                          {!addr.isDefault && (
                            <button
                              onClick={() => handleSetDefaultAddress(addr.id)}
                              style={{
                                marginLeft: 'auto', padding: '6px 12px', borderRadius: '8px',
                                background: '#FFFFFF', border: '1px solid #CBD5E1',
                                color: '#166534', fontSize: '12px', fontWeight: 800, cursor: 'pointer'
                              }}
                            >
                              Set as Default
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── 2. ADD / EDIT ADDRESS FORM MODAL ── */}
            {activeModal === 'address_form' && (
              <form onSubmit={handleSaveAddress}>
                <div style={{ marginBottom: '16px', paddingRight: '36px' }}>
                  <h3 style={{ fontSize: '19px', fontWeight: 900, margin: '0 0 2px', color: '#0F172A', letterSpacing: '-0.3px' }}>
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </h3>
                  <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
                    Provide accurate details for fast doorstep delivery
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Full Name *</label>
                    <input
                      value={addrForm.fullName}
                      onChange={(e) => setAddrForm({ ...addrForm, fullName: e.target.value })}
                      placeholder="e.g. Shaik Asmath"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Phone Number *</label>
                    <input
                      value={addrForm.phone}
                      onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })}
                      placeholder="10-digit number" maxLength={10}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Pincode *</label>
                    <input
                      value={addrForm.pincode}
                      onChange={(e) => setAddrForm({ ...addrForm, pincode: e.target.value })}
                      placeholder="e.g. 524001" maxLength={6}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>House / Flat No. *</label>
                    <input
                      value={addrForm.houseNo}
                      onChange={(e) => setAddrForm({ ...addrForm, houseNo: e.target.value })}
                      placeholder="e.g. D.No 14-2-120"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Street / Area *</label>
                    <input
                      value={addrForm.streetArea}
                      onChange={(e) => setAddrForm({ ...addrForm, streetArea: e.target.value })}
                      placeholder="e.g. Gandhi Nagar"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ gridColumn: '1/-1' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Landmark (Optional)</label>
                    <input
                      value={addrForm.landmark}
                      onChange={(e) => setAddrForm({ ...addrForm, landmark: e.target.value })}
                      placeholder="e.g. Near Clock Tower"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>City *</label>
                    <input
                      value={addrForm.city}
                      onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                      placeholder="e.g. Nellore"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>State *</label>
                    <input
                      value={addrForm.state}
                      onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })}
                      placeholder="e.g. Andhra Pradesh"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <input
                    type="checkbox" id="isDefaultCheck"
                    checked={addrForm.isDefault}
                    onChange={(e) => setAddrForm({ ...addrForm, isDefault: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <label htmlFor="isDefaultCheck" style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', cursor: 'pointer' }}>
                    Make this my default delivery address
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button" onClick={() => setActiveModal('addresses')}
                    style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#F1F5F9', color: '#475569', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 2, padding: '12px', borderRadius: '12px', background: '#0F172A', color: '#FFFFFF', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                  >
                    Save Address
                  </button>
                </div>
              </form>
            )}

            {/* ── 3. EDIT PROFILE MODAL ── */}
            {activeModal === 'edit_profile' && (
              <form onSubmit={handleSaveProfile}>
                <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '16px', color: '#0F172A' }}>Edit Profile</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Full Name</label>
                    <input
                      value={fullName} onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full name"
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Phone Number</label>
                    <input
                      value={phone} onChange={(e) => setPhone(e.target.value)}
                      placeholder="10-digit mobile number" maxLength={10}
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '14px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Email (Registered)</label>
                    <input
                      value={user.email} disabled
                      style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: '14px', color: '#94A3B8', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <button
                  type="submit" disabled={savingProfile}
                  style={{ width: '100%', padding: '13px', borderRadius: '12px', background: '#0F172A', color: 'white', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                >
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {/* ── 4. COUPONS MODAL (DYNAMICALLY SYNCED WITH ADMIN) ── */}
            {activeModal === 'coupons' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '6px', color: '#0F172A' }}>Available Coupons</h3>
                <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>Copy and apply these at checkout to save instantly!</p>
                
                {visibleCoupons.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748B', fontSize: '13px' }}>
                    <Gift size={36} color="#CBD5E1" style={{ marginBottom: '8px' }} />
                    <p style={{ fontWeight: 700, margin: 0 }}>No active public coupons available right now.</p>
                    <p style={{ fontSize: '11.5px', color: '#94A3B8', marginTop: '4px' }}>Check back soon for new special deals &amp; promos!</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {visibleCoupons.map((c) => (
                      <div key={c.code} style={{ background: '#F8FAFC', border: '1.5px dashed #CBD5E1', borderRadius: '14px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                            <span style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', letterSpacing: '0.5px' }}>{c.code}</span>
                            <span style={{
                              fontSize: '10px', fontWeight: 900, padding: '2px 6px', borderRadius: '5px',
                              background: c.type === 'percent' ? '#DCFCE7' : '#FEF3C7',
                              color: c.type === 'percent' ? '#166534' : '#92400E'
                            }}>
                              {c.type === 'percent' ? `${c.val}% OFF` : `₹${c.val} OFF`}
                            </span>
                          </div>
                          <p style={{ fontSize: '12px', color: '#475569', margin: 0, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.desc}
                          </p>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px', fontSize: '10.5px', color: '#64748B', fontWeight: 600 }}>
                            <span>
                              {c.minCartTotal > 0 ? `Min Order: ₹${c.minCartTotal}` : 'No Minimum Order'}
                            </span>
                            <span>•</span>
                            <span>
                              {
                                c.scope === 'ALL_PRODUCTS' ? 'Storewide' :
                                c.scope === 'SPECIFIC_CATEGORY' ? `${c.applicableCategory === 'tailoring' ? 'Tailoring Supplies' : 'Women\'s Fashion'}` :
                                c.scope === 'SELECTED_PRODUCTS' ? 'Selected Products' :
                                c.scope === 'MIN_PRICE_TAG' ? `Item Price ≥ ₹${c.minItemPrice}` : 'Storewide'
                              }
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => copyCouponCode(c.code)}
                          style={{
                            padding: '8px 14px', borderRadius: '8px', flexShrink: 0,
                            background: copiedCoupon === c.code ? '#16A34A' : '#0F172A',
                            color: '#fff', fontSize: '12px', fontWeight: 800, border: 'none', cursor: 'pointer',
                            transition: 'all 200ms ease'
                          }}
                        >
                          {copiedCoupon === c.code ? 'COPIED ✓' : 'COPY'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── 5. PLUS SILVER MODAL ── */}
            {activeModal === 'plus' && (
              <div style={{ textAlign: 'center' }}>
                <span style={{ fontSize: '36px' }}>✦</span>
                <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '8px 0 4px', color: '#0F172A' }}>Asmalabel Plus Silver</h3>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
                  You are an active Plus member! Enjoy free pan-India delivery, priority tailoring tool fulfillment, and exclusive coupon deals.
                </p>
                <button onClick={() => setActiveModal(null)} style={{ padding: '11px 24px', borderRadius: '12px', background: '#0F172A', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                  Got it
                </button>
              </div>
            )}

            {/* ── 6. POLICIES MODAL ── */}
            {activeModal === 'policies' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '10px', color: '#0F172A' }}>Terms &amp; Store Policies</h3>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, maxHeight: '280px', overflowY: 'auto' }}>
                  <p><strong>1. Shipping:</strong> Express pan-India delivery within 24-48 business hours.</p>
                  <p><strong>2. Quality Guarantee:</strong> 100% genuine tailoring tools and inspected fabrics.</p>
                  <p><strong>3. Support:</strong> Dedicated boutique WhatsApp customer care from Nellore, AP.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ marginTop: '16px', width: '100%', padding: '11px', borderRadius: '12px', background: '#0F172A', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            )}

            {/* ── 7. FAQS MODAL ── */}
            {activeModal === 'faqs' && (
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '10px', color: '#0F172A' }}>Frequently Asked Questions</h3>
                <div style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, maxHeight: '280px', overflowY: 'auto' }}>
                  <p><strong>Q: How can I track my order?</strong><br />A: Go to the Orders tab anytime to view live tracking updates.</p>
                  <p style={{ marginTop: '10px' }}><strong>Q: How do I apply coupons?</strong><br />A: Enter the code on the checkout or order summary page.</p>
                </div>
                <button onClick={() => setActiveModal(null)} style={{ marginTop: '16px', width: '100%', padding: '11px', borderRadius: '12px', background: '#0F172A', color: '#fff', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            )}

            {/* ── 8. REVIEWS & RATINGS MODAL (Working Implementation) ── */}
            {activeModal === 'reviews' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', paddingRight: '36px' }}>
                  <div>
                    <h3 style={{ fontSize: '19px', fontWeight: 900, margin: '0 0 2px', color: '#0F172A', letterSpacing: '-0.3px' }}>
                      Your Reviews &amp; Ratings
                    </h3>
                    <p style={{ fontSize: '12.5px', color: '#64748B', margin: 0 }}>
                      Manage your verified product reviews &amp; ratings
                    </p>
                  </div>
                </div>

                {/* Write Review Action Banner */}
                <button
                  onClick={() => setWriteReviewModal(true)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '14px',
                    background: '#EFF6FF',
                    border: '1.5px dashed #3B82F6',
                    color: '#2563EB',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    marginBottom: '16px'
                  }}
                >
                  <Plus size={16} /> Write a New Review
                </button>

                {/* Reviews List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {userReviews.map((rev) => (
                    <div
                      key={rev.id}
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid #E2E8F0',
                        borderRadius: '16px',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(15,23,42,0.03)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>
                          {rev.productName}
                        </span>
                        <span style={{ fontSize: '10px', fontWeight: 900, background: '#DCFCE7', color: '#166534', padding: '2px 7px', borderRadius: '4px' }}>
                          ✓ VERIFIED
                        </span>
                      </div>

                      {/* Stars */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} style={{ color: i < rev.rating ? '#F59E0B' : '#E2E8F0', fontSize: '15px' }}>★</span>
                        ))}
                        <span style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A', marginLeft: '4px' }}>
                          {rev.rating}.0
                        </span>
                      </div>

                      <p style={{ fontSize: '13.5px', fontWeight: 800, color: '#1E293B', margin: '2px 0 0' }}>
                        "{rev.title}"
                      </p>
                      <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: 1.45, margin: 0 }}>
                        {rev.comment}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', marginTop: '4px', borderTop: '1px solid #F1F5F9' }}>
                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>{rev.date}</span>
                        <button
                          onClick={() => {
                            const updated = userReviews.filter(r => r.id !== rev.id);
                            setUserReviews(updated);
                            localStorage.setItem(`asma_user_reviews_${user.id}`, JSON.stringify(updated));
                            if (showToast) showToast('Review deleted', null, 'wishlist');
                          }}
                          style={{ background: 'none', border: 'none', color: '#EF4444', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── WRITE REVIEW SUB-MODAL ── */}
            {writeReviewModal && (
              <div style={{
                position: 'fixed', inset: 0, zIndex: 1100,
                background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
              }}>
                <div style={{
                  background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '420px',
                  padding: '24px', boxShadow: '0 20px 48px rgba(0,0,0,0.25)', position: 'relative'
                }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 900, margin: '0 0 14px', color: '#0F172A' }}>
                    Write a Review
                  </h3>

                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const newRev = {
                      id: `rev_${Date.now()}`,
                      productName: reviewForm.productName,
                      rating: Number(reviewForm.rating),
                      title: reviewForm.title,
                      comment: reviewForm.comment,
                      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                    };
                    const updated = [newRev, ...userReviews];
                    setUserReviews(updated);
                    localStorage.setItem(`asma_user_reviews_${user.id}`, JSON.stringify(updated));
                    setWriteReviewModal(false);
                    if (showToast) showToast('Review published successfully!', null, 'wishlist');
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Product Name</label>
                        <input
                          value={reviewForm.productName}
                          onChange={(e) => setReviewForm({ ...reviewForm, productName: e.target.value })}
                          required
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Rating (Stars)</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                              style={{
                                flex: 1, padding: '8px 0', borderRadius: '8px',
                                background: reviewForm.rating >= star ? '#FEF3C7' : '#F1F5F9',
                                border: reviewForm.rating >= star ? '1.5px solid #F59E0B' : '1px solid #E2E8F0',
                                color: reviewForm.rating >= star ? '#B45309' : '#64748B',
                                fontSize: '14px', fontWeight: 900, cursor: 'pointer'
                              }}
                            >
                              ★ {star}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Review Headline</label>
                        <input
                          value={reviewForm.title}
                          onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                          placeholder="e.g. Excellent build quality!"
                          required
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#64748B', marginBottom: '4px' }}>Your Feedback</label>
                        <textarea
                          rows={3}
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          placeholder="Tell us what you liked about this item..."
                          required
                          style={{ width: '100%', padding: '10px 12px', borderRadius: '10px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box', resize: 'none' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button" onClick={() => setWriteReviewModal(false)}
                        style={{ flex: 1, padding: '11px', borderRadius: '10px', background: '#F1F5F9', color: '#475569', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{ flex: 2, padding: '11px', borderRadius: '10px', background: '#0F172A', color: '#FFFFFF', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                      >
                        Submit Review
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
