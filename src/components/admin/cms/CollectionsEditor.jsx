import { useState } from 'react';
import { Plus, Trash2, Edit2, Eye, EyeOff, Layers, ArrowUp, ArrowDown, Copy, Grid, RotateCcw, AlertTriangle } from 'lucide-react';
import { DEFAULT_CMS_DATA } from '../../../utils/cmsDefaults';

export default function CollectionsEditor({ collectionsData = {}, onChange }) {
  const [activeTab, setActiveTab] = useState('tailoring');
  const [showResetWarning, setShowResetWarning] = useState(false);
  const collections = collectionsData || {};
  const currentList = Array.isArray(collections[activeTab]) ? collections[activeTab] : [];

  const updateList = (newList) => {
    onChange?.({
      ...collections,
      [activeTab]: newList,
    });
  };

  const handleConfirmSync = () => {
    updateList(DEFAULT_CMS_DATA.collections[activeTab] || []);
    setShowResetWarning(false);
  };

  const handleAddCollection = () => {
    const newCol = {
      id: 'col-' + Date.now(),
      label: 'New Collection',
      emoji: '✨',
      desc: 'Collection description',
      active: true,
      image: '/images/collections/all_tools.png',
    };
    updateList([...currentList, newCol]);
  };

  const handleUpdate = (id, field, value) => {
    const updated = currentList.map(c => c.id === id ? { ...c, [field]: value } : c);
    updateList(updated);
  };

  const handleDelete = (id) => {
    updateList(currentList.filter(c => c.id !== id));
  };

  const handleMove = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= currentList.length) return;
    const list = [...currentList];
    const temp = list[index];
    list[index] = list[newIndex];
    list[newIndex] = temp;
    updateList(list);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0, width: '100%', boxSizing: 'border-box' }}>
      {/* Tab Switcher & Actions */}
      <div className="cms-horizontal-options" style={{ display: 'flex', alignItems: 'center', background: '#FFFFFF', padding: '10px 14px', borderRadius: '16px', border: '1px solid #E2E8F0', gap: '8px', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', width: '100%', boxSizing: 'border-box' }}>
        <button
          onClick={() => setActiveTab('tailoring')}
          style={{
            padding: '8px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            background: activeTab === 'tailoring' ? 'linear-gradient(135deg, #6B4F8A, #9C80AA)' : '#F1F5F9',
            color: activeTab === 'tailoring' ? '#FFFFFF' : '#475569',
          }}
        >
          🪡 Tailoring Collections
        </button>
        <button
          onClick={() => setActiveTab('fashion')}
          style={{
            padding: '8px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '12px', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
            background: activeTab === 'fashion' ? 'linear-gradient(135deg, #0A2540, #1A4A7A)' : '#F1F5F9',
            color: activeTab === 'fashion' ? '#FFFFFF' : '#475569',
          }}
        >
          👗 Women Fashion Collections
        </button>
        <button
          onClick={() => setShowResetWarning(true)}
          title="Reset to Website Live Collections"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '10px', background: '#FEF2F2', color: '#DC2626',
            fontSize: '12px', fontWeight: 800, border: '1px solid #FECACA', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', marginLeft: 'auto'
          }}
        >
          <RotateCcw size={13} /> Reset Placeholders
        </button>
        <button
          onClick={handleAddCollection}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '8px 14px', borderRadius: '10px', background: '#0F172A', color: '#FFF',
            fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap'
          }}
        >
          <Plus size={14} /> Add Card
        </button>
      </div>

      {/* Grid of Collection Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))', gap: '12px' }}>
        {currentList.map((col, idx) => (
          <div
            key={col.id}
            style={{
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '12px', opacity: col.active ? 1 : 0.6,
              boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', background: '#F1F5F9', border: '1px solid #E2E8F0', flexShrink: 0 }}>
                <img src={col.image} alt={col.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.src = '/images/collections/all_tools.png'} />
              </div>
              <div style={{ display: 'flex', gap: '6px', flex: 1, minWidth: 0 }}>
                <input
                  type="text"
                  value={col.emoji || ''}
                  onChange={e => handleUpdate(col.id, 'emoji', e.target.value)}
                  style={{ width: '36px', textAlign: 'center', padding: '6px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '14px' }}
                />
                <input
                  type="text"
                  value={col.label || ''}
                  onChange={e => handleUpdate(col.id, 'label', e.target.value)}
                  style={{ flex: 1, padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', fontWeight: 800, color: '#0F172A' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Subtext Description</label>
              <input
                type="text"
                value={col.desc || ''}
                onChange={e => handleUpdate(col.id, 'desc', e.target.value)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '12px', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '10px', fontWeight: 800, color: '#64748B', display: 'block', marginBottom: '4px', textTransform: 'uppercase' }}>Card Image URL</label>
              <input
                type="text"
                value={col.image || ''}
                onChange={e => handleUpdate(col.id, 'image', e.target.value)}
                style={{ width: '100%', padding: '6px 10px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '11px', fontFamily: 'monospace', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px dashed #E2E8F0' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button className="reorder-arrow-btn" onClick={() => handleMove(idx, -1)} disabled={idx === 0} title="Move Up"><ArrowUp size={14} /></button>
                <button className="reorder-arrow-btn" onClick={() => handleMove(idx, 1)} disabled={idx === currentList.length - 1} title="Move Down"><ArrowDown size={14} /></button>
              </div>

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => handleUpdate(col.id, 'active', !col.active)}
                  style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', cursor: 'pointer' }}
                >
                  {col.active ? <Eye size={14} color="#059669" /> : <EyeOff size={14} color="#94A3B8" />}
                </button>
                <button
                  onClick={() => handleDelete(col.id)}
                  style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', cursor: 'pointer' }}
                >
                  <Trash2 size={14} color="#DC2626" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Warning Confirmation Modal for Resetting Placeholders */}
      {showResetWarning && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '24px', maxWidth: '440px', width: '100%',
            padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0',
            fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#FEF2F2', border: '1px solid #FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', flexShrink: 0 }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Reset Placeholder Values?</h3>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', margin: '2px 0 0' }}>⚠️ Warning: Action cannot be undone</p>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 24px', fontWeight: 500 }}>
              Are you sure you want to reset all input values and placeholders in this section back to default store values? Any custom text or image links will be replaced.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowResetWarning(false)}
                style={{ padding: '10px 18px', borderRadius: '12px', background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSync}
                style={{ padding: '10px 18px', borderRadius: '12px', background: '#DC2626', border: 'none', color: '#FFFFFF', fontSize: '13px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 14px rgba(220,38,38,0.25)' }}
              >
                Yes, Reset Values
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
