import { useState } from 'react';
import {
  Plus, Trash2, Edit2, Eye, EyeOff, ArrowUp, ArrowDown,
  RotateCcw, SlidersHorizontal, Sparkles, Tag, Check, X,
  Package, Scissors, CircleDot, Pin, Ruler, Wrench,
  Crown, Shirt, Layers, ShoppingBag, Grid, Box, Compass,
  Palette, Feather, Flame, Zap, Star, Gift
} from 'lucide-react';
import { DEFAULT_CMS_DATA, normalizeCategoryKey } from '../../../utils/cmsDefaults';

const ICON_MAP = {
  Sparkles, Package, Scissors, CircleDot, SlidersHorizontal,
  Pin, Ruler, Wrench, Crown, Shirt, Layers, ShoppingBag,
  Tag, Grid, Box, Compass, Palette, Feather, Flame, Zap, Star, Gift
};

const AVAILABLE_ICONS = [
  'Sparkles', 'Package', 'Scissors', 'CircleDot', 'SlidersHorizontal',
  'Pin', 'Ruler', 'Wrench', 'Crown', 'Shirt', 'Layers', 'ShoppingBag',
  'Tag', 'Grid', 'Box', 'Compass', 'Palette', 'Feather', 'Flame', 'Zap', 'Star', 'Gift'
];

export default function CategoryFilterEditor({ subcategoriesData = {}, products = [], onChange }) {
  const [activeTab, setActiveTab] = useState('tailoring');
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon] = useState('Tag');
  const [editingId, setEditingId] = useState(null);
  const [editLabel, setEditLabel] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [showResetWarning, setShowResetWarning] = useState(false);

  const subcategories = subcategoriesData || {};
  const currentList = Array.isArray(subcategories[activeTab]) && subcategories[activeTab].length > 0
    ? subcategories[activeTab]
    : (DEFAULT_CMS_DATA.subcategories[activeTab] || []);

  const updateList = (newList) => {
    onChange?.({
      ...subcategories,
      [activeTab]: newList,
    });
  };

  const handleResetToDefaults = () => {
    updateList(DEFAULT_CMS_DATA.subcategories[activeTab] || []);
    setShowResetWarning(false);
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    const slug = normalizeCategoryKey(trimmed);
    if (!slug) return;

    if (currentList.some(item => normalizeCategoryKey(item.id || item.key) === slug)) {
      alert('A category with this name or slug already exists');
      return;
    }

    const newItem = {
      id: slug,
      key: slug,
      label: trimmed,
      icon: newIcon || 'Tag',
      active: true,
      isCustom: true,
    };

    updateList([...currentList, newItem]);
    setNewLabel('');
    setNewIcon('Tag');
  };

  const handleStartEdit = (item) => {
    setEditingId(item.id || item.key);
    setEditLabel(item.label || '');
    setEditIcon(item.icon || 'Tag');
  };

  const handleSaveEdit = (id) => {
    const trimmed = editLabel.trim();
    if (!trimmed) return;
    const updated = currentList.map(item => {
      if ((item.id || item.key) === id) {
        return {
          ...item,
          label: trimmed,
          icon: editIcon || item.icon || 'Tag'
        };
      }
      return item;
    });
    updateList(updated);
    setEditingId(null);
  };

  const handleToggleActive = (id) => {
    const updated = currentList.map(item => {
      if ((item.id || item.key) === id) {
        return { ...item, active: item.active === false ? true : false };
      }
      return item;
    });
    updateList(updated);
  };

  const handleDelete = (id) => {
    const normId = normalizeCategoryKey(id);
    const inUseCount = products.filter(p =>
      (p.category || '').toLowerCase() === activeTab &&
      normalizeCategoryKey(p.sub_category) === normId
    ).length;

    if (inUseCount > 0) {
      if (!window.confirm(`${inUseCount} product(s) are assigned to this category. Remove from filter bar anyway?`)) {
        return;
      }
    }
    updateList(currentList.filter(item => (item.id || item.key) !== id));
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= currentList.length) return;
    const list = [...currentList];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    updateList(list);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box', overflowX: 'hidden' }}>
      {/* Top Header & Tab Switcher */}
      <div style={{
        background: '#FFFFFF', padding: '12px 14px', borderRadius: '16px',
        border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => { setActiveTab('tailoring'); setEditingId(null); }}
            style={{
              padding: '7px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '12px',
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              background: activeTab === 'tailoring' ? 'linear-gradient(135deg, #6B4F8A, #9C80AA)' : '#F1F5F9',
              color: activeTab === 'tailoring' ? '#FFFFFF' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            🧵 Tailoring Filter Bar
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('fashion'); setEditingId(null); }}
            style={{
              padding: '7px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '12px',
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
              background: activeTab === 'fashion' ? 'linear-gradient(135deg, #0A2540, #1A4A7A)' : '#F1F5F9',
              color: activeTab === 'fashion' ? '#FFFFFF' : '#475569',
              transition: 'all 0.15s ease'
            }}
          >
            👗 Fashion Filter Bar
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowResetWarning(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '6px 12px', borderRadius: '9px', background: '#FEF2F2',
            color: '#DC2626', fontSize: '11px', fontWeight: 800,
            border: '1px solid #FECACA', cursor: 'pointer', whiteSpace: 'nowrap'
          }}
        >
          <RotateCcw size={12} /> Reset Defaults
        </button>
      </div>

      {/* Live Visual Preview of Filter Chips */}
      <div style={{
        background: '#F8FAFC', padding: '14px', borderRadius: '16px',
        border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px',
        boxSizing: 'border-box', overflowX: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Live Storefront Filter Bar Preview
          </span>
          <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700 }}>
            {currentList.filter(c => c.active !== false).length} active chips
          </span>
        </div>

        <div style={{
          display: 'flex', gap: '6px', overflowX: 'auto', padding: '8px 4px',
          background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0',
          scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch'
        }}>
          {currentList.filter(c => c.active !== false).map((c, i) => {
            const IconC = ICON_MAP[c.icon] || Tag;
            return (
              <div
                key={c.id || c.key || i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '5px',
                  padding: '5px 11px', borderRadius: '8px',
                  background: i === 0 ? '#0F172A' : '#F1F5F9',
                  color: i === 0 ? '#FFFFFF' : '#334155',
                  fontSize: '11.5px', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0
                }}
              >
                <IconC size={12} />
                <span>{c.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Category Pill Form */}
      <form onSubmit={handleAdd} style={{
        background: '#FFFFFF', padding: '14px', borderRadius: '16px',
        border: '1px solid #E2E8F0', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap',
        boxSizing: 'border-box'
      }}>
        <input
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          placeholder={`Add new category chip (e.g. Embroidery Tools)...`}
          style={{
            flex: '1 1 180px', minWidth: 0, padding: '8px 12px', borderRadius: '8px',
            border: '1px solid #CBD5E1', fontSize: '12.5px', outline: 'none', boxSizing: 'border-box'
          }}
        />

        <select
          value={newIcon}
          onChange={e => setNewIcon(e.target.value)}
          style={{
            padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1',
            fontSize: '12px', background: '#FFFFFF', fontWeight: 600
          }}
        >
          {AVAILABLE_ICONS.map(ic => (
            <option key={ic} value={ic}>{ic}</option>
          ))}
        </select>

        <button
          type="submit"
          disabled={!newLabel.trim()}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '8px 14px', borderRadius: '8px', border: 'none',
            background: newLabel.trim() ? '#0F172A' : '#94A3B8',
            color: '#FFFFFF', fontSize: '12px', fontWeight: 800,
            cursor: newLabel.trim() ? 'pointer' : 'default', whiteSpace: 'nowrap'
          }}
        >
          <Plus size={13} /> Add Chip
        </button>
      </form>

      {/* Categories Reorderable List — Clean Responsive Layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', boxSizing: 'border-box' }}>
        <p style={{ fontSize: '11px', fontWeight: 800, color: '#64748B', margin: '2px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Category Chips Order & Visibility ({currentList.length})
        </p>

        {currentList.map((item, index) => {
          const id = item.id || item.key;
          const normKey = normalizeCategoryKey(id);
          const isEditing = editingId === id;
          const isActive = item.active !== false;
          const ItemIcon = ICON_MAP[item.icon] || Tag;
          const count = normKey === 'all'
            ? products.filter(p => (p.category || '').toLowerCase() === activeTab).length
            : products.filter(p =>
                (p.category || '').toLowerCase() === activeTab &&
                (normalizeCategoryKey(p.sub_category) === normKey || (p.sub_category || '').toLowerCase() === id.toLowerCase())
              ).length;

          return (
            <div
              key={id}
              style={{
                background: '#FFFFFF', padding: '12px 14px', borderRadius: '12px',
                border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '8px',
                opacity: isActive ? 1 : 0.65, boxSizing: 'border-box', width: '100%'
              }}
            >
              {isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', width: '100%' }}>
                  <input
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                    autoFocus
                    style={{
                      flex: '1 1 140px', minWidth: 0, padding: '7px 10px', borderRadius: '8px',
                      border: '1px solid #0F172A', fontSize: '12.5px', boxSizing: 'border-box'
                    }}
                  />
                  <select
                    value={editIcon}
                    onChange={e => setEditIcon(e.target.value)}
                    style={{
                      padding: '7px 8px', borderRadius: '8px',
                      border: '1px solid #CBD5E1', fontSize: '12px', background: '#FFF'
                    }}
                  >
                    {AVAILABLE_ICONS.map(ic => (
                      <option key={ic} value={ic}>{ic}</option>
                    ))}
                  </select>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(id)}
                      style={{
                        padding: '6px 12px', borderRadius: '8px', background: '#0F172A',
                        color: '#FFF', fontSize: '11.5px', fontWeight: 800, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'
                      }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      style={{
                        padding: '6px 10px', borderRadius: '8px', background: '#F1F5F9',
                        color: '#475569', fontSize: '11.5px', fontWeight: 800, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Top Row: Reorder Buttons + Icon + Label + Product Count */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button
                          type="button"
                          className="reorder-arrow-btn"
                          onClick={() => handleMove(index, -1)}
                          disabled={index === 0}
                          title="Move Up"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          className="reorder-arrow-btn"
                          onClick={() => handleMove(index, 1)}
                          disabled={index === currentList.length - 1}
                          title="Move Down"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>

                      <div style={{
                        width: '28px', height: '28px', borderRadius: '8px',
                        background: '#F1F5F9', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#0F172A', flexShrink: 0
                      }}>
                        <ItemIcon size={14} />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'block' }}>
                          {item.label}
                        </span>
                      </div>
                    </div>

                    <span style={{
                      fontSize: '10px', fontWeight: 900, background: '#F1F5F9',
                      color: '#64748B', padding: '2px 7px', borderRadius: '9999px',
                      flexShrink: 0, whiteSpace: 'nowrap'
                    }}>
                      {count} {count === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  {/* Bottom Details & Actions Row: Key slug + Action Buttons (Active / Edit / Trash) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', paddingTop: '4px', borderTop: '1px solid #F8FAFC', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8' }}>
                      <span>Slug:</span>
                      <code style={{ background: '#F8FAFC', padding: '1px 5px', borderRadius: '4px', border: '1px solid #F1F5F9', color: '#475569' }}>
                        {normKey}
                      </code>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'nowrap' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(id)}
                        title={isActive ? "Hide from homepage bar" : "Show on homepage bar"}
                        style={{
                          padding: '5px 8px', borderRadius: '8px', border: '1px solid #E2E8F0',
                          background: isActive ? '#F0FDF4' : '#F8FAFC',
                          color: isActive ? '#16A34A' : '#94A3B8',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                          fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0
                        }}
                      >
                        {isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                        <span>{isActive ? 'Active' : 'Hidden'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStartEdit(item)}
                        title="Edit Category Name & Icon"
                        style={{
                          padding: '5px 8px', borderRadius: '8px', border: '1px solid #E2E8F0',
                          background: '#FFFFFF', color: '#0F172A',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                          fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap', flexShrink: 0
                        }}
                      >
                        <Edit2 size={11} />
                        <span>Edit</span>
                      </button>

                      {normKey !== 'all' && (
                        <button
                          type="button"
                          onClick={() => handleDelete(id)}
                          title="Remove category chip"
                          style={{
                            padding: '5px 7px', borderRadius: '8px', border: 'none',
                            background: '#FEF2F2', color: '#DC2626',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Warning Confirmation Modal for Resetting */}
      {showResetWarning && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '20px', maxWidth: '400px', width: '100%',
            padding: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0'
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 900, color: '#0F172A', margin: '0 0 8px' }}>
              Reset {activeTab === 'tailoring' ? 'Tailoring' : 'Fashion'} Categories?
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, margin: '0 0 20px' }}>
              This will restore the category filter chips to standard store defaults. Existing products in the database will not be deleted.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowResetWarning(false)}
                style={{
                  padding: '8px 16px', borderRadius: '10px', background: '#F1F5F9',
                  color: '#475569', fontWeight: 800, fontSize: '12px', border: 'none', cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetToDefaults}
                style={{
                  padding: '8px 16px', borderRadius: '10px', background: '#DC2626',
                  color: '#FFFFFF', fontWeight: 800, fontSize: '12px', border: 'none', cursor: 'pointer'
                }}
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
