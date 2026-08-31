import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MessageCircle, RefreshCw, ChevronDown, ChevronUp, Trash2, CheckCircle2, ShoppingBag, ArrowLeft, ExternalLink, Check, Copy, BadgeCheck, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../config/supabase';
import { getProductImage } from '../utils/productImages';
import SEO from '../components/common/SEO';

const SHOP_WA = '917013942909';

const STEPS = [
  { key:'pending_payment',   label:'Order Placed',         emoji:'📋', desc:'Your order has been placed in our system.' },
  { key:'payment_submitted', label:'Payment Submitted',    emoji:'💸', desc:'We received your payment reference and are verifying it.' },
  { key:'payment_verified',  label:'Payment Verified',     emoji:'✅', desc:'Payment has been verified successfully.' },
  { key:'confirmed',         label:'Confirmed',            emoji:'🎉', desc:"We're preparing these items for shipping." },
  { key:'preparing',         label:'Preparing Order',      emoji:'📦', desc:'Your package is being carefully packed at our Nellore facility.' },
  { key:'shipped',           label:'Shipped',              emoji:'🚚', desc:'Your parcel is in transit with our express delivery partner.' },
  { key:'delivered',         label:'Delivered',            emoji:'🏠', desc:'Package has been delivered to your address.' },
];

function stepIndex(status) {
  const i = STEPS.findIndex(s => s.key === status);
  return i === -1 ? 0 : i;
}

function ProgressBar({ status }) {
  const current = stepIndex(status);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0, padding:'8px 0' }}>
      {STEPS.map((step, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={step.key} style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:'28px', flexShrink:0 }}>
              <div style={{
                width:'28px', height:'28px', borderRadius:'50%',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'12px', fontWeight:900,
                background: done ? '#16A34A' : active ? '#0F172A' : '#F1F5F9',
                color: (done || active) ? 'white' : '#94A3B8',
                boxShadow: active ? '0 0 0 3px rgba(15,23,42,.15)' : 'none',
              }}>
                {done ? '✓' : step.emoji}
              </div>
              {i < STEPS.length - 1 && (
                <div style={{ width:'2px', height:'26px', marginTop:'2px',
                  background: done ? '#16A34A' : '#E2E8F0' }} />
              )}
            </div>
            <div style={{ paddingTop:'4px', paddingBottom:'18px' }}>
              <p style={{
                fontSize:'13px',
                fontWeight: active ? 900 : done ? 700 : 500,
                color: done ? '#16A34A' : active ? '#0F172A' : '#94A3B8',
                margin:0
              }}>
                {step.label}
              </p>
              {active && (
                <p style={{ fontSize:'11.5px', color:'#64748B', marginTop:'2px', margin:0 }}>
                  {step.desc}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Collapsible Small Rectangle Order Card ── */
function OrderCard({ order, onDeleteOrder }) {
  const navigate = useNavigate();
  const { addToCart } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [copied, setCopied] = useState(false);

  const addr = order.shipping_address || {};
  const isVerified = order.payment_status === 'verified';
  const isSubmitted = order.payment_status === 'submitted' || order.status === 'payment_submitted';
  const isRejected = order.payment_status === 'rejected' || order.status === 'payment_rejected';
  const isPending = !isVerified && !isRejected && !isSubmitted;
  const orderDateStr = new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
  const totalAmount = Number(order.total_amount || 0);
  const taxesApprox = (totalAmount * 0.18).toFixed(2);
  const items = Array.isArray(order.items) ? order.items : [];
  const firstItem = items[0] || {};
  const itemsSubtotal = items.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
  const shippingCost = totalAmount > itemsSubtotal ? totalAmount - itemsSubtotal : 0;

  const statusLabel =
    order.status === 'delivered' ? 'Delivered'
    : order.status === 'shipped' ? 'Shipped'
    : order.status === 'preparing' ? 'Preparing'
    : order.status === 'confirmed' ? 'Confirmed'
    : order.status === 'payment_submitted' ? 'Payment Submitted'
    : order.status === 'payment_rejected' ? 'Payment Rejected'
    : 'Pending Payment';

  const statusColor =
    order.status === 'delivered' ? '#16A34A'
    : order.status === 'shipped' ? '#2563EB'
    : order.status === 'payment_rejected' ? '#DC2626'
    : '#0F172A';

  function waContact(e) {
    if (e) e.stopPropagation();
    const msg =
      `Hello Asmalabel! 👋%0A%0A` +
      `I need assistance with my order.%0A%0A` +
      `🔖 Order ID: %23${order.id.slice(0,8).toUpperCase()}%0A` +
      `💰 Amount: ₹${totalAmount.toFixed(0)}%0A` +
      `📋 Status: ${order.status}%0A%0A` +
      `Please assist me.`;
    window.open(`https://wa.me/${SHOP_WA}?text=${msg}`, '_blank');
  }

  function handleBuyAgain(e) {
    if (e) e.stopPropagation();
    if (Array.isArray(order.items)) {
      order.items.forEach(it => {
        addToCart({
          id: it.product_id || it.id,
          name: it.name,
          price: it.price,
          image_url: it.image_url,
          unit: it.unit
        }, it.quantity || 1);
      });
      navigate('/cart');
    }
  }

  function handleCopyId(e) {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '18px',
      border: '1px solid #E2E8F0',
      marginBottom: '14px',
      boxShadow: '0 2px 10px rgba(15,23,42,0.03)',
      overflow: 'hidden',
      transition: 'all .25s ease',
      boxSizing: 'border-box'
    }}>

      {/* ── Compact Rectangle Header (Default Clickable View) ── */}
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          cursor: 'pointer',
          background: expanded ? '#F8FAFC' : '#FFFFFF',
          borderBottom: expanded ? '1px solid #E2E8F0' : 'none',
          userSelect: 'none'
        }}
      >
        {/* Left: Thumbnail with count + Order summary */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', minWidth:0 }}>
          <div style={{ position:'relative', width:'46px', height:'46px', flexShrink:0 }}>
            <img
              src={firstItem.image_url || 'https://placehold.co/60x60?text=Order'}
              alt={firstItem.name || 'Order item'}
              style={{ width:'100%', height:'100%', borderRadius:'10px', objectFit:'cover', background:'#F1F5F9', border:'1px solid #E2E8F0' }}
            />
            {items.length > 1 && (
              <span style={{
                position:'absolute', top:'-5px', right:'-5px',
                width:'19px', height:'19px', borderRadius:'50%',
                background:'#0F172A', color:'#FFFFFF',
                fontSize:'10px', fontWeight:900,
                display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'0 2px 4px rgba(0,0,0,0.25)', border:'1.5px solid #FFFFFF'
              }}>
                +{items.length - 1}
              </span>
            )}
          </div>

          <div style={{ minWidth:0, overflow:'hidden' }}>
            <p style={{
              fontSize:'13.5px',
              fontWeight:800,
              color:'#0F172A',
              margin:'0 0 2px',
              overflow:'hidden',
              textOverflow:'ellipsis',
              whiteSpace:'nowrap',
              lineHeight:1.3
            }}>
              {firstItem.name || 'Order Item'}
            </p>
            <p style={{
              fontSize:'12px',
              fontWeight:700,
              color:'#475569',
              margin:0,
              fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif',
              letterSpacing:'0'
            }}>
              Order #{order.id.slice(0,8).toUpperCase()}
            </p>
            <p style={{ fontSize:'11.5px', color:'#64748B', margin:'2px 0 0', fontWeight:500 }}>
              {orderDateStr} · <span style={{ color: statusColor, fontWeight:700 }}>{statusLabel}</span>
            </p>
          </div>
        </div>

        {/* Right: Total + Expand Button */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px', flexShrink:0 }}>
          <div style={{ textAlign:'right' }}>
            <p style={{ fontSize:'15px', fontWeight:900, color:'#0F172A', margin:0 }}>
              ₹{totalAmount.toFixed(0)}
            </p>
            <span style={{ fontSize:'11px', color: expanded ? '#0F172A' : '#64748B', fontWeight:700 }}>
              {expanded ? 'Collapse' : 'Details'}
            </span>
          </div>
          <div style={{
            width:'30px', height:'30px', borderRadius:'50%',
            background:'#FFFFFF', border:'1px solid #E2E8F0',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 1px 3px rgba(0,0,0,0.04)'
          }}>
            {expanded ? <ChevronUp size={16} color="#0F172A" /> : <ChevronDown size={16} color="#0F172A" />}
          </div>
        </div>
      </div>

      {/* ── Expanded Materialism / Shopify Content (Images 2 & 3) ── */}
      {expanded && (
        <div style={{ padding:'18px 16px', display:'flex', flexDirection:'column', gap:'14px', background:'#FFFFFF' }}>

          {/* Top Actions: Copy ID & Buy Again */}
          <div style={{ display:'flex', gap:'10px' }}>
            <button
              onClick={handleBuyAgain}
              style={{
                flex:1, padding:'11px', borderRadius:'12px',
                background:'#0F172A', color:'#FFFFFF',
                fontSize:'13px', fontWeight:800, cursor:'pointer',
                border:'none', transition:'all .2s'
              }}
            >
              Buy again
            </button>
            <button
              onClick={handleCopyId}
              title="Copy Order ID"
              style={{
                padding:'11px 14px', borderRadius:'12px',
                background:'#FFFFFF', border:'1px solid #E2E8F0',
                color:'#475569', fontSize:'12.5px', fontWeight:700,
                cursor:'pointer', display:'flex', alignItems:'center', gap:'4px'
              }}
            >
              {copied ? <Check size={13} color="#16A34A" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy ID'}</span>
            </button>
          </div>

          {/* Payment Status Box */}
          <div style={{ background:'#F8FAFC', borderRadius:'14px', border:'1px solid #E2E8F0', padding:'14px' }}>
            <p style={{ fontSize:'15.5px', fontWeight:900, color:'#0F172A', margin:0 }}>
              ₹{totalAmount.toFixed(2)} INR
            </p>
            <p style={{ fontSize:'12.5px', color:'#475569', margin:'3px 0 0', lineHeight:1.5, fontWeight:500 }}>
              {isVerified
                ? 'Payment verified successfully. Thank you for shopping with Asmalabel!'
                : isSubmitted
                ? 'Payment screenshot submitted. Awaiting admin verification.'
                : isRejected
                ? `Payment could not be verified: ${order.rejection_reason || 'Please contact support.'}`
                : 'This order has a pending payment. The balance will be updated when payment is received and verified by admin.'}
            </p>
          </div>

          {/* Fulfillment Status Box */}
          <div style={{ background:'#F8FAFC', borderRadius:'14px', border:'1px solid #E2E8F0', padding:'14px', display:'flex', flexDirection:'column', gap:'6px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                <span style={{ width:'20px', height:'20px', borderRadius:'50%', background:'#0F172A', color:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'11px', fontWeight:900 }}>✓</span>
                <span style={{ fontSize:'14.5px', fontWeight:900, color:'#0F172A' }}>{statusLabel}</span>
              </div>
              <span style={{ fontSize:'12px', color:'#94A3B8', fontWeight:600 }}>{orderDateStr}</span>
            </div>

            <p style={{ fontSize:'12.5px', color:'#475569', margin:0, fontWeight:500 }}>
              {order.status === 'delivered'
                ? 'Your package has been successfully delivered to your doorstep.'
                : order.status === 'shipped'
                ? 'Your items are in transit with our express delivery courier.'
                : "We're preparing these items for shipping."}
            </p>

            <button
              onClick={() => setShowTimeline(!showTimeline)}
              style={{ background:'none', border:'none', padding:'6px 0 0', color:'#0F172A', fontSize:'12px', fontWeight:800, cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'4px' }}
            >
              <span>{showTimeline ? 'Hide Tracking Steps' : 'View Full Tracking Timeline'}</span>
              {showTimeline ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {showTimeline && (
              <div style={{ borderTop:'1px solid #E2E8F0', marginTop:'8px', paddingTop:'10px' }}>
                <ProgressBar status={order.status} />
              </div>
            )}
          </div>

          {/* Ordered Items Breakdown */}
          <div style={{ background:'#F8FAFC', borderRadius:'14px', border:'1px solid #E2E8F0', padding:'14px', display:'flex', flexDirection:'column', gap:'12px' }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'10px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px', minWidth:0 }}>
                  <div style={{ position:'relative', width:'48px', height:'48px', flexShrink:0 }}>
                    <img
                      src={item.image_url || 'https://placehold.co/60x60?text=Product'}
                      alt={item.name}
                      style={{ width:'100%', height:'100%', borderRadius:'10px', objectFit:'cover', background:'#FFFFFF', border:'1px solid #E2E8F0' }}
                    />
                    <span style={{
                      position:'absolute', top:'-5px', right:'-5px',
                      width:'18px', height:'18px', borderRadius:'50%',
                      background:'#000000', color:'#FFFFFF',
                      fontSize:'10.5px', fontWeight:900,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      border:'1.5px solid #FFFFFF'
                    }}>
                      {item.quantity || 1}
                    </span>
                  </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:'13px', fontWeight:800, color:'#0F172A', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {item.name}
                    </p>
                    {(item.size || item.color) && (
                      <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'3px', flexWrap:'wrap' }}>
                        {item.size && (
                          <span style={{ fontSize:'10.5px', fontWeight:700, color:'#0F172A', background:'#E2E8F0', padding:'1px 6px', borderRadius:'4px' }}>
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', fontSize:'10.5px', fontWeight:700, color:'#0F172A', background:'#E2E8F0', padding:'1px 6px', borderRadius:'4px' }}>
                            {item.color_value && (
                              <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:item.color_value, border:'1px solid rgba(0,0,0,0.2)' }} />
                            )}
                            Color: {item.color}
                          </span>
                        )}
                      </div>
                    )}
                    {item.unit && !item.size && (
                      <p style={{ fontSize:'11px', color:'#64748B', margin:'2px 0 0', fontWeight:500 }}>
                        {item.unit}
                      </p>
                    )}
                  </div>
                </div>
                <span style={{ fontSize:'13.5px', fontWeight:900, color:'#0F172A', flexShrink:0 }}>
                  ₹{Number(item.price || 0).toFixed(2)}
                </span>
              </div>
            ))}

            {/* Price rows */}
            <div style={{ borderTop:'1px solid #E2E8F0', paddingTop:'10px', display:'flex', flexDirection:'column', gap:'6px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12.5px', color:'#64748B', fontWeight:600 }}>
                <span>Subtotal</span>
                <span style={{ color:'#0F172A', fontWeight:700 }}>₹{itemsSubtotal.toFixed(2)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'12.5px', color:'#64748B', fontWeight:600 }}>
                <span>Shipping</span>
                <span style={{ color:'#0F172A', fontWeight:700 }}>{shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'Free'}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginTop:'2px', paddingTop:'6px', borderTop:'1px dashed #E2E8F0' }}>
                <span style={{ fontSize:'14px', fontWeight:900, color:'#0F172A' }}>Total</span>
                <div style={{ textAlign:'right' }}>
                  <span style={{ fontSize:'11px', color:'#64748B', fontWeight:700, marginRight:'4px' }}>INR</span>
                  <span style={{ fontSize:'16.5px', fontWeight:900, color:'#0F172A' }}>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
              <p style={{ fontSize:'11px', color:'#94A3B8', margin:0, textAlign:'right', fontWeight:500 }}>
                Including ₹{taxesApprox} in taxes
              </p>
            </div>
          </div>

          {/* Contact & Ship To Card */}
          <div style={{ background:'#F8FAFC', borderRadius:'14px', border:'1px solid #E2E8F0', padding:'14px', display:'flex', flexDirection:'column', gap:'10px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'70px 1fr', gap:'6px', fontSize:'12.5px' }}>
              <span style={{ color:'#64748B', fontWeight:600 }}>Contact</span>
              <span style={{ color:'#0F172A', fontWeight:700, textDecoration:'underline' }}>
                {addr.phone ? `+91 ${addr.phone}` : 'Customer Contact'}
              </span>
            </div>

            <div style={{ height:'1px', background:'#E2E8F0' }} />

            <div style={{ display:'grid', gridTemplateColumns:'70px 1fr', gap:'6px', fontSize:'12.5px', alignItems:'flex-start' }}>
              <span style={{ color:'#64748B', fontWeight:600 }}>Ship to</span>
              <div style={{ color:'#0F172A', lineHeight:1.45, fontWeight:600 }}>
                <p style={{ fontWeight:800, margin:0 }}>{addr.fullName || 'Valued Customer'}</p>
                <p style={{ margin:0, color:'#475569' }}>{addr.houseNo ? `${addr.houseNo}, ` : ''}{addr.streetArea || ''}</p>
                {addr.landmark && <p style={{ margin:0, color:'#475569' }}>Near {addr.landmark}</p>}
                <p style={{ margin:0, color:'#475569' }}>
                  {[addr.city, addr.state, addr.pincode, 'India'].filter(Boolean).join(' ')}
                </p>
                {addr.phone && <p style={{ margin:'2px 0 0', textDecoration:'underline', fontWeight:700 }}>+91 {addr.phone}</p>}
              </div>
            </div>

            <div style={{ height:'1px', background:'#E2E8F0' }} />

            <div style={{ display:'grid', gridTemplateColumns:'70px 1fr', gap:'6px', fontSize:'12.5px', alignItems:'flex-start' }}>
              <span style={{ color:'#64748B', fontWeight:600 }}>Payment</span>
              <div>
                <p style={{ fontWeight:800, color:'#0F172A', margin:0 }}>
                  {order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'UPI / Online Payment'}
                </p>
                <p style={{ fontSize:'11.5px', color:'#64748B', margin:'2px 0 0', fontWeight:500 }}>
                  ₹{totalAmount.toFixed(2)} INR · {orderDateStr}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons: WhatsApp Support & Delete */}
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            <button
              onClick={waContact}
              style={{
                flex:1, minWidth:'140px', padding:'10px 12px', borderRadius:'10px',
                background:'#F0FDF4', color:'#16A34A', fontWeight:800,
                fontSize:'12.5px', border:'1px solid #BBF7D0', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'
              }}
            >
              <MessageCircle size={14} /> WhatsApp Support
            </button>

            {onDeleteOrder && (
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteOrder(order.id); }}
                title="Delete Order from History"
                style={{
                  padding:'10px 14px', borderRadius:'10px',
                  background:'#FEF2F2', color:'#DC2626', fontWeight:800,
                  fontSize:'12.5px', border:'1px solid #FECACA', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center', gap:'6px'
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
}

export default function Orders() {
  const navigate  = useNavigate();
  const { user, loading: authLoading, addToCart } = useApp();
  const [orders,   setOrders]   = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('/login'); return; }
    fetchOrders();
    fetchSuggested();
  }, [user, authLoading]);

  // Realtime updates
  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel('customer-orders')
      .on('postgres_changes', { event:'UPDATE', schema:'public', table:'orders',
        filter:`user_id=eq.${user.id}` },
        payload => {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? payload.new : o));
        })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [user]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders').select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setOrders(data || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function fetchSuggested() {
    try {
      const { data } = await supabase.from('products').select('*').eq('active', true).limit(8);
      setSuggested(data || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDeleteOrder(orderId) {
    if (!window.confirm('Are you sure you want to delete this order from your order history?')) return;
    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
      if (error) throw error;
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err) {
      alert('Failed to delete order: ' + err.message);
    }
  }

  const FILTERS = [
    { key:'all',      label:'All Orders' },
    { key:'delivered',label:'Delivered' },
  ];

  const filtered = orders.filter(o => {
    if (filter === 'all')       return true;
    if (filter === 'delivered') return o.status === 'delivered';
    return true;
  });

  if (authLoading) return null;

  return (
    <div style={{ minHeight:'100vh', background:'radial-gradient(circle at 50% 0%, #F8FAFC 0%, #F1F5F9 100%)', paddingBottom:'80px' }}>
      <SEO title="My Orders | Asmalabel" robots="noindex, nofollow" canonical="https://asmalabel.in/orders" />
      <div className="container-center" style={{ padding:'24px 16px', maxWidth:'620px', margin:'0 auto' }}>

        {/* Orders Page Header */}
        <div style={{ marginBottom:'18px' }}>
          <h1 style={{
            fontSize:'26px',
            fontWeight:900,
            color:'#0F172A',
            margin:0,
            letterSpacing:'-0.6px',
            fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif'
          }}>
            My Orders
          </h1>
        </div>

        {/* Unified 2-Option Segment Bar Row (All Orders, Delivered) */}
        <div style={{
          display:'flex',
          background:'#FFFFFF',
          padding:'4px',
          borderRadius:'14px',
          border:'1px solid #E2E8F0',
          marginBottom:'20px',
          boxShadow:'0 2px 6px rgba(0,0,0,0.02)'
        }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                flex:1,
                padding:'10px 0',
                borderRadius:'10px',
                fontWeight:800,
                fontSize:'13px',
                border:'none',
                cursor:'pointer',
                background: filter === f.key ? '#0F172A' : 'transparent',
                color: filter === f.key ? '#FFFFFF' : '#64748B',
                boxShadow: filter === f.key ? '0 2px 8px rgba(15,23,42,0.15)' : 'none',
                transition:'all .2s'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders list */}
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px 0', display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' }}>
            <div style={{ width:'36px', height:'36px', border:'3px solid #E2E8F0', borderTop:'3px solid #0F172A', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
            <p style={{ color:'#64748B', fontWeight:600 }}>Loading your orders...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 20px', background:'white', borderRadius:'20px', border:'1px solid #E2E8F0', boxShadow:'0 4px 20px rgba(0,0,0,0.03)', marginBottom:'32px' }}>
            <Package size={52} style={{ color:'#CBD5E1', margin:'0 auto 14px' }} />
            <h3 style={{ fontSize:'18px', fontWeight:900, color:'#0F172A', marginBottom:'6px' }}>
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h3>
            <p style={{ fontSize:'13.5px', color:'#64748B', marginBottom:'20px' }}>
              {filter === 'all' ? 'Explore our collections to place your first order!' : 'You have no orders in this category.'}
            </p>
            {filter === 'all' && (
              <button onClick={() => navigate('/')}
                style={{ padding:'12px 24px', borderRadius:'12px', background:'#0F172A', color:'white', fontWeight:800, border:'none', cursor:'pointer' }}>
                Explore Store
              </button>
            )}
          </div>
        ) : (
          <div style={{ marginBottom:'36px' }}>
            {filtered.map(order => <OrderCard key={order.id} order={order} onDeleteOrder={handleDeleteOrder} />)}
          </div>
        )}

        {/* ── SUGGESTED FOR YOU SCROLLER (Below Orders) ── */}
        {suggested.length > 0 && (
          <div style={{ marginTop:'24px' }}>
            <div style={{ marginBottom:'12px' }}>
              <h3 style={{ fontSize:'18px', fontWeight:900, color:'#0F172A', margin:'0 0 2px', letterSpacing:'-0.3px' }}>
                Suggested for You
              </h3>
              <p style={{ fontSize:'12px', color:'#64748B', margin:0, fontWeight:500 }}>
                Based on Your Activity
              </p>
            </div>

            <div style={{ display:'flex', gap:'12px', overflowX:'auto', paddingBottom:'8px', WebkitOverflowScrolling:'touch', scrollSnapType:'x mandatory', scrollbarWidth:'none' }}>
              {suggested.map(p => {
                const pPrice = Number(p.price || 0);
                const pOrig = Number(p.original_price || 0);
                const pDisc = pOrig > pPrice ? Math.round((1 - pPrice / pOrig) * 100) : 0;

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

      </div>
      <style>{`
        @keyframes spin  { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
}
