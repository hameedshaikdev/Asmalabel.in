import { useState } from 'react';
import {
  Shield, Truck, Zap, Heart, Star, CheckCircle, RefreshCw,
  Package, Clock, Award, Sparkles, Users, Smile,
  Plus, Trash2, Edit2, Eye, EyeOff, ArrowUp, ArrowDown, RotateCcw
} from 'lucide-react';
import { DEFAULT_CMS_DATA } from '../../../utils/cmsDefaults';

const ICON_MAP = {
  Truck, Shield, Zap, Heart, Star, CheckCircle, RefreshCw,
  Package, Clock, Award, Sparkles, Users, Smile
};

const TRUST_ICONS = [
  'Truck', 'Shield', 'Zap', 'Heart', 'Star', 'CheckCircle', 'RefreshCw',
  'Package', 'Clock', 'Award', 'Sparkles', 'Users', 'Smile'
];

export default function TrustBadgesEditor({ badgesData = {}, onChange }) {
  const data = badgesData || {};
  const enabled = data.enabled !== false;
  const items = Array.isArray(data.items) ? data.items : (DEFAULT_CMS_DATA.trustBadges.items || []);

  const handleUpdate = (field, value) => {
    onChange?.({
      ...data,
      [field]: value,
    });
  };

  const handleUpdateItem = (id, field, value) => {
    const updated = items.map(item => item.id === id ? { ...item, [field]: value } : item);
    handleUpdate('items', updated);
  };

  const handleAddItem = () => {
    const newItem = {
      id: 'tb-' + Date.now(),
      icon: 'Shield',
      title: 'New Benefit Title',
      desc: 'Short explanation for customers',
      active: true,
    };
    handleUpdate('items', [...items, newItem]);
  };

  const handleDeleteItem = (id) => {
    handleUpdate('items', items.filter(item => item.id !== id));
  };

  const handleMoveItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const list = [...items];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    handleUpdate('items', list);
  };

  const handleReset = () => {
    onChange?.(DEFAULT_CMS_DATA.trustBadges);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* Top Header & Actions */}
      <div style={{
        background: '#FFFFFF', padding: '14px 16px', borderRadius: '16px',
        border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', flexShrink: 0
          }}>
            <Shield size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Trust Badges Strip
            </h3>
            <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Horizontal guarantee strip shown below hero
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleUpdate('enabled', !enabled)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '7px 12px', borderRadius: '10px',
              background: enabled ? '#F0FDF4' : '#F8FAFC',
              color: enabled ? '#16A34A' : '#94A3B8',
              border: '1px solid #E2E8F0', cursor: 'pointer',
              fontWeight: 800, fontSize: '11.5px', whiteSpace: 'nowrap'
            }}
          >
            {enabled ? <Eye size={13} /> : <EyeOff size={13} />}
            <span>{enabled ? 'Strip Visible' : 'Strip Hidden'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '7px 12px', borderRadius: '10px',
              background: '#FEF2F2', color: '#DC2626',
              border: '1px solid #FECACA', cursor: 'pointer',
              fontWeight: 800, fontSize: '11.5px', whiteSpace: 'nowrap'
            }}
          >
            <RotateCcw size={12} /> Reset
          </button>

          <button
            type="button"
            onClick={handleAddItem}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '7px 12px', borderRadius: '10px',
              background: '#0F172A', color: '#FFFFFF',
              border: 'none', cursor: 'pointer',
              fontWeight: 800, fontSize: '11.5px', whiteSpace: 'nowrap'
            }}
          >
            <Plus size={13} /> Add Badge
          </button>
        </div>
      </div>

      {/* Live Preview with DYNAMIC ICONS */}
      <div style={{
        background: '#F8FAFC', padding: '14px', borderRadius: '16px',
        border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px',
        boxSizing: 'border-box', overflowX: 'hidden'
      }}>
        <span style={{ fontSize: '11px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Live Storefront Trust Strip Preview
        </span>

        {enabled ? (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '10px', background: '#FFFFFF', padding: '12px', borderRadius: '12px', border: '1px solid #E2E8F0'
          }}>
            {items.map(item => {
              const DynamicIcon = ICON_MAP[item.icon] || Shield;
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px', minWidth: 0 }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    background: '#F1F5F9', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#0F172A', flexShrink: 0
                  }}>
                    <DynamicIcon size={17} />
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </h4>
                    <p style={{ fontSize: '10.5px', color: '#64748B', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{
            background: '#E2E8F0', color: '#64748B', padding: '12px', borderRadius: '10px',
            textAlign: 'center', fontSize: '12px', fontWeight: 700
          }}>
            🚫 Trust Badges Strip is currently hidden
          </div>
        )}
      </div>

      {/* Badges List Editor — Fully Responsive */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', boxSizing: 'border-box' }}>
        {items.map((item, index) => {
          const ItemIcon = ICON_MAP[item.icon] || Shield;
          return (
            <div
              key={item.id}
              style={{
                background: '#FFFFFF', padding: '14px', borderRadius: '14px',
                border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '10px',
                boxSizing: 'border-box', width: '100%'
              }}
            >
              {/* Row 1: Move + Icon Select with preview + Delete */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                    <button
                      type="button"
                      className="reorder-arrow-btn"
                      onClick={() => handleMoveItem(index, -1)}
                      disabled={index === 0}
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      className="reorder-arrow-btn"
                      onClick={() => handleMoveItem(index, 1)}
                      disabled={index === items.length - 1}
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <div style={{
                    width: '28px', height: '28px', borderRadius: '6px',
                    background: '#F1F5F9', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#0F172A', flexShrink: 0
                  }}>
                    <ItemIcon size={15} />
                  </div>

                  <select
                    value={item.icon || 'Shield'}
                    onChange={e => handleUpdateItem(item.id, 'icon', e.target.value)}
                    style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFF', maxWidth: '110px' }}
                  >
                    {TRUST_ICONS.map(ic => (
                      <option key={ic} value={ic}>{ic}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  title="Delete badge"
                  style={{ padding: '5px 8px', borderRadius: '8px', border: 'none', background: '#FEF2F2', color: '#DC2626', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', fontSize: '11px', fontWeight: 800 }}
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>

              {/* Row 2: Title & Subtitle inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                <input
                  type="text"
                  value={item.title || ''}
                  onChange={e => handleUpdateItem(item.id, 'title', e.target.value)}
                  placeholder="Badge Title (e.g. Free Express Delivery)"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12.5px', fontWeight: 800, boxSizing: 'border-box' }}
                />

                <input
                  type="text"
                  value={item.desc || ''}
                  onChange={e => handleUpdateItem(item.id, 'desc', e.target.value)}
                  placeholder="Badge Description (e.g. On all orders above ₹499)"
                  style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box', color: '#475569' }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
