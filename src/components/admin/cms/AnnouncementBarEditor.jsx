import { useState } from 'react';
import { Megaphone, Eye, EyeOff, RotateCcw, Sparkles, Link as LinkIcon, Palette, Zap } from 'lucide-react';
import { DEFAULT_CMS_DATA } from '../../../utils/cmsDefaults';

export default function AnnouncementBarEditor({ barData = {}, onChange }) {
  const bar = barData || {};
  const enabled = bar.enabled === true; // default false to avoid clutter

  const handleUpdate = (field, value) => {
    onChange?.({
      ...bar,
      [field]: value,
    });
  };

  const handleReset = () => {
    onChange?.(DEFAULT_CMS_DATA.announcementBar);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* Top Header & Actions */}
      <div style={{
        background: '#FFFFFF', padding: '12px 16px', borderRadius: '16px',
        border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #3B82F6, #1D4ED8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', flexShrink: 0
          }}>
            <Megaphone size={18} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Top Announcement Ticker
            </h3>
            <p style={{ fontSize: '11.5px', color: '#64748B', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Header promo bar shown at very top of website
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleUpdate('enabled', !enabled)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '7px 12px', borderRadius: '10px',
              background: enabled ? '#F0FDF4' : '#F8FAFC',
              color: enabled ? '#16A34A' : '#94A3B8',
              border: '1px solid #E2E8F0', cursor: 'pointer',
              fontWeight: 800, fontSize: '11.5px', whiteSpace: 'nowrap'
            }}
          >
            {enabled ? <Eye size={13} /> : <EyeOff size={13} />}
            <span>{enabled ? 'Bar Visible' : 'Bar Hidden'}</span>
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
        </div>
      </div>

      {/* Live Preview */}
      <div style={{
        background: '#F8FAFC', padding: '14px', borderRadius: '16px',
        border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px',
        boxSizing: 'border-box', width: '100%', overflowX: 'hidden'
      }}>
        <span style={{ fontSize: '11px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Live Storefront Announcement Preview
        </span>

        {enabled ? (
          <div style={{
            background: bar.bgColor || '#0F172A', color: bar.textColor || '#FFFFFF',
            padding: '10px 14px', borderRadius: '10px', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '8px',
            fontSize: '12px', fontWeight: 700, overflow: 'hidden', flexWrap: 'wrap',
            textAlign: 'center', boxSizing: 'border-box', width: '100%'
          }}>
            {bar.badge && (
              <span style={{
                background: bar.badgeBg || '#2563EB', color: '#FFFFFF',
                fontSize: '9.5px', fontWeight: 900, padding: '2px 7px', borderRadius: '5px',
                letterSpacing: '0.5px', flexShrink: 0
              }}>
                {bar.badge}
              </span>
            )}
            <span style={{ wordBreak: 'break-word', overflowWrap: 'break-word', maxWidth: '100%' }}>
              {bar.text || 'Announcement text goes here...'}
            </span>
          </div>
        ) : (
          <div style={{
            background: '#E2E8F0', color: '#64748B', padding: '12px', borderRadius: '10px',
            textAlign: 'center', fontSize: '12px', fontWeight: 700
          }}>
            🚫 Announcement Bar is currently hidden (Click "Bar Visible" to show)
          </div>
        )}
      </div>

      {/* Form Controls */}
      <div style={{
        background: '#FFFFFF', padding: '16px', borderRadius: '16px',
        border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '14px',
        boxSizing: 'border-box', width: '100%'
      }}>
        <div>
          <label style={{ fontSize: '12px', fontWeight: 800, color: '#334155', display: 'block', marginBottom: '6px' }}>
            Announcement Message / Ticker Text
          </label>
          <textarea
            rows={2}
            value={bar.text || ''}
            onChange={e => handleUpdate('text', e.target.value)}
            placeholder="e.g. ✨ Free Express Delivery on orders above ₹499 | Direct Atelier Quality"
            style={{
              width: '100%', padding: '9px 12px', borderRadius: '10px',
              border: '1px solid #CBD5E1', fontSize: '12.5px', lineHeight: 1.4,
              outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
              Badge (Optional)
            </label>
            <input
              type="text"
              value={bar.badge || ''}
              onChange={e => handleUpdate('badge', e.target.value)}
              placeholder="e.g. OFFER"
              style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
              Link URL (Optional)
            </label>
            <input
              type="text"
              value={bar.link || ''}
              onChange={e => handleUpdate('link', e.target.value)}
              placeholder="#products"
              style={{ width: '100%', padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', width: '100%', boxSizing: 'border-box' }}>
          <div>
            <label style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
              Background Color
            </label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="color"
                value={bar.bgColor || '#0F172A'}
                onChange={e => handleUpdate('bgColor', e.target.value)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #CBD5E1', cursor: 'pointer', padding: '1px', flexShrink: 0 }}
              />
              <input
                type="text"
                value={bar.bgColor || '#0F172A'}
                onChange={e => handleUpdate('bgColor', e.target.value)}
                style={{ flex: 1, minWidth: 0, padding: '7px 8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11.5px', fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
              Text Color
            </label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="color"
                value={bar.textColor || '#FFFFFF'}
                onChange={e => handleUpdate('textColor', e.target.value)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #CBD5E1', cursor: 'pointer', padding: '1px', flexShrink: 0 }}
              />
              <input
                type="text"
                value={bar.textColor || '#FFFFFF'}
                onChange={e => handleUpdate('textColor', e.target.value)}
                style={{ flex: 1, minWidth: 0, padding: '7px 8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11.5px', fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '10.5px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>
              Badge Color
            </label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="color"
                value={bar.badgeBg || '#2563EB'}
                onChange={e => handleUpdate('badgeBg', e.target.value)}
                style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #CBD5E1', cursor: 'pointer', padding: '1px', flexShrink: 0 }}
              />
              <input
                type="text"
                value={bar.badgeBg || '#2563EB'}
                onChange={e => handleUpdate('badgeBg', e.target.value)}
                style={{ flex: 1, minWidth: 0, padding: '7px 8px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11.5px', fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
