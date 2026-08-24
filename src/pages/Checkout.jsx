import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, Mail, User, Home, Building2,
  ArrowLeft, AlertCircle, Copy, Check,
  Heart, ShoppingCart, ArrowRight,
  ChevronRight, ChevronDown, ChevronUp,
  ShieldCheck, Tag, CreditCard, Landmark,
  Banknote, Sparkles, Truck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../config/supabase';
import { getProductImage } from '../utils/productImages';
import SEO from '../components/common/SEO';
import { GPayLogo, PhonePeLogo, CredLogo, PaytmLogo } from '../components/common/UpiIcons';

/* ─── Shop config ───────────────────────────────────────────── */
const SHOP = {
  upiId:          '7995747250@ptyes',
  upiName:        'Shaik Asmath',
  whatsappNumber: '917013942909',
  shopName:       'Asmalabel',
};

/* ─── Validators ────────────────────────────────────────────── */
const V = {
  fullName:   { min:3,  re:/^[a-zA-Z\s]{3,}$/,           msg:'Enter full name (letters only)' },
  phone:      { min:10, re:/^[6-9]\d{9}$/,               msg:'Valid 10-digit mobile number required' },
  email:      { min:5,  re:/^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg:'Enter a valid email' },
  houseNo:    { min:1,  re:/.+/,                         msg:'House / Flat number required' },
  streetArea: { min:5,  re:/.{5,}/,                      msg:'Enter street name and area (min 5 chars)' },
  landmark:   { min:3,  re:/.{3,}/,                      msg:'Enter a nearby landmark' },
  city:       { min:2,  re:/^[a-zA-Z\s]{2,}$/,          msg:'Enter a valid city' },
  state:      { min:2,  re:/^[a-zA-Z\s]{2,}$/,          msg:'Enter a valid state' },
  pincode:    { min:6,  re:/^[1-9][0-9]{5}$/,           msg:'Valid 6-digit pincode required' },
};

function validate(name, value) {
  const r = V[name];
  if (!r) return '';
  const v = (value || '').trim();
  if (v.length < r.min) return r.msg;
  if (!r.re.test(v)) return r.msg;
  return '';
}

/* ─── Field Error ───────────────────────────────────────────── */
function FieldError({ name, errors, touched }) {
  if (!touched[name] || !errors[name]) return null;
  return (
    <p style={{ color:'#EF4444', fontSize:'11.5px', marginTop:'4px',
      display:'flex', alignItems:'center', gap:'4px', fontWeight:600 }}>
      <AlertCircle size={12} />
      {errors[name]}
    </p>
  );
}

/* ─── StepDot ───────────────────────────────────────────────── */
function StepDot({ n, current }) {
  const done   = current > n;
  const active = current === n;
  return (
    <div style={{
      width:'28px', height:'28px', borderRadius:'50%',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:'11px', fontWeight:900,
      background: done ? '#16A34A' : active ? '#0F172A' : '#E2E8F0',
      color: (done || active) ? 'white' : '#94A3B8',
    }}>
      {done ? '✓' : n}
    </div>
  );
}

/* ─── Authentic Vector UPI Logos imported from UpiIcons.jsx ───────── */

/* ─── Accurate UPI App Launcher Helper ────────────────────────── */
function getUpiAppUrl(appName, shopUpiId, shopUpiName, amount) {
  const pa = shopUpiId;
  const pn = encodeURIComponent(shopUpiName);
  const am = Number(amount || 0).toFixed(2);
  const baseUpi = `pa=${pa}&pn=${pn}&am=${am}&cu=INR`;
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent);

  const cleanName = (appName || '').toLowerCase().trim();

  if (isAndroid) {
    let pkg = '';
    if (cleanName.includes('google') || cleanName.includes('gpay')) {
      pkg = 'com.google.android.apps.nfc.phone';
    } else if (cleanName.includes('phonepe')) {
      pkg = 'com.phonepe.app';
    } else if (cleanName.includes('paytm')) {
      pkg = 'net.one97.paytm';
    } else if (cleanName.includes('cred')) {
      pkg = 'com.cred.club';
    }
    if (pkg) {
      return `intent://pay?${baseUpi}#Intent;scheme=upi;package=${pkg};end`;
    }
  }

  if (isIOS) {
    if (cleanName.includes('google') || cleanName.includes('gpay')) {
      return `gpay://upi/pay?${baseUpi}`;
    }
    if (cleanName.includes('phonepe')) {
      return `phonepe://pay?${baseUpi}`;
    }
    if (cleanName.includes('paytm')) {
      return `paytmmp://pay?${baseUpi}`;
    }
    if (cleanName.includes('cred')) {
      return `cred://pay?${baseUpi}`;
    }
  }

  return `upi://pay?${baseUpi}`;
}

const DEFAULT_COUPONS = [
  { code: 'ASMA10', desc: '10% OFF Storewide', type: 'percent', val: 10, scope: 'ALL_PRODUCTS', active: true },
  { code: 'WELCOME50', desc: '₹50 OFF on Orders Above ₹299', type: 'flat', val: 50, scope: 'ALL_PRODUCTS', minCartTotal: 299, active: true },
  { code: 'TAILOR100', desc: '₹100 OFF Tailoring Supplies', type: 'flat', val: 100, scope: 'SPECIFIC_CATEGORY', applicableCategory: 'tailoring', minCartTotal: 499, active: true },
  { code: 'FASHION20', desc: '20% OFF Women\'s Fashion Items', type: 'percent', val: 20, scope: 'SPECIFIC_CATEGORY', applicableCategory: 'fashion', minItemPrice: 999, active: true }
];

const getStoredCoupons = () => {
  try {
    const stored = localStorage.getItem('asmalabel_coupons_list');
    if (stored) return JSON.parse(stored);
  } catch (e) { console.error(e); }
  return DEFAULT_COUPONS;
};

/* ─── Main Component ────────────────────────────────────────── */
export default function Checkout() {
  const navigate = useNavigate();
  const { cart, getCartTotal, user, clearCart, loading: authLoading, addToCart, addToWishlist, removeFromWishlist, isInWishlist } = useApp();

  const [step,          setStep]          = useState(1);
  const [saving,        setSaving]        = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [order,         setOrder]         = useState(null);
  const [utr,           setUtr]           = useState('');
  const [screenshot,    setScreenshot]    = useState(null);
  const [uploading,     setUploading]     = useState(false);
  const [copied,        setCopied]        = useState('');
  const [errors,        setErrors]        = useState({});
  const [touched,       setTouched]       = useState({});
  const [recommended,   setRecommended]   = useState([]);
  const [promoInput,    setPromoInput]    = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError,   setCouponError]   = useState('');

  const [saveAddress,   setSaveAddress]   = useState(true);
  const [addressTag,    setAddressTag]    = useState('Home');
  const [instantUpiOpen, setInstantUpiOpen] = useState(false);
  const [customUpiId,   setCustomUpiId]   = useState('');

  const rawSubtotal = getCartTotal ? getCartTotal() : cart.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);

  const handleUpiAppClick = (appName, e) => {
    if (e) e.preventDefault();
    const url = getUpiAppUrl(appName, SHOP.upiId, SHOP.upiName, total);
    copy(SHOP.upiId, 'upi');
    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = url;
    } else {
      alert(`Opening ${appName}...\n\nMerchant UPI ID (${SHOP.upiId}) copied to clipboard!\nScan the QR Code or paste the UPI ID in ${appName} on your phone to complete payment.`);
    }
  };

  const handlePayWithCustomUpi = () => {
    const rawVpa = customUpiId.trim();
    if (!rawVpa) return;

    let targetApp = '';
    const lower = rawVpa.toLowerCase();
    if (lower.includes('@ok') || lower.includes('@gpay')) {
      targetApp = 'Google Pay';
    } else if (lower.includes('@ybl') || lower.includes('@ibl') || lower.includes('@axl') || lower.includes('@phonepe')) {
      targetApp = 'PhonePe';
    } else if (lower.includes('@paytm')) {
      targetApp = 'PayTM';
    } else if (lower.includes('@cred')) {
      targetApp = 'CRED UPI';
    }

    const url = targetApp
      ? getUpiAppUrl(targetApp, SHOP.upiId, SHOP.upiName, total)
      : `upi://pay?pa=${SHOP.upiId}&pn=${encodeURIComponent(SHOP.upiName)}&am=${total.toFixed(2)}&cu=INR`;

    copy(SHOP.upiId, 'upi');

    const isMobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = url;
    } else {
      alert(`Merchant UPI ID (${SHOP.upiId}) copied to clipboard!\nAmount: ₹${total.toFixed(2)}\n\nPlease open your UPI App (${rawVpa || 'Google Pay / PhonePe / Paytm'}) to complete payment.`);
    }
  };

  const handleApplyCoupon = (e) => {
    if (e) e.preventDefault();
    setCouponError('');
    const code = (promoInput || '').trim().toUpperCase();
    if (!code) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    const couponsList = getStoredCoupons();
    const targetCpn = couponsList.find(c => (c.code || '').toUpperCase() === code);

    if (!targetCpn || targetCpn.active === false) {
      setCouponError(`Invalid or inactive coupon code "${code}".`);
      return;
    }

    if (targetCpn.minCartTotal > 0 && rawSubtotal < targetCpn.minCartTotal) {
      setCouponError(`Order subtotal must be at least ₹${targetCpn.minCartTotal} to use code ${targetCpn.code}.`);
      return;
    }

    // Filter cart for eligible items based on Scope
    const eligibleItems = cart.filter(item => {
      if (targetCpn.scope === 'SPECIFIC_CATEGORY') {
        return (item.category || '').toLowerCase() === (targetCpn.applicableCategory || '').toLowerCase();
      }
      if (targetCpn.scope === 'SELECTED_PRODUCTS') {
        return Array.isArray(targetCpn.applicableProductIds) && targetCpn.applicableProductIds.includes(item.id);
      }
      if (targetCpn.scope === 'MIN_PRICE_TAG') {
        return Number(item.price || 0) >= Number(targetCpn.minItemPrice || 0);
      }
      return true; // ALL_PRODUCTS
    });

    const eligibleSubtotal = eligibleItems.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.quantity || 1)), 0);

    if (eligibleSubtotal === 0) {
      if (targetCpn.scope === 'SPECIFIC_CATEGORY') {
        const catName = targetCpn.applicableCategory === 'tailoring' ? 'Tailoring Supplies' : 'Fashion';
        setCouponError(`Coupon ${targetCpn.code} is only valid for ${catName} items.`);
      } else if (targetCpn.scope === 'SELECTED_PRODUCTS') {
        setCouponError(`Coupon ${targetCpn.code} only applies to specific selected products.`);
      } else if (targetCpn.scope === 'MIN_PRICE_TAG') {
        setCouponError(`Coupon ${targetCpn.code} only applies to individual items priced at or above ₹${targetCpn.minItemPrice}.`);
      } else {
        setCouponError(`No items in your cart qualify for coupon ${targetCpn.code}.`);
      }
      return;
    }

    let discountAmount = 0;
    if (targetCpn.type === 'percent') {
      discountAmount = (eligibleSubtotal * Number(targetCpn.val)) / 100;
      if (targetCpn.maxDiscount > 0) {
        discountAmount = Math.min(discountAmount, Number(targetCpn.maxDiscount));
      }
    } else {
      discountAmount = Math.min(Number(targetCpn.val), eligibleSubtotal);
    }

    setAppliedCoupon({
      code: targetCpn.code,
      desc: targetCpn.desc,
      type: targetCpn.type,
      val: targetCpn.val,
      scope: targetCpn.scope,
      discountAmount,
      eligibleSubtotal
    });
    setPromoInput('');
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  let couponDiscount = 0;
  if (appliedCoupon) {
    couponDiscount = Number(appliedCoupon.discountAmount || 0);
  }
  const total = Math.max(0, rawSubtotal - couponDiscount);

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

  const [form, setForm] = useState({
    fullName:   '',
    email:      '',
    phone:      '',
    houseNo:    '',
    streetArea: '',
    landmark:   '',
    city:       '',
    state:      '',
    pincode:    '',
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login?redirect=/checkout'); return; }
    if (cart.length === 0) navigate('/cart');

    if (user) {
      const saved = localStorage.getItem(`asma_saved_addresses_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedAddresses(parsed);
            const def = parsed.find(a => a.isDefault) || parsed[0];
            if (def) {
              applySavedAddress(def);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [user, authLoading, cart]);

  function applySavedAddress(addr) {
    setSelectedAddrId(addr.id);
    setForm({
      fullName:   addr.fullName || '',
      email:      addr.email || user?.email || '',
      phone:      addr.phone || '',
      houseNo:    addr.houseNo || '',
      streetArea: addr.streetArea || '',
      landmark:   addr.landmark || '',
      city:       addr.city || '',
      state:      addr.state || '',
      pincode:    addr.pincode || '',
    });
    setErrors({});
    setTouched({});
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setSelectedAddrId(null);
    if (touched[name]) setErrors(p => ({ ...p, [name]: validate(name, value) }));
  }

  function handleBlur(e) {
    const { name, value } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    setErrors(p => ({ ...p, [name]: validate(name, value) }));
  }

  function validateAll() {
    const errs = {};
    const t    = {};
    Object.keys(V).forEach(k => {
      t[k] = true;
      const e = validate(k, form[k]);
      if (e) errs[k] = e;
    });
    setErrors(errs);
    setTouched(t);
    return Object.keys(errs).length === 0;
  }

  function fieldStyle(name) {
    const ok  = touched[name] && !errors[name];
    const bad = touched[name] &&  errors[name];
    return {
      width:'100%', padding:'12px 16px', borderRadius:'12px',
      fontSize:'14px', fontFamily:'inherit', fontWeight:500,
      color:'var(--text)', outline:'none', transition:'all .2s',
      border:      bad ? '1.5px solid #EF4444' : ok ? '1.5px solid #16A34A' : '1.5px solid #E2E8F0',
      background:  bad ? '#FEF2F2'             : ok ? '#F0FDF4'             : 'white',
    };
  }

  function copy(text, label) {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  }

  async function handleAddressSubmit(e) {
    e.preventDefault();
    if (!validateAll()) return;
    setSaving(true);
    try {
      const fullAddress =
        `${form.houseNo}, ${form.streetArea}, Near ${form.landmark}, ` +
        `${form.city}, ${form.state} - ${form.pincode}`;

      // Persist to user's saved addresses in localStorage if checked
      if (saveAddress && user) {
        const newAddr = {
          id: 'addr_' + Date.now(),
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          houseNo: form.houseNo,
          streetArea: form.streetArea,
          landmark: form.landmark,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          tag: (addressTag || 'Home').toUpperCase(),
          isDefault: savedAddresses.length === 0,
        };
        const exists = savedAddresses.some(a => a.houseNo === form.houseNo && a.pincode === form.pincode);
        if (!exists) {
          const updated = [...savedAddresses, newAddr];
          setSavedAddresses(updated);
          localStorage.setItem(`asma_saved_addresses_${user.id}`, JSON.stringify(updated));
        }
      }

      const { data, error } = await supabase.from('orders').insert([{
        user_id:        user.id,
        total_amount:   total,
        payment_status: 'pending',
        status:         'pending_payment',
        shipping_address: {
          fullName:   form.fullName, phone:      form.phone,
          email:      form.email,   houseNo:    form.houseNo,
          streetArea: form.streetArea, landmark: form.landmark,
          city:       form.city,    state:      form.state,
          pincode:    form.pincode, fullAddress,
          coupon:     appliedCoupon ? appliedCoupon.code : null,
          discount_amount: couponDiscount,
          address_tag: addressTag || 'Home',
        },
        items: cart.map(i => ({
          product_id:  i.product_id || i.id,
          variant_id:  i.variant_id || null,
          size:        i.size || null,
          color:       i.color || null,
          color_value: i.color_value || null,
          sku:         i.sku || null,
          name:        i.name,
          quantity:    i.quantity,
          price:       i.price,
          image_url:   i.image_url || getProductImage(i),
        }))
      }]).select().single();

      if (error) throw error;
      setOrder(data);
      setStep(2);
      window.scrollTo(0, 0);
    } catch (err) {
      alert('Error creating order: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleScreenshotUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext  = file.name.split('.').pop();
      const path = `screenshots/${order.id}.${ext}`;
      const { error } = await supabase.storage
        .from('payment-screenshots').upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from('payment-screenshots').getPublicUrl(path);
      setScreenshot(data.publicUrl);
    } catch (err) {
      alert('Screenshot upload failed — you can still proceed.');
    } finally {
      setUploading(false);
    }
  }

  async function handlePaymentSubmitted() {
    if (submitting) return;
    setSubmitting(true);
    try {
      await supabase.from('orders').update({
        payment_status: 'submitted',
        status:         'payment_submitted',
        utr:            utr.trim() || null,
        screenshot_url: screenshot || null,
        submitted_at:   new Date().toISOString(),
      }).eq('id', order.id);

      const addr  = order.shipping_address;
      const items = order.items
        .map(i => `  * ${i.name} x${i.quantity}  -  Rs.${(i.price * i.quantity).toFixed(0)}`)
        .join('%0A');

      const msg =
        `*PAYMENT SUBMITTED - ${SHOP.shopName}*%0A` +
        `=========================================%0A` +
        `Order ID : %23${order.id.slice(0,8).toUpperCase()}%0A` +
        `Amount   : Rs.${order.total_amount.toFixed(0)}%0A` +
        `UPI ID   : ${SHOP.upiId}%0A` +
        (utr ? `UTR No   : ${utr}%0A` : '') +
        `=========================================%0A` +
        `*CUSTOMER*%0A` +
        `Name  : ${addr.fullName}%0A` +
        `Phone : +91 ${addr.phone}%0A` +
        `Email : ${addr.email}%0A` +
        `=========================================%0A` +
        `*ITEMS ORDERED*%0A` +
        `${items}%0A` +
        `=========================================%0A` +
        `*DELIVERY ADDRESS*%0A` +
        `Flat/House : ${addr.houseNo}%0A` +
        `Street/Area: ${addr.streetArea}%0A` +
        `Landmark   : Near ${addr.landmark}%0A` +
        `City       : ${addr.city}%0A` +
        `State      : ${addr.state}%0A` +
        `Pincode    : ${addr.pincode}%0A` +
        `=========================================%0A` +
        `*Please verify payment and confirm order.*%0A` +
        `Payment done via UPI - Please ship!`;

      clearCart();
      window.open(`https://wa.me/${SHOP.whatsappNumber}?text=${msg}`, '_blank');
      navigate(`/order-status/${order.id}`);
    } catch (err) {
      alert('Error submitting payment: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const savings = cart.reduce((a, i) =>
    i.original_price > i.price ? a + (i.original_price - i.price) * i.quantity : a, 0);

  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=` +
    encodeURIComponent(
      `upi://pay?pa=${SHOP.upiId}&pn=${SHOP.upiName}&am=${total.toFixed(2)}&cu=INR`
    );

  if (authLoading) return null;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)' }}>
      <SEO title="Checkout | Asmalabel" robots="noindex, nofollow" canonical="https://asmalabel.in/checkout" />

      {/* ── Header bar ── */}
      <div style={{ background:'white', borderBottom:'1px solid var(--border)',
        position:'sticky', top:0, zIndex:50 }}>
        <div className="container-center" style={{ display:'flex',
          alignItems:'center', gap:'12px', padding:'14px 16px' }}>
          <button
            onClick={() => step === 2 ? setStep(1) : navigate('/cart')}
            style={{ padding:'8px', borderRadius:'12px', background:'var(--secondary)',
              border:'none', cursor:'pointer', display:'flex' }}>
            <ArrowLeft size={20} color="var(--text-2)" />
          </button>
          <h1 style={{ fontSize:'18px', fontWeight:900, color:'var(--text)' }}>
            {step === 1 ? 'Delivery Address' : 'Pay & Confirm'}
          </h1>
          <div style={{ display:'flex', alignItems:'center', gap:'6px', marginLeft:'auto' }}>
            <StepDot n={1} current={step} />
            <div style={{ width:'20px', height:'2px',
              background: step > 1 ? '#16A34A' : '#E2E8F0', borderRadius:'99px' }} />
            <StepDot n={2} current={step} />
          </div>
        </div>
      </div>

      <div className="container-center" style={{ padding:'16px', maxWidth:'680px' }}>

        {/* ══ STEP 1 — ADDRESS ══ */}
        {step === 1 && (
          <form onSubmit={handleAddressSubmit} noValidate>
            <div style={{ background:'white', borderRadius:'20px', padding:'20px',
              boxShadow:'var(--shadow-sm)', border:'1px solid var(--border)' }}>

              <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
                <div style={{ width:'40px', height:'40px', borderRadius:'12px',
                  background:'#EEF2FF', display:'flex', alignItems:'center',
                  justifyContent:'center', flexShrink:0 }}>
                  <MapPin size={20} color="#6366F1" />
                </div>
                <div>
                  <h2 style={{ fontSize:'16px', fontWeight:900, color:'var(--text)' }}>Delivery Address</h2>
                  <p style={{ fontSize:'12px', color:'var(--text-3)' }}>All fields required for delivery</p>
                </div>
              </div>

              {/* ── Saved Addresses Selector ── */}
              {savedAddresses.length > 0 && (
                <div style={{ marginBottom:'18px', background:'#F8FAFC', borderRadius:'14px', border:'1px solid #E2E8F0', padding:'12px' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                    <span style={{ fontSize:'11.5px', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.6px', color:'#475569' }}>
                      📍 Use Saved Address ({savedAddresses.length})
                    </span>
                    {selectedAddrId && (
                      <span style={{ fontSize:'11.5px', color:'#16A34A', fontWeight:800 }}>
                        ✓ Auto-Filled
                      </span>
                    )}
                  </div>
                  <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'4px' }}>
                    {savedAddresses.map((addr) => {
                      const isSel = selectedAddrId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => applySavedAddress(addr)}
                          style={{
                            flexShrink:0,
                            padding:'9px 12px',
                            borderRadius:'12px',
                            background: isSel ? '#0F172A' : '#FFFFFF',
                            color: isSel ? '#FFFFFF' : '#0F172A',
                            border: isSel ? '1.5px solid #0F172A' : '1px solid #CBD5E1',
                            cursor:'pointer',
                            textAlign:'left',
                            display:'flex',
                            flexDirection:'column',
                            gap:'2px',
                            transition:'all .15s ease'
                          }}
                        >
                          <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                            <span style={{ fontSize:'12.5px', fontWeight:800 }}>{addr.fullName || 'Address'}</span>
                            <span style={{
                              fontSize:'9.5px', fontWeight:900, padding:'1px 5px', borderRadius:'4px',
                              background: isSel ? 'rgba(255,255,255,0.2)' : '#F1F5F9',
                              color: isSel ? '#FFFFFF' : '#475569'
                            }}>
                              {addr.tag || 'HOME'}
                            </span>
                          </div>
                          <span style={{ fontSize:'11px', opacity:0.8, whiteSpace:'nowrap' }}>
                            {addr.city}, {addr.pincode}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {Object.keys(errors).length > 0 && Object.keys(touched).length > 0 && (
                <div style={{ background:'#FEF2F2', border:'1px solid #FECACA',
                  borderRadius:'12px', padding:'10px 14px', marginBottom:'14px',
                  display:'flex', alignItems:'center', gap:'8px',
                  fontSize:'13px', fontWeight:700, color:'#DC2626' }}>
                  <AlertCircle size={15} />
                  Fix {Object.keys(errors).length} error(s) to continue
                </div>
              )}

              <div className="checkout-form-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>

                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:700,
                    color:'var(--text-2)', marginBottom:'6px' }}>Full Name *</label>
                  <div style={{ position:'relative' }}>
                    <User size={14} color="#94A3B8" style={{ position:'absolute',
                      left:'12px', top:'50%', transform:'translateY(-50%)' }} />
                    <input name="fullName" value={form.fullName}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder="e.g. Ramesh Kumar"
                      style={{ ...fieldStyle('fullName'), paddingLeft:'36px' }} />
                  </div>
                  <FieldError name="fullName" errors={errors} touched={touched} />
                </div>

                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:700,
                    color:'var(--text-2)', marginBottom:'6px' }}>Mobile *</label>
                  <div style={{ position:'relative' }}>
                    <span style={{ position:'absolute', left:'12px', top:'50%',
                      transform:'translateY(-50%)', fontSize:'13px',
                      fontWeight:800, color:'#64748B' }}>+91</span>
                    <input name="phone" value={form.phone}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder="e.g. 9876543210" maxLength={10}
                      style={{ ...fieldStyle('phone'), paddingLeft:'44px' }} />
                  </div>
                  <FieldError name="phone" errors={errors} touched={touched} />
                </div>

                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:700,
                    color:'var(--text-2)', marginBottom:'6px' }}>Email *</label>
                  <div style={{ position:'relative' }}>
                    <Mail size={14} color="#94A3B8" style={{ position:'absolute',
                      left:'12px', top:'50%', transform:'translateY(-50%)' }} />
                    <input name="email" type="email" value={form.email}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder="e.g. ramesh@gmail.com"
                      style={{ ...fieldStyle('email'), paddingLeft:'36px' }} />
                  </div>
                  <FieldError name="email" errors={errors} touched={touched} />
                </div>

                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:700,
                    color:'var(--text-2)', marginBottom:'6px' }}>House / Flat No. *</label>
                  <input name="houseNo" value={form.houseNo}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="e.g. Flat 3A / H.No 10-2-304" style={fieldStyle('houseNo')} />
                  <FieldError name="houseNo" errors={errors} touched={touched} />
                </div>

                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:700,
                    color:'var(--text-2)', marginBottom:'6px' }}>Street / Area *</label>
                  <input name="streetArea" value={form.streetArea}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="e.g. Gandhi Nagar, Banjara Hills" style={fieldStyle('streetArea')} />
                  <FieldError name="streetArea" errors={errors} touched={touched} />
                </div>

                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:700,
                    color:'var(--text-2)', marginBottom:'6px' }}>
                    Landmark * <span style={{ fontWeight:500, color:'var(--text-3)' }}>(helps delivery)</span>
                  </label>
                  <div style={{ position:'relative' }}>
                    <MapPin size={14} color="#94A3B8" style={{ position:'absolute',
                      left:'12px', top:'50%', transform:'translateY(-50%)' }} />
                    <input name="landmark" value={form.landmark}
                      onChange={handleChange} onBlur={handleBlur}
                      placeholder="e.g. Near Railway Station"
                      style={{ ...fieldStyle('landmark'), paddingLeft:'36px' }} />
                  </div>
                  <FieldError name="landmark" errors={errors} touched={touched} />
                </div>

                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:700,
                    color:'var(--text-2)', marginBottom:'6px' }}>City *</label>
                  <input name="city" value={form.city}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="e.g. Hyderabad" style={fieldStyle('city')} />
                  <FieldError name="city" errors={errors} touched={touched} />
                </div>

                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:700,
                    color:'var(--text-2)', marginBottom:'6px' }}>State *</label>
                  <input name="state" value={form.state}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="e.g. Telangana" style={fieldStyle('state')} />
                  <FieldError name="state" errors={errors} touched={touched} />
                </div>

                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:700,
                    color:'var(--text-2)', marginBottom:'6px' }}>Pincode *</label>
                  <input name="pincode" value={form.pincode}
                    onChange={handleChange} onBlur={handleBlur}
                    placeholder="e.g. 500034" maxLength={6} style={fieldStyle('pincode')} />
                  <FieldError name="pincode" errors={errors} touched={touched} />
                </div>
              </div>

              {/* ── SAVE MY ADDRESS AS (Matching Image 2) ── */}
              <div style={{ marginTop:'16px', padding:'14px 16px', background:'#F8FAFC', borderRadius:'14px', border:'1px solid #E2E8F0' }}>
                <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'13.5px', fontWeight:800, color:'#0F172A', userSelect:'none' }}>
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    style={{ width:'18px', height:'18px', accentColor:'#0F172A', cursor:'pointer' }}
                  />
                  <span>Save my address as</span>
                  <span style={{ fontSize:'12px', color:'#94A3B8', fontWeight:600 }} title="Saves this address for future 1-click checkouts">ⓘ</span>
                </label>

                {saveAddress && (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'8px', marginTop:'10px', width:'100%', boxSizing:'border-box' }}>
                    {[
                      { id:'Home', label:'Home', Icon:Home },
                      { id:'Office', label:'Office', Icon:Building2 },
                      { id:'Others', label:'Others', Icon:MapPin }
                    ].map(t => {
                      const active = addressTag === t.id;
                      const Icon = t.Icon;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setAddressTag(t.id)}
                          style={{
                            padding:'8px 6px',
                            borderRadius:'20px',
                            border: active ? '1.5px solid #0F172A' : '1px solid #CBD5E1',
                            background: active ? '#0F172A' : '#FFFFFF',
                            color: active ? '#FFFFFF' : '#475569',
                            fontSize:'12px',
                            fontWeight:800,
                            cursor:'pointer',
                            display:'inline-flex',
                            alignItems:'center',
                            justifyContent:'center',
                            gap:'5px',
                            whiteSpace:'nowrap',
                            width:'100%',
                            boxSizing:'border-box',
                            transition:'all .15s ease'
                          }}
                        >
                          <Icon size={14} color={active ? '#FFFFFF' : '#64748B'} strokeWidth={2.2} />
                          <span>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── ADD PROMO CODE / COUPON ── */}
              <div style={{ marginTop:'22px', paddingTop:'18px', borderTop:'1px solid #E2E8F0' }}>
                <label style={{ display:'block', fontSize:'12px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.8px', color:'#0F172A', marginBottom:'8px' }}>
                  Add Promo Code / Coupon
                </label>
                <div style={{ display:'flex', gap:'8px' }}>
                  <input
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="ENTER PROMO CODE"
                    style={{
                      flex:1, padding:'12px 14px', borderRadius:'12px',
                      border:'1.5px solid #CBD5E1', fontSize:'13px', fontWeight:700,
                      textTransform:'uppercase', background:'#FFFFFF', outline:'none'
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    style={{
                      padding:'12px 22px', borderRadius:'12px',
                      background:'#0F172A', color:'#FFFFFF',
                      fontWeight:900, fontSize:'13px', border:'none', cursor:'pointer',
                      letterSpacing:'0.5px'
                    }}
                  >
                    APPLY
                  </button>
                </div>

                {appliedCoupon && (
                  <div style={{ marginTop:'10px', display:'flex', alignItems:'center', justifyContent:'space-between', background:'#DCFCE7', border:'1px solid #86EFAC', borderRadius:'10px', padding:'8px 12px' }}>
                    <span style={{ fontSize:'12.5px', fontWeight:800, color:'#166534' }}>
                      ✓ Coupon {appliedCoupon.code} applied ({appliedCoupon.desc})
                    </span>
                    <button type="button" onClick={handleRemoveCoupon} style={{ background:'none', border:'none', color:'#166534', fontWeight:800, cursor:'pointer', fontSize:'14px' }}>
                      ✕
                    </button>
                  </div>
                )}

                {couponError && (
                  <p style={{ color:'#EF4444', fontSize:'12px', fontWeight:700, marginTop:'6px' }}>
                    {couponError}
                  </p>
                )}

                {/* Pricing Breakdown Summary */}
                <div style={{ marginTop:'16px', background:'#F8FAFC', borderRadius:'14px', border:'1px solid #E2E8F0', padding:'14px', display:'flex', flexDirection:'column', gap:'8px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#64748B', fontWeight:600 }}>
                    <span>Subtotal ({cart.length} item{cart.length !== 1 ? 's' : ''})</span>
                    <span style={{ color:'#0F172A', fontWeight:800 }}>₹{rawSubtotal.toFixed(2)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#16A34A', fontWeight:700 }}>
                      <span>Coupon Discount</span>
                      <span>-₹{couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#64748B', fontWeight:600 }}>
                    <span>Shipping</span>
                    <span style={{ color:'#16A34A', fontWeight:800 }}>FREE</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', paddingTop:'8px', borderTop:'1px dashed #CBD5E1' }}>
                    <span style={{ fontSize:'15px', fontWeight:900, color:'#0F172A' }}>Total Payable</span>
                    <span style={{ fontSize:'20px', fontWeight:900, color:'#0F172A' }}>₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  width:'100%', marginTop:'20px', padding:'16px',
                  borderRadius:'16px', fontWeight:900, fontSize:'16px',
                  color:'#FFFFFF', border:'none', cursor:'pointer',
                  background:'#0F172A',
                  boxShadow:'0 4px 14px rgba(15,23,42,0.15)',
                  opacity: saving ? 0.6 : 1,
                  transition:'all .2s'
                }}
              >
                {saving ? 'Saving...' : `Proceed to Payment (₹${total.toFixed(0)}) →`}
              </button>
            </div>
          </form>
        )}

        {/* ── YOU MAY ALSO LIKE SCROLLER (In Checkout Tab) ── */}
        {step === 1 && recommended.length > 0 && (
          <div className="pd-scroller-section" style={{ marginTop: '36px' }}>
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

        {/* ══ STEP 2 — PAYMENT & CONFIRM ══ */}
        {step === 2 && order && (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

            {/* ── Big Orange Amount Banner (Matching Image 2) ── */}
            <div style={{
              background:'linear-gradient(135deg,#FC8019,#FF9F1C)',
              borderRadius:'22px', padding:'24px 20px', color:'white', textAlign:'center',
              boxShadow:'0 12px 32px rgba(252,128,25,.35)'
            }}>
              <p style={{ fontSize:'12.5px', fontWeight:700, opacity:.9, margin:'0 0 3px' }}>
                Order #{order.id.slice(0,8).toUpperCase()}
              </p>
              <p style={{ fontSize:'13.5px', fontWeight:600, opacity:.85, margin:'0 0 6px' }}>
                Total Amount to Pay
              </p>
              <p style={{ fontSize:'54px', fontWeight:900, lineHeight:1.1, margin:0 }}>
                ₹{total.toFixed(0)}
              </p>
              {savings > 0 && (
                <p style={{
                  fontSize:'12px', marginTop:'8px',
                  background:'rgba(255,255,255,.2)', borderRadius:'99px',
                  padding:'4px 14px', display:'inline-block', fontWeight:700, margin:'8px 0 0'
                }}>
                  You saved ₹{savings.toFixed(0)}!
                </p>
              )}
            </div>

            {/* ── Recommended 1-Tap UPI Apps ── */}
            <div style={{ background:'#FFFFFF', borderRadius:'18px', border:'1px solid #E2E8F0', padding:'16px', boxShadow:'var(--shadow-sm)' }}>
              <span style={{ fontSize:'11.5px', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.6px', color:'#64748B', display:'block', marginBottom:'10px' }}>
                Quick Pay with UPI Apps
              </span>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'16px' }}>
                {[
                  { name:'Google Pay', Logo: GPayLogo },
                  { name:'PhonePe',    Logo: PhonePeLogo },
                  { name:'CRED UPI',   Logo: CredLogo },
                  { name:'PayTM',      Logo: PaytmLogo },
                ].map(({ name, Logo }, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => handleUpiAppClick(name, e)}
                    style={{
                      padding:'11px 12px', borderRadius:'12px', background:'#F8FAFC', border:'1px solid #E2E8F0',
                      display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                      color:'#0F172A', fontWeight:800, fontSize:'13px', cursor:'pointer', transition:'all .15s ease'
                    }}
                  >
                    <Logo size={18} />
                    <span>{name}</span>
                  </button>
                ))}
              </div>

              {/* QR Code & Scan Option */}
              <div style={{ textAlign:'center', paddingTop:'12px', borderTop:'1px solid #F1F5F9' }}>
                <p style={{ fontSize:'13.5px', fontWeight:800, color:'#0F172A', margin:'0 0 14px' }}>
                  Or Scan QR Code to Pay
                </p>

                {/* Orange Border Container (Matching Image 2) */}
                <div style={{
                  display:'inline-block',
                  padding:'12px',
                  border:'3.5px solid #FC8019',
                  borderRadius:'18px',
                  background:'#FFFFFF',
                  marginBottom:'16px',
                  boxShadow:'0 6px 24px rgba(252,128,25,0.18)'
                }}>
                  <img src={qrUrl} alt="UPI QR Code" style={{ width:'170px', height:'170px', display:'block', borderRadius:'8px' }} />
                </div>

                {[
                  { label:'UPI ID', value:SHOP.upiId, key:'upi' },
                  { label:'Exact Amount', value:`${total.toFixed(2)}`, key:'amt' },
                ].map(({ label, value, key }) => (
                  <div key={key} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:'12px', padding:'10px 14px', marginBottom:'8px' }}>
                    <div style={{ textAlign:'left' }}>
                      <p style={{ fontSize:'10px', color:'#64748B', fontWeight:800, textTransform:'uppercase', margin:0 }}>{label}</p>
                      <p style={{ fontSize:'14.5px', fontWeight:900, color:'#0F172A', margin:'2px 0 0' }}>
                        {key === 'amt' ? '₹' : ''}{value}
                      </p>
                    </div>
                    <button
                      onClick={() => copy(value, key)}
                      style={{
                        padding:'6px 12px', borderRadius:'8px', background: copied === key ? '#16A34A' : '#0F172A',
                        color:'#FFFFFF', fontWeight:800, fontSize:'12px', border:'none', cursor:'pointer'
                      }}
                    >
                      {copied === key ? '✓ Copied' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Payment Options (Instant UPI Toggle Menu & Cash on Delivery) ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <div style={{
                background:'#FFFFFF',
                borderRadius:'16px',
                border: instantUpiOpen ? '1.5px solid #0F172A' : '1px solid #E2E8F0',
                overflow:'hidden',
                boxShadow:'0 2px 10px rgba(15,23,42,0.04)',
                transition:'all .2s ease'
              }}>
                {/* Toggle Header */}
                <div
                  onClick={() => setInstantUpiOpen(!instantUpiOpen)}
                  style={{
                    padding:'14px 16px',
                    display:'flex', alignItems:'center', justifyContent:'space-between',
                    cursor:'pointer', background:'#FFFFFF'
                  }}
                >
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                      <GPayLogo size={16} />
                      <PhonePeLogo size={16} />
                      <PaytmLogo size={14} />
                    </div>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                        <span style={{ fontSize:'13.5px', fontWeight:900, color:'#0F172A' }}>Instant UPI</span>
                        <span style={{ fontSize:'10px', fontWeight:900, padding:'2px 6px', borderRadius:'4px', background:'#DCFCE7', color:'#166534' }}>
                          FASTEST
                        </span>
                      </div>
                      <span style={{ fontSize:'11.5px', color:'#64748B' }}>Google Pay, PhonePe, Paytm, CRED & Any UPI ID</span>
                    </div>
                  </div>
                  <div style={{ color:'#0F172A', display:'flex', alignItems:'center' }}>
                    {instantUpiOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Expanded Content: Pay with Any UPI ID */}
                {instantUpiOpen && (
                  <div style={{ padding:'0 16px 16px', borderTop:'1px solid #F1F5F9', background:'#FAFCFF' }}>
                    
                    {/* Pay with Any UPI ID Input Box */}
                    <div style={{ paddingTop:'14px' }}>
                      <label style={{ display:'block', fontSize:'12px', fontWeight:800, color:'#0F172A', marginBottom:'6px' }}>
                        Pay with Any UPI ID / VPA
                      </label>

                      <div style={{ display:'flex', gap:'8px', marginBottom:'8px' }}>
                        <input
                          value={customUpiId}
                          onChange={e => setCustomUpiId(e.target.value)}
                          placeholder="e.g. mobile@upi or name@okhdfcbank"
                          style={{
                            flex:1, padding:'11px 14px', borderRadius:'12px',
                            border:'1.5px solid #CBD5E1', fontSize:'13px', outline:'none',
                            background:'#FFFFFF', boxSizing:'border-box', color:'#0F172A', fontWeight:600
                          }}
                        />
                        <button
                          type="button"
                          onClick={handlePayWithCustomUpi}
                          disabled={!customUpiId.trim()}
                          style={{
                            padding:'11px 16px', borderRadius:'12px',
                            background: customUpiId.trim() ? '#0F172A' : '#E2E8F0',
                            color: customUpiId.trim() ? '#FFFFFF' : '#94A3B8',
                            fontWeight:900, fontSize:'13px', border:'none',
                            cursor: customUpiId.trim() ? 'pointer' : 'not-allowed',
                            whiteSpace:'nowrap', transition:'all .15s'
                          }}
                        >
                          Pay ₹{total.toFixed(0)}
                        </button>
                      </div>

                      {/* Quick Bank Handle Pills */}
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'14px' }}>
                        {['@okhdfcbank', '@okaxis', '@okicici', '@oksbi', '@ybl', '@paytm'].map(suffix => (
                          <button
                            key={suffix}
                            type="button"
                            onClick={() => {
                              const prefix = customUpiId.split('@')[0] || '';
                              setCustomUpiId(prefix ? `${prefix}${suffix}` : suffix);
                            }}
                            style={{
                              padding:'4px 8px', borderRadius:'6px', background:'#FFFFFF',
                              border:'1px solid #E2E8F0', fontSize:'11px', color:'#475569',
                              fontWeight:700, cursor:'pointer', transition:'all .15s'
                            }}
                          >
                            {suffix}
                          </button>
                        ))}
                      </div>

                      {/* Quick 1-Tap UPI Apps Grid */}
                      <div style={{ borderTop:'1px solid #EDF2F7', paddingTop:'12px' }}>
                        <span style={{ fontSize:'11px', fontWeight:800, textTransform:'uppercase', color:'#64748B', display:'block', marginBottom:'8px' }}>
                          Or Quick Pay With UPI Apps
                        </span>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                          {[
                            { name:'Google Pay', Logo: GPayLogo },
                            { name:'PhonePe',    Logo: PhonePeLogo },
                            { name:'CRED UPI',   Logo: CredLogo },
                            { name:'PayTM',      Logo: PaytmLogo },
                          ].map(({ name, Logo }, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => handleUpiAppClick(name, e)}
                              style={{
                                padding:'9px 10px', borderRadius:'10px', background:'#FFFFFF', border:'1px solid #E2E8F0',
                                display:'flex', alignItems:'center', justifyContent:'center', gap:'7px',
                                color:'#0F172A', fontWeight:800, fontSize:'12px', cursor:'pointer', transition:'all .15s ease'
                              }}
                            >
                              <Logo size={16} />
                              <span>{name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>
                )}
              </div>

              {/* Cash on Delivery Row */}
              <div style={{ background:'#F8FAFC', borderRadius:'16px', border:'1px solid #E2E8F0', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <Banknote size={18} color="#94A3B8" />
                  <div>
                    <span style={{ fontSize:'13.5px', fontWeight:800, color:'#64748B' }}>Cash on Delivery</span>
                  </div>
                </div>
                <span style={{ fontSize:'10.5px', fontWeight:900, padding:'3px 9px', borderRadius:'6px', background:'#E2E8F0', color:'#475569' }}>
                  Coming Soon
                </span>
              </div>
            </div>

            {/* ── Confirm Payment Details Card (UTR + Screenshot) ── */}
            <div style={{ background:'#FFFFFF', borderRadius:'18px', border:'1px solid #E2E8F0', padding:'18px', display:'flex', flexDirection:'column', gap:'12px', boxShadow:'var(--shadow-sm)' }}>
              <div>
                <h3 style={{ fontSize:'14.5px', fontWeight:900, color:'#0F172A', margin:0 }}>
                  Confirm Payment Details
                </h3>
                <p style={{ fontSize:'12px', color:'#64748B', margin:'2px 0 0' }}>
                  Adding UTR / screenshot speeds up admin verification to under 2 minutes
                </p>
              </div>

              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:700, color:'#334155', marginBottom:'4px' }}>
                  UTR / Transaction Ref No.
                </label>
                <input
                  value={utr} onChange={e => setUtr(e.target.value)}
                  placeholder="e.g. 423698745123"
                  style={{
                    width:'100%', padding:'11px 14px', borderRadius:'12px', border:'1.5px solid #CBD5E1',
                    fontSize:'13.5px', outline:'none', background:'#FFFFFF', boxSizing:'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:700, color:'#334155', marginBottom:'4px' }}>
                  Payment Screenshot
                </label>
                <label style={{
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                  padding:'13px', borderRadius:'12px', border:'2px dashed #CBD5E1',
                  cursor:'pointer', fontSize:'13px', fontWeight:800, color:'#334155', background:'#F8FAFC'
                }}>
                  {uploading ? '⏳ Uploading screenshot...'
                    : screenshot ? '✅ Screenshot uploaded!'
                    : '📸 Tap to upload screenshot'}
                  <input type="file" accept="image/*" onChange={handleScreenshotUpload} style={{ display:'none' }} disabled={uploading} />
                </label>
              </div>
            </div>

            {/* ── WhatsApp Submit Button ── */}
            <button
              onClick={handlePaymentSubmitted}
              disabled={submitting}
              style={{
                width:'100%', padding:'17px', borderRadius:'16px',
                background:'linear-gradient(135deg, #059669, #047857)',
                color:'#FFFFFF', fontWeight:900, fontSize:'16.5px',
                border:'none', cursor:'pointer',
                boxShadow:'0 8px 24px rgba(5,150,105,0.3)',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? '⏳ Submitting...' : "✅ I've Made Payment"}
            </button>
            <p style={{ textAlign:'center', fontSize:'12px', color:'#64748B', marginTop:'-6px', fontWeight:500 }}>
              This notifies Asmalabel on WhatsApp for immediate order confirmation
            </p>

            {/* ── Order Summary Mini Breakdown ── */}
            <div style={{ background:'#FFFFFF', borderRadius:'16px', padding:'16px', boxShadow:'var(--shadow-sm)', border:'1px solid #E2E8F0' }}>
              <h3 style={{ fontSize:'14px', fontWeight:900, color:'#0F172A', margin:'0 0 12px' }}>Order Summary</h3>
              {order.items.map((item, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', marginBottom:'6px' }}>
                  <span style={{ color:'#475569', fontWeight:600 }}>
                    {item.name}
                    {(item.size || item.color) && (
                      <span style={{ fontSize:'11.5px', color:'#0F172A', fontWeight:700, marginLeft:'4px' }}>
                        ({[item.size ? `Size: ${item.size}` : '', item.color ? `Color: ${item.color}` : ''].filter(Boolean).join(', ')})
                      </span>
                    )} ×{item.quantity}
                  </span>
                  <span style={{ fontWeight:800, color:'#0F172A' }}>
                    ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(0)}
                  </span>
                </div>
              ))}
              {couponDiscount > 0 && (
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13px', color:'#16A34A', fontWeight:700, marginBottom:'6px' }}>
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <span>-₹{couponDiscount.toFixed(0)}</span>
                </div>
              )}
              <div style={{ borderTop:'1px solid #E2E8F0', marginTop:'10px', paddingTop:'10px', display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
                <span style={{ fontWeight:900, fontSize:'14.5px', color:'#0F172A' }}>Total Amount</span>
                <span style={{ fontWeight:900, fontSize:'19px', color:'#0F172A' }}>
                  ₹{total.toFixed(0)}
                </span>
              </div>
            </div>

            {/* ── Shipping Address Details ── */}
            <div style={{ background:'#FFFFFF', borderRadius:'16px', padding:'16px', boxShadow:'var(--shadow-sm)', border:'1px solid #E2E8F0' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                <h3 style={{ fontSize:'14px', fontWeight:900, color:'#0F172A', margin:0, display:'flex', alignItems:'center', gap:'6px' }}>
                  <MapPin size={16} color="#0F172A" /> Shipping Address
                </h3>
                <span style={{ fontSize:'11px', fontWeight:800, padding:'3px 8px', borderRadius:'6px', background:'#EFF6FF', color:'#2563EB', border:'1px solid #DBEAFE' }}>
                  {(order.shipping_address?.address_tag || addressTag || 'HOME').toUpperCase()}
                </span>
              </div>

              <p style={{ fontSize:'13.5px', fontWeight:800, color:'#0F172A', margin:'0 0 3px' }}>
                {order.shipping_address?.fullName || form.fullName}
              </p>
              <p style={{ fontSize:'12.5px', color:'#475569', margin:'0 0 2px', lineHeight:1.4 }}>
                {order.shipping_address?.houseNo || form.houseNo}, {order.shipping_address?.streetArea || form.streetArea}
                {(order.shipping_address?.landmark || form.landmark) ? `, Near ${order.shipping_address?.landmark || form.landmark}` : ''}
              </p>
              <p style={{ fontSize:'12.5px', color:'#475569', margin:'0 0 6px' }}>
                {order.shipping_address?.city || form.city}, {order.shipping_address?.state || form.state} - {order.shipping_address?.pincode || form.pincode}
              </p>
              <p style={{ fontSize:'12px', color:'#64748B', margin:'0 0 10px', fontWeight:600 }}>
                Mobile: +91 {order.shipping_address?.phone || form.phone}
              </p>

              <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'9px 12px', borderRadius:'10px', background:'#F0FDF4', border:'1px solid #DCFCE7' }}>
                <Truck size={15} color="#16A34A" />
                <span style={{ fontSize:'12px', fontWeight:800, color:'#166534' }}>
                  Standard Express Delivery: Usually takes 5-7 business days
                </span>
              </div>
            </div>

            {/* ── Why is Cash on Delivery (COD) Not Available? (Matching Image 2) ── */}
            <div style={{
              background: 'linear-gradient(135deg, #FFFDF7 0%, #FAF2E6 50%, #F5E8D3 100%)',
              borderRadius: '20px',
              border: '1.5px solid #EBDCCB',
              padding: '22px 18px',
              boxShadow: '0 8px 24px rgba(180, 130, 70, 0.08)',
              position: 'relative'
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'12px' }}>
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

              <h3 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: '0 0 10px', letterSpacing: '-0.3px', lineHeight: 1.3 }}>
                Why is Cash on Delivery (COD) Not Available?
              </h3>

              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                To ensure <strong style={{ color: '#0F172A' }}>100% genuine products</strong>, fast 24–hour dispatch without delivery delays, and prevent fraudulent returns on custom tailoring tools, we currently accept secure instant UPI/Online payments only. Cash on Delivery verification support is coming soon!
              </p>
            </div>

          </div>
        )}

      </div>
      <style>{`
        @media (max-width: 640px) {
          .checkout-form-grid {
            grid-template-columns: 1fr !important;
          }
          .checkout-form-grid > div {
            grid-column: 1 / -1 !important;
          }
        }
      `}</style>
    </div>
  );
}
