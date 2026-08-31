import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, Users, BarChart2,
  LogOut, Search, Bell, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  CheckCircle, XCircle, MessageCircle, Phone, Truck,
  Plus, Edit2, Trash2, Eye, EyeOff, X, Save, Upload,
  AlertTriangle, AlertCircle, Download, Printer,
  Menu, Settings, TrendingUp, ShieldCheck, Home, Sparkles,
  RotateCcw, Calendar, Copy, Check, Tag, Target, Sliders, Settings2,
  ArrowUp, ArrowDown
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from '../config/supabase';
import { useApp } from '../context/AppContext';
import { getProductImage, parseProductTags } from '../utils/productImages';
import { getColorName, getColorSwatch, PRESET_COLORS } from '../utils/colorUtils';
import { normalizeCategoryKey, DEFAULT_CMS_DATA } from '../utils/cmsDefaults';
import {
  ToastContainer, ConfirmDialog, CommandPalette,
  OrderSkeleton, ProductSkeleton, EmptyState,
  exportOrdersCSV, exportProductsCSV,
  toast, confirm,
} from '../components/admin/AdminUtils';
import { compressImageFile } from '../utils/imageCompressor';
import { SAFE_DEFAULT_COUPONS, MIN_ORDER_VALUE } from '../utils/pricing';
import HomepageManager from '../components/admin/cms/HomepageManager';
import SocialMediaManager from '../components/admin/SocialMediaManager';
import SEO from '../components/common/SEO';

const ADMIN_EMAIL = 'as.businezzz@gmail.com';

export const PRESET_SIZES = [
  '1.6mm', '2.4mm', '3.2mm', '4.8mm', '6.4mm', '8.0mm', 'Inches', 'S', 'M', 'L', 'XL', 'Free Size'
];

export function extractSizeFromName(name) {
  if (!name || typeof name !== 'string') return '';
  // Match multi-dimensional inches/mm/cm: 12 x 22 inches, 12x22 inch, 10 x 15 cm, 12" x 22"
  const multiDimMatch = name.match(/(\d+(?:\.\d+)?\s*(?:["']|\s)?\s*[xX*×]\s*\d+(?:\.\d+)?\s*(?:inches|inch|in|mm|cm|["'])?)/i);
  if (multiDimMatch) return multiDimMatch[1].trim();
  // Match mm sizes: 1.6mm, 1.6 mm, 3.2mm, 5mm
  const mmMatch = name.match(/(\d+(?:\.\d+)?\s*mm)/i);
  if (mmMatch) return mmMatch[1].replace(/\s+/g, '');
  // Match fractional inches: 1/16", 1/8", 1/4", 3/8", 1/2"
  const inchFracMatch = name.match(/(\d+\/\d+["']?)/i);
  if (inchFracMatch) return inchFracMatch[1];
  // Match whole inches: 11 inch, 12 in, 60 inch
  const inchMatch = name.match(/(\d+\s*(?:inch|inches|in)\b)/i);
  if (inchMatch) return inchMatch[1];
  // Match clothing sizes: XXL, XL, XS, S, M, L, Free Size
  const sizeMatch = name.match(/\b(XXL|XL|XS|S|M|L|Free Size)\b/i);
  if (sizeMatch) return sizeMatch[1];
  return '';
}

const SHOP = {
  shopName: 'Asmalabel',
};

const NAV = [
  { key:'dashboard', label:'Dashboard', icon:LayoutDashboard },
  { key:'orders',    label:'Orders',    icon:ShoppingBag },
  { key:'products',  label:'Products',  icon:Package },
];

/* ── Unified Neutral Slate Status Palette (No loud rainbow colors) ── */
const ORDER_STATUS = [
  { key:'all_pending',       label:'All New',   color:'#334155' },
  { key:'payment_submitted', label:'Verify',    color:'#2563EB' },
  { key:'confirmed',         label:'Confirmed', color:'#0F172A' },
  { key:'preparing',         label:'Preparing', color:'#475569' },
  { key:'shipped',           label:'Shipped',   color:'#1E293B' },
  { key:'delivered',         label:'Delivered', color:'#059669' },
  { key:'payment_rejected',  label:'Rejected',  color:'#DC2626' },
];

/* ── Print Label ──────────────────────────────────────────── */
function printShippingLabel(order) {
  const addr = order.shipping_address || {};
  const html = `<!DOCTYPE html><html><head><title>Label #${order.id.slice(0,8).toUpperCase()}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:20px}
  .wrap{max-width:580px;margin:0 auto;page-break-after:always;border:2px solid #000;padding:20px}
  .header{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #000;padding-bottom:12px;margin-bottom:16px}
  .brand{font-size:22px;font-weight:900}.oid{font-family:monospace;font-size:16px;font-weight:900;background:#f0f0f0;padding:6px 12px;border-radius:4px}
  .box{background:#fafafa;border-radius:8px;padding:14px;margin-bottom:14px;border:1px solid #ddd}
  .lbl{font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:1.5px;color:#666;margin-bottom:7px}
  .name{font-size:20px;font-weight:900;margin-bottom:4px}.ph{font-size:15px;font-weight:700;margin-bottom:8px}
  .addr{font-size:14px;line-height:1.65;color:#333}.pin{font-size:22px;font-weight:900;margin-top:8px;letter-spacing:2px}
  .from{background:#f5f5f5}.fn{font-size:16px;font-weight:800;margin-bottom:5px}
  .fd{font-size:13px;color:#333;line-height:1.75}table{width:100%;border-collapse:collapse;font-size:13px}
  th{background:#333;color:white;padding:8px 10px;text-align:left;font-size:11px;text-transform:uppercase}
  td{padding:8px 10px;border-bottom:1px solid #e0e0e0}.tot td{font-weight:900;background:#f5f5f5;border-top:2px solid #333}
  .badge{display:inline-block;background:#000;color:white;font-size:11px;font-weight:900;padding:5px 14px;border-radius:6px;margin-top:10px}
  .foot{border-top:2px solid #ddd;padding-top:12px;margin-top:14px;display:flex;justify-content:space-between;font-size:11px;color:#555}
  .care{background:#000;color:#fff;padding:5px 12px;border-radius:4px;font-weight:700}
  @media print{.np{display:none!important}}</style></head><body>
  <div class="wrap">
  <div class="np" style="text-align:right;margin-bottom:14px"><button onclick="window.print()" style="padding:10px 24px;background:#000;color:white;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer">🖨 Print Label</button></div>
  <div class="header"><div><div class="brand">Asmalabel</div><div style="font-size:11px;color:#666;margin-top:2px">Ph: 7013942909 | as.businezzz@gmail.com</div></div>
  <div class="oid">#${order.id.slice(0,8).toUpperCase()}<div style="font-size:11px;color:#666;font-weight:400;text-align:right;margin-top:3px">${new Date(order.created_at).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})}</div></div></div>
  <div class="box"><div class="lbl">📦 Deliver To</div><div class="name">${addr.fullName||'N/A'}</div>
  <div class="ph">📞 +91 ${addr.phone||'N/A'}</div>
  <div class="addr">${addr.houseNo||''}, ${addr.streetArea||''}<br>Near ${addr.landmark||'N/A'}<br>${addr.city||''}, ${addr.state||''}</div>
  <div class="pin">PIN: ${addr.pincode||'N/A'}</div>${addr.email?`<div style="font-size:12px;color:#555;margin-top:6px">✉ ${addr.email}</div>`:''}</div>
  <div class="box from"><div class="lbl">From</div><div class="fn">Shaik Asmath (Asmalabel)</div>
  <div class="fd">D.No. 25-2-1709,<br>Pragathi Nagar, Podalkur Road,<br>Nellore, Andhra Pradesh - 524004<br>Ph: 7013942909</div></div>
  <div class="box"><div class="lbl">Items</div><table><thead><tr><th>Product</th><th style="text-align:right">Qty</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>${(order.items||[]).map(i=>`<tr><td>${i.name}</td><td style="text-align:right">${i.quantity}</td><td style="text-align:right">₹${(i.price*i.quantity).toFixed(0)}</td></tr>`).join('')}
  <tr class="tot"><td colspan="2">Total</td><td style="text-align:right">₹${order.total_amount?.toFixed(0)}</td></tr></tbody></table>
  <div class="badge">✓ Paid via UPI</div></div>
  <div class="foot"><span>Order: ${order.id.slice(0,8).toUpperCase()} | ${new Date(order.created_at).toLocaleDateString('en-IN')} | ${order.status?.toUpperCase()}</span><span class="care">HANDLE WITH CARE</span></div>
  </div></body></html>`;
  const w = window.open('','_blank','width=700,height=900');
  w.document.write(html); w.document.close(); w.focus();
}

/* ── Tailoring & Fashion Default Subcategories ── */
const DEFAULT_TAILORING_SUBCATS = [
  { key: 'all', label: 'All Tailoring', icon: 'Sparkles' },
  { key: 'machines', label: 'Tailoring Kit', icon: 'Package' },
  { key: 'scissors', label: 'Scissors', icon: 'Scissors' },
  { key: 'threads', label: 'Threads', icon: 'CircleDot' },
  { key: 'presser_feet', label: 'Presser Feet', icon: 'SlidersHorizontal' },
  { key: 'needles', label: 'Needles', icon: 'Pin' },
  { key: 'measuring', label: 'Measuring', icon: 'Ruler' },
  { key: 'other_tools', label: 'Other Tools', icon: 'Wrench' },
];

const DEFAULT_FASHION_SUBCATS = [
  { key: 'all', label: 'All Fashion & Textile', icon: 'Sparkles' },
  { key: 'dresses', label: 'Dresses', icon: 'Crown' },
  { key: 'tops', label: 'Tops', icon: 'Shirt' },
  { key: 'bottoms', label: 'Bottoms', icon: 'Layers' },
  { key: 'ethnic', label: 'Ethnic & Kurtis', icon: 'Sparkles' },
  { key: 'fabrics', label: 'Fabrics & Textiles', icon: 'Layers' },
  { key: 'accessories', label: 'Accessories', icon: 'ShoppingBag' },
];

/* ── Category & Subcategory Manager Modal ── */
function CategoryManagerModal({
  isOpen,
  onClose,
  activeCategory,
  products,
  customSubcats,
  onSaveCustomSubcats,
  onRenameSubcategory,
}) {
  const [targetCategory, setTargetCategory] = useState(activeCategory || 'tailoring');
  const [newLabel, setNewLabel] = useState('');
  const [editingKey, setEditingKey] = useState(null);
  const [editLabelVal, setEditLabelVal] = useState('');

  useEffect(() => {
    if (activeCategory) setTargetCategory(activeCategory);
  }, [activeCategory, isOpen]);

  if (!isOpen) return null;

  const defaults = targetCategory === 'tailoring'
    ? DEFAULT_TAILORING_SUBCATS
    : DEFAULT_FASHION_SUBCATS;

  const currentCustom = customSubcats[targetCategory] || [];

  const uniqueSubcatsMap = new Map();
  defaults.filter(d => d.key !== 'all').forEach(s => {
    const k = normalizeCategoryKey(s.key || s.id);
    if (k) uniqueSubcatsMap.set(k, { ...s, key: k, id: k });
  });

  currentCustom.forEach(s => {
    const k = normalizeCategoryKey(s.key || s.id);
    if (k && k !== 'all') {
      uniqueSubcatsMap.set(k, { ...s, key: k, id: k, label: s.label || k });
    }
  });

  // Scan products in DB for any additional custom subcategories
  products.filter(p => (p.category || '').toLowerCase() === targetCategory).forEach(p => {
    const raw = (p.sub_category || '').trim();
    const k = normalizeCategoryKey(raw);
    if (k && k !== 'all' && !uniqueSubcatsMap.has(k)) {
      const formatted = raw.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      uniqueSubcatsMap.set(k, {
        key: k,
        id: k,
        label: formatted,
        icon: 'Tag',
        isCustom: true
      });
    }
  });

  const subcatsList = Array.from(uniqueSubcatsMap.values());

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    const key = normalizeCategoryKey(trimmed);
    if (!key) return;

    if (uniqueSubcatsMap.has(key)) {
      toast('A subcategory with this name already exists', 'error');
      return;
    }

    const updated = [
      ...subcatsList.filter(c => normalizeCategoryKey(c.key) !== key),
      { key, id: key, label: trimmed, icon: 'Tag', isCustom: true, active: true }
    ];

    onSaveCustomSubcats(targetCategory, updated);
    setNewLabel('');
    toast(`Added subcategory "${trimmed}"!`, 'success');
  };

  const handleRenameSubmit = async (oldKey) => {
    const trimmed = editLabelVal.trim();
    if (!trimmed) return;
    const newKey = normalizeCategoryKey(trimmed);
    if (!newKey) return;

    await onRenameSubcategory(targetCategory, oldKey, newKey, trimmed);
    setEditingKey(null);
    setEditLabelVal('');
  };

  const handleDelete = (keyToDelete) => {
    const normKey = normalizeCategoryKey(keyToDelete);
    const usageCount = products.filter(p =>
      (p.category || '').toLowerCase() === targetCategory &&
      (normalizeCategoryKey(p.sub_category) === normKey || (p.sub_category || '').toLowerCase() === keyToDelete.toLowerCase())
    ).length;

    if (usageCount > 0) {
      toast(`Cannot delete: ${usageCount} product(s) are assigned to this subcategory`, 'error');
      return;
    }
    const updated = subcatsList.filter(c => normalizeCategoryKey(c.key) !== normKey);
    onSaveCustomSubcats(targetCategory, updated);
    toast('Subcategory removed', 'success');
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= subcatsList.length) return;
    const list = [...subcatsList];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    onSaveCustomSubcats(targetCategory, list);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', padding: '16px', boxSizing: 'border-box' }}>
      <div style={{ background: '#FFFFFF', borderRadius: '18px', width: '100%', maxWidth: '540px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '1px solid #E2E8F0' }}>
        
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF' }}>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 900, color: '#0F172A', margin: 0 }}>⚙️ Edit Categories &amp; Subcategories</h2>
            <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>Add new categories, rename or customize sub-sections</p>
          </div>
          <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}>
            <X size={16} />
          </button>
        </div>

        {/* Category Switcher Tabs inside Modal */}
        <div style={{ padding: '12px 20px 0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <button
              type="button"
              onClick={() => { setTargetCategory('tailoring'); setEditingKey(null); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '8px 12px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                fontSize: '12.5px', fontWeight: 800,
                background: targetCategory === 'tailoring' ? '#0F172A' : 'transparent',
                color: targetCategory === 'tailoring' ? '#FFFFFF' : '#475569',
                boxShadow: targetCategory === 'tailoring' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span>🧵 Tailoring</span>
            </button>
            <button
              type="button"
              onClick={() => { setTargetCategory('fashion'); setEditingKey(null); }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                padding: '8px 12px', borderRadius: '9px', border: 'none', cursor: 'pointer',
                fontSize: '12.5px', fontWeight: 800,
                background: targetCategory === 'fashion' ? '#0F172A' : 'transparent',
                color: targetCategory === 'fashion' ? '#FFFFFF' : '#475569',
                boxShadow: targetCategory === 'fashion' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <span>👗 Women Fashion</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Add New Subcategory Form */}
          <form onSubmit={handleAdd} style={{ background: '#F8FAFC', padding: '12px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', gap: '8px' }}>
            <input
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder={`Add new ${targetCategory === 'tailoring' ? 'tailoring' : 'fashion'} category chip (e.g. Sarees)...`}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', outline: 'none', background: '#FFFFFF' }}
            />
            <button
              type="submit"
              disabled={!newLabel.trim()}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '8px', background: newLabel.trim() ? '#0F172A' : '#94A3B8', color: '#FFFFFF', fontWeight: 800, fontSize: '12px', border: 'none', cursor: newLabel.trim() ? 'pointer' : 'default' }}
            >
              <Plus size={14} /> Add
            </button>
          </form>

          {/* Subcategories List */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.4px', margin: '0 0 8px' }}>
              Categories in {targetCategory === 'tailoring' ? 'Tailoring Tools' : "Women's Fashion"} ({subcatsList.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {subcatsList.map((sc, index) => {
                const normKey = normalizeCategoryKey(sc.key || sc.id);
                const count = products.filter(p =>
                  (p.category || '').toLowerCase() === targetCategory &&
                  (normalizeCategoryKey(p.sub_category) === normKey || (p.sub_category || '').toLowerCase() === normKey)
                ).length;
                const isEditing = editingKey === sc.key;

                return (
                  <div key={normKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 12px', borderRadius: '10px', background: '#FFFFFF', border: '1px solid #E2E8F0', gap: '8px' }}>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '6px', flex: 1, alignItems: 'center' }}>
                        <input
                          value={editLabelVal}
                          onChange={e => setEditLabelVal(e.target.value)}
                          autoFocus
                          style={{ flex: 1, padding: '6px 8px', borderRadius: '6px', border: '1px solid #0F172A', fontSize: '12.5px' }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRenameSubmit(sc.key)}
                          style={{ padding: '6px 12px', borderRadius: '6px', background: '#0F172A', color: '#FFFFFF', fontSize: '11px', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingKey(null)}
                          style={{ padding: '6px 10px', borderRadius: '6px', background: '#F1F5F9', color: '#475569', fontSize: '11px', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <div style={{ display: 'flex', gap: '3px', flexShrink: 0 }}>
                            <button
                              type="button"
                              className="reorder-arrow-btn"
                              onClick={() => handleMove(index, -1)}
                              disabled={index === 0}
                              title="Move Up"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              className="reorder-arrow-btn"
                              onClick={() => handleMove(index, 1)}
                              disabled={index === subcatsList.length - 1}
                              title="Move Down"
                            >
                              <ArrowDown size={13} />
                            </button>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>{sc.label}</span>
                          <span style={{ fontSize: '10.5px', background: '#F1F5F9', color: '#64748B', fontWeight: 900, padding: '2px 7px', borderRadius: '9999px' }}>
                            {count} {count === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => { setEditingKey(sc.key); setEditLabelVal(sc.label); }}
                            title="Rename subcategory"
                            style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '5px 9px', borderRadius: '6px', background: '#F1F5F9', color: '#0F172A', fontSize: '11px', fontWeight: 800, border: 'none', cursor: 'pointer' }}
                          >
                            <Edit2 size={11} /> Rename
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(sc.key)}
                            title={count > 0 ? "Cannot delete while products are assigned" : "Delete subcategory"}
                            style={{ display: 'flex', alignItems: 'center', padding: '5px 8px', borderRadius: '6px', background: count > 0 ? '#F8FAFC' : '#FEF2F2', color: count > 0 ? '#CBD5E1' : '#DC2626', fontSize: '11px', fontWeight: 800, border: 'none', cursor: count > 0 ? 'not-allowed' : 'pointer' }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', background: '#F8FAFC' }}>
          <button
            type="button"
            onClick={onClose}
            style={{ padding: '8px 18px', borderRadius: '9px', background: '#0F172A', color: '#FFFFFF', fontWeight: 800, fontSize: '12px', border: 'none', cursor: 'pointer' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminProductCard({ p, onEdit, onDuplicate, onToggleActive, onDelete }) {
  const discount = p.original_price > p.price ? Math.round((1 - p.price / p.original_price) * 100) : null;
  const stockStatus = p.stock === 0
    ? { label: 'Out of Stock', c: '#DC2626', bg: '#FEF2F2' }
    : p.stock <= 5
    ? { label: `Low: ${p.stock}`, c: '#D97706', bg: '#FFFBEB' }
    : { label: `${p.stock} in stock`, c: '#059669', bg: '#ECFDF5' };

  const isTailoring = (p.category || '').toLowerCase() === 'tailoring' || p.category !== 'fashion';
  const categoryBadge = isTailoring
    ? { label: '🧵 Tailoring', bg: '#F1F5F9', c: '#0F172A', border: '#E2E8F0' }
    : { label: "👗 Women Fashion", bg: '#FDF2F8', c: '#9D174D', border: '#FCE7F3' };

  const formatSubCat = (str) => {
    if (!str) return null;
    return str.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div style={{ background: '#FFFFFF', borderRadius: '14px', overflow: 'hidden', border: '1px solid #E5E7EB', opacity: p.active ? 1 : 0.75, display: 'flex', flexDirection: 'column', transition: 'all 0.15s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
      {/* Image Container */}
      <div className="admin-prod-card-img" style={{ position: 'relative', height: '150px', background: '#F8FAFC', overflow: 'hidden' }}>
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { e.target.style.display = 'none'; if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div style={{ display: p.image_url ? 'none' : 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', background: '#F1F5F9' }}>
          <Package size={28} strokeWidth={1} color="#94A3B8" />
        </div>

        {/* Category Pill & Discount on Image */}
        <div style={{ position: 'absolute', top: '6px', left: '6px', display: 'flex', gap: '4px', flexWrap: 'wrap', maxWidth: '85%' }}>
          <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 7px', borderRadius: '9999px', background: categoryBadge.bg, color: categoryBadge.c, border: `1px solid ${categoryBadge.border}`, backdropFilter: 'blur(4px)' }}>
            {categoryBadge.label}
          </span>
          {discount && (
            <span style={{ background: '#DC2626', color: 'white', fontSize: '9px', fontWeight: 900, padding: '2px 6px', borderRadius: '9999px' }}>
              -{discount}%
            </span>
          )}
        </div>

        {!p.active && (
          <div style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(15,23,42,0.85)', color: 'white', fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: '9999px' }}>
            Hidden
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '9px 10px 0', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {p.sub_category && (
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748B' }}>
            📁 {formatSubCat(p.sub_category)}
          </span>
        )}
        <p className="admin-prod-card-title" style={{ fontSize: '12px', fontWeight: 800, color: '#111827', lineHeight: 1.3, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {p.name}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: 'auto' }}>
          <span className="admin-prod-card-price" style={{ fontSize: '14.5px', fontWeight: 900, color: '#0F172A' }}>₹{p.price}</span>
          {p.original_price > p.price && (
            <span style={{ fontSize: '10px', color: '#94A3B8', textDecoration: 'line-through' }}>₹{p.original_price}</span>
          )}
        </div>
        {p.stock !== null && (
          <span style={{ fontSize: '9px', fontWeight: 800, color: stockStatus.c, background: stockStatus.bg, padding: '2px 6px', borderRadius: '9999px', width: 'fit-content' }}>
            {stockStatus.label}
          </span>
        )}
      </div>

      {/* Actions 2x2 */}
      <div style={{ padding: '7px 8px 8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
        <button onClick={() => onEdit(p)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', padding: '6px 4px', borderRadius: '7px', background: '#F1F5F9', color: '#1E293B', fontWeight: 800, fontSize: '10.5px', border: 'none', cursor: 'pointer' }}>
          <Edit2 size={10} /> Edit
        </button>
        <button onClick={() => onDuplicate(p)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 4px', borderRadius: '7px', background: '#F5F3FF', color: '#7C3AED', fontWeight: 800, fontSize: '10.5px', border: 'none', cursor: 'pointer' }}>
          <Copy size={10} /> Dup
        </button>
        <button onClick={() => onToggleActive(p)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 4px', borderRadius: '7px', background: p.active ? '#FFFBEB' : '#ECFDF5', color: p.active ? '#D97706' : '#059669', fontWeight: 800, fontSize: '10.5px', border: 'none', cursor: 'pointer' }}>
          {p.active ? 'Hide' : 'Show'}
        </button>
        <button onClick={() => onDelete(p.id)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', padding: '6px 4px', borderRadius: '7px', background: '#FEF2F2', color: '#DC2626', fontWeight: 800, fontSize: '10.5px', border: 'none', cursor: 'pointer' }}>
          <Trash2 size={10} /> Del
        </button>
      </div>
    </div>
  );
}

/* ── Product Modal ────────────────────────────────────────── */
function ProductModal({ product, onClose, onSave }) {
  const isEdit = !!product?.id;
  const targetProduct = isEdit ? product : null;
  const defaultCategory = (typeof product === 'object' && product?.defaultCategory)
    ? product.defaultCategory
    : (typeof product === 'string' && product.includes('fashion') ? 'fashion' : (product?.category || 'tailoring'));
  const parsed = parseProductTags(targetProduct);

  const initialVariants = (Array.isArray(targetProduct?.variants) && targetProduct.variants.length > 0)
    ? targetProduct.variants
    : (Array.isArray(parsed.variants) ? parsed.variants : []);
  const initialImages = (Array.isArray(targetProduct?.images) && targetProduct.images.length > 0)
    ? targetProduct.images
    : (Array.isArray(parsed.images) ? parsed.images : []);
  const initialVideos = (Array.isArray(targetProduct?.video_links) && targetProduct.video_links.length > 0)
    ? targetProduct.video_links
    : (Array.isArray(parsed.video_links) ? parsed.video_links : []);

  const [form, setForm] = useState({
    name: targetProduct?.name||'',
    description: parsed.cleanDesc||'',
    price: targetProduct?.price||'',
    original_price: targetProduct?.original_price||'',
    badge: parsed.badge||'',
    discount_tag: parsed.discount_tag||'',
    colors: (Array.isArray(parsed.colors) && parsed.colors.length > 0) ? parsed.colors : (targetProduct?.colors || []),
    variants_enabled: Boolean(initialVariants && initialVariants.length > 0),
    variants: initialVariants,
    bundle_enabled: parsed.bundle?.enabled ?? true,
    bundle_companions: parsed.bundle?.companionIds?.length ? parsed.bundle.companionIds : (parsed.bundle?.companionId ? [parsed.bundle.companionId] : []),
    bundle_discount: parsed.bundle?.discountPct ?? 5,
    bundle_subtitle: parsed.bundle?.subtitle || '',
    category: targetProduct?.category || defaultCategory,
    sub_category: targetProduct?.sub_category||'',
    unit: targetProduct?.unit||'',
    stock: targetProduct?.stock||'',
    image_url: targetProduct?.image_url||'',
    images: initialImages,
    video_links: initialVideos,
    active: targetProduct?.active??true,
  });
  const [customSubCat, setCustomSubCat] = useState(() => {
    return !!(targetProduct?.sub_category && !['machines','scissors','threads','needles','measuring','presser_feet','dresses','tops','bottoms','ethnic','accessories'].includes(targetProduct.sub_category));
  });
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newVT, setNewVT] = useState(''); const [newVU, setNewVU] = useState('');
  const [colorInputText, setColorInputText] = useState('');
  const [colorPickerVal, setColorPickerVal] = useState('#0F172A');
  const [varUrlInputs, setVarUrlInputs] = useState({});

  // ── Import Uploaded Products as Variants Modal States ──
  const [showImportModal, setShowImportModal] = useState(false);
  const [importSearch, setImportSearch] = useState('');
  const [selectedImportIds, setSelectedImportIds] = useState([]);
  const [deactivateOriginals, setDeactivateOriginals] = useState(true);
  const [deactivatedProductIds, setDeactivatedProductIds] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        setCatalogProducts(data || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  async function upload(file) {
    // Automatically compress to crisp WebP (< 120 KB) before uploading
    const compressed = await compressImageFile(file, { maxWidth: 1000, maxHeight: 1000, quality: 0.82 });
    const ext = (compressed.name || file.name || 'img.webp').split('.').pop() || 'webp';
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, compressed, {
      upsert: true,
      contentType: compressed.type || 'image/webp'
    });
    if (error) throw error;
    return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
  }
  async function handleMainImg(e) {
    const f = e.target.files[0]; if (!f) return; setUploading(true);
    try { const url = await upload(f); setForm(p=>({...p,image_url:url})); } catch(e){alert('Upload failed')} finally{setUploading(false);}
  }
  async function handleMoreImgs(e) {
    const files = Array.from(e.target.files); if (!files.length) return; setUploading(true);
    try { const urls=await Promise.all(files.map(upload)); setForm(p=>({...p,images:[...(p.images||[]),...urls]})); } catch(e){alert('Upload failed')} finally{setUploading(false);}
  }
  function handleRemoveImg(index) {
    setForm(p => ({...p, images: p.images.filter((_, i) => i !== index)}));
  }
  function handleMakeCover(url) {
    setForm(p => ({...p, image_url: url}));
  }

  function handleAddColorOption() {
    const val = (colorInputText || colorPickerVal || '').trim();
    if (!val) return;
    if (!(form.colors || []).some(c => typeof c === 'string' && c.toLowerCase() === val.toLowerCase())) {
      setForm(p => ({ ...p, colors: [...(p.colors || []), val] }));
    }
    setColorInputText('');
  }

  /* ── Variant Action Handlers ── */
  function handleAddVariant(initialSize = '') {
    const newVar = {
      id: `var_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      title: '',
      description: '',
      size: initialSize || '',
      color: '',
      color_value: '#0F172A',
      price: form.price !== '' && form.price !== null ? parseFloat(form.price) : 0,
      original_price: form.original_price !== '' && form.original_price !== null ? parseFloat(form.original_price) : null,
      stock: form.stock !== '' && form.stock !== null ? parseInt(form.stock) : 100,
      sku: '',
      images: [],
      is_default: (form.variants || []).length === 0,
    };
    setForm(p => ({
      ...p,
      variants_enabled: true,
      variants: [...(p.variants || []), newVar]
    }));
  }

  function handleUpdateVariant(index, field, value) {
    setForm(p => ({
      ...p,
      variants: (p.variants || []).map((v, i) => {
        if (i !== index) return v;
        const updated = { ...v, [field]: value };
        // If updating color name, auto-sync swatch if matching preset
        if (field === 'color') {
          const swatch = getColorSwatch(value);
          if (swatch) updated.color_value = swatch;
        }
        return updated;
      })
    }));
  }

  function handleCloneVariant(index) {
    const src = form.variants[index];
    const cloned = {
      ...src,
      id: `var_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      sku: src.sku ? `${src.sku}-copy` : '',
      is_default: false,
    };
    setForm(p => ({
      ...p,
      variants: [...p.variants.slice(0, index + 1), cloned, ...p.variants.slice(index + 1)]
    }));
    toast('Variant cloned!', 'success');
  }

  function handleDeleteVariant(index) {
    setForm(p => {
      const remaining = p.variants.filter((_, i) => i !== index);
      if (remaining.length > 0 && !remaining.some(v => v.is_default)) {
        remaining[0].is_default = true;
      }
      return {
        ...p,
        variants: remaining,
        variants_enabled: remaining.length > 0 ? p.variants_enabled : false
      };
    });
  }

  async function handleVariantUploadImage(varIdx, e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(files.map(upload));
      setForm(p => ({
        ...p,
        variants: (p.variants || []).map((v, i) => i === varIdx ? { ...v, images: [...(v.images || []), ...urls] } : v)
      }));
      toast(files.length === 1 ? 'Variant image uploaded!' : `${files.length} variant images uploaded!`, 'success');
    } catch (err) {
      toast('Upload failed: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  function handleVariantAddImageUrl(varIdx, url) {
    if (!url || typeof url !== 'string' || !url.trim()) return;
    setForm(p => ({
      ...p,
      variants: (p.variants || []).map((v, i) => i === varIdx ? { ...v, images: [...(v.images || []), url.trim()] } : v)
    }));
    setVarUrlInputs(p => ({ ...p, [varIdx]: '' }));
    toast('Photo URL added to variant!', 'success');
  }

  function handleVariantRemoveImage(varIdx, imgIdx) {
    setForm(p => ({
      ...p,
      variants: (p.variants || []).map((v, i) => i === varIdx ? { ...v, images: (v.images || []).filter((_, idx) => idx !== imgIdx) } : v)
    }));
  }

  function handleVariantSetCoverImage(varIdx, imgIdx) {
    setForm(p => ({
      ...p,
      variants: (p.variants || []).map((v, i) => {
        if (i !== varIdx) return v;
        const list = [...(v.images || [])];
        const [picked] = list.splice(imgIdx, 1);
        return { ...v, images: [picked, ...list] };
      })
    }));
  }

  function handleSetDefaultVariant(index) {
    setForm(p => ({
      ...p,
      variants: (p.variants || []).map((v, i) => ({ ...v, is_default: i === index }))
    }));
  }

  /* ── Import Existing Products as Variants Handler ── */
  function handleImportSelectedProducts() {
    if (selectedImportIds.length === 0) {
      toast('Please select at least one product to import', 'info');
      return;
    }
    const selectedProds = catalogProducts.filter(cp => selectedImportIds.includes(cp.id) && cp.id !== targetProduct?.id);
    if (selectedProds.length === 0) return;

    const newImportedVariants = selectedProds.map(p => {
      const parsedProd = parseProductTags(p);
      const prodImages = [];
      if (p.image_url) prodImages.push(p.image_url);
      if (Array.isArray(p.images)) {
        p.images.forEach(img => {
          if (img && !prodImages.includes(img)) prodImages.push(img);
        });
      } else if (Array.isArray(parsedProd.images)) {
        parsedProd.images.forEach(img => {
          if (img && !prodImages.includes(img)) prodImages.push(img);
        });
      }

      const detectedSize = extractSizeFromName(p.name);

      return {
        id: `var_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        title: p.name || '',
        description: parsedProd.cleanDesc || p.description || '',
        size: detectedSize || '',
        color: (parsedProd.colors && parsedProd.colors[0]) || '',
        color_value: (parsedProd.colors && getColorSwatch(parsedProd.colors[0])) || '#0F172A',
        price: p.price !== undefined && p.price !== null && p.price !== '' ? parseFloat(p.price) : (form.price !== '' ? parseFloat(form.price) : 0),
        original_price: p.original_price ? parseFloat(p.original_price) : null,
        stock: p.stock !== undefined && p.stock !== null && p.stock !== '' ? parseInt(p.stock) : 100,
        sku: p.sku || '',
        images: prodImages,
        is_default: false,
        imported_product_id: p.id,
      };
    });

    if (deactivateOriginals) {
      setDeactivatedProductIds(prev => Array.from(new Set([...prev, ...selectedImportIds])));
    }

    setForm(p => ({
      ...p,
      variants_enabled: true,
      variants: [...(p.variants || []), ...newImportedVariants]
    }));

    setSelectedImportIds([]);
    setImportSearch('');
    setShowImportModal(false);
    toast(`Successfully imported ${newImportedVariants.length} products as variants!`, 'success');
  }

  async function handleSubmit(e) {
    e.preventDefault(); if (!form.name||!form.price){alert('Name and price required');return;}
    setSaving(true);
    try {
      let finalDesc = (form.description || '')
        .replace(/\s*\[TAG:[^\]]*\]/gi, '')
        .replace(/\s*\[BUNDLE:[^\]]*\]/gi, '')
        .replace(/\s*\[VARIANTS:[^\]]*\]/gi, '')
        .replace(/\s*\[IMAGES:[^\]]*\]/gi, '')
        .replace(/\s*\[VIDEOS:[^\]]*\]/gi, '')
        .trim();

      const colorsStr = (form.colors || []).join(',');
      const tagStr = [form.badge || '', form.discount_tag || '', colorsStr].join('|');
      if (tagStr !== '||') {
        finalDesc = finalDesc ? `${finalDesc} [TAG:${tagStr}]` : `[TAG:${tagStr}]`;
      }

      const bundleStr = [
        form.bundle_enabled ? 'true' : 'false',
        (form.bundle_companions || []).join(','),
        form.bundle_discount || 5,
        form.bundle_subtitle || ''
      ].join('|');
      finalDesc = finalDesc ? `${finalDesc} [BUNDLE:${bundleStr}]` : `[BUNDLE:${bundleStr}]`;

      // Clean and Validate Variants (Supports any size format: mm, inch, XL, titles, descriptions)
      let variantsPayload = [];
      if (form.variants_enabled && form.variants && form.variants.length > 0) {
        const cleaned = form.variants
          .map(v => ({
            id: v.id || `var_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            title: (v.title || '').trim(),
            description: (v.description || '').trim(),
            size: (v.size || '').trim(),
            color: (v.color || '').trim(),
            color_value: v.color_value || '#0F172A',
            price: v.price !== undefined && v.price !== null && v.price !== '' ? parseFloat(v.price) : (form.price !== '' ? parseFloat(form.price) : 0),
            original_price: v.original_price !== undefined && v.original_price !== null && v.original_price !== '' ? parseFloat(v.original_price) : null,
            stock: v.stock !== undefined && v.stock !== null && v.stock !== '' ? parseInt(v.stock) : 100,
            sku: (v.sku || '').trim(),
            images: Array.isArray(v.images) ? v.images.filter(Boolean) : [],
            is_default: !!v.is_default
          }))
          .filter(v => v.size || v.color || v.title || (v.images && v.images.length > 0));

        if (cleaned.length > 0) {
          if (!cleaned.some(v => v.is_default)) {
            cleaned[0].is_default = true;
          }
          variantsPayload = cleaned;
        }
      }

      const imagesPayload = form.images || [];
      const videoLinksPayload = form.video_links || [];

      // Construct base payload
      const payload = {
        name: form.name.trim(),
        description: finalDesc,
        price: parseFloat(form.price) || 0,
        original_price: form.original_price ? parseFloat(form.original_price) : null,
        category: form.category,
        sub_category: form.sub_category ? normalizeCategoryKey(form.sub_category) : null,
        unit: form.unit || null,
        stock: form.stock !== '' && form.stock !== null ? parseInt(form.stock) : null,
        image_url: form.image_url || null,
        images: imagesPayload,
        video_links: videoLinksPayload,
        variants: variantsPayload,
        active: form.active ?? true,
      };

      // Resilient save loop: Try native columns first; if schema cache is missing a column, fall back to safe tag encoding
      let saved = false;
      let lastError = null;

      for (let attempt = 0; attempt < 4 && !saved; attempt++) {
        const res = isEdit
          ? await supabase.from('products').update(payload).eq('id', product.id)
          : await supabase.from('products').insert([payload]);

        if (!res.error) {
          saved = true;
          break;
        }

        const errMsg = (res.error?.message || '').toLowerCase();
        lastError = res.error;

        // Check if schema cache lacks 'variants' column
        if (errMsg.includes('variants') && 'variants' in payload) {
          delete payload.variants;
          if (variantsPayload.length > 0) {
            payload.description = `${payload.description} [VARIANTS:${encodeURIComponent(JSON.stringify(variantsPayload))}]`;
          }
          continue;
        }

        // Check if schema cache lacks 'video_links' column
        if (errMsg.includes('video_links') && 'video_links' in payload) {
          delete payload.video_links;
          if (videoLinksPayload.length > 0) {
            payload.description = `${payload.description} [VIDEOS:${encodeURIComponent(JSON.stringify(videoLinksPayload))}]`;
          }
          continue;
        }

        // Check if schema cache lacks 'images' column
        if (errMsg.includes('images') && 'images' in payload) {
          delete payload.images;
          if (imagesPayload.length > 0) {
            payload.description = `${payload.description} [IMAGES:${encodeURIComponent(JSON.stringify(imagesPayload))}]`;
          }
          continue;
        }

        // Other non-column error
        break;
      }

      if (!saved) {
        throw lastError || new Error('Failed to save product');
      }

      // Auto-deactivate original imported standalone products to prevent storefront duplication
      if (deactivatedProductIds && deactivatedProductIds.length > 0) {
        try {
          await supabase.from('products').update({ active: false }).in('id', deactivatedProductIds);
        } catch (e) {
          console.error('Error deactivating imported products:', e);
        }
      }

      toast(isEdit ? 'Product updated!' : 'Product added!', 'success');
      onSave();
    } catch(err) {
      toast('Error: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  const S = {width:'100%',padding:'9px 12px',borderRadius:'10px',border:'1.5px solid #E2E8F0',fontSize:'13px',fontFamily:'inherit',outline:'none',boxSizing:'border-box'};

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:1000,display:'flex',alignItems:'flex-end',justifyContent:'center',backdropFilter:'blur(4px)'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <motion.div initial={{y:'100%'}} animate={{y:0}} exit={{y:'100%'}} transition={{type:'spring',damping:30,stiffness:300}}
        style={{background:'white',borderRadius:'20px 20px 0 0',width:'100%',maxWidth:'560px',maxHeight:'90vh',overflowY:'auto',padding:'20px 20px 40px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <h2 style={{fontSize:'16px',fontWeight:800,color:'#0A0A0A'}}>{isEdit?'Edit Product':'Add Product'}</h2>
          <button onClick={onClose} style={{background:'#F4F4F8',border:'none',cursor:'pointer',borderRadius:'8px',padding:'6px',display:'flex'}}><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {/* Main & Multiple Gallery Images Section */}
          <div style={{ background:'#F8FAFC', padding:'12px', borderRadius:'14px', border:'1px solid #E2E8F0' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
              <label style={{ fontSize:'11px', fontWeight:800, color:'#1A1A2E', textTransform:'uppercase', letterSpacing:'.5px' }}>
                🖼️ Multiple Product Images (Cover + Gallery)
              </label>
              <span style={{ fontSize:'11px', fontWeight:700, color:'#64748B' }}>
                {(form.image_url ? 1 : 0) + (form.images?.length || 0)} Total Images
              </span>
            </div>

            {/* Upload Buttons Row */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'10px' }}>
              <label style={{ padding:'10px', borderRadius:'10px', border:'2px dashed #CBD5E1', background:'white', textAlign:'center', cursor:'pointer', fontSize:'12px', fontWeight:700, color:'#334155', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                📸 Upload Main Cover
                <input type="file" accept="image/*" style={{ display:'none' }} onChange={handleMainImg} disabled={uploading} />
              </label>

              <label style={{ padding:'10px', borderRadius:'10px', border:'2px dashed #93C5FD', background:'#EFF6FF', textAlign:'center', cursor:'pointer', fontSize:'12px', fontWeight:700, color:'#2563EB', display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                🖼️ + Add Multiple Images
                <input type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleMoreImgs} disabled={uploading} />
              </label>
            </div>

            {/* Image Thumbnails Strip */}
            <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'4px' }} className="sh-scroll-hide">
              {form.image_url && (
                <div style={{ position:'relative', width:'68px', height:'68px', borderRadius:'10px', overflow:'hidden', border:'2px solid #3B82F6', flexShrink:0, boxShadow:'0 2px 6px rgba(59,130,246,.25)' }}>
                  <img src={form.image_url} alt="Main" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <span style={{ position:'absolute', bottom:0, left:0, right:0, background:'rgba(59,130,246,.95)', color:'white', fontSize:'8px', fontWeight:900, textAlign:'center', padding:'2px 0', textTransform:'uppercase' }}>Main Cover</span>
                </div>
              )}

              {form.images?.map((url, i) => (
                <div key={i} style={{ position:'relative', width:'68px', height:'68px', borderRadius:'10px', overflow:'hidden', border:'1px solid #E2E8F0', flexShrink:0, background:'white' }}>
                  <img src={url} alt={`Gallery ${i}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  <button type="button" title="Set as Main Cover" onClick={() => handleMakeCover(url)}
                    style={{ position:'absolute', top:'3px', left:'3px', background:'rgba(0,0,0,.65)', color:'white', border:'none', borderRadius:'4px', padding:'2px 4px', fontSize:'8px', cursor:'pointer', fontWeight:700 }}>
                    ★ Cover
                  </button>
                  <button type="button" title="Remove image" onClick={() => handleRemoveImg(i)}
                    style={{ position:'absolute', top:'3px', right:'3px', background:'#EF4444', color:'white', border:'none', borderRadius:'50%', width:'18px', height:'18px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div><input placeholder="Product Name *" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required style={S}/></div>
          <textarea placeholder="Description" value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} rows={2} style={{...S,resize:'vertical'}}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <div>
              <label style={{fontSize:'10px',fontWeight:700,color:'#64748B',textTransform:'uppercase',display:'block',marginBottom:'3px'}}>Selling Price (₹) *</label>
              <input type="number" placeholder="Selling Price ₹ *" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} required style={S}/>
            </div>
            <div>
              <label style={{fontSize:'10px',fontWeight:700,color:'#64748B',textTransform:'uppercase',display:'block',marginBottom:'3px'}}>Original MRP (₹ Strikeoff)</label>
              <input type="number" placeholder="Original MRP ₹" value={form.original_price} onChange={e=>setForm(p=>({...p,original_price:e.target.value}))} style={S}/>
            </div>
          </div>

          {/* Dual Product Tags Section (Badge Tag + Written Percentage Tag) */}
          <div style={{ background:'#F8FAFC', padding:'12px', borderRadius:'14px', border:'1px solid #E2E8F0', display:'flex', flexDirection:'column', gap:'10px' }}>
            {/* Tag 1: Main Badge */}
            <div>
              <label style={{fontSize:'11px',fontWeight:800,color:'#1A1A2E',textTransform:'uppercase',display:'block',marginBottom:'4px',letterSpacing:'.5px'}}>
                🔥 1. Main Badge Tag (Top Left)
              </label>
              <input placeholder="Type or tap pill badge (e.g. 🔥 SALE, ✨ NEW)"
                value={form.badge}
                onChange={e=>setForm(p=>({...p,badge:e.target.value}))}
                style={{...S, marginBottom:'6px'}}/>

              <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                {['🔥 SALE','✨ NEW','⭐ BESTSELLER','⚡ FLASH DEAL','🔥 HOT DEAL'].map(t => (
                  <button key={t} type="button" onClick={() => setForm(p => ({...p, badge: t}))}
                    style={{ padding:'3px 9px', borderRadius:'9999px', fontSize:'10px', fontWeight:800,
                      cursor:'pointer', border: form.badge === t ? '1.5px solid #1A1A2E' : '1px solid #CBD5E1',
                      background: form.badge === t ? '#1A1A2E' : 'white',
                      color: form.badge === t ? 'white' : '#475569', transition:'all .2s' }}>
                    {t}
                  </button>
                ))}
                {form.badge && (
                  <button type="button" onClick={() => setForm(p => ({...p, badge: ''}))}
                    style={{ padding:'3px 9px', borderRadius:'9999px', fontSize:'10px', fontWeight:800,
                      cursor:'pointer', border:'1px solid #FECDD3', background:'#FFF1F2', color:'#EF4444' }}>
                    ✕ Clear Badge
                  </button>
                )}
              </div>
            </div>

            {/* Tag 2: Written Percentage Tag */}
            <div>
              <label style={{fontSize:'11px',fontWeight:800,color:'#E94560',textTransform:'uppercase',display:'block',marginBottom:'4px',letterSpacing:'.5px'}}>
                🏷️ 2. Written Percentage Tag (Top Right)
              </label>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'6px'}}>
                <input placeholder="Percentage tag (e.g. -17% OFF)"
                  value={form.discount_tag}
                  onChange={e=>setForm(p=>({...p,discount_tag:e.target.value}))}
                  style={S}/>

                {form.price && form.original_price && Number(form.original_price) > Number(form.price) && (
                  <button type="button"
                    onClick={() => setForm(p => ({...p, discount_tag: `-${Math.round((1 - Number(p.price) / Number(p.original_price)) * 100)}% OFF`}))}
                    style={{ padding:'8px 10px', borderRadius:'10px', background:'#FFF1F2', border:'1px solid #FECDD3', color:'#E94560', fontWeight:800, fontSize:'11px', cursor:'pointer' }}>
                    Auto: -{Math.round((1 - Number(form.price) / Number(form.original_price)) * 100)}% OFF
                  </button>
                )}
              </div>
              <div style={{display:'flex',gap:'5px',flexWrap:'wrap'}}>
                {['-10% OFF','-17% OFF','-25% OFF','-30% OFF','-50% OFF'].map(pTag => (
                  <button key={pTag} type="button" onClick={() => setForm(p => ({...p, discount_tag: pTag}))}
                    style={{ padding:'3px 9px', borderRadius:'9999px', fontSize:'10px', fontWeight:800,
                      cursor:'pointer', border: form.discount_tag === pTag ? '1.5px solid #E94560' : '1px solid #FECDD3',
                      background: form.discount_tag === pTag ? '#E94560' : '#FFF1F2',
                      color: form.discount_tag === pTag ? 'white' : '#E94560', transition:'all .2s' }}>
                    {pTag}
                  </button>
                ))}
                {form.discount_tag && (
                  <button type="button" onClick={() => setForm(p => ({...p, discount_tag: ''}))}
                    style={{ padding:'3px 9px', borderRadius:'9999px', fontSize:'10px', fontWeight:800,
                      cursor:'pointer', border:'1px solid #FECDD3', background:'#FFF1F2', color:'#EF4444' }}>
                    ✕ Clear Tag
                  </button>
                )}
              </div>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value,sub_category:''}))} style={S}>
              <option value="tailoring">🪡 Tailoring</option>
              <option value="fashion">👗 Fashion</option>
            </select>
            <div>
              <select value={customSubCat ? 'custom' : form.sub_category}
                onChange={e => {
                  if (e.target.value === 'custom') {
                    setCustomSubCat(true);
                    setForm(p => ({ ...p, sub_category: '' }));
                  } else {
                    setCustomSubCat(false);
                    setForm(p => ({ ...p, sub_category: e.target.value }));
                  }
                }} style={S}>
                <option value="">Select subcategory...</option>
                {(() => {
                  try {
                    const defaults = form.category === 'tailoring'
                      ? DEFAULT_TAILORING_SUBCATS.filter(d => d.key !== 'all')
                      : DEFAULT_FASHION_SUBCATS.filter(d => d.key !== 'all');
                    const stored = localStorage.getItem('asmalabel_custom_subcategories_v1');
                    const custom = stored ? JSON.parse(stored) : { tailoring: [], fashion: [] };
                    const map = new Map();
                    defaults.forEach(d => {
                      const k = normalizeCategoryKey(d.key || d.id);
                      map.set(k, d.label);
                    });
                    (custom[form.category] || []).forEach(c => {
                      const k = normalizeCategoryKey(c.key || c.id);
                      if (k) map.set(k, c.label || k);
                    });
                    return Array.from(map.entries()).map(([k, l]) => (
                      <option key={k} value={k}>{l}</option>
                    ));
                  } catch {
                    return (form.category==='tailoring'?['machines','scissors','threads','needles','measuring','presser_feet','other_tools']:['dresses','tops','bottoms','ethnic','accessories']).map(s=><option key={s} value={s}>{s}</option>);
                  }
                })()}
                <option value="custom">✏️ + Type New Subcategory...</option>
              </select>
              {(customSubCat || (form.sub_category && !['machines','scissors','threads','needles','measuring','presser_feet','other_tools','dresses','tops','bottoms','ethnic','fabrics','accessories'].includes(normalizeCategoryKey(form.sub_category)))) && (
                <input placeholder="Type custom subcategory (e.g. blouses)"
                  value={form.sub_category}
                  onChange={e => setForm(p => ({ ...p, sub_category: e.target.value }))}
                  style={{ ...S, marginTop:'6px' }} />
              )}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <input placeholder="Unit (e.g. 1 piece)" value={form.unit} onChange={e=>setForm(p=>({...p,unit:e.target.value}))} style={S}/>
            <input type="number" placeholder="Stock" value={form.stock} onChange={e=>setForm(p=>({...p,stock:e.target.value}))} style={S}/>
          </div>

          {/* Color Swatches Option */}
          <div style={{ background:'#F8FAFC', padding:'14px', borderRadius:'14px', border:'1px solid #E2E8F0', display:'flex', flexDirection:'column', gap:'12px' }}>
            <div>
              <label style={{ fontSize:'11px', fontWeight:800, color:'#1A1A2E', textTransform:'uppercase', display:'block', marginBottom:'2px', letterSpacing:'.5px' }}>
                🎨 Color Swatches / Options (Optional)
              </label>
              <p style={{ fontSize:'11px', color:'#64748B', margin:0 }}>
                Colors added here will display as interactive color selectors in the customer overview.
              </p>
            </div>

            {/* Current Added Colors as Clean Chips */}
            {form.colors?.length > 0 ? (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {form.colors.map((c, i) => {
                  const cName = getColorName(c);
                  const swatch = getColorSwatch(c);
                  const isHex = typeof c === 'string' && c.startsWith('#');
                  return (
                    <span
                      key={i}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: '#0F172A',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                      }}
                    >
                      <span
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: swatch,
                          border: '1px solid rgba(0,0,0,0.15)',
                          flexShrink: 0
                        }}
                      />
                      <span>{cName}</span>
                      {isHex && (
                        <span style={{ color: '#94A3B8', fontSize: '10px', fontWeight: 500 }}>({c})</span>
                      )}
                      <button
                        type="button"
                        onClick={() => setForm(p => ({ ...p, colors: p.colors.filter((_, idx) => idx !== i) }))}
                        title={`Remove ${cName}`}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#94A3B8',
                          padding: '0 0 0 2px',
                          display: 'flex',
                          alignItems: 'center',
                          transition: 'color 0.15s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#EF4444'}
                        onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}
                      >
                        <X size={13} />
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : (
              <div style={{ fontSize: '11px', color: '#94A3B8', fontStyle: 'italic', padding: '2px 0' }}>
                No colors added yet. Tap presets below or add a custom color.
              </div>
            )}

            {/* Quick 1-Tap Preset Colors */}
            <div>
              <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#64748B', display: 'block', marginBottom: '6px' }}>
                Quick Add Presets:
              </span>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {PRESET_COLORS.slice(0, 12).map(p => {
                  const isAdded = (form.colors || []).some(c => typeof c === 'string' && (c.toLowerCase() === p.name.toLowerCase() || c.toLowerCase() === p.hex.toLowerCase()));
                  return (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => {
                        if (isAdded) {
                          setForm(prev => ({ ...prev, colors: (prev.colors || []).filter(c => typeof c === 'string' && c.toLowerCase() !== p.name.toLowerCase() && c.toLowerCase() !== p.hex.toLowerCase()) }));
                        } else {
                          setForm(prev => ({ ...prev, colors: [...(prev.colors || []), p.name] }));
                        }
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 9px',
                        borderRadius: '8px',
                        background: isAdded ? '#0F172A' : '#FFFFFF',
                        color: isAdded ? '#FFFFFF' : '#334155',
                        border: isAdded ? '1px solid #0F172A' : '1px solid #E2E8F0',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span
                        style={{
                          width: '9px',
                          height: '9px',
                          borderRadius: '50%',
                          background: p.hex,
                          border: isAdded ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(0,0,0,0.15)',
                          flexShrink: 0
                        }}
                      />
                      {p.name} {isAdded ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Input Row — Responsive & Clean */}
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ position: 'relative', width: '38px', height: '38px', flexShrink: 0 }}>
                <input
                  type="color"
                  value={colorPickerVal}
                  onChange={e => {
                    setColorPickerVal(e.target.value);
                    if (!colorInputText) setColorInputText(e.target.value);
                  }}
                  title="Choose Color"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    padding: '2px',
                    background: '#FFFFFF',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <input
                placeholder="Color name or hex (e.g. Navy Blue, #D92F32)"
                value={colorInputText}
                onChange={e => setColorInputText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddColorOption(); } }}
                style={{
                  ...S,
                  flex: 1,
                  minWidth: 0,
                  background: '#FFFFFF',
                  fontSize: '12px'
                }}
              />
              <button
                type="button"
                onClick={handleAddColorOption}
                style={{
                  padding: '9px 14px',
                  borderRadius: '9px',
                  background: '#0F172A',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                + Add
              </button>
            </div>
          </div>

          {/* Buy More, Save More (Bundle Deal) Configuration */}
          <div style={{ background:'linear-gradient(135deg, #FFFDFB 0%, #FAF5EE 100%)', padding:'14px', borderRadius:'16px', border:'1.5px solid #F1E5D6', display:'flex', flexDirection:'column', gap:'10px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <label style={{ fontSize:'12px', fontWeight:900, color:'#8A6133', display:'flex', alignItems:'center', gap:'6px', margin:0 }}>
                <span>💎 Buy More, Save More (Bundle Deal)</span>
              </label>
              <label style={{ display:'flex', alignItems:'center', gap:'6px', cursor:'pointer', fontSize:'12px', fontWeight:800, color: form.bundle_enabled ? '#16A34A' : '#64748B' }}>
                <input
                  type="checkbox"
                  checked={form.bundle_enabled}
                  onChange={e => setForm(p => ({ ...p, bundle_enabled: e.target.checked }))}
                  style={{ width:'16px', height:'16px', cursor:'pointer' }}
                />
                {form.bundle_enabled ? 'ON' : 'OFF'}
              </label>
            </div>

            {form.bundle_enabled && (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px', paddingTop:'8px', borderTop:'1px solid #EBDCCB' }}>
                {/* Multi-Companion Product Picker */}
                <div>
                  <label style={{ fontSize:'11px', fontWeight:700, color:'#64748B', display:'block', marginBottom:'4px' }}>
                    Bundled Products ({form.bundle_companions?.length || 0} selected):
                  </label>
                  
                  {/* Selected product chips */}
                  {form.bundle_companions?.length > 0 && (
                    <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'8px' }}>
                      {form.bundle_companions.map(cid => {
                        const comp = catalogProducts.find(p => p.id === cid);
                        return (
                          <span key={cid} style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'4px 10px', borderRadius:'8px', background:'#FFFFFF', border:'1px solid #CBD5E1', fontSize:'11.5px', fontWeight:700, color:'#0F172A', boxShadow:'0 1px 4px rgba(0,0,0,0.03)' }}>
                            <span>{comp?.name || cid.slice(0, 8)} (₹{comp?.price || '0'})</span>
                            <button
                              type="button"
                              onClick={() => setForm(p => ({ ...p, bundle_companions: p.bundle_companions.filter(id => id !== cid) }))}
                              style={{ background:'none', border:'none', cursor:'pointer', color:'#EF4444', padding:0, display:'flex', alignItems:'center' }}
                            >
                              <X size={12} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Add Companion Dropdown */}
                  <select
                    value=""
                    onChange={e => {
                      const val = e.target.value;
                      if (val && !form.bundle_companions?.includes(val)) {
                        setForm(p => ({ ...p, bundle_companions: [...(p.bundle_companions || []), val] }));
                      }
                    }}
                    style={{ ...S, background:'#FFFFFF' }}
                  >
                    <option value="">+ Add Product to Bundle...</option>
                    {catalogProducts.filter(cp => cp.id !== product?.id && !form.bundle_companions?.includes(cp.id)).map(cp => (
                      <option key={cp.id} value={cp.id}>
                        {cp.name} (₹{cp.price})
                      </option>
                    ))}
                  </select>
                  <span style={{ fontSize:'10.5px', color:'#94A3B8', marginTop:'3px', display:'block' }}>
                    You can bundle 1, 2, 3, or more companion products together. If none selected, the first related accessory is used automatically.
                  </span>
                </div>

                {/* Bundle Discount % & Custom Subtitle */}
                <div style={{ display:'grid', gridTemplateColumns:'120px 1fr', gap:'8px' }}>
                  <div>
                    <label style={{ fontSize:'11px', fontWeight:700, color:'#64748B', display:'block', marginBottom:'4px' }}>
                      Bundle Discount %:
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="90"
                      placeholder="e.g. 5"
                      value={form.bundle_discount}
                      onChange={e => setForm(p => ({ ...p, bundle_discount: e.target.value }))}
                      style={{ ...S, background:'#FFFFFF' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize:'11px', fontWeight:700, color:'#64748B', display:'block', marginBottom:'4px' }}>
                      Bundle Subtitle / Hook:
                    </label>
                    <input
                      placeholder="e.g. Collect both Asmalabel signatures and enjoy an exclusive discount ✨"
                      value={form.bundle_subtitle}
                      onChange={e => setForm(p => ({ ...p, bundle_subtitle: e.target.value }))}
                      style={{ ...S, background:'#FFFFFF' }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              PRODUCT VARIANTS SECTION (Sizes, Colors, SKUs, Stocks, Images)
              ══════════════════════════════════════════════════════════ */}
          <div style={{
            background: form.variants_enabled ? '#F8FAFC' : '#FFFFFF',
            padding: '16px',
            borderRadius: '16px',
            border: form.variants_enabled ? '1.5px solid #0F172A' : '1.5px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            transition: 'all 0.2s ease'
          }}>
            {/* Header with Enable Switch */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13.5px', fontWeight: 900, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                    📦 Product Variants
                  </span>
                  {form.variants_enabled && (
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#FFFFFF', background: '#0F172A', padding: '2px 8px', borderRadius: '6px' }}>
                      {form.variants?.length || 0} {form.variants?.length === 1 ? 'Variant' : 'Variants'}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0', fontWeight: 500 }}>
                  Enable different sizes, colors, prices, and variant-specific photo galleries.
                </p>
              </div>

              <label style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                background: form.variants_enabled ? '#0F172A' : '#F1F5F9',
                color: form.variants_enabled ? '#FFFFFF' : '#475569',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 800,
                transition: 'all 0.2s ease',
                userSelect: 'none'
              }}>
                <input
                  type="checkbox"
                  checked={form.variants_enabled}
                  onChange={e => {
                    const checked = e.target.checked;
                    if (checked && (!form.variants || form.variants.length === 0)) {
                      handleAddVariant();
                    } else {
                      setForm(p => ({ ...p, variants_enabled: checked }));
                    }
                  }}
                  style={{ width: '15px', height: '15px', cursor: 'pointer', accentColor: '#30D158' }}
                />
                <span>{form.variants_enabled ? 'Variants Enabled ✓' : 'Enable Variants'}</span>
              </label>
            </div>

            {/* Variant List Body */}
            {form.variants_enabled && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '10px', borderTop: '1px solid #E2E8F0' }}>
                {(form.variants || []).map((v, vIdx) => (
                  <div key={v.id || vIdx} style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    border: v.is_default ? '2px solid #0F172A' : '1px solid #CBD5E1',
                    padding: '14px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    {/* Variant Card Header: Default Badge & Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 800, color: v.is_default ? '#0F172A' : '#64748B' }}>
                        <input
                          type="radio"
                          name="default_variant"
                          checked={!!v.is_default}
                          onChange={() => handleSetDefaultVariant(vIdx)}
                          style={{ cursor: 'pointer' }}
                        />
                        <span>{v.is_default ? '★ Default / Cover Variant' : 'Set as Default'}</span>
                      </label>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => handleCloneVariant(vIdx)}
                          title="Duplicate / Clone Variant"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            color: '#0F172A',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Copy size={11} /> Clone
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteVariant(vIdx)}
                          title="Delete Variant"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            background: '#FEF2F2',
                            border: '1px solid #FEE2E2',
                            color: '#EF4444',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                    </div>

                    {/* Row 1: Variant Title & Description */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#F8FAFC', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '3px' }}>
                          Variant Title / Spec (Optional)
                        </label>
                        <input
                          placeholder="e.g. 1.6mm (1/16) Narrow Rolled Hemmer Presser Foot"
                          value={v.title || ''}
                          onChange={e => handleUpdateVariant(vIdx, 'title', e.target.value)}
                          style={{ ...S, background: '#FFFFFF' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '3px' }}>
                          Variant Description / Features (Optional)
                        </label>
                        <textarea
                          placeholder="e.g. Specially designed for 1.6mm delicate chiffon and silk rolled edges. High durability steel."
                          value={v.description || ''}
                          onChange={e => handleUpdateVariant(vIdx, 'description', e.target.value)}
                          rows={2}
                          style={{ ...S, background: '#FFFFFF', resize: 'vertical', minHeight: '48px', fontFamily: 'inherit', fontSize: '12px' }}
                        />
                      </div>
                    </div>

                    {/* Row 2: Size & Color Inputs (Fully Responsive for Mobile & PC) */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                      <div style={{ minWidth: 0 }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                          {form.category === 'tailoring' ? '📏 Sizing Menu (mm, inches, pack)' : '👗 Sizing Menu (XS, S, M, L, XL)'} *
                        </label>
                        
                        {/* Primary Dropdown Menu (No button pills) */}
                        <select
                          value={v.size || ''}
                          onChange={e => handleUpdateVariant(vIdx, 'size', e.target.value)}
                          style={{
                            ...S,
                            width: '100%',
                            background: '#FFFFFF',
                            fontWeight: 700,
                            color: '#0F172A',
                            cursor: 'pointer',
                            marginBottom: '6px'
                          }}
                        >
                          <option value="">
                            -- Select {form.category === 'tailoring' ? 'Tailoring Size / Unit' : 'Fashion Size'} --
                          </option>
                          {form.category === 'tailoring' ? (
                            <>
                              <optgroup label="📏 Millimeters (mm)">
                                <option value="1.0mm">1.0mm</option>
                                <option value="1.6mm">1.6mm (1/16")</option>
                                <option value="2.0mm">2.0mm</option>
                                <option value="2.4mm">2.4mm (3/32")</option>
                                <option value="3.0mm">3.0mm</option>
                                <option value="3.2mm">3.2mm (1/8")</option>
                                <option value="4.0mm">4.0mm (5/32")</option>
                                <option value="4.8mm">4.8mm (3/16")</option>
                                <option value="5.0mm">5.0mm</option>
                                <option value="6.0mm">6.0mm</option>
                                <option value="6.4mm">6.4mm (1/4")</option>
                                <option value="8.0mm">8.0mm (5/16")</option>
                                <option value="9.5mm">9.5mm (3/8")</option>
                                <option value="10.0mm">10.0mm</option>
                                <option value="12.0mm">12.0mm (1/2")</option>
                              </optgroup>
                              <optgroup label="📐 Inches (e.g. 12 x 22 Inches)">
                                <option value="12 x 22 Inches">12 x 22 Inches</option>
                                <option value="0.5 Inch">0.5 Inch (1/2")</option>
                                <option value="1.0 Inch">1.0 Inch</option>
                                <option value="1.5 Inch">1.5 Inch</option>
                                <option value="2.0 Inch">2.0 Inch</option>
                                <option value="3.0 Inch">3.0 Inch</option>
                                <option value="4.0 Inch">4.0 Inch</option>
                                <option value="6.0 Inch">6.0 Inch</option>
                                <option value="8.0 Inch">8.0 Inch</option>
                                <option value="10.0 Inch">10.0 Inch</option>
                                <option value="12.0 Inch">12.0 Inch</option>
                                <option value="60 Inch (150 cm)">60 Inch (150 cm)</option>
                              </optgroup>
                              <optgroup label="📦 Packs & Standards">
                                <option value="Standard">Standard / Universal</option>
                                <option value="Pack of 1">Pack of 1</option>
                                <option value="Pack of 3">Pack of 3</option>
                                <option value="Pack of 5">Pack of 5</option>
                                <option value="Pack of 10">Pack of 10</option>
                                <option value="Free Size">Free Size</option>
                              </optgroup>
                            </>
                          ) : (
                            <>
                              <optgroup label="👗 Standard Apparel Sizes">
                                <option value="XS">XS (Extra Small)</option>
                                <option value="S">S (Small)</option>
                                <option value="M">M (Medium)</option>
                                <option value="L">L (Large)</option>
                                <option value="XL">XL (Extra Large)</option>
                                <option value="2XL">2XL (Double XL)</option>
                                <option value="3XL">3XL (Triple XL)</option>
                                <option value="4XL">4XL</option>
                                <option value="5XL">5XL</option>
                                <option value="Free Size">Free Size / Universal Fit</option>
                              </optgroup>
                              <optgroup label="🔢 Numeric Waist/Bust (Inches)">
                                <option value="28">28</option>
                                <option value="30">30</option>
                                <option value="32">32</option>
                                <option value="34">34</option>
                                <option value="36">36</option>
                                <option value="38">38</option>
                                <option value="40">40</option>
                                <option value="42">42</option>
                                <option value="44">44</option>
                              </optgroup>
                              <optgroup label="🧒 Kids & Custom">
                                <option value="Kids (2-4 Yrs)">Kids (2-4 Yrs)</option>
                                <option value="Kids (5-7 Yrs)">Kids (5-7 Yrs)</option>
                                <option value="Kids (8-10 Yrs)">Kids (8-10 Yrs)</option>
                                <option value="Kids (11-14 Yrs)">Kids (11-14 Yrs)</option>
                                <option value="Unstitched">Unstitched / Fabric Material</option>
                              </optgroup>
                            </>
                          )}
                          {v.size && (
                            <option value={v.size}>Selected: {v.size}</option>
                          )}
                        </select>

                        {/* Direct Editable Input for Custom values like "12 x 22 Inches" */}
                        <input
                          placeholder="Or type custom (e.g. 12 x 22 Inches)..."
                          value={v.size || ''}
                          onChange={e => handleUpdateVariant(vIdx, 'size', e.target.value)}
                          style={{ ...S, width: '100%', fontSize: '12px', background: '#F8FAFC', color: '#0F172A', fontWeight: 600 }}
                        />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                          🎨 Color (Optional, e.g. Black, Red, Gold)
                        </label>
                        
                        {/* Clean Text Color Input (No stretched black bars) */}
                        <input
                          placeholder="e.g. Black, Crimson Red, Gold..."
                          value={v.color || ''}
                          onChange={e => handleUpdateVariant(vIdx, 'color', e.target.value)}
                          style={{ ...S, width: '100%', fontWeight: 700 }}
                        />

                        {/* Quick Color Presets */}
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center', marginTop: '6px' }}>
                          {PRESET_COLORS.slice(0, 8).map(pc => {
                            const isChosen = (v.color || '').toLowerCase() === pc.name.toLowerCase();
                            return (
                              <button
                                key={pc.name}
                                type="button"
                                onClick={() => {
                                  handleUpdateVariant(vIdx, 'color', pc.name);
                                  handleUpdateVariant(vIdx, 'color_value', pc.hex);
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '3px 7px',
                                  borderRadius: '6px',
                                  background: isChosen ? '#0F172A' : '#FFFFFF',
                                  color: isChosen ? '#FFFFFF' : '#334155',
                                  border: isChosen ? '1px solid #0F172A' : '1px solid #CBD5E1',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                  cursor: 'pointer'
                                }}
                              >
                                <span
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: pc.hex,
                                    border: '1px solid rgba(0,0,0,0.15)',
                                    flexShrink: 0
                                  }}
                                />
                                {pc.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Price, MRP, Stock, SKU */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: '8px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>
                          Selling Price (₹) *
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 1999"
                          value={v.price !== undefined && v.price !== null ? v.price : ''}
                          onChange={e => handleUpdateVariant(vIdx, 'price', e.target.value)}
                          style={S}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>
                          MRP (₹)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 2999"
                          value={v.original_price !== undefined && v.original_price !== null ? v.original_price : ''}
                          onChange={e => handleUpdateVariant(vIdx, 'original_price', e.target.value)}
                          style={S}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>
                          Stock Units
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 100"
                          value={v.stock !== undefined && v.stock !== null ? v.stock : ''}
                          onChange={e => handleUpdateVariant(vIdx, 'stock', e.target.value)}
                          style={S}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '3px' }}>
                          SKU (Optional)
                        </label>
                        <input
                          placeholder="e.g. HEM-16-MM"
                          value={v.sku || ''}
                          onChange={e => handleUpdateVariant(vIdx, 'sku', e.target.value)}
                          style={S}
                        />
                      </div>
                    </div>

                    {/* Row 4: Variant-Specific Images Manager (Same as Main Product) */}
                    <div style={{ background: '#F8FAFC', padding: '10px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A', display: 'block', marginBottom: '6px' }}>
                        📷 Variant-Specific Images ({v.images?.length || 0})
                      </label>
                      <p style={{ fontSize: '10.5px', color: '#64748B', margin: '0 0 8px', lineHeight: 1.4 }}>
                        Upload or add photos specific to this size/spec. If none added, it cleanly falls back to the product's main gallery.
                      </p>

                      {/* Variant Thumbnails */}
                      {v.images?.length > 0 && (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          {v.images.map((img, imgIdx) => (
                            <div key={imgIdx} style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: imgIdx === 0 ? '2px solid #0F172A' : '1px solid #CBD5E1' }}>
                              <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              {imgIdx === 0 && (
                                <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(15,23,42,0.85)', color: 'white', fontSize: '8px', fontWeight: 800, textAlign: 'center', padding: '1px 0' }}>
                                  COVER
                                </span>
                              )}
                              <div style={{ position: 'absolute', top: 2, right: 2, display: 'flex', gap: '2px' }}>
                                {imgIdx !== 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleVariantSetCoverImage(vIdx, imgIdx)}
                                    title="Make Cover Image"
                                    style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#0F172A', color: 'white', border: 'none', cursor: 'pointer', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                  >
                                    ★
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleVariantRemoveImage(vIdx, imgIdx)}
                                  title="Delete photo"
                                  style={{ width: '16px', height: '16px', borderRadius: '50%', background: '#EF4444', color: 'white', border: 'none', cursor: 'pointer', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Image Upload & Direct URL Input Row */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <label style={{ padding: '7px 14px', borderRadius: '8px', background: '#FFFFFF', border: '1.5px dashed #CBD5E1', fontSize: '11.5px', fontWeight: 700, color: '#0F172A', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <Upload size={13} /> {uploading ? 'Uploading...' : '📷 + Upload Photos'}
                          <input type="file" accept="image/*" multiple onChange={e => handleVariantUploadImage(vIdx, e)} style={{ display: 'none' }} disabled={uploading} />
                        </label>

                        <div style={{ display: 'flex', gap: '4px', flex: 1, minWidth: '180px' }}>
                          <input
                            placeholder="Or paste image URL (https://...)"
                            value={varUrlInputs[vIdx] || ''}
                            onChange={e => setVarUrlInputs(p => ({ ...p, [vIdx]: e.target.value }))}
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleVariantAddImageUrl(vIdx, varUrlInputs[vIdx]);
                              }
                            }}
                            style={{ ...S, background: '#FFFFFF', fontSize: '11px', flex: 1 }}
                          />
                          <button
                            type="button"
                            onClick={() => handleVariantAddImageUrl(vIdx, varUrlInputs[vIdx])}
                            style={{
                              padding: '6px 10px',
                              borderRadius: '8px',
                              background: '#0F172A',
                              color: '#FFFFFF',
                              fontWeight: 700,
                              fontSize: '11px',
                              border: 'none',
                              cursor: 'pointer',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            + Add URL
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}

                {/* Clean Category-Specific Quick Add Bar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: '#F8FAFC', padding: '12px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#0F172A' }}>
                      ⚡ 1-Tap Quick Add:
                    </span>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {(form.category === 'tailoring'
                        ? ['1.6mm', '2.4mm', '3.2mm', '4.8mm', '6.4mm', '8.0mm', 'Inches', 'Standard']
                        : ['S', 'M', 'L', 'XL', '2XL', 'Free Size']
                      ).map(qs => (
                        <button
                          key={qs}
                          type="button"
                          onClick={() => handleAddVariant(qs === 'Inches' ? '12 x 22 Inches' : qs)}
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            color: '#0F172A',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          + {qs}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons Row: Add Custom & Import Existing */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => handleAddVariant()}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        background: '#FFFFFF',
                        border: '1.5px dashed #0F172A',
                        color: '#0F172A',
                        fontWeight: 800,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Plus size={14} /> + Blank Custom Variant
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowImportModal(true)}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        border: 'none',
                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <Download size={13} /> 📥 Import {form.category === 'tailoring' ? 'Tailoring' : 'Fashion'} Products
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Modal: Import Uploaded Products as Variants ── */}
            {showImportModal && (
              <div style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(6px)',
                zIndex: 1100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
              }}
              onClick={e => { if (e.target === e.currentTarget) setShowImportModal(false); }}>
                <div style={{
                  background: '#FFFFFF',
                  borderRadius: '20px',
                  width: '100%',
                  maxWidth: '520px',
                  maxHeight: '85vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  overflow: 'hidden'
                }}>
                  {/* Header */}
                  <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                        📥 Import Uploaded Products as Variants
                      </h3>
                      <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0', fontWeight: 600 }}>
                        Showing <strong>{form.category === 'tailoring' ? '🪡 Tailoring Products' : '👗 Fashion Products'}</strong> only (matching current product category).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowImportModal(false)}
                      style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B' }}
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div style={{ padding: '12px 20px', borderBottom: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                    <div style={{ position: 'relative' }}>
                      <Search size={15} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        placeholder={`Search ${form.category === 'tailoring' ? 'tailoring tools' : 'fashion products'} by name or subcategory...`}
                        value={importSearch}
                        onChange={e => setImportSearch(e.target.value)}
                        style={{
                          ...S,
                          paddingLeft: '34px',
                          background: '#FFFFFF',
                          fontSize: '12.5px'
                        }}
                      />
                      {importSearch && (
                        <button
                          type="button"
                          onClick={() => setImportSearch('')}
                          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
                        >
                          <X size={13} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Products List */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(() => {
                      const targetCategory = (form.category || targetProduct?.category || 'tailoring').toLowerCase();

                      const filtered = (catalogProducts || [])
                        .filter(cp => cp.id !== targetProduct?.id)
                        .filter(cp => (cp.category || 'tailoring').toLowerCase() === targetCategory)
                        .filter(cp => {
                          if (!importSearch.trim()) return true;
                          const q = importSearch.toLowerCase();
                          return (cp.name || '').toLowerCase().includes(q) || (cp.sub_category || '').toLowerCase().includes(q);
                        });

                      if (filtered.length === 0) {
                        return (
                          <div style={{ padding: '30px 10px', textAlign: 'center', color: '#94A3B8', fontSize: '13px' }}>
                            No matching {targetCategory === 'tailoring' ? 'tailoring products' : 'fashion products'} found to import.
                          </div>
                        );
                      }

                      return filtered.map(cp => {
                        const isChecked = selectedImportIds.includes(cp.id);
                        const detectedSize = extractSizeFromName(cp.name);

                        return (
                          <div
                            key={cp.id}
                            onClick={() => {
                              setSelectedImportIds(prev =>
                                isChecked ? prev.filter(id => id !== cp.id) : [...prev, cp.id]
                              );
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '10px 12px',
                              borderRadius: '12px',
                              border: isChecked ? '1.5px solid #0F172A' : '1px solid #E2E8F0',
                              background: isChecked ? '#F8FAFC' : '#FFFFFF',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              style={{ width: '16px', height: '16px', accentColor: '#0F172A', cursor: 'pointer' }}
                            />

                            <div style={{ width: '42px', height: '42px', borderRadius: '8px', overflow: 'hidden', background: '#F1F5F9', flexShrink: 0, border: '1px solid #E2E8F0' }}>
                              <img
                                src={getProductImage(cp)}
                                alt=""
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                onError={e => { e.target.src = 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&auto=format&fit=crop&q=80'; }}
                              />
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <p style={{ fontSize: '12.5px', fontWeight: 800, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {cp.name}
                              </p>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 900, color: '#0F172A' }}>₹{Number(cp.price || 0).toFixed(0)}</span>
                                {detectedSize && (
                                  <span style={{ fontSize: '10px', fontWeight: 800, background: '#0F172A', color: '#FFFFFF', padding: '1px 6px', borderRadius: '4px' }}>
                                    Size: {detectedSize}
                                  </span>
                                )}
                                <span style={{ fontSize: '11px', color: '#64748B' }}>
                                  Stock: {cp.stock ?? '100'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Footer & Actions */}
                  <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', background: '#F8FAFC', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11.5px', fontWeight: 600, color: '#334155' }}>
                      <input
                        type="checkbox"
                        checked={deactivateOriginals}
                        onChange={e => setDeactivateOriginals(e.target.checked)}
                        style={{ width: '15px', height: '15px', accentColor: '#0F172A', cursor: 'pointer' }}
                      />
                      <span>Deactivate original standalone products in store (Avoid duplicate listings)</span>
                    </label>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => { setShowImportModal(false); setSelectedImportIds([]); }}
                        style={{
                          padding: '9px 16px',
                          borderRadius: '10px',
                          background: '#FFFFFF',
                          border: '1px solid #CBD5E1',
                          color: '#475569',
                          fontWeight: 700,
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleImportSelectedProducts}
                        disabled={selectedImportIds.length === 0}
                        style={{
                          padding: '9px 18px',
                          borderRadius: '10px',
                          background: selectedImportIds.length > 0 ? '#0F172A' : '#94A3B8',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '12px',
                          border: 'none',
                          cursor: selectedImportIds.length > 0 ? 'pointer' : 'not-allowed',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Download size={13} /> Import as Variants ({selectedImportIds.length})
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Video links */}
          <div>
            <p style={{fontSize:'11px',fontWeight:700,color:'#8E8E93',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'.5px'}}>Video Links</p>
            {form.video_links?.map((v,i)=>(
              <div key={i} style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 10px',background:'#F0FDF4',borderRadius:'8px',marginBottom:'6px'}}>
                <span style={{fontSize:'12px',fontWeight:600,color:'#16A34A',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.title}</span>
                <button type="button" onClick={()=>setForm(p=>({...p,video_links:p.video_links.filter((_,j)=>j!==i)}))} style={{background:'none',border:'none',cursor:'pointer',color:'#EF4444',display:'flex'}}><X size={12}/></button>
              </div>
            ))}
            <div style={{display:'flex',flexDirection:'column',gap:'6px',padding:'10px',background:'#F8FAFC',borderRadius:'10px',border:'1px dashed #E2E8F0'}}>
              <input value={newVT} onChange={e=>setNewVT(e.target.value)} placeholder="Video title" style={S}/>
              <div style={{display:'flex',gap:'6px'}}>
                <input value={newVU} onChange={e=>setNewVU(e.target.value)} placeholder="YouTube URL" style={{...S,flex:1}}/>
                <button type="button" onClick={()=>{if(!newVU)return;setForm(p=>({...p,video_links:[...(p.video_links||[]),{title:newVT||'Tutorial',url:newVU}]}));setNewVT('');setNewVU('');}}
                  style={{padding:'9px 14px',borderRadius:'8px',background:'#16A34A',color:'white',fontWeight:700,fontSize:'12px',border:'none',cursor:'pointer',whiteSpace:'nowrap'}}>+Add</button>
              </div>
            </div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'8px',padding:'10px 12px',background:'#F8FAFC',borderRadius:'10px'}}>
            <input type="checkbox" id="active" checked={form.active} onChange={e=>setForm(p=>({...p,active:e.target.checked}))} style={{width:'16px',height:'16px',cursor:'pointer'}}/>
            <label htmlFor="active" style={{fontSize:'13px',fontWeight:600,color:'#333',cursor:'pointer'}}>Visible to customers</label>
          </div>
          <div style={{display:'flex',gap:'8px'}}>
            <button type="submit" disabled={saving} style={{flex:1,padding:'12px',borderRadius:'12px',background:saving?'#E2E8F0':'linear-gradient(135deg,#1A1A2E,#0F3460)',color:saving?'#94A3B8':'white',fontWeight:800,fontSize:'14px',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:'6px'}}>
              <Save size={15}/>{saving?'Saving...':isEdit?'Update':'Add Product'}
            </button>
            <button type="button" onClick={onClose} style={{padding:'12px 18px',borderRadius:'12px',background:'#F4F4F8',color:'#555',fontWeight:700,fontSize:'14px',border:'none',cursor:'pointer'}}>Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/* ── Modern Expandable Order Card (Matching Orders.jsx / Images 2-5) ── */
function OrderCard({ order, onConfirm, onReject, onStatus, onDelete, confirming, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [rejectBox, setRejectBox] = useState(false);
  const [reason, setReason] = useState('');
  const [copied, setCopied] = useState(false);

  const addr = order.shipping_address || {};
  const isVerified = order.payment_status === 'verified';
  const isSubmitted = order.payment_status === 'submitted' || order.status === 'payment_submitted';
  const isRejected = order.payment_status === 'rejected' || order.status === 'payment_rejected';
  const isPending = !isVerified && !isRejected && !isSubmitted;

  const items = Array.isArray(order.items) ? order.items : [];
  const firstItem = items[0] || {};
  const totalAmount = Number(order.total_amount || 0);

  const STATUS_CONFIG = {
    pending_payment:   { label:'Pending Payment',   color:'#475569', bg:'#F1F5F9' },
    payment_submitted: { label:'Pending Payment',   color:'#475569', bg:'#F1F5F9' },
    confirmed:         { label:'Confirmed',         color:'#0F172A', bg:'#F8FAFC' },
    preparing:         { label:'Preparing Order',   color:'#334155', bg:'#F1F5F9' },
    shipped:           { label:'Shipped',           color:'#0284C7', bg:'#F0F9FF' },
    delivered:         { label:'Delivered',         color:'#16A34A', bg:'#DCFCE7' },
    payment_rejected:  { label:'Payment Rejected',  color:'#DC2626', bg:'#FEF2F2' },
    cancelled:         { label:'Cancelled',         color:'#94A3B8', bg:'#F1F5F9' }
  };

  const currentStatus = STATUS_CONFIG[order.status] || { label: 'Pending Payment', color: '#475569', bg: '#F1F5F9' };

  const orderDateStr = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Recent';

  function waMsg(msg) {
    const phone = addr.phone || '';
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(msg)}`, '_blank');
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
      border: selected ? '2px solid #0F172A' : '1px solid #E2E8F0',
      marginBottom: '12px',
      boxShadow: '0 2px 8px rgba(15,23,42,0.03)',
      overflow: 'hidden',
      transition: 'all .2s ease',
      boxSizing: 'border-box'
    }}>

      {/* ── Compact Rectangle Header (Clickable View) ── */}
      <div
        onClick={() => setOpen(!open)}
        style={{
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          cursor: 'pointer',
          background: open ? '#F8FAFC' : '#FFFFFF',
          borderBottom: open ? '1px solid #E2E8F0' : 'none',
          userSelect: 'none'
        }}
      >
        {/* Left: Checkbox + Thumbnail with count + Summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => { e.stopPropagation(); onSelect(); }}
            onClick={(e) => e.stopPropagation()}
            style={{ width: '17px', height: '17px', cursor: 'pointer', accentColor: '#0F172A', flexShrink: 0 }}
          />

          <div style={{ position: 'relative', width: '46px', height: '46px', flexShrink: 0 }}>
            <img
              src={firstItem.image_url || 'https://placehold.co/60x60?text=Product'}
              alt={firstItem.name || 'Product'}
              style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover', background: '#F1F5F9', border: '1px solid #E2E8F0' }}
            />
            {items.length > 1 && (
              <span style={{
                position: 'absolute', top: '-5px', right: '-5px',
                width: '18px', height: '18px', borderRadius: '50%',
                background: '#0F172A', color: '#FFFFFF',
                fontSize: '10px', fontWeight: 900,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid #FFFFFF'
              }}>
                +{items.length - 1}
              </span>
            )}
          </div>

          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            <p style={{
              fontSize: '13.5px',
              fontWeight: 800,
              color: '#0F172A',
              margin: '0 0 2px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              lineHeight: 1.3,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif'
            }}>
              {firstItem.name || 'Order Item'}
            </p>
            <p style={{
              fontSize: '12px',
              fontWeight: 700,
              color: '#475569',
              margin: 0,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif',
              letterSpacing: '0'
            }}>
              Order #{order.id.slice(0,8).toUpperCase()}
            </p>
            <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0', fontWeight: 500, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", sans-serif' }}>
              {orderDateStr} · <span style={{ color: currentStatus.color, fontWeight: 700 }}>{currentStatus.label}</span>
            </p>
          </div>
        </div>

        {/* Right: Total + Details Chevron Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
              ₹{totalAmount.toFixed(0)}
            </p>
            <span style={{ fontSize: '11px', color: open ? '#0F172A' : '#64748B', fontWeight: 700 }}>
              {open ? 'Collapse' : 'Details'}
            </span>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onDelete(order.id); }}
            title="Delete Order"
            style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: '#FEF2F2', border: '1px solid #FECACA',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0
            }}
          >
            <Trash2 size={13} color="#DC2626" />
          </button>

          <div style={{
            width: '28px', height: '28px', borderRadius: '50%',
            background: '#FFFFFF', border: '1px solid #E2E8F0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            {open ? <ChevronUp size={15} color="#0F172A" /> : <ChevronDown size={15} color="#0F172A" />}
          </div>
        </div>
      </div>

      {/* ── Expanded Materialism / Shopify Content ── */}
      {open && (
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#FFFFFF' }}>

          {/* 1. Fulfillment Status Box with 7-Stage Timeline */}
          <div style={{ background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 900 }}>✓</span>
                <span style={{ fontSize: '14.5px', fontWeight: 900, color: '#0F172A' }}>{currentStatus.label}</span>
              </div>
              <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>{orderDateStr}</span>
            </div>

            <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, fontWeight: 500 }}>
              {order.status === 'delivered'
                ? 'Package has been delivered to the customer.'
                : order.status === 'shipped'
                ? 'Package is in transit with delivery courier.'
                : order.status === 'preparing'
                ? "Items are being prepared for shipping."
                : isVerified
                ? 'Order confirmed and ready for processing.'
                : 'Awaiting payment confirmation.'}
            </p>

            <button
              onClick={() => setShowTimeline(!showTimeline)}
              style={{ background: 'none', border: 'none', padding: '6px 0 0', color: '#0F172A', fontSize: '12px', fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <span>{showTimeline ? 'Hide Tracking Steps' : 'View Full Tracking Timeline'}</span>
              {showTimeline ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {/* 7-Stage Timeline */}
            {showTimeline && (
              <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '8px', paddingTop: '12px' }}>
                {(() => {
                  const STAGES = [
                    { key: 'pending_payment',   label: 'Order Placed',        desc: 'Your order has been placed in our system.', icon: '📋' },
                    { key: 'payment_submitted', label: 'Payment Submitted',   desc: 'UPI / payment screenshot received.',         icon: '💸' },
                    { key: 'confirmed',         label: 'Payment Verified',    desc: 'Admin has verified the transaction.',        icon: '✅' },
                    { key: 'confirmed',         label: 'Confirmed',           desc: 'Order confirmed for processing.',            icon: '🎉' },
                    { key: 'preparing',         label: 'Preparing Order',     desc: 'Items packed at our Nellore facility.',       icon: '📦' },
                    { key: 'shipped',           label: 'Shipped',             desc: 'Dispatched with express delivery partner.', icon: '🚚' },
                    { key: 'delivered',         label: 'Delivered',           desc: 'Handed over to the customer.',              icon: '🏠' },
                  ];
                  const stageKeys = ['pending_payment', 'payment_submitted', 'confirmed', 'confirmed', 'preparing', 'shipped', 'delivered'];
                  const orderStageIdx = ['pending_payment', 'payment_submitted', 'confirmed', 'confirmed', 'preparing', 'shipped', 'delivered'].indexOf(order.status);
                  const activeIdx = orderStageIdx >= 0 ? orderStageIdx : (order.status === 'delivered' ? 6 : (isVerified ? 2 : 0));

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '4px 0' }}>
                      {STAGES.map((s, idx) => {
                        const isDone = idx <= activeIdx;
                        const isCurrent = idx === activeIdx;

                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', position: 'relative' }}>
                            {idx < STAGES.length - 1 && (
                              <div style={{
                                position: 'absolute', left: '16px', top: '32px', bottom: '-14px', width: '2px',
                                background: isDone ? '#0F172A' : '#E2E8F0', zIndex: 0
                              }} />
                            )}
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%',
                              background: isDone ? (isCurrent ? '#0F172A' : '#F1F5F9') : '#F8FAFC',
                              border: isDone ? '2px solid #0F172A' : '2px solid #E2E8F0',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '14px', flexShrink: 0, zIndex: 1, boxShadow: isCurrent ? '0 2px 8px rgba(15,23,42,0.2)' : 'none'
                            }}>
                              {s.icon}
                            </div>
                            <div style={{ flex: 1, paddingTop: '4px' }}>
                              <p style={{ fontSize: '13.5px', fontWeight: 800, color: isDone ? '#0F172A' : '#94A3B8', margin: '0 0 2px' }}>
                                {s.label}
                              </p>
                              <p style={{ fontSize: '11.5px', color: isDone ? '#64748B' : '#CBD5E1', margin: 0, lineHeight: 1.4 }}>
                                {s.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* 3. Ordered Items Breakdown */}
          <div style={{ background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <div style={{ position: 'relative', width: '48px', height: '48px', flexShrink: 0 }}>
                    <img
                      src={item.image_url || 'https://placehold.co/60x60?text=Product'}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', borderRadius: '10px', objectFit: 'cover', background: '#FFFFFF', border: '1px solid #E2E8F0' }}
                    />
                    <span style={{
                      position: 'absolute', top: '-5px', right: '-5px',
                      width: '18px', height: '18px', borderRadius: '50%',
                      background: '#000000', color: '#FFFFFF',
                      fontSize: '10.5px', fontWeight: 900,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '1.5px solid #FFFFFF'
                    }}>
                      {item.quantity || 1}
                    </span>
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </p>
                    {(item.size || item.color) && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px', flexWrap: 'wrap' }}>
                        {item.size && (
                          <span style={{ fontSize: '10px', fontWeight: 700, color: '#0F172A', background: '#E2E8F0', padding: '1px 5px', borderRadius: '4px' }}>
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', fontWeight: 700, color: '#0F172A', background: '#E2E8F0', padding: '1px 5px', borderRadius: '4px' }}>
                            {item.color_value && (
                              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: item.color_value, border: '1px solid rgba(0,0,0,0.2)' }} />
                            )}
                            Color: {item.color}
                          </span>
                        )}
                      </div>
                    )}
                    {item.unit && !item.size && (
                      <p style={{ fontSize: '11px', color: '#64748B', margin: '2px 0 0', fontWeight: 500 }}>
                        {item.unit}
                      </p>
                    )}
                  </div>
                </div>
                <span style={{ fontSize: '13.5px', fontWeight: 900, color: '#0F172A', flexShrink: 0 }}>
                  ₹{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                </span>
              </div>
            ))}

            {/* Price breakdown */}
            <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>
                <span>Subtotal</span>
                <span style={{ color: '#0F172A', fontWeight: 700 }}>₹{totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#64748B', fontWeight: 600 }}>
                <span>Shipping</span>
                <span style={{ color: '#16A34A', fontWeight: 800 }}>Free</span>
              </div>
              {order.discount_amount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#16A34A', fontWeight: 700 }}>
                  <span>Coupon Discount ({order.coupon || 'PROMO'})</span>
                  <span>-₹{Number(order.discount_amount).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '2px', paddingTop: '6px', borderTop: '1px dashed #E2E8F0' }}>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#0F172A' }}>Total</span>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, marginRight: '4px' }}>INR</span>
                  <span style={{ fontSize: '16.5px', fontWeight: 900, color: '#0F172A' }}>₹{totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Customer Information Card */}
          <div style={{ background: '#F8FAFC', borderRadius: '14px', border: '1px solid #E2E8F0', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Contact */}
            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '6px', fontSize: '12.5px' }}>
              <span style={{ color: '#64748B', fontWeight: 600 }}>Contact</span>
              <a href={`tel:+91${addr.phone || ''}`} style={{ color: '#0F172A', fontWeight: 700, textDecoration: 'underline' }}>
                {addr.phone ? `+91 ${addr.phone}` : 'Customer Contact'}
              </a>
            </div>

            <div style={{ height: '1px', background: '#E2E8F0' }} />

            {/* Ship to */}
            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '6px', fontSize: '12.5px', alignItems: 'flex-start' }}>
              <span style={{ color: '#64748B', fontWeight: 600 }}>Ship to</span>
              <div style={{ color: '#0F172A', lineHeight: 1.45, fontWeight: 600 }}>
                <p style={{ fontWeight: 800, margin: 0 }}>{addr.fullName || 'Valued Customer'}</p>
                <p style={{ margin: 0, color: '#475569' }}>{addr.houseNo ? `${addr.houseNo}, ` : ''}{addr.streetArea || ''}</p>
                {addr.landmark && <p style={{ margin: 0, color: '#475569' }}>Near {addr.landmark}</p>}
                <p style={{ margin: 0, color: '#475569' }}>
                  {[addr.city, addr.state, addr.pincode, 'India'].filter(Boolean).join(' ')}
                </p>
                {addr.phone && <p style={{ margin: '2px 0 0', textDecoration: 'underline', fontWeight: 700 }}>+91 {addr.phone}</p>}
              </div>
            </div>

            <div style={{ height: '1px', background: '#E2E8F0' }} />

            {/* Payment & Screenshot */}
            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '6px', fontSize: '12.5px', alignItems: 'flex-start' }}>
              <span style={{ color: '#64748B', fontWeight: 600 }}>Payment</span>
              <div>
                <p style={{ fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  {order.payment_method === 'cod' ? 'Cash on Delivery (COD)' : 'UPI / Online Payment'}
                </p>
                <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0', fontWeight: 500 }}>
                  ₹{totalAmount.toFixed(2)} INR · {orderDateStr}
                </p>
                {order.utr && (
                  <p style={{ fontSize: '11.5px', color: '#059669', fontWeight: 800, margin: '3px 0 0' }}>
                    UTR Ref: {order.utr}
                  </p>
                )}
                {(order.screenshot_url || order.payment_screenshot_url) && (
                  <a
                    href={order.screenshot_url || order.payment_screenshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      marginTop: '6px', padding: '4px 10px', borderRadius: '6px',
                      background: '#EFF6FF', color: '#2563EB', fontSize: '11.5px',
                      fontWeight: 800, textDecoration: 'none', border: '1px solid #BFDBFE'
                    }}
                  >
                    <Eye size={12} /> View Payment Screenshot
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* 5. ── ADMIN CONTROLS & ACTION BUTTONS AT THE BOTTOM (Matching Image 2) ── */}
          <div style={{ background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ fontSize: '10.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#64748B' }}>
                Admin Controls &amp; Status
              </span>
              <button
                onClick={handleCopyId}
                style={{ background: 'none', border: 'none', color: '#2563EB', fontSize: '11.5px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
              >
                {copied ? <Check size={11} color="#16A34A" /> : <Copy size={11} />}
                <span>{copied ? 'Copied ID' : 'Copy Full UUID'}</span>
              </button>
            </div>

            {/* Quick verification buttons for unverified / pending payments */}
            {!isVerified && !rejectBox && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                <button
                  onClick={() => onConfirm(order)}
                  disabled={confirming}
                  style={{
                    padding: '7px 10px', borderRadius: '8px',
                    background: confirming ? '#CBD5E1' : '#059669', color: '#FFFFFF',
                    fontWeight: 800, fontSize: '11.5px', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                  }}
                >
                  <CheckCircle size={13} /> {confirming ? 'Verifying...' : 'Verify Payment'}
                </button>
                <button
                  onClick={() => setRejectBox(true)}
                  style={{
                    padding: '7px 10px', borderRadius: '8px',
                    background: '#FEF2F2', color: '#DC2626',
                    fontWeight: 800, fontSize: '11.5px', border: '1px solid #FECACA', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                  }}
                >
                  <XCircle size={13} /> Reject
                </button>
              </div>
            )}

            {/* Rejection input box */}
            {rejectBox && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <input
                  value={reason} onChange={e => setReason(e.target.value)}
                  placeholder="Rejection reason for customer..."
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #FECACA', fontSize: '11.5px', background: '#FEF2F2', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    onClick={() => { onReject(order, reason); setRejectBox(false); }}
                    style={{ padding: '7px', borderRadius: '8px', background: '#DC2626', color: '#FFFFFF', fontWeight: 800, fontSize: '11.5px', border: 'none', cursor: 'pointer' }}
                  >
                    Confirm Reject
                  </button>
                  <button
                    onClick={() => { setRejectBox(false); setReason(''); }}
                    style={{ padding: '7px', borderRadius: '8px', background: '#F1F5F9', color: '#475569', fontWeight: 700, fontSize: '11.5px', border: 'none', cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Status Change Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', flexShrink: 0 }}>Update Status:</span>
              <select
                value={order.status}
                onChange={(e) => onStatus(order.id, e.target.value)}
                style={{
                  flex: 1, padding: '5px 8px', borderRadius: '8px',
                  border: '1px solid #CBD5E1', fontSize: '11.5px',
                  background: '#FFFFFF', fontWeight: 700, color: '#0F172A', cursor: 'pointer',
                  height: '30px'
                }}
              >
                <option value="pending_payment">Pending Payment</option>
                <option value="confirmed">Confirmed / Verified</option>
                <option value="preparing">Preparing Order</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="payment_rejected">Payment Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* 4 Action Buttons Grid (Sleek, De-congested) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '2px' }}>
              <button
                onClick={() => waMsg(`Hello ${addr.fullName || 'Customer'}, regarding your order #${order.id.slice(0,8).toUpperCase()} from Asmalabel:\nStatus: ${currentStatus.label}. Total: ₹${totalAmount.toFixed(0)}.`)}
                style={{
                  padding: '7px 10px', borderRadius: '8px',
                  background: '#ECFDF5', color: '#059669', fontWeight: 750,
                  fontSize: '11.5px', border: '1px solid #A7F3D0', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                }}
              >
                <MessageCircle size={13} /> WhatsApp
              </button>

              <a
                href={`tel:+91${addr.phone || ''}`}
                style={{
                  padding: '7px 10px', borderRadius: '8px',
                  background: '#EFF6FF', color: '#2563EB', fontWeight: 750,
                  fontSize: '11.5px', border: '1px solid #BFDBFE', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
                  textDecoration: 'none'
                }}
              >
                <Phone size={13} /> Call Customer
              </a>

              <button
                onClick={() => printShippingLabel(order)}
                style={{
                  padding: '7px 10px', borderRadius: '8px',
                  background: '#0F172A', color: '#FFFFFF', fontWeight: 750,
                  fontSize: '11.5px', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                }}
              >
                <Printer size={13} /> Print Label
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); onDelete(order.id); }}
                style={{
                  padding: '7px 10px', borderRadius: '8px',
                  background: '#FEF2F2', color: '#DC2626', fontWeight: 750,
                  fontSize: '11.5px', border: '1px solid #FECACA', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                }}
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}

/* ── Quick Actions FAB ────────────────────────────────────── */
function QuickActions({ onAddProduct, onExportOrders, onRefresh }) {
  const [open, setOpen] = useState(false);
  const ACTIONS = [
    { label:'Add Product',   icon:Plus,       action:onAddProduct,   color:'#2563EB', bg:'#EFF6FF' },
    { label:'Export Orders', icon:Download,   action:onExportOrders, color:'#10B981', bg:'#ECFDF5' },
    { label:'Refresh Data',  icon:RefreshCw,  action:onRefresh,      color:'#8B5CF6', bg:'#F5F3FF' },
  ];
  return (
    <div className="admin-fab-wrap" style={{ position:'fixed', bottom:'24px', right:'24px', zIndex:500, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'10px' }}>
      <AnimatePresence>
        {open && ACTIONS.map((a, i) => (
          <motion.button key={a.label}
            initial={{ opacity:0, y:12, scale:.85 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:12, scale:.85 }}
            transition={{ delay: i*.04, duration:.2 }}
            onClick={() => { a.action(); setOpen(false); }}
            style={{ display:'flex', alignItems:'center', gap:'10px', padding:'10px 18px', borderRadius:'14px',
              background:'#FFFFFF', border:'1px solid #E5E7EB', cursor:'pointer',
              boxShadow:'0 10px 30px -4px rgba(15, 23, 42, 0.15)', fontSize:'13px', fontWeight:700, color:'#111827' }}>
            <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:a.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <a.icon size={15} color={a.color} />
            </div>
            {a.label}
          </motion.button>
        ))}
      </AnimatePresence>
      <motion.button
        whileHover={{ scale:1.06, y:-2 }} whileTap={{ scale:.94 }}
        onClick={() => setOpen(o => !o)}
        style={{ width:'52px', height:'52px', borderRadius:'50%',
          background:'linear-gradient(135deg, #1E293B, #0F172A)', color:'#FFFFFF',
          border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:'0 8px 24px rgba(15, 23, 42, 0.3)' }}>
        <motion.div animate={{ rotate: open ? 45 : 0 }} transition={{ duration:.2 }}>
          <Plus size={24} />
        </motion.div>
      </motion.button>
    </div>
  );
}

/* ── Module-Level In-Memory Cache for 0ms Instant Tab Switches in Admin Panel ── */
let adminCachedProducts = null;
let adminCachedOrders = null;
let adminCachedCounts = null;

/* ── Main Admin Panel ─────────────────────────────────────── */
export default function AdminPanel() {
  const navigate = useNavigate();
  const { user, setUser, cmsData, cmsDraft, updateCmsDraft, publishCms } = useApp();

  /* ── state ── */
  const [page,       setPage]       = useState('orders');   // orders | products | coupons | cms | more
  const [orderTab,   setOrderTab]   = useState('all_pending');
  const [orders,     setOrders]     = useState(() => (adminCachedOrders ? (adminCachedOrders['all_pending'] || []) : []));
  const [allOrders,  setAllOrders]  = useState(() => (adminCachedOrders ? (adminCachedOrders['__all__'] || []) : []));
  const [products,   setProducts]   = useState(() => adminCachedProducts || []);
  const [counts,     setCounts]     = useState(() => adminCachedCounts || {});
  const [loading,    setLoading]    = useState(() => !adminCachedProducts && !adminCachedOrders);
  const [confirming, setConfirming] = useState(null);
  const [modal,      setModal]      = useState(null);
  const [search,     setSearch]     = useState('');
  const [productTab, setProductTab] = useState('tailoring'); // 'tailoring' | 'fashion'
  const [tailoringSubCat, setTailoringSubCat] = useState('all');
  const [fashionSubCat,   setFashionSubCat]   = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // ── CUSTOM SUBCATEGORIES STATE & MODAL ──
  const [customSubcats, setCustomSubcats] = useState(() => {
    try {
      const cmsSubs = cmsDraft?.subcategories || cmsData?.subcategories;
      if (cmsSubs && (cmsSubs.tailoring?.length || cmsSubs.fashion?.length)) {
        return cmsSubs;
      }
      const stored = localStorage.getItem('asmalabel_custom_subcategories_v1');
      return stored ? JSON.parse(stored) : { tailoring: [], fashion: [] };
    } catch {
      return { tailoring: [], fashion: [] };
    }
  });
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  const handleSaveCustomSubcats = async (cat, list) => {
    const cleanList = list.map(item => ({
      id: normalizeCategoryKey(item.key || item.id),
      key: normalizeCategoryKey(item.key || item.id),
      label: item.label,
      icon: item.icon || 'Tag',
      active: item.active !== false,
      isCustom: item.isCustom
    }));

    const updatedCustom = { ...customSubcats, [cat]: cleanList };
    setCustomSubcats(updatedCustom);
    try {
      localStorage.setItem('asmalabel_custom_subcategories_v1', JSON.stringify(updatedCustom));
    } catch { }

    if (updateCmsDraft) {
      const currentCmsSubs = cmsDraft?.subcategories || DEFAULT_CMS_DATA.subcategories;
      const newCmsSubs = {
        ...currentCmsSubs,
        [cat]: cleanList
      };
      updateCmsDraft({ subcategories: newCmsSubs });

      try {
        const currentContent = cmsDraft || cmsData || DEFAULT_CMS_DATA;
        const newContent = {
          ...currentContent,
          subcategories: newCmsSubs
        };
        await supabase.from('homepage_cms').upsert({
          id: 'published',
          content: newContent,
          updated_at: new Date().toISOString()
        });
      } catch (err) {
        console.error('Error saving subcategories to Supabase:', err);
      }
    }
  };

  const handleRenameSubcategory = async (cat, oldKey, newKey, newLabel) => {
    const normOld = normalizeCategoryKey(oldKey);
    const normNew = normalizeCategoryKey(newKey);

    const affectedProducts = products.filter(p =>
      (p.category || '').toLowerCase() === cat &&
      (normalizeCategoryKey(p.sub_category) === normOld || (p.sub_category || '').toLowerCase() === oldKey.toLowerCase())
    );

    if (affectedProducts.length > 0) {
      for (const p of affectedProducts) {
        const { error } = await supabase
          .from('products')
          .update({ sub_category: normNew })
          .eq('id', p.id);
        if (error) {
          toast(`Error updating product ${p.name}: ${error.message}`, 'error');
        }
      }
    }

    const currentSubcats = getSubcategoriesList(cat).filter(c => c.key !== 'all');
    const updatedList = currentSubcats.map(c => {
      if (normalizeCategoryKey(c.key) === normOld) {
        return { ...c, key: normNew, id: normNew, label: newLabel };
      }
      return c;
    });

    await handleSaveCustomSubcats(cat, updatedList);
    toast(`Renamed to "${newLabel}" (${affectedProducts.length} product(s) updated)`, 'success');
    fetchProducts();
  };

  const getSubcategoriesList = (categoryKey) => {
    const cmsList = (cmsDraft?.subcategories?.[categoryKey] || cmsData?.subcategories?.[categoryKey] || []);
    const defaults = categoryKey === 'tailoring' ? DEFAULT_TAILORING_SUBCATS : DEFAULT_FASHION_SUBCATS;
    const customs = customSubcats[categoryKey] || [];
    const map = new Map();

    const baseList = cmsList.length > 0 ? cmsList : defaults;
    baseList.forEach(item => {
      const k = normalizeCategoryKey(item.key || item.id);
      if (k) {
        map.set(k, {
          key: k,
          id: k,
          label: item.label || item.name || k,
          icon: item.icon || 'Tag',
          active: item.active !== false,
          isCustom: !defaults.some(d => normalizeCategoryKey(d.key) === k)
        });
      }
    });

    customs.forEach(c => {
      const k = normalizeCategoryKey(c.key || c.id);
      if (k) {
        map.set(k, {
          key: k,
          id: k,
          label: c.label || c.name || k,
          icon: c.icon || 'Tag',
          active: c.active !== false,
          isCustom: true
        });
      }
    });

    if (!map.has('all')) {
      const allLabel = categoryKey === 'tailoring' ? 'All Tailoring' : "All Fashion";
      map.set('all', { key: 'all', id: 'all', label: allLabel, icon: 'Sparkles', active: true });
    }

    products.filter(p => (p.category || '').toLowerCase() === categoryKey).forEach(p => {
      const raw = (p.sub_category || '').trim();
      const normKey = normalizeCategoryKey(raw);
      if (normKey && normKey !== 'all' && !map.has(normKey)) {
        const formatted = raw.replace(/_/g, ' ').replace(/\b\w/g, ch => ch.toUpperCase());
        map.set(normKey, {
          key: normKey,
          id: normKey,
          label: formatted,
          icon: 'Tag',
          active: true,
          isCustom: true
        });
      }
    });

    return Array.from(map.values());
  };

  // Auto-normalize any unnormalized product subcategories in DB
  useEffect(() => {
    if (!products || products.length === 0) return;
    const messyProducts = products.filter(p => {
      const raw = p.sub_category || '';
      const norm = normalizeCategoryKey(raw);
      return raw !== norm && norm !== '';
    });
    if (messyProducts.length > 0) {
      (async () => {
        let changed = false;
        for (const p of messyProducts) {
          const norm = normalizeCategoryKey(p.sub_category);
          const { error } = await supabase.from('products').update({ sub_category: norm }).eq('id', p.id);
          if (!error) changed = true;
        }
        if (changed) fetchProducts();
      })();
    }
  }, [products.length]);

  /* ── COUPON MANAGEMENT STATE ── */
  const DEFAULT_COUPONS = SAFE_DEFAULT_COUPONS;

  const [couponsList, setCouponsList] = useState(() => {
    try {
      const stored = localStorage.getItem('asmalabel_coupons_list');
      return stored ? JSON.parse(stored) : DEFAULT_COUPONS;
    } catch {
      return DEFAULT_COUPONS;
    }
  });
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({
    code: '', desc: '', type: 'percent', val: 10,
    scope: 'ALL_PRODUCTS', applicableProductIds: [],
    applicableCategory: 'tailoring', minItemPrice: 0, minCartTotal: 399,
    maxDiscount: 50, active: true, hidden: false
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('asmalabel_coupons_list', JSON.stringify(couponsList));
      window.dispatchEvent(new Event('storage'));
    } catch (e) { console.error(e); }
  }, [couponsList]);

  const openCouponModal = (cpn = null) => {
    fetchProducts();
    if (cpn) {
      setEditingCoupon(cpn);
      setCouponForm({ ...cpn });
    } else {
      setEditingCoupon(null);
      setCouponForm({
        code: '', desc: '', type: 'percent', val: 10,
        scope: 'ALL_PRODUCTS', applicableProductIds: [],
        applicableCategory: 'tailoring', minItemPrice: 0, minCartTotal: 0,
        maxDiscount: 0, active: true, hidden: false
      });
    }
    setCouponModalOpen(true);
  };

  const handleToggleCouponActive = (code) => {
    setCouponsList(prev => prev.map(c => c.code === code ? { ...c, active: !c.active } : c));
    toast('Coupon status updated', 'success');
  };

  const handleToggleCouponHidden = (code) => {
    setCouponsList(prev => prev.map(c => c.code === code ? { ...c, hidden: !c.hidden } : c));
    toast('Coupon visibility updated', 'success');
  };

  const handleDeleteCoupon = (code) => {
    if (window.confirm(`Delete coupon ${code}?`)) {
      setCouponsList(prev => prev.filter(c => c.code !== code));
      toast(`Coupon ${code} deleted`, 'info');
    }
  };

  const [resetMetrics, setResetMetrics] = useState(() => {
    try {
      return localStorage.getItem('ashub_analytics_reset') === 'true';
    } catch { return false; }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ashub_analytics_reset', resetMetrics ? 'true' : 'false');
    } catch { /* ignore */ }
  }, [resetMetrics]);
  const [storeInfoEditing, setStoreInfoEditing] = useState(false);
  const [storeInfo, setStoreInfo] = useState(() => {
    try {
      const saved = localStorage.getItem('ashub_store_info');
      if (saved) return JSON.parse(saved);
    } catch { /* ignore */ }
    return {
      name: 'Asmalabel',
      owner: 'Shaik Asmath',
      email: 'as.businezzz@gmail.com',
      phone: '+91 70139 42909',
      upi: '7995747250@ptyes',
      whatsapp: '+91 70139 42909',
    };
  });
  const [tempStoreInfo, setTempStoreInfo] = useState(storeInfo);
  const [cmdOpen,    setCmdOpen]    = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selected,   setSelected]   = useState([]);
  const [sideOpen,   setSideOpen]   = useState(() => {
    try { return localStorage.getItem('admin_sidebar') !== 'false'; } catch { return true; }
  });
  const [notifRead, setNotifRead] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_notif_read') || '[]'); } catch { return []; }
  });

  /* ── guards ── */
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (user.email !== ADMIN_EMAIL) { navigate('/'); return; }
  }, [user]);

  /* ── keyboard ── */
  useEffect(() => {
    const h = (e) => {
      if ((e.ctrlKey||e.metaKey) && e.key==='k') { e.preventDefault(); setCmdOpen(o=>!o); }
      if (e.key==='Escape') { setCmdOpen(false); setNotifOpen(false); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  /* ── sidebar persist ── */
  useEffect(() => {
    localStorage.setItem('admin_sidebar', sideOpen);
  }, [sideOpen]);

  /* ── data fetching ── */
  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) return;
    if (page === 'orders' || page === 'dashboard') { fetchOrders(); fetchCounts(); }
    if (page === 'products' || page === 'coupons' || page === 'dashboard' || page === 'more') fetchProducts();
  }, [page, orderTab, dateFilter]);

  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) return;
    supabase.from('orders').select('*').then(({ data }) => { if (data) setAllOrders(data); });
  }, []);

  /* ── realtime ── */
  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) return;
    const ch = supabase.channel('admin-rt')
      .on('postgres_changes', { event:'*', schema:'public', table:'orders' }, () => { fetchOrders(); fetchCounts(); })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [orderTab, dateFilter]);

  async function fetchOrders() {
    const cacheKey = `${orderTab}_${dateFilter}`;
    if (adminCachedOrders && adminCachedOrders[cacheKey]) {
      setOrders(adminCachedOrders[cacheKey]);
      setLoading(false);
    } else {
      setLoading(true);
    }

    try {
      const { data: allData } = await supabase.from('orders').select('*');
      if (allData) {
        setAllOrders(allData);
        if (!adminCachedOrders) adminCachedOrders = {};
        adminCachedOrders['__all__'] = allData;
      }

      let q = supabase.from('orders').select('*').order('created_at',{ascending:false});
      if (orderTab==='all_pending') q = q.in('status',['pending_payment','payment_submitted']);
      else if (orderTab==='payment_submitted') q = q.eq('payment_status','submitted');
      else if (orderTab==='payment_rejected') q = q.eq('payment_status','rejected');
      else q = q.eq('status', orderTab);
      const { data, error } = await q; if (error) throw error;
      let filtered = data || [];
      if (dateFilter !== 'all') {
        const now = new Date();
        filtered = filtered.filter(o => {
          const d = new Date(o.created_at);
          if (dateFilter==='today') return d.toDateString()===now.toDateString();
          if (dateFilter==='week') return d >= new Date(now-7*86400000);
          if (dateFilter==='month') return d.getMonth()===now.getMonth() && d.getFullYear()===now.getFullYear();
          return true;
        });
      }
      if (!adminCachedOrders) adminCachedOrders = {};
      adminCachedOrders[cacheKey] = filtered;
      setOrders(filtered);
    } catch(err) { toast('Failed to load orders','error'); }
    finally { setLoading(false); }
  }

  async function handleDeleteAllOrders() {
    const ok = await confirm({
      title: '🚨 Delete ALL Test Orders?',
      message: 'This will PERMANENTLY delete every single order from the database and reset Performance Analytics to ₹0. This action cannot be undone.',
      confirm: 'Yes, Delete All Orders',
      type: 'danger'
    });
    if (!ok) return;
    try {
      const { error } = await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      adminCachedOrders = null;
      setAllOrders([]);
      setOrders([]);
      setSelected([]);
      fetchCounts();
      toast('All orders permanently deleted from database!', 'success');
    } catch(err) {
      toast('Error deleting orders: ' + err.message, 'error');
    }
  }

  async function fetchCounts() {
    if (adminCachedCounts) {
      setCounts(adminCachedCounts);
    }
    const { data } = await supabase.from('orders').select('status,payment_status');
    if (!data) return;
    const c = {};
    data.forEach(o => {
      if (['pending_payment','payment_submitted'].includes(o.status)) c.all_pending=(c.all_pending||0)+1;
      if (o.payment_status==='submitted') c.payment_submitted=(c.payment_submitted||0)+1;
      else if (o.payment_status==='rejected') c.payment_rejected=(c.payment_rejected||0)+1;
      else c[o.status]=(c[o.status]||0)+1;
    });
    adminCachedCounts = c;
    setCounts(c);
  }

  async function fetchProducts() {
    if (adminCachedProducts && adminCachedProducts.length > 0) {
      setProducts(adminCachedProducts);
      setLoading(false);
    } else {
      setLoading(true);
    }
    const { data, error } = await supabase.from('products').select('*').order('created_at',{ascending:false});
    if (!error && data) {
      adminCachedProducts = data;
      setProducts(data);
    }
    setLoading(false);
  }

  async function handleConfirm(order) {
    setConfirming(order.id);
    try {
      await supabase.from('orders').update({ payment_status:'verified', status:'confirmed', verified_by:user.email, verified_at:new Date().toISOString() }).eq('id',order.id);
      const a = order.shipping_address||{};
      window.open(`https://wa.me/91${a.phone}?text=${encodeURIComponent(`*PAYMENT VERIFIED - ${SHOP.shopName}*\n\nDear ${a.fullName},\n\nYour payment of Rs.${order.total_amount?.toFixed(0)} for Order #${order.id.slice(0,8).toUpperCase()} has been successfully verified!\n\n=========================================\nORDER SUMMARY:\n=========================================\nOrder ID: #${order.id.slice(0,8).toUpperCase()}\nAmount Paid: Rs.${order.total_amount?.toFixed(0)}\nPayment Method: UPI\nStatus: CONFIRMED\n\n=========================================\nNEXT STEPS:\n=========================================\n* Your order is being prepared\n* Estimated delivery: 3-7 business days\n* You will receive tracking details soon\n\nThank you for shopping with ${SHOP.shopName}!\n\nFor any queries, reply to this message or call us at +91 7013942909.\n\nHappy Shopping!`)}`, '_blank');
      toast('Payment confirmed!','success');
      fetchOrders(); fetchCounts();
    } catch(err) { toast('Error: '+err.message,'error'); }
    finally { setConfirming(null); }
  }

  async function handleReject(order, reason) {
    try {
      await supabase.from('orders').update({ payment_status:'rejected', status:'payment_rejected', rejection_reason:reason||'Payment not verified' }).eq('id',order.id);
      const a = order.shipping_address||{};
      window.open(`https://wa.me/91${a.phone}?text=${encodeURIComponent(`*PAYMENT FAILED - ${SHOP.shopName}*\n\nDear ${a.fullName},\n\nWe could not verify your payment for Order #${order.id.slice(0,8).toUpperCase()}.\n\n=========================================\nREASON:\n=========================================\n${reason||'Payment not received'}\n\n=========================================\nWHAT TO DO NEXT:\n=========================================\n* Please check your UPI app for transaction status\n* If amount was deducted, send us the screenshot\n* Or you can retry the payment\n\nContact us for immediate assistance:\nWhatsApp: +91 7013942909\nEmail: as.businezzz@gmail.com\n\nWe're here to help!`)}`, '_blank');
      toast('Order rejected','warning');
      fetchOrders(); fetchCounts();
    } catch(err) { toast('Error: '+err.message,'error'); }
  }

  async function handleStatus(id, status) {
    try {
      await supabase.from('orders').update({ status }).eq('id',id);
      toast(`Status → ${status}`,'success');
      fetchOrders(); fetchCounts();
    } catch(err) { toast('Error: '+err.message,'error'); }
  }

  async function handleDeleteOrder(id) {
    const ok = await confirm({ title:'Delete Order', message:'This order will be permanently deleted.', confirm:'Delete', type:'danger' });
    if (!ok) return;
    await supabase.from('orders').delete().eq('id',id);
    toast('Order deleted','success'); fetchOrders(); fetchCounts();
  }

  async function handleDeleteProduct(id) {
    const ok = await confirm({ title:'Delete Product', message:'Product will be permanently removed.', confirm:'Delete', type:'danger' });
    if (!ok) return;
    await supabase.from('products').delete().eq('id',id);
    toast('Product deleted','success'); fetchProducts();
  }

  async function handleToggleActive(product) {
    await supabase.from('products').update({ active:!product.active }).eq('id',product.id);
    toast(product.active?'Product hidden':'Product visible','success'); fetchProducts();
  }

  async function handleQuickRestock(product, qty) {
    const newStock = (product.stock || 0) + qty;
    try {
      const { error } = await supabase.from('products').update({ stock: newStock }).eq('id', product.id);
      if (error) throw error;
      toast(`Restocked ${product.name} +${qty} (total: ${newStock})`, 'success');
      fetchProducts();
    } catch(err) {
      toast('Restock failed: ' + err.message, 'error');
    }
  }

  async function handleLogout() {
    const ok = await confirm({ title:'Sign Out', message:'Are you sure you want to sign out?', confirm:'Sign Out' });
    if (!ok) return;
    supabase.auth.signOut(); setUser(null); navigate('/');
  }

  /* ── notifications ── */
  const notifications = [
    ...orders.filter(o=>o.payment_status==='submitted').slice(0,3).map(o=>({ id:`p_${o.id}`, color:'#3B82F6', title:'Payment Submitted', body:`#${o.id.slice(0,8).toUpperCase()} — ₹${o.total_amount?.toFixed(0)}` })),
    ...products.filter(p=>p.stock===0).slice(0,2).map(p=>({ id:`oos_${p.id}`, color:'#EF4444', title:'Out of Stock', body:p.name })),
    ...products.filter(p=>p.stock>0&&p.stock<=5).slice(0,2).map(p=>({ id:`ls_${p.id}`, color:'#F59E0B', title:'Low Stock', body:`${p.name} — ${p.stock} left` })),
  ];
  const unread = notifications.filter(n=>!notifRead.includes(n.id)).length;

  /* ── bulk ── */
  const toggleSelect = (id) => setSelected(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const selectAll = () => setSelected(orders.map(o=>o.id));
  const clearSel = () => setSelected([]);
async function bulkConfirm() {
    const ok = await confirm({ title:`Confirm ${selected.length} orders?`, message:'Will mark all as verified.', confirm:'Confirm All' });
    if (!ok) return;
    for (const id of selected) {
      const o = orders.find(x=>x.id===id);
      if (o) await supabase.from('orders').update({ payment_status:'verified', status:'confirmed', verified_by:user.email, verified_at:new Date().toISOString() }).eq('id',id);
    }
    clearSel(); fetchOrders(); fetchCounts(); toast(`${selected.length} orders confirmed`,'success');
  }
  async function bulkDelete() {
    const ok = await confirm({ title:`Delete ${selected.length} orders?`, message:'Cannot be undone.', confirm:'Delete All', type:'danger' });
    if (!ok) return;
    for (const id of selected) await supabase.from('orders').delete().eq('id',id);
    clearSel(); fetchOrders(); fetchCounts(); toast(`${selected.length} orders deleted`,'success');
  }

  function bulkPrint(overrideOrders) {
    let toPrint = [];
    if (selected.length > 0) {
      toPrint = orders.filter(o => selected.includes(o.id));
    } else if (Array.isArray(overrideOrders) && overrideOrders.length > 0) {
      toPrint = overrideOrders;
    } else {
      toPrint = orders;
    }
    if (!toPrint || !Array.isArray(toPrint) || toPrint.length === 0) {
      toast('Select orders to print', 'warning');
      return;
    }

    function buildLabelHTML(order) {
      const addr = order.shipping_address || {};
      const items = (order.items||[]).map(i =>
        `<tr><td>${i.name}</td><td>${i.quantity}</td><td align="right">Rs.${(i.price*i.quantity).toFixed(0)}</td></tr>`
      ).join('');
      return `<div class='label-card'>
        <div class='lc-header'><span class='brand'>AS HUB</span><span class='oid'>ORDER #${order.id.slice(0,8).toUpperCase()}</span></div>
        <div class='box'>
          <p class='lbl'>DELIVER TO</p>
          <p class='cname'>${addr.name||'Customer'}</p>
          <p class='ph'>Ph: ${addr.phone||'N/A'}</p>
          <p class='addr'>${[addr.house,addr.area,addr.city,addr.state].filter(Boolean).join(', ')}</p>
          <p class='pin'>PIN: ${addr.pincode||''}</p>
        </div>
        <div class='box from'>
          <p class='lbl'>FROM (SHIPPER)</p>
          <p class='fn'>AS HUB - Shaik Asmath</p>
          <p class='fd'>D.No. 25-2-1709, Pragathi Nagar, Podalkur Road, Nellore, AP-524004 | Ph: 7013942909</p>
        </div>
        <div class='box items-box'>
          <p class='lbl'>ORDER ITEMS (${(order.items||[]).length})</p>
          <table><thead><tr><th>Item</th><th>Qty</th><th align="right">Price</th></tr></thead>
          <tbody>${items}<tr class='tot'><td colspan='2'>TOTAL PAID (UPI)</td><td align="right">Rs.${order.total_amount}</td></tr></tbody></table>
          ${order.utr_number?`<span class='badge'>UTR: ${order.utr_number}</span>`:''}
        </div>
        <div class='ft'>
          <span>PRINTED: ${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN')}</span>
          <span class='care'>FRAGILE - HANDLE WITH CARE</span>
        </div>
      </div>`;
    }

    const labelsJson = JSON.stringify(toPrint.map(buildLabelHTML));

    const html = `<!DOCTYPE html><html><head><title>Batch Labels (${toPrint.length})</title>
<style>
/* ── Reset ── */
*{margin:0;padding:0;box-sizing:border-box}

/* ── Force exact A4 paper size with ZERO margin so browser default margins don't split pages ── */
@page {
  size: A4 portrait;
  margin: 0;
}

/* ── Body ── */
body {
  font-family: Arial, sans-serif;
  background: #d0d0d0;
  color: #000;
  -webkit-print-color-adjust: exact !important;
  print-color-adjust: exact !important;
}

/* ── Screen controls bar (hidden during print) ── */
.np {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 18px; background: #1E293B; color: #fff;
  gap: 10px; flex-wrap: wrap; position: sticky; top: 0; z-index: 999;
}
.np-title { font-size: 13px; font-weight: 800; }
.np-controls { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.np label { font-size: 11px; font-weight: 600; color: #CBD5E1; }
.np select { padding: 5px 8px; border-radius: 6px; border: none; font-size: 12px; font-weight: 700; cursor: pointer; background: #fff; color: #0F172A; }
.print-btn { padding: 8px 18px; background: #2563EB; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 800; cursor: pointer; }
.print-btn:hover { background: #1D4ED8; }

#pagesContainer {
  padding: 16px;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
}

/* ── Exact A4 Page Container ── */
.page-wrap {
  width: 210mm;
  height: 297mm;
  max-height: 297mm;
  background: #fff;
  box-shadow: 0 4px 24px rgba(0,0,0,.20);
  overflow: hidden;
  display: grid;
  gap: 3mm;
  padding: 8mm; /* Internal page margin */
  box-sizing: border-box;
}

/* ── Base Label Card ── */
.label-card {
  border: 1.5px solid #000;
  border-radius: 4px;
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0;
  box-sizing: border-box;
}

.lc-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #000; padding-bottom: 3px; margin-bottom: 2px; flex-shrink: 0; }
.brand { font-weight: 900; }
.oid { font-family: monospace; font-weight: 900; background: #f0f0f0; padding: 2px 4px; border-radius: 3px; }
.box { background: #fafafa; border-radius: 3px; padding: 3px 4px; margin-bottom: 2px; border: 1px solid #ddd; flex-shrink: 0; }
.lbl { font-weight: 900; text-transform: uppercase; letter-spacing: 0.5px; color: #555; margin-bottom: 1px; }
.cname { font-weight: 900; margin-bottom: 1px; }
.ph { font-weight: 700; margin-bottom: 1px; }
.addr { line-height: 1.3; color: #222; }
.pin { font-weight: 900; margin-top: 1px; }
.from { background: #f5f5f5; }
.fn { font-weight: 800; margin-bottom: 1px; }
.fd { color: #555; line-height: 1.3; }
.items-box { flex: 1; overflow: hidden; }
table { width: 100%; border-collapse: collapse; }
th { background: #333; color: #fff; padding: 2px 3px; text-transform: uppercase; text-align: left; }
td { padding: 2px 3px; border-bottom: 1px solid #e0e0e0; }
.tot td { font-weight: 900; background: #f5f5f5; border-top: 1.5px solid #333; }
.badge { display: inline-block; background: #000; color: #fff; font-weight: 900; padding: 1px 4px; border-radius: 2px; margin-top: 1px; }
.ft { border-top: 1px solid #ddd; padding-top: 2px; margin-top: auto; display: flex; justify-content: space-between; color: #666; flex-shrink: 0; }
.care { background: #000; color: #fff; padding: 1px 4px; border-radius: 2px; font-weight: 700; }

/* ── Density Adjustments for Each Layout ── */
.density-1 .label-card { padding: 10px; }
.density-1 { font-size: 11px; }
.density-1 .brand { font-size: 18px; }
.density-1 .oid { font-size: 12px; }
.density-1 .cname { font-size: 15px; }

.density-2 .label-card { padding: 8px; }
.density-2 { font-size: 10px; }
.density-2 .brand { font-size: 15px; }
.density-2 .oid { font-size: 10px; }
.density-2 .cname { font-size: 13px; }

.density-4 .label-card { padding: 5px 6px; }
.density-4 { font-size: 8px; }
.density-4 .brand { font-size: 12px; }
.density-4 .oid { font-size: 8px; }
.density-4 .lbl { font-size: 6px; }
.density-4 .cname { font-size: 10px; }
.density-4 .ph { font-size: 8px; }
.density-4 .addr { font-size: 7.5px; }
.density-4 .pin { font-size: 9.5px; }

.density-6 .label-card { padding: 4px; }
.density-6 { font-size: 7px; }
.density-6 .brand { font-size: 10px; }
.density-6 .oid { font-size: 7px; }
.density-6 .lbl { font-size: 5.5px; }
.density-6 .cname { font-size: 8.5px; }

.density-8 .label-card { padding: 3px; }
.density-8 { font-size: 6.5px; }
.density-8 .brand { font-size: 9px; }
.density-8 .oid { font-size: 6.5px; }
.density-8 .lbl { font-size: 5px; }
.density-8 .cname { font-size: 8px; }

.density-10 .label-card { padding: 2px; }
.density-10 { font-size: 6px; }
.density-10 .brand { font-size: 8px; }
.density-10 .oid { font-size: 6px; }
.density-10 .lbl { font-size: 4.5px; }
.density-10 .cname { font-size: 7.5px; }
.density-10 .ph { font-size: 6.5px; }
.density-10 .addr { font-size: 6px; }
.density-10 .pin { font-size: 7.5px; }

.back-btn {
  background: #334155;
  color: #ffffff;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.back-btn:hover { background: #475569; }

/* ── Print Overrides ── */
@media print {
  html, body {
    width: 210mm !important;
    height: 297mm !important;
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    overflow: hidden !important;
  }
  .np { display: none !important; }
  #pagesContainer {
    padding: 0 !important;
    margin: 0 !important;
    gap: 0 !important;
    display: block !important;
    width: 210mm !important;
  }
  .page-wrap {
    width: 210mm !important;
    height: 297mm !important;
    max-height: 297mm !important;
    margin: 0 !important;
    padding: 8mm !important;
    box-shadow: none !important;
    page-break-after: always !important;
    break-after: page !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    overflow: hidden !important;
  }
  .page-wrap:last-child {
    page-break-after: auto !important;
    break-after: auto !important;
  }
}
</style></head>
<body>
<div class="np">
  <div style="display:flex;align-items:center;gap:12px">
    <button class="back-btn" onclick="window.close()">&larr; Back</button>
    <span class="np-title">&#128230; ${toPrint.length} Labels Ready</span>
  </div>
  <div class="np-controls">
    <label for="perPage">Labels per A4 page:</label>
    <select id="perPage" onchange="buildPages(this.value)">
      <option value="1">1 per page (full size)</option>
      <option value="2">2 per page</option>
      <option value="4" selected>4 per page (2&times;2)</option>
      <option value="6">6 per page (2&times;3)</option>
      <option value="8">8 per page (2&times;4)</option>
      <option value="10">10 per page (2&times;5)</option>
    </select>
    <button class="print-btn" onclick="window.print()">&#128438; Print All Labels</button>
  </div>
</div>
<div id="pagesContainer"></div>
<script>
var LAYOUT = {
  '1': { cols: 1, rows: 1 },
  '2': { cols: 1, rows: 2 },
  '4': { cols: 2, rows: 2 },
  '6': { cols: 2, rows: 3 },
  '8': { cols: 2, rows: 4 },
  '10': { cols: 2, rows: 5 }
};
var LABELS = ${labelsJson};

function buildPages(n) {
  n = parseInt(n);
  var cfg = LAYOUT[String(n)] || { cols: 2, rows: 2 };
  var perPage = cfg.cols * cfg.rows;
  var gtc = '';
  for (var ci = 0; ci < cfg.cols; ci++) gtc += (ci ? ' ' : '') + '1fr';
  var gtr = '';
  for (var ri = 0; ri < cfg.rows; ri++) gtr += (ri ? ' ' : '') + '1fr';

  var c = document.getElementById('pagesContainer');
  c.innerHTML = '';

  for (var i = 0; i < LABELS.length; i += perPage) {
    var pw = document.createElement('div');
    pw.className = 'page-wrap density-' + n;
    pw.style.gridTemplateColumns = gtc;
    pw.style.gridTemplateRows = gtr;
    pw.innerHTML = LABELS.slice(i, i + perPage).join('');
    c.appendChild(pw);
  }
}
buildPages(4);
</script>
</body></html>`;

    const w = window.open('','_blank','width=960,height=960');
    if (!w) { toast('Please allow popups to print labels', 'warning'); return; }
    w.document.write(html);
    w.document.close();
    w.focus();
    toast(`${toPrint.length} label${toPrint.length>1?'s':''} ready to print`, 'success');
  }


  /* derived product categories */
  const allTailoringList = products.filter(p => (p.category || '').toLowerCase() === 'tailoring' || !(p.category === 'fashion'));
  const allFashionList = products.filter(p => (p.category || '').toLowerCase() === 'fashion');

  const tailoringProducts = allTailoringList.filter(p => {
    const s = search.toLowerCase().trim();
    const ms = !s || (p.name || '').toLowerCase().includes(s) || (p.sub_category || '').toLowerCase().includes(s);
    const normTab = normalizeCategoryKey(tailoringSubCat);
    const mSub = normTab === 'all' || normalizeCategoryKey(p.sub_category) === normTab || (p.sub_category || '').toLowerCase() === tailoringSubCat.toLowerCase();
    return ms && mSub;
  });

  const fashionProducts = allFashionList.filter(p => {
    const s = search.toLowerCase().trim();
    const ms = !s || (p.name || '').toLowerCase().includes(s) || (p.sub_category || '').toLowerCase().includes(s);
    const normTab = normalizeCategoryKey(fashionSubCat);
    const mSub = normTab === 'all' || normalizeCategoryKey(p.sub_category) === normTab || (p.sub_category || '').toLowerCase() === fashionSubCat.toLowerCase();
    return ms && mSub;
  });

  const handleDuplicateProduct = async (p) => {
    const { id: _id, created_at: _c, updated_at: _u, ...rest } = p;
    const payload = { ...rest, name: rest.name + ' (Copy)', active: false };
    let { error } = await supabase.from('products').insert([payload]);
    if (error && error.message?.toLowerCase()?.includes('variants') && 'variants' in payload) {
      delete payload.variants;
      const res = await supabase.from('products').insert([payload]);
      error = res.error;
    }
    if (!error) {
      toast('Product duplicated!', 'success');
      fetchProducts();
    } else {
      toast('Error: ' + error.message, 'error');
    }
  };

  const today = new Date().toDateString();
  const todayOrders  = allOrders.filter(o=>new Date(o.created_at).toDateString()===today).length;
  const todayRevenue = allOrders.filter(o=>new Date(o.created_at).toDateString()===today&&o.payment_status==='verified').reduce((s,o)=>s+(o.total_amount||0),0);
  const monthRevenue = allOrders.filter(o=>{ const d=new Date(o.created_at); const n=new Date(); return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear()&&o.payment_status==='verified'; }).reduce((s,o)=>s+(o.total_amount||0),0);

  const thisMonth = new Date().toLocaleDateString('en-IN',{month:'long',year:'numeric'});
  const thisMonthCount = orders.filter(o=>new Date(o.created_at).toLocaleDateString('en-IN',{month:'long',year:'numeric'})===thisMonth).length;

  function groupByMonth(orders) {
    const g = {};
    orders.forEach(o => {
      const d=new Date(o.created_at);
      const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const label=d.toLocaleDateString('en-IN',{month:'long',year:'numeric'});
      if (!g[k]) g[k]={label,orders:[],total:0};
      g[k].orders.push(o); g[k].total+=o.total_amount||0;
    });
    return Object.values(g).sort((a,b)=>b.label.localeCompare(a.label));
  }

  if (!user||user.email!==ADMIN_EMAIL) return null;

  return (
    <div className="admin-panel" style={{ minHeight:'100vh', background:'#F8FAFC', display:'flex', flexDirection:'column', fontFamily:"'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif", overflowX:'hidden' }}>
      <SEO title="Admin Panel | Asmalabel" robots="noindex, nofollow" canonical="https://asmalabel.in/admin" />
      <ToastContainer />
      <ConfirmDialog />
      {cmdOpen && <CommandPalette orders={allOrders} products={products} onClose={()=>setCmdOpen(false)} />}

      {/* ── TOP NAV (Mobile-first) ─────────────────────────── */}
      <header style={{ background:'rgba(255,255,255,0.98)', backdropFilter:'blur(16px)', WebkitBackdropFilter:'blur(16px)', borderBottom:'1px solid #E5E7EB',
        height:'58px', display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 16px', position:'sticky', top:0, zIndex:100,
        boxShadow:'0 1px 4px rgba(0,0,0,.03)', flexShrink:0, gap:'10px', boxSizing:'border-box', width:'100%' }}>

        {/* Left Brand with Real Logo Image */}
        <div style={{ display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
          <div style={{ width:'36px', height:'36px', borderRadius:'50%', overflow:'hidden',
            border:'1px solid #E2E8F0', background:'#F5EBE0',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
            boxShadow:'0 2px 6px rgba(15,23,42,0.06)' }}>
            <img src="/logo.png" alt="Asmalabel Hub" style={{ width:'100%', height:'100%', objectFit:'contain', borderRadius:'50%', background:'#F5EBE0' }} onError={e=>{e.target.style.display='none'; if(e.target.nextSibling) e.target.nextSibling.style.display='flex';}} />
            <div style={{ display:'none', width:'100%', height:'100%', alignItems:'center', justifyContent:'center', background:'#1E293B' }}>
              <BarChart2 size={16} color="#FFFFFF" />
            </div>
          </div>
          <span style={{ fontSize:'18px', fontWeight:900, color:'#0F172A', fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:'-0.5px' }}>Asmalabel</span>
        </div>

        {/* Center search */}
        <button onClick={()=>setCmdOpen(true)}
          style={{ display:'flex', alignItems:'center', gap:'8px', padding:'7px 12px',
            borderRadius:'10px', background:'#F1F5F9', border:'1px solid #E2E8F0',
            cursor:'pointer', fontSize:'12px', color:'#64748B', fontWeight:600,
            flex:1, minWidth:0, maxWidth:'300px', transition:'all 200ms ease' }}>
          <Search size={14} color="#94A3B8" style={{ flexShrink:0 }} />
          <span style={{ flex:1, textAlign:'left', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>Search orders, products...</span>
          <span className="admin-kbd-hide" style={{ fontSize:'10px', fontWeight:800, background:'#FFFFFF', border:'1px solid #CBD5E1', padding:'2px 5px', borderRadius:'5px', color:'#475569', flexShrink:0 }}>⌘K</span>
        </button>

        {/* Right Actions */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
          {/* Notifications button */}
          <div style={{ position:'relative' }}>
            <button onClick={()=>{ setNotifOpen(o=>!o); setUserMenuOpen(false); }}
              style={{ width:'36px', height:'36px', borderRadius:'10px', background:'#F8FAFC',
                border:'1px solid #E5E7EB', cursor:'pointer', display:'flex', alignItems:'center',
                justifyContent:'center', position:'relative', transition:'all 200ms ease' }}>
              <Bell size={16} color="#475569" />
              {unread > 0 && <span style={{ position:'absolute', top:'5px', right:'5px',
                width:'8px', height:'8px', borderRadius:'50%',
                background:'#EF4444', border:'2px solid white' }} />}
            </button>
            {notifOpen && (
              <div style={{ position:'absolute', right:0, top:'46px', width:'300px',
                background:'#FFFFFF', borderRadius:'14px', border:'1px solid #E2E8F0',
                boxShadow:'0 16px 36px -8px rgba(15, 23, 42, 0.15)', zIndex:200, overflow:'hidden' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'12px 14px', borderBottom:'1px solid #F1F5F9', background:'#F8FAFC' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                    <Bell size={14} color="#0F172A" />
                    <span style={{ fontSize:'13px', fontWeight:800, color:'#0F172A' }}>Notifications</span>
                    {unread>0 && <span style={{ background:'#EF4444', color:'white', fontSize:'10px', fontWeight:800, borderRadius:'99px', padding:'1px 6px' }}>{unread}</span>}
                  </div>
                  <button onClick={()=>{ const ids=notifications.map(n=>n.id); localStorage.setItem('admin_notif_read',JSON.stringify(ids)); setNotifRead(ids); setNotifOpen(false); }}
                    style={{ background:'none', border:'none', cursor:'pointer', fontSize:'11px', fontWeight:700, color:'#2563EB' }}>Mark all read</button>
                </div>
                <div style={{ maxHeight:'260px', overflowY:'auto' }}>
                  {notifications.length===0 ? (
                    <div style={{ padding:'20px', textAlign:'center', color:'#94A3B8', fontSize:'12px' }}>No new notifications</div>
                  ) : notifications.map(n=>(
                    <div key={n.id} style={{ padding:'12px 14px', borderBottom:'1px solid #F8FAFC', opacity:n.read?.6:1, background:n.read?'transparent':'#F0F9FF', display:'flex', alignItems:'flex-start', gap:'10px' }}>
                      <div style={{ width:'7px', height:'7px', borderRadius:'50%', background:n.read?'#CBD5E1':'#2563EB', marginTop:'5px', flexShrink:0 }}/>
                      <div style={{ flex:1 }}>
                        <p style={{ fontSize:'12px', fontWeight:800, color:'#0F172A', margin:0 }}>{n.title}</p>
                        <p style={{ fontSize:'11px', color:'#64748B', margin:'2px 0 0 0' }}>{n.desc}</p>
                        <span style={{ fontSize:'10px', color:'#94A3B8', marginTop:'4px', display:'block' }}>{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User profile dropdown (FIXED: avatar click toggles user menu with Return to Store & Sign Out) */}
          <div style={{ position:'relative' }}>
            <button onClick={() => { setUserMenuOpen(o => !o); setNotifOpen(false); }}
              title="Admin Menu"
              style={{ width:'36px', height:'36px', borderRadius:'10px', background:'#0F172A',
                color:'white', fontWeight:800, fontSize:'14px', border:'none', cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 8px rgba(15,23,42,0.2)' }}>
              A
            </button>

            {userMenuOpen && (
              <div style={{ position:'absolute', right:0, top:'46px', width:'220px',
                background:'#FFFFFF', borderRadius:'14px', border:'1px solid #E2E8F0',
                boxShadow:'0 16px 36px -8px rgba(15, 23, 42, 0.18)', zIndex:250, overflow:'hidden',
                padding:'6px' }}>

                <div style={{ padding:'10px 12px', borderBottom:'1px solid #F1F5F9', marginBottom:'4px', background:'#F8FAFC', borderRadius:'10px' }}>
                  <p style={{ fontSize:'10px', fontWeight:800, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'.5px', margin:0 }}>Signed in as</p>
                  <p style={{ fontSize:'12px', fontWeight:800, color:'#0F172A', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:'2px', margin:0 }}>{user?.email}</p>
                  <span style={{ fontSize:'10px', fontWeight:800, color:'#059669', background:'#ECFDF5', padding:'2px 8px', borderRadius:'99px', display:'inline-block', marginTop:'4px' }}>
                    ● Administrator
                  </span>
                </div>

                <button onClick={() => { setUserMenuOpen(false); navigate('/'); }}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px',
                    padding:'9px 12px', borderRadius:'8px', background:'transparent',
                    border:'none', cursor:'pointer', fontSize:'12px', fontWeight:700,
                    color:'#0F172A', transition:'background .15s', textAlign:'left' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Home size={15} color="#2563EB" />
                  <span>Return to Store</span>
                </button>

                <button onClick={async () => { setUserMenuOpen(false); await supabase.auth.signOut(); setUser(null); navigate('/'); }}
                  style={{ width:'100%', display:'flex', alignItems:'center', gap:'10px',
                    padding:'9px 12px', borderRadius:'8px', background:'transparent',
                    border:'none', cursor:'pointer', fontSize:'12px', fontWeight:800,
                    color:'#DC2626', transition:'background .15s', textAlign:'left', marginTop:'2px' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <LogOut size={15} color="#DC2626" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── BODY: STICKY SEGMENTED TABS + CONTENT ────────────── */}
      <div style={{ flex:1, minHeight:0 }}>

        {/* Tab switcher — full width & scrollable on mobile */}
        <div className="admin-tab-bar-outer" style={{ background:'#FFFFFF', borderBottom:'1px solid #E5E7EB', padding:'8px 16px', position:'sticky', top:'58px', zIndex:90, boxSizing:'border-box', width:'100%' }}>
          <div style={{ maxWidth:'1360px', margin:'0 auto' }}>
            <div className="admin-tab-bar-inner" style={{ display:'flex', gap:'4px', background:'#F1F5F9', padding:'3px', borderRadius:'12px', border:'1px solid #E2E8F0', overflowX:'auto', scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
              {[
                { key:'orders',    label:'Orders',    icon:ShoppingBag },
                { key:'products',  label:'Products',  icon:Package },
                { key:'coupons',   label:'Coupons',   icon:Tag },
                { key:'cms',       label:'CMS',       icon:Sparkles },
                { key:'more',      label:'More',      icon:Settings },
              ].map(({ key, label, icon:Icon }) => (
                <button key={key} onClick={() => setPage(key)}
                  style={{ flex:'1 0 auto', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px',
                    padding:'8px 12px', borderRadius:'9px', fontWeight:800,
                    fontSize:'12px', border:'none', cursor:'pointer', transition:'all 200ms ease',
                    background: page===key ? '#FFFFFF' : 'transparent',
                    color: page===key ? '#0F172A' : '#64748B',
                    boxShadow: page===key ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                    whiteSpace:'nowrap', position:'relative' }}>
                  <Icon size={14} strokeWidth={2.2} color={page===key ? '#2563EB' : '#64748B'} />
                  {label}
                  {key==='orders' && counts.all_pending > 0 && (
                    <span style={{ background:'#DC2626', color:'white', fontSize:'9px',
                      fontWeight:900, borderRadius:'99px', padding:'1px 5px',
                      minWidth:'15px', textAlign:'center', marginLeft:'2px' }}>
                      {counts.all_pending > 9 ? '9+' : counts.all_pending}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="admin-main" style={{ padding:'16px 16px 90px 16px', maxWidth:'1360px', margin:'0 auto', boxSizing:'border-box', width:'100%' }}>

          {/* ── ORDERS TAB ── */}
          {page==='orders' && (
            <div className="page-enter" style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

              {/* Toolbar — full width even distribution */}
              <div style={{ background:'#FFFFFF', borderRadius:'14px', border:'1px solid #E5E7EB', padding:'14px 16px', boxSizing:'border-box', display:'flex', flexDirection:'column', gap:'12px', width:'100%' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'6px' }}>
                  <div>
                    <h1 style={{ fontSize:'18px', fontWeight:900, color:'#0F172A', margin:0, letterSpacing:'-0.3px' }}>Orders</h1>
                    <p style={{ fontSize:'11px', color:'#64748B', margin:'2px 0 0 0' }}>Manage, verify, ship, and export store purchases</p>
                  </div>
                </div>

                {/* 1. Date Filter Pills — 100% full width evenly distributed */}
                <div style={{ display:'flex', width:'100%', gap:'4px', background:'#F1F5F9', padding:'3px', borderRadius:'10px', boxSizing:'border-box' }}>
                  {['all','today','week','month'].map(f=>(
                    <button key={f} onClick={()=>setDateFilter(f)}
                      style={{ flex:1, padding:'6px 4px', borderRadius:'7px', fontSize:'11px', fontWeight:700, cursor:'pointer', border:'none', whiteSpace:'nowrap', textAlign:'center', transition:'all 150ms ease', display:'flex', alignItems:'center', justifyContent:'center',
                        background: dateFilter===f ? '#FFFFFF' : 'transparent',
                        color: dateFilter===f ? '#0F172A' : '#64748B',
                        boxShadow: dateFilter===f ? '0 1px 4px rgba(0,0,0,0.06)' : 'none' }}>
                      {f==='all'?'All':f==='today'?'Today':f==='week'?'This Week':'This Month'}
                    </button>
                  ))}
                </div>

                {/* 2. Action Buttons Row — 100% full width evenly distributed */}
                <div style={{ display:'flex', gap:'8px', width:'100%', alignItems:'center' }}>
                  <button onClick={()=>exportOrdersCSV(selected.length>0?orders.filter(o=>selected.includes(o.id)):orders)}
                    style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', padding:'8px 10px', borderRadius:'9px', background:'#FFFFFF', border:'1px solid #CBD5E1', color:'#334155', fontSize:'11px', fontWeight:800, cursor:'pointer' }}>
                    <Download size={13} color="#2563EB" /> Export CSV
                  </button>

                  <button onClick={()=>{
                    if (selected.length > 0) {
                      bulkPrint();
                    } else {
                      const labelOrders = dateFilter==='today'
                        ? orders.filter(o=>new Date(o.created_at).toDateString()===new Date().toDateString())
                        : dateFilter==='week'
                        ? orders.filter(o=>new Date(o.created_at)>=new Date(Date.now()-7*86400000))
                        : dateFilter==='month'
                        ? orders.filter(o=>{const d=new Date(o.created_at);const n=new Date();return d.getMonth()===n.getMonth()&&d.getFullYear()===n.getFullYear();})
                        : orders;
                      if (labelOrders.length===0){toast('No orders to print','warning');return;}
                      bulkPrint(labelOrders);
                    }
                  }}
                    style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:'5px', padding:'8px 10px', borderRadius:'9px',
                      background:'#0F172A', color:'#FFFFFF',
                      fontSize:'11px', fontWeight:800, border:'none', cursor:'pointer', boxShadow:'0 2px 6px rgba(15,23,42,0.12)' }}>
                    <Printer size={13} /> Print Labels
                  </button>

                  <button onClick={fetchOrders} title="Refresh Data"
                    style={{ width:'34px', height:'34px', borderRadius:'9px', background:'#FFFFFF', border:'1px solid #CBD5E1', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <RefreshCw size={13} color="#475569" />
                  </button>
                </div>
              </div>

              {/* Status Tabs Bar */}
              <div style={{ display:'flex', gap:'6px', overflowX:'auto', paddingBottom:'4px' }} className="sh-scroll-hide">
                {ORDER_STATUS.map(t=>(
                  <button key={t.key} onClick={()=>{setOrderTab(t.key);setSelected([]);}}
                    style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'10px', whiteSpace:'nowrap',
                      fontWeight:800, fontSize:'12px',
                      border: orderTab===t.key ? '1px solid #0F172A' : '1px solid #E2E8F0',
                      cursor:'pointer', flexShrink:0, transition:'all 150ms ease',
                      background: orderTab===t.key ? '#0F172A' : '#FFFFFF',
                      color: orderTab===t.key ? '#FFFFFF' : '#475569',
                      boxShadow: orderTab===t.key ? '0 4px 12px rgba(15,23,42,0.15)' : 'none' }}>
                    {t.label}
                    {counts[t.key]>0 && (
                      <span style={{ background: orderTab===t.key ? 'rgba(255,255,255,0.2)' : '#F1F5F9',
                        color: orderTab===t.key ? '#FFFFFF' : '#0F172A',
                        fontSize:'9px', fontWeight:900, borderRadius:'99px', padding:'1px 5px' }}>
                        {counts[t.key]>99?'99+':counts[t.key]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Bulk Action Bar */}
              {selected.length>0 && (
                <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap', padding:'10px 12px', background:'#0F172A', borderRadius:'12px', color:'#FFFFFF' }}>
                  <span style={{ fontSize:'11px', fontWeight:800 }}>✓ {selected.length} selected</span>
                  <div style={{ flex:1 }}/>
                  <button onClick={bulkConfirm} style={{ padding:'5px 10px', borderRadius:'7px', background:'#059669', color:'white', fontSize:'11px', fontWeight:800, border:'none', cursor:'pointer' }}>Verify</button>
                  <button onClick={()=>{exportOrdersCSV(orders.filter(o=>selected.includes(o.id)));}} style={{ padding:'5px 10px', borderRadius:'7px', background:'#2563EB', color:'white', fontSize:'11px', fontWeight:800, border:'none', cursor:'pointer' }}>CSV</button>
                  <button onClick={() => bulkPrint()} style={{ padding:'5px 10px', borderRadius:'7px', background:'#FFFFFF', color:'#0F172A', fontSize:'11px', fontWeight:800, border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'3px' }}><Printer size={11}/>Print</button>
                  <button onClick={bulkDelete} style={{ padding:'5px 10px', borderRadius:'7px', background:'#DC2626', color:'white', fontSize:'11px', fontWeight:800, border:'none', cursor:'pointer' }}>Delete</button>
                  <button onClick={clearSel} style={{ padding:'5px 10px', borderRadius:'7px', background:'rgba(255,255,255,0.15)', color:'white', fontSize:'11px', fontWeight:800, border:'none', cursor:'pointer' }}>✕</button>
                </div>
              )}

              {/* Select all check */}
              {orders.length>0 && !loading && (
                <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'0 2px' }}>
                  <input type="checkbox" checked={selected.length===orders.length} onChange={e=>e.target.checked?selectAll():clearSel()} style={{ width:'15px', height:'15px', cursor:'pointer', accentColor:'#0F172A' }} />
                  <span style={{ fontSize:'11px', color:'#475569', fontWeight:700 }}>Select all {orders.length}</span>
                  <span style={{ marginLeft:'auto', fontSize:'11px', color:'#64748B', fontWeight:600 }}>{thisMonthCount} this month</span>
                </div>
              )}

              {/* Orders List / Cards */}
              {loading ? (
                <div>{[...Array(3)].map((_,i)=><OrderSkeleton key={i}/>)}</div>
              ) : orders.length===0 ? (
                <EmptyState icon={ShoppingBag} title="No orders found" desc="No orders match your selected filters."/>
              ) : (
                groupByMonth(orders).map(group=>(
                  <div key={group.label}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 2px', marginBottom:'6px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                        <div style={{ width:'3px', height:'14px', borderRadius:'99px', background:'#0F172A' }}/>
                        <p style={{ fontSize:'13px', fontWeight:900, color:'#111827', margin:0 }}>{group.label}</p>
                        <span style={{ background:'#F1F5F9', color:'#475569', fontSize:'10px', fontWeight:800, borderRadius:'99px', padding:'1px 7px' }}>{group.orders.length}</span>
                      </div>
                      <p style={{ fontSize:'11px', fontWeight:800, color:'#059669', margin:0 }}>₹{group.total.toFixed(0)}</p>
                    </div>
                    {group.orders.map(o=>(
                      <OrderCard key={o.id} order={o}
                        onConfirm={handleConfirm} onReject={handleReject}
                        onStatus={handleStatus} onDelete={handleDeleteOrder}
                        confirming={confirming===o.id}
                        selected={selected.includes(o.id)}
                        onSelect={()=>toggleSelect(o.id)}/>
                    ))}
                  </div>
                ))
              )}
            </div>
          )}
          {/* ── PRODUCTS TAB — 2 Dedicated Category Tabs ── */}
          {page==='products' && (
            <div className="page-enter" style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

              {/* ── TOP HORIZONTAL CATEGORY TABS BAR (Mobile Fixed & Theme-Matched) ── */}
              <div style={{ background:'#F1F5F9', borderRadius:'12px', border:'1px solid #E2E8F0', padding:'3px', boxSizing:'border-box', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4px', width:'100%' }}>
                <button
                  type="button"
                  onClick={() => setProductTab('tailoring')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 8px',
                    borderRadius: '9px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 800,
                    transition: 'all 0.15s ease',
                    background: productTab === 'tailoring' ? '#0F172A' : 'transparent',
                    color: productTab === 'tailoring' ? '#FFFFFF' : '#64748B',
                    boxShadow: productTab === 'tailoring' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                    minWidth: 0,
                    width: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}
                >
                  <span style={{ fontSize: '14px', flexShrink: 0 }}>🧵</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                    Tailoring Tools
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 900,
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    background: productTab === 'tailoring' ? 'rgba(255,255,255,0.22)' : '#E2E8F0',
                    color: productTab === 'tailoring' ? '#FFFFFF' : '#475569',
                    flexShrink: 0,
                    lineHeight: '14px'
                  }}>
                    {allTailoringList.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setProductTab('fashion')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '9px 8px',
                    borderRadius: '9px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 800,
                    transition: 'all 0.15s ease',
                    background: productTab === 'fashion' ? '#0F172A' : 'transparent',
                    color: productTab === 'fashion' ? '#FFFFFF' : '#64748B',
                    boxShadow: productTab === 'fashion' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                    minWidth: 0,
                    width: '100%',
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}
                >
                  <span style={{ fontSize: '14px', flexShrink: 0 }}>👗</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                    Women's Fashion
                  </span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: 900,
                    padding: '1px 6px',
                    borderRadius: '9999px',
                    background: productTab === 'fashion' ? 'rgba(255,255,255,0.22)' : '#E2E8F0',
                    color: productTab === 'fashion' ? '#FFFFFF' : '#475569',
                    flexShrink: 0,
                    lineHeight: '14px'
                  }}>
                    {allFashionList.length}
                  </span>
                </button>
              </div>

              {/* ── HORIZONTAL SUBCATEGORY PILLS BAR + MANAGE BUTTON ── */}
              <div style={{ display:'flex', gap:'6px', alignItems:'center', overflowX:'auto', paddingBottom:'4px', scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }} className="sh-scroll-hide">
                {getSubcategoriesList(productTab).map(sc => {
                  const isTailoring = productTab === 'tailoring';
                  const currentList = isTailoring ? allTailoringList : allFashionList;
                  const normKey = normalizeCategoryKey(sc.key || sc.id);
                  const count = normKey === 'all'
                    ? currentList.length
                    : currentList.filter(p => normalizeCategoryKey(p.sub_category) === normKey || (p.sub_category || '').toLowerCase() === normKey).length;
                  const active = (isTailoring ? normalizeCategoryKey(tailoringSubCat) : normalizeCategoryKey(fashionSubCat)) === normKey;

                  return (
                    <button
                      key={normKey}
                      onClick={() => isTailoring ? setTailoringSubCat(sc.key) : setFashionSubCat(sc.key)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '8px',
                        border: active ? '1px solid #0F172A' : '1px solid #E2E8F0',
                        background: active ? '#0F172A' : '#FFFFFF',
                        color: active ? '#FFFFFF' : '#475569',
                        fontSize: '11.5px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.12s ease',
                        flexShrink: 0
                      }}
                    >
                      <span>{sc.label}</span>
                      <span style={{
                        fontSize: '9.5px',
                        background: active ? 'rgba(255,255,255,0.22)' : '#F1F5F9',
                        color: active ? '#FFFFFF' : '#64748B',
                        padding: '1px 5px',
                        borderRadius: '9999px',
                        fontWeight: 900
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}

                {/* Manage Categories & Subcategories Button */}
                <button
                  onClick={() => setCategoryModalOpen(true)}
                  title="Add, edit, or rename subcategories"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: '#F8FAFC',
                    border: '1px dashed #94A3B8',
                    color: '#0F172A',
                    fontSize: '11.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.12s ease'
                  }}
                >
                  <Settings2 size={12} color="#0F172A" />
                  <span>Edit Categories</span>
                </button>
              </div>

              {/* ── ACTION & SEARCH TOOLBAR ── */}
              <div style={{ background:'#FFFFFF', borderRadius:'14px', border:'1px solid #E5E7EB', padding:'12px 14px', display:'flex', flexDirection:'column', gap:'10px', boxShadow:'0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px' }}>
                  <div>
                    <h2 style={{ fontSize:'15px', fontWeight:900, color:'#0F172A', margin:0 }}>
                      {productTab === 'tailoring' ? '🧵 Tailoring Machinery & Tools Catalog' : "👗 Women's Fashion & Textile Collection"}
                    </h2>
                    <p style={{ fontSize:'11px', color:'#64748B', margin:'2px 0 0 0' }}>
                      {productTab === 'tailoring'
                        ? `Showing ${tailoringProducts.length} of ${allTailoringList.length} tailoring items`
                        : `Showing ${fashionProducts.length} of ${allFashionList.length} fashion & textile items`}
                    </p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
                    <button
                      onClick={() => setCategoryModalOpen(true)}
                      style={{ display:'flex', alignItems:'center', gap:'4px', padding:'7px 11px', borderRadius:'8px', background:'#F1F5F9', border:'1px solid #E2E8F0', color:'#0F172A', fontSize:'11px', fontWeight:800, cursor:'pointer' }}
                    >
                      <Settings2 size={12} /> Edit Categories
                    </button>
                    <button
                      onClick={() => setModal(productTab === 'tailoring' ? 'add_tailoring' : 'add_fashion')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '7px 13px',
                        borderRadius: '9px',
                        background: '#0F172A',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '11.5px',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(15,23,42,0.2)'
                      }}
                    >
                      <Plus size={13} /> {productTab === 'tailoring' ? 'Add Tailoring Product' : 'Add Fashion Product'}
                    </button>
                    <button
                      onClick={() => exportProductsCSV(productTab === 'tailoring' ? allTailoringList : allFashionList)}
                      style={{ display:'flex', alignItems:'center', gap:'4px', padding:'7px 10px', borderRadius:'8px', background:'#F1F5F9', border:'1px solid #E2E8F0', color:'#334155', fontSize:'11px', fontWeight:800, cursor:'pointer' }}
                    >
                      <Download size={12} /> CSV
                    </button>
                  </div>
                </div>

                {/* Search input */}
                <div style={{ position:'relative', width:'100%' }}>
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder={productTab === 'tailoring' ? 'Search tailoring machines, threads, needles...' : 'Search dresses, kurtis, tops, fabrics...'}
                    style={{ width:'100%', padding:'8px 10px 8px 30px', borderRadius:'9px', border:'1px solid #E2E8F0', fontSize:'12px', outline:'none', background:'#F8FAFC', boxSizing:'border-box' }}
                  />
                  <Search size={13} color="#94A3B8" style={{ position:'absolute', left:'9px', top:'50%', transform:'translateY(-50%)' }} />
                  {search && (
                    <button onClick={() => setSearch('')} style={{ position:'absolute', right:'8px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#94A3B8' }}>
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* ── METRICS STRIP (Slate Theme) ── */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(110px, 1fr))', gap:'8px' }}>
                {(productTab === 'tailoring' ? [
                  { label:'Total Tailoring', value:allTailoringList.length, c:'#0F172A' },
                  { label:'Active', value:allTailoringList.filter(p=>p.active).length, c:'#059669' },
                  { label:'Hidden', value:allTailoringList.filter(p=>!p.active).length, c:'#64748B' },
                  { label:'Low Stock', value:allTailoringList.filter(p=>p.stock!==null&&p.stock<=5).length, c:'#D97706' },
                ] : [
                  { label:'Total Fashion', value:allFashionList.length, c:'#0F172A' },
                  { label:'Active', value:allFashionList.filter(p=>p.active).length, c:'#059669' },
                  { label:'Hidden', value:allFashionList.filter(p=>!p.active).length, c:'#64748B' },
                  { label:'Low Stock', value:allFashionList.filter(p=>p.stock!==null&&p.stock<=5).length, c:'#D97706' },
                ]).map(({ label, value, c }) => (
                  <div key={label} style={{ background:'#FFFFFF', borderRadius:'10px', padding:'9px 12px', border:'1px solid #E5E7EB' }}>
                    <p style={{ fontSize:'10px', fontWeight:800, color:'#64748B', textTransform:'uppercase', margin:0 }}>{label}</p>
                    <p style={{ fontSize:'18px', fontWeight:900, color: c, margin:'2px 0 0 0' }}>{value}</p>
                  </div>
                ))}
              </div>

              {/* ── PRODUCTS GRID ── */}
              {loading ? (
                <div className="admin-products-grid">
                  {[...Array(6)].map((_,i)=><ProductSkeleton key={i}/>)}
                </div>
              ) : (productTab === 'tailoring' ? tailoringProducts : fashionProducts).length === 0 ? (
                <EmptyState
                  icon={Package}
                  title={productTab === 'tailoring' ? 'No tailoring products found' : 'No women fashion products found'}
                  desc={search ? `No items match "${search}"` : (productTab === 'tailoring' ? "Click below to add a sewing machine or tailoring tool" : "Click below to add a dress, kurti or fabric item")}
                  action={productTab === 'tailoring' ? 'Add Tailoring Product' : 'Add Fashion Product'}
                  onAction={() => setModal(productTab === 'tailoring' ? 'add_tailoring' : 'add_fashion')}
                />
              ) : (
                <div className="admin-products-grid">
                  {(productTab === 'tailoring' ? tailoringProducts : fashionProducts).map(p => (
                    <AdminProductCard
                      key={p.id}
                      p={p}
                      onEdit={(prod) => setModal(prod)}
                      onDuplicate={handleDuplicateProduct}
                      onToggleActive={handleToggleActive}
                      onDelete={handleDeleteProduct}
                    />
                  ))}
                </div>
              )}

            </div>
          )}

          {/* ── DEDICATED COUPONS MAIN TAB ── */}
          {page==='coupons' && (
            <div className="page-enter" style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              {/* Toolbar */}
              <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', padding: '16px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h1 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                      Promo Coupons &amp; Discount Rules 🏷️
                    </h1>
                    <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0' }}>
                      Configure item-specific rules, price tag restrictions, category caps &amp; storewide promo codes
                    </p>
                  </div>
                  <button
                    onClick={() => openCouponModal()}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '9px 16px', borderRadius: '10px', background: '#0F172A',
                      color: '#FFFFFF', fontWeight: 800, fontSize: '12.5px', border: 'none', cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(15,23,42,0.15)'
                    }}
                  >
                    <Plus size={15} /> Create New Coupon
                  </button>
                </div>
              </div>

              {/* Coupon Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                {couponsList.map((cpn) => (
                  <div key={cpn.code} style={{
                    background: '#FFFFFF', borderRadius: '16px', border: cpn.active ? '1.5px solid #CBD5E1' : '1px dashed #CBD5E1',
                    padding: '16px', boxShadow: '0 4px 14px rgba(15,23,42,0.03)', opacity: cpn.active ? 1 : 0.6,
                    display: 'flex', flexDirection: 'column', gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', letterSpacing: '0.5px' }}>
                          {cpn.code}
                        </span>
                        <span style={{
                          fontSize: '11px', fontWeight: 900, padding: '2px 8px', borderRadius: '6px',
                          background: cpn.type === 'percent' ? '#DCFCE7' : '#FEF3C7',
                          color: cpn.type === 'percent' ? '#166534' : '#92400E'
                        }}>
                          {cpn.type === 'percent' ? `${cpn.val}% OFF` : `₹${cpn.val} OFF`}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {cpn.hidden && (
                          <span style={{ fontSize: '10px', fontWeight: 800, background: '#F1F5F9', color: '#64748B', padding: '2px 6px', borderRadius: '4px' }}>
                            Hidden
                          </span>
                        )}
                        <span style={{ fontSize: '10px', fontWeight: 800, background: cpn.active ? '#DCFCE7' : '#FEE2E2', color: cpn.active ? '#166534' : '#991B1B', padding: '2px 6px', borderRadius: '4px' }}>
                          {cpn.active ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: '12.5px', color: '#475569', margin: 0, fontWeight: 500 }}>
                      {cpn.desc}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11px' }}>
                      <span style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '6px', color: '#334155', fontWeight: 700 }}>
                        Scope: {
                          cpn.scope === 'ALL_PRODUCTS' ? '🌐 Storewide (All Items)' :
                          cpn.scope === 'SPECIFIC_CATEGORY' ? `🏷️ Category: ${cpn.applicableCategory}` :
                          cpn.scope === 'SELECTED_PRODUCTS' ? `📦 Specific Items (${cpn.applicableProductIds?.length || 0})` :
                          cpn.scope === 'MIN_PRICE_TAG' ? `💰 Price Tag ≥ ₹${cpn.minItemPrice}` : 'Storewide'
                        }
                      </span>
                      {cpn.minCartTotal > 0 && (
                        <span style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '6px', color: '#334155', fontWeight: 700 }}>
                          Min Cart: ₹{cpn.minCartTotal}
                        </span>
                      )}
                      {cpn.maxDiscount > 0 && (
                        <span style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '3px 8px', borderRadius: '6px', color: '#334155', fontWeight: 700 }}>
                          Max Cap: ₹{cpn.maxDiscount}
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', marginTop: 'auto' }}>
                      <button
                        onClick={() => handleToggleCouponActive(cpn.code)}
                        style={{
                          flex: 1, padding: '6px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer', border: 'none',
                          background: cpn.active ? '#FFFBEB' : '#ECFDF5', color: cpn.active ? '#D97706' : '#059669'
                        }}
                      >
                        {cpn.active ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleToggleCouponHidden(cpn.code)}
                        style={{
                          flex: 1, padding: '6px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer', border: 'none',
                          background: '#F1F5F9', color: '#475569'
                        }}
                      >
                        {cpn.hidden ? 'Show' : 'Hide'}
                      </button>
                      <button
                        onClick={() => openCouponModal(cpn)}
                        style={{
                          padding: '6px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer', border: 'none',
                          background: '#EFF6FF', color: '#1D4ED8'
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCoupon(cpn.code)}
                        style={{
                          padding: '6px 12px', borderRadius: '8px', fontSize: '11.5px', fontWeight: 800, cursor: 'pointer', border: 'none',
                          background: '#FEF2F2', color: '#DC2626'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── MORE TAB — Inventory Hub, clean no colored top borders ── */}
          {page==='more' && (
            <div className="page-enter" style={{ display:'flex', flexDirection:'column', gap:'16px' }}>

              {/* Banner */}
              <div style={{ background:'linear-gradient(135deg, #1E293B, #0F172A)', color:'#FFFFFF', padding:'16px', borderRadius:'14px' }}>
                <p style={{ fontSize:'11px', fontWeight:800, color:'#60A5FA', margin:'0 0 4px 0', textTransform:'uppercase', letterSpacing:'0.6px' }}>Business Hub</p>
                <h1 style={{ fontSize:'18px', fontWeight:800, color:'#FFFFFF', margin:'0 0 2px 0', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Asmalabel Admin</h1>
                <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.7)', margin:0 }}>Inventory, analytics &amp; exports</p>
              </div>

              {/* ── INVENTORY MANAGEMENT (Working quick restock) ── */}
              <div style={{ background:'#FFFFFF', borderRadius:'14px', border:'1px solid #E5E7EB', overflow:'hidden' }}>
                <div style={{ padding:'12px 14px', borderBottom:'1px solid #F1F5F9', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <p style={{ fontSize:'13px', fontWeight:900, color:'#111827', margin:0 }}>📦 Inventory Alerts</p>
                  <button onClick={()=>{fetchProducts();}} style={{ fontSize:'10px', fontWeight:800, color:'#2563EB', background:'#EFF6FF', padding:'3px 8px', borderRadius:'6px', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'3px' }}>
                    <RefreshCw size={10} /> Refresh
                  </button>
                </div>

                {/* Out of Stock */}
                <div style={{ padding:'12px 14px', borderBottom:'1px solid #F1F5F9' }}>
                  <p style={{ fontSize:'11px', fontWeight:800, color:'#DC2626', margin:'0 0 8px 0', display:'flex', alignItems:'center', gap:'5px' }}>
                    <XCircle size={13} /> Out of Stock ({products.filter(p=>p.stock===0).length})
                  </p>
                  {products.filter(p=>p.stock===0).map(p=>(
                    <div key={p.id} style={{ display:'flex', flexDirection:'column', gap:'6px', padding:'8px 0', borderBottom:'1px dashed #FEE2E2' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        {p.image_url && <img src={p.image_url} alt={p.name} style={{ width:'30px', height:'30px', borderRadius:'6px', objectFit:'cover', flexShrink:0 }} />}
                        <span style={{ fontSize:'12px', fontWeight:700, color:'#111827', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</span>
                        <span style={{ fontSize:'10px', fontWeight:800, color:'#DC2626', background:'#FEF2F2', padding:'2px 6px', borderRadius:'5px', flexShrink:0 }}>0 left</span>
                      </div>
                      <div style={{ display:'flex', gap:'4px', paddingLeft:'38px' }}>
                        <span style={{ fontSize:'10px', color:'#64748B', fontWeight:600, lineHeight:'24px' }}>Restock:</span>
                        {[5,10,20].map(qty=>(
                          <button key={qty} onClick={()=>handleQuickRestock(p,qty)}
                            style={{ padding:'3px 8px', borderRadius:'5px', background:'#F1F5F9', color:'#0F172A', border:'1px solid #E2E8F0', fontWeight:800, fontSize:'10px', cursor:'pointer' }}>+{qty}</button>
                        ))}
                        <button onClick={()=>setModal(p)} style={{ padding:'3px 8px', borderRadius:'5px', background:'#0F172A', color:'white', border:'none', fontWeight:800, fontSize:'10px', cursor:'pointer', marginLeft:'auto' }}>Edit</button>
                      </div>
                    </div>
                  ))}
                  {products.filter(p=>p.stock===0).length===0 && <p style={{ fontSize:'11px', color:'#059669', fontWeight:700, margin:0, padding:'4px 0' }}>All products in stock ✓</p>}
                </div>

                {/* Low Stock */}
                <div style={{ padding:'12px 14px', borderBottom:'1px solid #F1F5F9' }}>
                  <p style={{ fontSize:'11px', fontWeight:800, color:'#D97706', margin:'0 0 8px 0', display:'flex', alignItems:'center', gap:'5px' }}>
                    <AlertTriangle size={13} /> Low Stock ≤5 ({products.filter(p=>p.stock>0&&p.stock<=5).length})
                  </p>
                  {products.filter(p=>p.stock>0&&p.stock<=5).map(p=>(
                    <div key={p.id} style={{ display:'flex', flexDirection:'column', gap:'6px', padding:'8px 0', borderBottom:'1px dashed #FEF9C3' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        {p.image_url && <img src={p.image_url} alt={p.name} style={{ width:'30px', height:'30px', borderRadius:'6px', objectFit:'cover', flexShrink:0 }} />}
                        <span style={{ fontSize:'12px', fontWeight:700, color:'#111827', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</span>
                        <span style={{ fontSize:'10px', fontWeight:800, color:'#D97706', background:'#FFFBEB', padding:'2px 6px', borderRadius:'5px', flexShrink:0 }}>{p.stock} left</span>
                      </div>
                      <div style={{ display:'flex', gap:'4px', paddingLeft:'38px' }}>
                        <span style={{ fontSize:'10px', color:'#64748B', fontWeight:600, lineHeight:'24px' }}>Add:</span>
                        {[5,10,20].map(qty=>(
                          <button key={qty} onClick={()=>handleQuickRestock(p,qty)}
                            style={{ padding:'3px 8px', borderRadius:'5px', background:'#F1F5F9', color:'#0F172A', border:'1px solid #E2E8F0', fontWeight:800, fontSize:'10px', cursor:'pointer' }}>+{qty}</button>
                        ))}
                        <button onClick={()=>setModal(p)} style={{ padding:'3px 8px', borderRadius:'5px', background:'#0F172A', color:'white', border:'none', fontWeight:800, fontSize:'10px', cursor:'pointer', marginLeft:'auto' }}>Edit</button>
                      </div>
                    </div>
                  ))}
                  {products.filter(p=>p.stock>0&&p.stock<=5).length===0 && <p style={{ fontSize:'11px', color:'#059669', fontWeight:700, margin:0, padding:'4px 0' }}>No low stock alerts ✓</p>}
                </div>

                {/* Hidden Products */}
                <div style={{ padding:'12px 14px' }}>
                  <p style={{ fontSize:'11px', fontWeight:800, color:'#475569', margin:'0 0 8px 0', display:'flex', alignItems:'center', gap:'5px' }}>
                    <Eye size={13} /> Hidden ({products.filter(p=>!p.active).length})
                  </p>
                  {products.filter(p=>!p.active).map(p=>(
                    <div key={p.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'7px 0', borderBottom:'1px dashed #F1F5F9' }}>
                      <span style={{ fontSize:'12px', fontWeight:700, color:'#111827', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginRight:'8px' }}>{p.name}</span>
                      <button onClick={()=>handleToggleActive(p)} style={{ fontSize:'10px', fontWeight:800, color:'#2563EB', background:'#EFF6FF', padding:'3px 8px', borderRadius:'6px', border:'none', cursor:'pointer', flexShrink:0 }}>Unhide</button>
                    </div>
                  ))}
                  {products.filter(p=>!p.active).length===0 && <p style={{ fontSize:'11px', color:'#059669', fontWeight:700, margin:0, padding:'4px 0' }}>All items visible ✓</p>}
                </div>
              </div>

              {/* ── PERFORMANCE METRICS & ANALYTICS TOOLBAR ── */}
              <div style={{ background:'#FFFFFF', borderRadius:'14px', border:'1px solid #E5E7EB', padding:'14px', boxSizing:'border-box' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'8px', marginBottom:'12px' }}>
                  <div>
                    <h2 style={{ fontSize:'15px', fontWeight:900, color:'#111827', margin:0, display:'flex', alignItems:'center', gap:'6px' }}>
                      📊 Performance Analytics
                    </h2>
                    <p style={{ fontSize:'11px', color:'#6B7280', margin:'2px 0 0 0' }}>Real-time revenue, orders & sales insights</p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'6px', flexWrap:'wrap' }}>
                    {/* Reset Button with Warning */}
                    <button onClick={async () => { 
                      const ok = await confirm({ 
                        title:'⚠️ Reset Analytics Metric Values?', 
                        message:'Warning: Are you sure you want to remove and reset all Performance Analytics values (Total Revenue, Today Sales, Month Revenue, Verified Orders, Avg Order Value, Paid Conversion) back to ₹0 / default placeholders? This action cannot be undone.', 
                        confirm:'Yes, Reset Values',
                        type:'warning'
                      }); 
                      if (!ok) return;
                      setResetMetrics(true);
                      setDateFilter('all'); 
                      setProductTab('tailoring'); 
                      toast('Performance Analytics metrics reset to ₹0 / default placeholders!', 'success'); 
                    }}
                      title="Reset analytics metric values to ₹0 placeholders"
                      style={{ display:'flex', alignItems:'center', gap:'4px', padding:'6px 10px', borderRadius:'8px', background:'#FEF2F2', border:'1px solid #FECACA', color:'#DC2626', fontSize:'11px', fontWeight:800, cursor:'pointer' }}>
                      <RotateCcw size={12} /> Reset Values
                    </button>
                    <button onClick={handleDeleteAllOrders}
                      title="Permanently delete all test orders from database"
                      style={{ display:'flex', alignItems:'center', gap:'4px', padding:'6px 10px', borderRadius:'8px', background:'#DC2626', border:'none', color:'#FFFFFF', fontSize:'11px', fontWeight:800, cursor:'pointer' }}>
                      <Trash2 size={12} /> Clear All Orders
                    </button>
                    {resetMetrics && (
                      <button onClick={() => { setResetMetrics(false); toast('Restored live performance metrics calculation!', 'info'); }}
                        title="Restore live order calculations"
                        style={{ display:'flex', alignItems:'center', gap:'4px', padding:'6px 10px', borderRadius:'8px', background:'#F0FDF4', border:'1px solid #BBF7D0', color:'#16A34A', fontSize:'11px', fontWeight:800, cursor:'pointer' }}>
                        <RefreshCw size={12} /> Restore Live Data
                      </button>
                    )}
                    {/* Export analytics CSV */}
                    <button onClick={() => exportProductsCSV(allOrders)}
                      title="Export sales analytics"
                      style={{ display:'flex', alignItems:'center', gap:'4px', padding:'6px 10px', borderRadius:'8px', background:'#EFF6FF', border:'1px solid #BFDBFE', color:'#2563EB', fontSize:'11px', fontWeight:800, cursor:'pointer' }}>
                      <Download size={12} /> Export CSV
                    </button>
                  </div>
                </div>

                {/* Filter Controls Row */}
                <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'12px', flexWrap:'wrap' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', fontWeight:700, color:'#475569' }}>
                    <Calendar size={13} color="#2563EB" />
                    <span>Range:</span>
                  </div>
                  <select value={dateFilter} onChange={e=>setDateFilter(e.target.value)}
                    style={{ padding:'5px 8px', borderRadius:'8px', border:'1px solid #CBD5E1', fontSize:'11px', fontWeight:700, color:'#1E293B', background:'#F8FAFC', outline:'none' }}>
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="month">This Month</option>
                  </select>
                </div>

                {/* Grid of 6 Performance Cards */}
                {(() => {
                  const verifiedOrders = allOrders.filter(o => o.payment_status === 'verified');
                  const filteredList = dateFilter === 'today'
                    ? allOrders.filter(o => new Date(o.created_at).toDateString() === today)
                    : dateFilter === 'month'
                    ? allOrders.filter(o => { const d=new Date(o.created_at); const n=new Date(); return d.getMonth()===n.getMonth() && d.getFullYear()===n.getFullYear(); })
                    : allOrders;

                  const verifiedFiltered = filteredList.filter(o => o.payment_status === 'verified');
                  const totalRev = resetMetrics ? 0 : verifiedFiltered.reduce((s,o) => s + (o.total_amount || 0), 0);
                  const todaySales = resetMetrics ? 0 : todayRevenue;
                  const monthSales = resetMetrics ? 0 : monthRevenue;
                  const orderCount = resetMetrics ? 0 : verifiedFiltered.length;
                  const avgOrderVal = resetMetrics ? 0 : (verifiedFiltered.length > 0 ? (totalRev / verifiedFiltered.length) : 0);
                  const convRate = resetMetrics ? 0 : (filteredList.length > 0 ? ((verifiedFiltered.length / filteredList.length) * 100) : 0);

                  return (
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                      {[
                        { label:'Total Revenue',   value:`₹${totalRev.toFixed(0)}`,        icon:'💰' },
                        { label:"Today's Sales",   value:`₹${todaySales.toFixed(0)}`,      icon:'📅' },
                        { label:'Month Revenue',   value:`₹${monthSales.toFixed(0)}`,      icon:'📆' },
                        { label:'Verified Orders', value:orderCount,                       icon:'✅' },
                        { label:'Avg Order Value', value:`₹${avgOrderVal.toFixed(0)}`,      icon:'📊' },
                        { label:'Paid Conversion', value:`${convRate.toFixed(0)}%`,          icon:'🎯' },
                      ].map(({ label, value, icon }) => (
                        <div key={label} style={{
                          background: '#F9FAFB',
                          borderRadius: '10px',
                          padding: '10px 12px',
                          border: '1px solid #E5E7EB',
                          borderLeft: '3px solid #111827',
                        }}>
                          <p style={{ fontSize:'10px', fontWeight:700, color:'#6B7280', textTransform:'uppercase', letterSpacing:'0.5px', margin:0, display:'flex', alignItems:'center', gap:'4px' }}>
                            <span>{icon}</span> {label}
                          </p>
                          <p style={{ fontSize:'17px', fontWeight:900, color:'#111827', margin:'4px 0 0 0', letterSpacing:'-0.5px' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* ── STORE INFO ── */}
              <div style={{ background:'#FFFFFF', borderRadius:'14px', border:'1px solid #E5E7EB', overflow:'hidden' }}>
                <div style={{ padding:'12px 14px', borderBottom:'1px solid #F1F5F9', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <p style={{ fontSize:'13px', fontWeight:900, color:'#111827', margin:0 }}>⚙️ Store Info</p>
                  {!storeInfoEditing ? (
                    <button
                      onClick={() => {
                        setTempStoreInfo({ ...storeInfo });
                        setStoreInfoEditing(true);
                      }}
                      title="Edit store info details"
                      style={{
                        padding: '5px 12px', fontSize: '11px', fontWeight: 800,
                        background: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE',
                        borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}>
                      <Edit2 size={12} /> Edit
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => setStoreInfoEditing(false)}
                        style={{
                          padding: '4px 10px', fontSize: '11px', fontWeight: 700,
                          background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1',
                          borderRadius: '8px', cursor: 'pointer'
                        }}>
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setStoreInfo(tempStoreInfo);
                          try { localStorage.setItem('ashub_store_info', JSON.stringify(tempStoreInfo)); } catch { /* ignore */ }
                          setStoreInfoEditing(false);
                          toast('Store Info updated successfully!', 'success');
                        }}
                        style={{
                          padding: '4px 12px', fontSize: '11px', fontWeight: 800,
                          background: '#059669', color: '#FFFFFF', border: 'none',
                          borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                        }}>
                        <Save size={12} /> Save
                      </button>
                    </div>
                  )}
                </div>
                <div style={{ padding:'6px 14px 12px 14px' }}>
                  {[
                    { key: 'name', label: 'Store Name', val: storeInfo.name },
                    { key: 'owner', label: 'Owner', val: storeInfo.owner },
                    { key: 'email', label: 'Email', val: storeInfo.email },
                    { key: 'phone', label: 'Phone', val: storeInfo.phone },
                    { key: 'upi', label: 'UPI VPA', val: storeInfo.upi },
                    { key: 'whatsapp', label: 'WhatsApp', val: storeInfo.whatsapp }
                  ].map(({ key, label, val }) => (
                    <div key={key} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid #F8FAFC', gap:'12px' }}>
                      <span style={{ fontSize:'11px', fontWeight:700, color:'#64748B', whiteSpace:'nowrap' }}>{label}</span>
                      {!storeInfoEditing ? (
                        <span style={{ fontSize:'11px', fontWeight:800, color:'#111827', textAlign:'right', wordBreak:'break-all' }}>{val}</span>
                      ) : (
                        <input
                          type="text"
                          value={tempStoreInfo[key] || ''}
                          onChange={e => setTempStoreInfo({ ...tempStoreInfo, [key]: e.target.value })}
                          style={{
                            padding: '4px 8px', borderRadius: '6px', border: '1px solid #CBD5E1',
                            fontSize: '11px', fontWeight: 700, color: '#0F172A', textAlign: 'right', flex: 1, maxWidth: '240px'
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── EXPORTS ── */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                <button onClick={()=>exportOrdersCSV(allOrders)}
                  style={{ background:'#FFFFFF', borderRadius:'12px', padding:'14px', border:'1px solid #E5E7EB', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', textAlign:'left' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'9px', background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Download size={18} color="#2563EB" />
                  </div>
                  <div><p style={{ fontSize:'12px', fontWeight:800, color:'#111827', margin:0 }}>Orders</p><p style={{ fontSize:'10px', color:'#6B7280', margin:0 }}>Export CSV</p></div>
                </button>
                <button onClick={()=>exportProductsCSV(products)}
                  style={{ background:'#FFFFFF', borderRadius:'12px', padding:'14px', border:'1px solid #E5E7EB', display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', textAlign:'left' }}>
                  <div style={{ width:'36px', height:'36px', borderRadius:'9px', background:'#ECFDF5', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <Download size={18} color="#059669" />
                  </div>
                  <div><p style={{ fontSize:'12px', fontWeight:800, color:'#111827', margin:0 }}>Catalog</p><p style={{ fontSize:'10px', color:'#6B7280', margin:0 }}>Export CSV</p></div>
                </button>
              </div>

            </div>
          )}

          {/* ── SOCIAL MEDIA TAB ── */}
          {page==='social' && (
            <div className="page-enter">
              <SocialMediaManager />
            </div>
          )}

          {/* ── HOMEPAGE CMS TAB ── */}
          {page==='cms' && (
            <div className="page-enter">
              <HomepageManager products={products} />
            </div>
          )}

        </main>
      </div>

      {/* Product modal */}
      <AnimatePresence>
        {modal && (
          <ProductModal
            product={typeof modal === 'string' ? { isAdd: true, defaultCategory: modal.includes('fashion') ? 'fashion' : 'tailoring' } : modal}
            onClose={()=>setModal(null)}
            onSave={()=>{setModal(null);fetchProducts();}}
          />
        )}
      </AnimatePresence>

      {/* Coupon Modal */}
      <AnimatePresence>
        {couponModalOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
              style={{ background: '#FFFFFF', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0 }}>
                  {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promo Coupon 🏷️'}
                </h2>
                <button onClick={() => setCouponModalOpen(false)} style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={16} color="#64748B" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const code = (couponForm.code || '').trim().toUpperCase();
                if (!code) { toast('Please enter a coupon code', 'warning'); return; }
                const val = Number(couponForm.val);
                if (isNaN(val) || val <= 0) { toast('Please enter a valid discount value', 'warning'); return; }

                const updatedCoupon = {
                  ...couponForm,
                  code,
                  val,
                  minItemPrice: Number(couponForm.minItemPrice || 0),
                  minCartTotal: Number(couponForm.minCartTotal || 0),
                  maxDiscount: Number(couponForm.maxDiscount || 0),
                };

                if (editingCoupon) {
                  setCouponsList(prev => prev.map(c => c.code === editingCoupon.code ? updatedCoupon : c));
                  toast(`Coupon ${code} updated!`, 'success');
                } else {
                  if (couponsList.some(c => c.code === code)) {
                    toast(`Coupon code ${code} already exists`, 'warning');
                    return;
                  }
                  setCouponsList(prev => [updatedCoupon, ...prev]);
                  toast(`Coupon ${code} created successfully!`, 'success');
                }
                setCouponModalOpen(false);
              }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* Code & Type */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>COUPON CODE *</label>
                    <input
                      value={couponForm.code}
                      onChange={e => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                      placeholder="e.g. ASMA10"
                      required
                      disabled={!!editingCoupon}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>DISCOUNT TYPE *</label>
                    <select
                      value={couponForm.type}
                      onChange={e => setCouponForm({ ...couponForm, type: e.target.value })}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 700, boxSizing: 'border-box' }}
                    >
                      <option value="percent">Percentage (% OFF)</option>
                      <option value="flat">Flat Amount (₹ OFF)</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>DESCRIPTION / TITLE *</label>
                  <input
                    value={couponForm.desc}
                    onChange={e => setCouponForm({ ...couponForm, desc: e.target.value })}
                    placeholder="e.g. 10% OFF on Tailoring Tools"
                    required
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Discount Value & Max Cap */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      {couponForm.type === 'percent' ? 'PERCENTAGE OFF (%)' : 'FLAT AMOUNT OFF (₹)'} *
                    </label>
                    <input
                      type="number"
                      value={couponForm.val}
                      onChange={e => setCouponForm({ ...couponForm, val: e.target.value })}
                      placeholder="10"
                      required
                      min="1"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 800, boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>MAX DISCOUNT CAP (₹)</label>
                    <input
                      type="number"
                      value={couponForm.maxDiscount}
                      onChange={e => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                      placeholder="0 for no max cap"
                      min="0"
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                {/* APPLICABILITY SCOPE */}
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 900, color: '#0F172A' }}>
                    🎯 APPLICABILITY &amp; ITEM SCOPE
                  </label>
                  <select
                    value={couponForm.scope}
                    onChange={e => setCouponForm({ ...couponForm, scope: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', fontWeight: 700, boxSizing: 'border-box' }}
                  >
                    <option value="ALL_PRODUCTS">🌐 Storewide (Applies to all products)</option>
                    <option value="SPECIFIC_CATEGORY">🏷️ Specific Category Only</option>
                    <option value="SELECTED_PRODUCTS">📦 Selected / Specific Items Only</option>
                    <option value="MIN_PRICE_TAG">💰 Price Tag Condition (Item price ≥ ₹X)</option>
                  </select>

                  {/* Scope Details */}
                  {couponForm.scope === 'SPECIFIC_CATEGORY' && (
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>SELECT CATEGORY</label>
                      <select
                        value={couponForm.applicableCategory}
                        onChange={e => setCouponForm({ ...couponForm, applicableCategory: e.target.value })}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', fontWeight: 700, boxSizing: 'border-box' }}
                      >
                        <option value="tailoring">Tailoring Tools &amp; Supplies</option>
                        <option value="fashion">Women's Fashion &amp; Dresses</option>
                      </select>
                    </div>
                  )}

                  {couponForm.scope === 'MIN_PRICE_TAG' && (
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>MINIMUM ITEM PRICE TAG (₹)</label>
                      <input
                        type="number"
                        value={couponForm.minItemPrice}
                        onChange={e => setCouponForm({ ...couponForm, minItemPrice: e.target.value })}
                        placeholder="e.g. 499"
                        style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
                      />
                      <span style={{ fontSize: '10.5px', color: '#64748B', display: 'block', marginTop: '3px' }}>
                        Coupon will only apply to individual cart items priced at or above this amount.
                      </span>
                    </div>
                  )}

                  {couponForm.scope === 'SELECTED_PRODUCTS' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', margin: 0 }}>
                          CHOOSE SPECIFIC PRODUCTS ({couponForm.applicableProductIds?.length || 0} selected)
                        </label>
                        {products.length === 0 && (
                          <button
                            type="button"
                            onClick={fetchProducts}
                            style={{ fontSize: '10.5px', fontWeight: 800, color: '#2563EB', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            ↻ Load Products
                          </button>
                        )}
                      </div>
                      {products.length === 0 ? (
                        <div style={{ padding: '14px', textAlign: 'center', fontSize: '12px', color: '#64748B', border: '1px solid #CBD5E1', borderRadius: '8px', background: '#FFFFFF' }}>
                          Loading product catalog... Click <strong>↻ Load Products</strong> above if not loaded.
                        </div>
                      ) : (
                        <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #CBD5E1', borderRadius: '8px', padding: '8px', background: '#FFFFFF', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {products.map(p => {
                            const isSelected = (couponForm.applicableProductIds || []).includes(p.id);
                            return (
                              <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#334155', cursor: 'pointer', padding: '4px 6px', borderRadius: '6px', background: isSelected ? '#F1F5F9' : 'transparent' }}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={e => {
                                    const curr = couponForm.applicableProductIds || [];
                                    const updated = e.target.checked
                                      ? [...curr, p.id]
                                      : curr.filter(id => id !== p.id);
                                    setCouponForm({ ...couponForm, applicableProductIds: updated });
                                  }}
                                  style={{ accentColor: '#0F172A', width: '15px', height: '15px' }}
                                />
                                <span style={{ fontWeight: isSelected ? 800 : 500 }}>{p.name} — <strong style={{ color: '#059669' }}>₹{p.price}</strong></span>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Min Cart Total */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#475569', display: 'block', marginBottom: '4px' }}>MINIMUM TOTAL CART VALUE (₹)</label>
                  <input
                    type="number"
                    value={couponForm.minCartTotal}
                    onChange={e => setCouponForm({ ...couponForm, minCartTotal: e.target.value })}
                    placeholder="0 for no minimum"
                    min="0"
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Status Toggles */}
                <div style={{ display: 'flex', gap: '16px', paddingTop: '4px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={couponForm.active}
                      onChange={e => setCouponForm({ ...couponForm, active: e.target.checked })}
                      style={{ accentColor: '#0F172A', width: '16px', height: '16px' }}
                    />
                    Active (Can be redeemed)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#334155', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={couponForm.hidden}
                      onChange={e => setCouponForm({ ...couponForm, hidden: e.target.checked })}
                      style={{ accentColor: '#0F172A', width: '16px', height: '16px' }}
                    />
                    Hide from public list
                  </label>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setCouponModalOpen(false)}
                    style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid #CBD5E1', background: '#FFFFFF', color: '#475569', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', background: '#0F172A', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 12px rgba(15,23,42,0.2)' }}
                  >
                    {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Category & Subcategory Manager Modal ── */}
      <CategoryManagerModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        activeCategory={productTab}
        products={products}
        customSubcats={customSubcats}
        onSaveCustomSubcats={handleSaveCustomSubcats}
        onRenameSubcategory={handleRenameSubcategory}
      />

      {/* Floating Quick Actions (Hide on CMS page so it doesn't block inputs on mobile) */}
      {page !== 'cms' && (
        <QuickActions
          onAddProduct={() => { setPage('products'); setModal('add'); }}
          onExportOrders={() => exportOrdersCSV(orders)}
          onRefresh={() => { fetchOrders(); fetchCounts(); fetchProducts(); toast('Dashboard refreshed','success'); }}
        />
      )}

      <style>{`@keyframes spin{to{transform:rotate(360deg)}} .prod-overlay{opacity:0!important} div:hover>.prod-overlay,.prod-card:hover .prod-overlay{opacity:1!important}
      @media(max-width:640px){
        .admin-fab-wrap { bottom: 80px !important; }
        .admin-fab-wrap button:last-child { width:48px !important; height:48px !important; }
      }
      `}</style>
    </div>
  );
}
