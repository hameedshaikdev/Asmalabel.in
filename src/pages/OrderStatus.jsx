import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, MessageCircle, Phone, CheckCircle2,
         Clock, XCircle, Package, Truck, Home, ArrowLeft, ChevronDown, ChevronUp, Copy, Check } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useApp } from '../context/AppContext';
import { getProductImage } from '../utils/productImages';
import SEO from '../components/common/SEO';

const SHOP_WA = '917013942909';

const STEPS = [
  { key:'pending_payment',    label:'Order Placed',          icon:'📋', desc:'Order placed in our system.' },
  { key:'payment_submitted',  label:'Payment Submitted',     icon:'💸', desc:'We are verifying your payment.' },
  { key:'payment_verified',   label:'Payment Verified',      icon:'✅', desc:'Payment has been verified.' },
  { key:'confirmed',          label:'Confirmed',             icon:'🎉', desc:"We're preparing these items for shipping." },
  { key:'preparing',          label:'Preparing Order',       icon:'📦', desc:'Packed at Nellore boutique center.' },
  { key:'shipped',            label:'Shipped',               icon:'🚚', desc:'In transit with express courier.' },
  { key:'delivered',          label:'Delivered',             icon:'🏠', desc:'Delivered to your address.' },
];

function stepIndex(status) {
  const idx = STATUS_STEPS.findIndex(s => s.key === status);
  return idx === -1 ? 0 : idx;
}

function ProgressTracker({ status }) {
  const current = stepIndex(status);
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'0', padding:'8px 0' }}>
      {STATUS_STEPS.map((step, i) => {
        const done    = i < current;
        const active  = i === current;
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
                {done ? '✓' : step.icon}
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div style={{
                  width:'2px', height:'26px',
                  background: done ? '#16A34A' : '#E2E8F0',
                }} />
              )}
            </div>
            <div style={{ paddingTop:'4px', paddingBottom:'18px' }}>
              <p style={{
                fontSize:'13px', fontWeight: active ? 900 : done ? 700 : 500,
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

export default function OrderStatus() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { addToCart } = useApp();
  const [order,    setOrder]    = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchOrder = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('orders').select('*').eq('id', id).single();
      if (error) throw error;
      setOrder(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => { fetchOrder(); }, [fetchOrder]);

  useEffect(() => {
    if (!order) return;
    if (order.payment_status !== 'submitted') return;
    const t = setInterval(() => fetchOrder(true), 30000);
    return () => clearInterval(t);
  }, [order, fetchOrder]);

  useEffect(() => {
    const channel = supabase
      .channel(`order-${id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public',
        table: 'orders', filter: `id=eq.${id}`,
      }, payload => {
        setOrder(payload.new);
      })
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [id]);

  if (loading) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#FFF5F7' }}>
        <div style={{ textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:'16px' }}>
          <div style={{ width:'36px', height:'36px', border:'3px solid #E2E8F0', borderTop:'3px solid #0F172A', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
          <p style={{ color:'#64748B', fontWeight:600 }}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#FFF5F7', padding:'24px' }}>
        <div style={{ textAlign:'center', background:'white', padding:'36px 24px', borderRadius:'24px', border:'1px solid #E2E8F0', maxWidth:'400px' }}>
          <Package size={52} color="#94A3B8" style={{ margin:'0 auto 12px' }} />
          <h2 style={{ fontSize:'20px', fontWeight:900, marginBottom:'8px' }}>Order Not Found</h2>
          <p style={{ color:'#64748B', fontSize:'14px', marginBottom:'20px' }}>Please check your order link or explore our collection.</p>
          <button onClick={() => navigate('/')}
            style={{ padding:'12px 24px', borderRadius:'14px', background:'linear-gradient(135deg, #1A1A2E 0%, #0F3460 100%)', color:'white', fontWeight:800, border:'none', cursor:'pointer' }}>
            Go to Store
          </button>
        </div>
      </div>
    );
  }

  const addr = order.shipping_address || {};
  const isPending = order.payment_status === 'pending' || order.payment_status === 'submitted';
  const isRejected = order.payment_status === 'rejected';
  const orderDateStr = new Date(order.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
  const totalAmount = Number(order.total_amount || 0);
  const taxesApprox = (totalAmount * 0.18).toFixed(2);
  const itemsSubtotal = (order.items || []).reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 1)), 0);
  const shippingCost = totalAmount > itemsSubtotal ? totalAmount - itemsSubtotal : 0;

  function waContact() {
    const msg =
      `Hello Asmalabel! 👋%0A%0A` +
      `I need assistance with my order.%0A%0A` +
      `🔖 Order ID: %23${order.id.slice(0,8).toUpperCase()}%0A` +
      `💰 Amount: ₹${totalAmount.toFixed(0)}%0A` +
      `📋 Status: ${order.status}%0A%0A` +
      `Please assist me.`;
    window.open(`https://wa.me/${SHOP_WA}?text=${msg}`, '_blank');
  }

  function handleBuyAgain() {
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

  function handleCopyId() {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ minHeight:'100vh', background:'radial-gradient(circle at 50% 0%, #F8FAFC 0%, #F1F5F9 100%)', padding:'24px 16px 80px' }}>
      <SEO title={`Order #${order.id.slice(0,8).toUpperCase()} | Asmalabel`} robots="noindex, nofollow" />
      <div style={{ maxWidth:'580px', margin:'0 auto', display:'flex', flexDirection:'column', gap:'16px' }}>

        {/* ── Top Navigation Bar ── */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <button
            onClick={() => navigate('/orders')}
            style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'none', border:'none', fontSize:'14px', fontWeight:800, color:'#0F172A', cursor:'pointer' }}
          >
            <ArrowLeft size={18} />
            <span>All Orders</span>
          </button>
          <button
            onClick={() => fetchOrder()}
            disabled={refreshing}
            style={{ background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius:'10px', padding:'6px 12px', fontSize:'12px', fontWeight:700, color:'#475569', cursor:'pointer', display:'flex', alignItems:'center', gap:'4px' }}
          >
            <RefreshCw size={13} className={refreshing ? 'spin' : ''} />
            <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>

        {/* ── 1. Top Header: Order # & Date (Image 2) ── */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
          <div>
            <h1 style={{ fontSize:'20px', fontWeight:900, color:'#0F172A', margin:0, letterSpacing:'-0.3px', fontFamily:'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif' }}>
              Order #{order.id.slice(0,8).toUpperCase()}
            </h1>
            <p style={{ fontSize:'13px', color:'#64748B', marginTop:'3px', fontWeight:600, margin:0 }}>
              Confirmed {orderDateStr}
            </p>
          </div>
          <button
            onClick={handleCopyId}
            title="Copy full Order ID"
            style={{
              background:'#FFFFFF', border:'1px solid #E2E8F0', borderRadius:'8px',
              padding:'6px 10px', fontSize:'11.5px', fontWeight:700, color:'#475569',
              cursor:'pointer', display:'flex', alignItems:'center', gap:'4px'
            }}
          >
            {copied ? <Check size={12} color="#16A34A" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'ID'}</span>
          </button>
        </div>

        {/* ── 2. "Buy again" Action Button (Image 2) ── */}
        <button
          onClick={handleBuyAgain}
          style={{
            width: '100%',
            padding: '13px',
            borderRadius: '14px',
            background: '#0F172A',
            border: 'none',
            color: '#FFFFFF',
            fontSize: '14px',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(15,23,42,0.1)',
            transition: 'all .2s'
          }}
        >
          Buy again
        </button>

        {/* ── 3. Payment Status Box (Image 2) ── */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}>
          <p style={{ fontSize:'17px', fontWeight:900, color:'#0F172A', margin:0 }}>
            ₹{totalAmount.toFixed(2)} INR
          </p>
          <p style={{ fontSize:'13px', color:'#475569', margin:0, lineHeight:1.5, fontWeight:500 }}>
            {isPending
              ? 'This order has a pending payment. The balance will be updated when payment is received.'
              : isRejected
              ? `Payment could not be verified: ${order.rejection_reason || 'Please contact support.'}`
              : 'Payment verified successfully. Thank you for shopping with Asmalabel!'}
          </p>
        </div>

        {/* ── 4. Order Confirmation / Status Box (Image 2) ── */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <span style={{
                width:'22px', height:'22px', borderRadius:'50%', background:'#0F172A',
                color:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'12px', fontWeight:900
              }}>✓</span>
              <span style={{ fontSize:'15px', fontWeight:900, color:'#0F172A' }}>
                {order.status === 'delivered' ? 'Delivered' : order.status === 'shipped' ? 'Shipped' : 'Confirmed'}
              </span>
            </div>
            <span style={{ fontSize:'12px', color:'#94A3B8', fontWeight:600 }}>{orderDateStr}</span>
          </div>

          <p style={{ fontSize:'13px', color:'#475569', margin:0, fontWeight:500 }}>
            {order.status === 'delivered'
              ? 'Your package has been successfully delivered to your doorstep.'
              : order.status === 'shipped'
              ? 'Your items are in transit with our express delivery courier.'
              : "We're preparing these items for shipping."}
          </p>

          {/* Toggle Detailed Timeline */}
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            style={{
              background:'none', border:'none', padding:'6px 0 0',
              color:'#2563EB', fontSize:'12.5px', fontWeight:800,
              cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'4px'
            }}
          >
            <span>{showTimeline ? 'Hide Tracking Steps' : 'View Full Tracking Timeline'}</span>
            {showTimeline ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showTimeline && (
            <div style={{ borderTop:'1px solid #F1F5F9', marginTop:'10px', paddingTop:'12px' }}>
              <ProgressTracker status={order.status} />
            </div>
          )}
        </div>

        {/* ── 5. Items Card with Count Badges (Image 2) ── */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {(order.items || []).map((item, idx) => (
            <div key={idx} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'12px', minWidth:0 }}>
                <div style={{ position:'relative', width:'54px', height:'54px', flexShrink:0 }}>
                  <img
                    src={item.image_url || 'https://placehold.co/60x60?text=Product'}
                    alt={item.name}
                    style={{ width:'100%', height:'100%', borderRadius:'12px', objectFit:'cover', background:'#F8FAFC', border:'1px solid #F1F5F9' }}
                  />
                  <span style={{
                    position:'absolute', top:'-6px', right:'-6px',
                    width:'20px', height:'20px', borderRadius:'50%',
                    background:'#000000', color:'#FFFFFF',
                    fontSize:'11px', fontWeight:900,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    boxShadow:'0 2px 5px rgba(0,0,0,0.3)', border:'1.5px solid #FFFFFF'
                  }}>
                    {item.quantity || 1}
                  </span>
                </div>
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:'13.5px', fontWeight:800, color:'#0F172A', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
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
                      <p style={{ fontSize:'11.5px', color:'#64748B', margin:'2px 0 0', fontWeight:500 }}>
                        {item.unit}
                      </p>
                    )}
                  </div>
              </div>
              <span style={{ fontSize:'14px', fontWeight:900, color:'#0F172A', flexShrink:0 }}>
                ₹{Number(item.price || 0).toFixed(2)}
              </span>
            </div>
          ))}

          {/* Pricing Subtotal, Shipping, Total */}
          <div style={{ borderTop:'1px solid #F1F5F9', paddingTop:'12px', display:'flex', flexDirection:'column', gap:'8px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13.5px', color:'#64748B', fontWeight:600 }}>
              <span>Subtotal</span>
              <span style={{ color:'#0F172A', fontWeight:700 }}>₹{itemsSubtotal.toFixed(2)}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:'13.5px', color:'#64748B', fontWeight:600 }}>
              <span>Shipping</span>
              <span style={{ color:'#0F172A', fontWeight:700 }}>{shippingCost > 0 ? `₹${shippingCost.toFixed(2)}` : 'Free'}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', marginTop:'4px', paddingTop:'8px', borderTop:'1px dashed #E2E8F0' }}>
              <span style={{ fontSize:'15px', fontWeight:900, color:'#0F172A' }}>Total</span>
              <div style={{ textAlign:'right' }}>
                <span style={{ fontSize:'12px', color:'#64748B', fontWeight:700, marginRight:'6px' }}>INR</span>
                <span style={{ fontSize:'18px', fontWeight:900, color:'#0F172A' }}>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
            <p style={{ fontSize:'11.5px', color:'#94A3B8', margin:0, textAlign:'right', fontWeight:500 }}>
              Including ₹{taxesApprox} in taxes
            </p>
          </div>
        </div>

        {/* ── 6. Contact & Shipping Information Card (Image 3) ── */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '18px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          {/* Contact */}
          <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap:'8px', fontSize:'13px', alignItems:'flex-start' }}>
            <span style={{ color:'#64748B', fontWeight:600 }}>Contact</span>
            <span style={{ color:'#0F172A', fontWeight:700, textDecoration:'underline' }}>
              {addr.phone ? `+91 ${addr.phone}` : 'Customer Contact'}
            </span>
          </div>

          <div style={{ height:'1px', background:'#F1F5F9' }} />

          {/* Ship to */}
          <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap:'8px', fontSize:'13px', alignItems:'flex-start' }}>
            <span style={{ color:'#64748B', fontWeight:600 }}>Ship to</span>
            <div style={{ color:'#0F172A', lineHeight:1.5, fontWeight:600 }}>
              <p style={{ fontWeight:800, margin:0 }}>{addr.fullName || 'Valued Customer'}</p>
              <p style={{ margin:0, color:'#475569' }}>{addr.houseNo ? `${addr.houseNo}, ` : ''}{addr.streetArea || ''}</p>
              {addr.landmark && <p style={{ margin:0, color:'#475569' }}>Near {addr.landmark}</p>}
              <p style={{ margin:0, color:'#475569' }}>
                {[addr.city, addr.state, addr.pincode, 'India'].filter(Boolean).join(' ')}
              </p>
              {addr.phone && <p style={{ margin:'2px 0 0', textDecoration:'underline', fontWeight:700 }}>+91 {addr.phone}</p>}
            </div>
          </div>

          <div style={{ height:'1px', background:'#F1F5F9' }} />

          {/* Method */}
          <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap:'8px', fontSize:'13px', alignItems:'center' }}>
            <span style={{ color:'#64748B', fontWeight:600 }}>Method</span>
            <span style={{ color:'#0F172A', fontWeight:700 }}>Free Express Shipping</span>
          </div>

          <div style={{ height:'1px', background:'#F1F5F9' }} />

          {/* Payment */}
          <div style={{ display:'grid', gridTemplateColumns:'80px 1fr', gap:'8px', fontSize:'13px', alignItems:'flex-start' }}>
            <span style={{ color:'#64748B', fontWeight:600 }}>Payment</span>
            <div>
              <p style={{ fontWeight:800, color:'#0F172A', margin:0 }}>
                {order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'UPI / Online Payment'}
              </p>
              <p style={{ fontSize:'12px', color:'#64748B', margin:'2px 0 0', fontWeight:500 }}>
                ₹{totalAmount.toFixed(2)} INR · {orderDateStr}
              </p>
            </div>
          </div>
        </div>

        {/* ── 7. Action Button: WhatsApp ── */}
        <button
          onClick={waContact}
          style={{
            width:'100%', padding:'13px', borderRadius:'14px',
            background:'#F0FDF4', color:'#16A34A', fontWeight:800,
            fontSize:'14px', border:'1px solid #BBF7D0', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'
          }}
        >
          <MessageCircle size={17} /> Chat with WhatsApp Support
        </button>

      </div>
    </div>
  );
}
