import { useState } from 'react';
import {
  Sparkles, Zap, Grid, Star, Image as ImageIcon,
  Globe, FileText, Save, Send, RotateCcw, Eye,
  CheckCircle, ArrowLeft, Undo, Redo, Layers, Users, AlertTriangle,
  Lock, Unlock
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { TailoringNeedleIcon, FrockIcon } from '../../common/CategoryIcons';
import HeroEditor from './HeroEditor';
import AnnouncementBarEditor from './AnnouncementBarEditor';
import TrustBadgesEditor from './TrustBadgesEditor';
import FlashDealsEditor from './FlashDealsEditor';
import CategoryFilterEditor from './CategoryFilterEditor';
import CollectionsEditor from './CollectionsEditor';
import NewArrivalsEditor from './NewArrivalsEditor';
import TopPicksEditor from './TopPicksEditor';
import BannersEditor from './BannersEditor';
import FooterEditor from './FooterEditor';
import SeoEditor from './SeoEditor';
import MediaLibrary from './MediaLibrary';
import CmsLivePreviewModal from './CmsLivePreviewModal';
import SocialMediaManager from '../SocialMediaManager';
import { toast } from '../AdminUtils';

export default function HomepageManager({ products = [] }) {
  const {
    cmsData, cmsDraft, updateCmsDraft, publishCms, resetCmsDraft,
    undoCms, redoCms, canUndo, canRedo,
    isWomenSectionLocked, setWomenSectionLocked
  } = useApp();

  const [activeSection, setActiveSection] = useState('hero');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showResetWarningModal, setShowResetWarningModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const navItems = [
    { key: 'announcement', label: 'Top Announcement Bar', icon: Layers },
    { key: 'hero', label: 'Hero Section', icon: Sparkles },
    { key: 'trust', label: 'Trust Badges Strip', icon: CheckCircle },
    { key: 'filter', label: 'Category Filter Bar', icon: Layers },
    { key: 'flash', label: 'Flash Deals', icon: Zap },
    { key: 'collections', label: 'Collections Grid', icon: Grid },
    { key: 'arrivals', label: 'New Arrivals', icon: Sparkles },
    { key: 'picks', label: 'Top Picks', icon: Star },
    { key: 'banners', label: 'Promo Banners', icon: Layers },
    { key: 'footer', label: 'Footer Content', icon: FileText },
    { key: 'seo', label: 'SEO & Social', icon: Globe },
    { key: 'social', label: 'Social Media Stats', icon: Users },
    { key: 'media', label: 'Media Library', icon: ImageIcon },
  ];

  const handleSaveDraft = () => {
    toast('Draft saved locally', 'success');
  };

  const handlePublish = async () => {
    setSaving(true);
    await publishCms();
    setSaving(false);
    toast('Homepage CMS Published Successfully!', 'success');
  };

  const handleConfirmResetAll = () => {
    resetCmsDraft();
    setShowResetWarningModal(false);
    toast('Reset all CMS placeholder values to defaults', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '100%' }}>
      {/* CMS Master Top Controls Bar */}
      <div
        className="cms-top-bar"
        style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '16px',
          padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', flexWrap: 'wrap', width: '100%', boxSizing: 'border-box'
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: '0 0 auto' }}>
          <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', flexShrink: 0 }}>
            <Sparkles size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1.2, whiteSpace: 'nowrap' }}>Homepage CMS</h2>
            <p style={{ fontSize: '10px', color: '#64748B', margin: '1px 0 0 0', whiteSpace: 'nowrap' }}>Dynamic Storefront Editor</p>
          </div>
        </div>

        {/* Action buttons — horizontal scroll row on mobile */}
        <div className="cms-action-bar-buttons" style={{ display: 'flex', gap: '6px', alignItems: 'center', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', flex: '1 1 auto', maxWidth: '100%', minWidth: 0 }}>
          {/* Undo / Redo */}
          <button
            onClick={undoCms}
            disabled={!canUndo}
            title="Undo Edit"
            style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', cursor: canUndo ? 'pointer' : 'not-allowed', opacity: canUndo ? 1 : 0.4, flexShrink: 0 }}
          >
            <Undo size={14} />
          </button>
          <button
            onClick={redoCms}
            disabled={!canRedo}
            title="Redo Edit"
            style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#F8FAFC', cursor: canRedo ? 'pointer' : 'not-allowed', opacity: canRedo ? 1 : 0.4, flexShrink: 0 }}
          >
            <Redo size={14} />
          </button>

          {/* Live Preview Button */}
          <button
            onClick={() => setShowPreviewModal(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '8px 12px', borderRadius: '9px', border: '1px solid #2563EB', background: '#EFF6FF',
              color: '#2563EB', fontSize: '12px', fontWeight: 800, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap'
            }}
          >
            <Eye size={14} /> Preview
          </button>
          <button
            onClick={() => setShowResetWarningModal(true)}
            title="Reset placeholder values to defaults"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '8px 12px', borderRadius: '9px', border: '1px solid #FECACA', background: '#FEF2F2',
              color: '#DC2626', fontSize: '12px', fontWeight: 800, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap'
            }}
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>

          {/* Publish */}
          <button
            onClick={handlePublish}
            disabled={saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '8px 14px', borderRadius: '9px', border: 'none', background: '#059669',
              color: '#FFFFFF', fontSize: '12px', fontWeight: 900, cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(5,150,105,0.25)', flexShrink: 0, whiteSpace: 'nowrap'
            }}
          >
            <Send size={14} /> {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      {/* ── Storefront Section Controls & Lock Card ── */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          overflow: 'hidden'
        }}
      >
        {/* Top Header Row with Icon and Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', width: '100%' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              minWidth: '42px',
              maxWidth: '42px',
              flexShrink: 0,
              borderRadius: '12px',
              background: isWomenSectionLocked
                ? 'linear-gradient(135deg, #EF4444, #B91C1C)'
                : 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: isWomenSectionLocked
                ? '0 4px 12px rgba(239, 68, 68, 0.3)'
                : '0 4px 12px rgba(16, 185, 129, 0.3)',
              marginTop: '1px'
            }}
          >
            {isWomenSectionLocked ? <Lock size={20} /> : <Unlock size={20} />}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 900, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
                Storefront Section Access &amp; Lock Controls
              </h3>
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 900,
                  padding: '3px 8px',
                  borderRadius: '99px',
                  background: isWomenSectionLocked ? '#FEF2F2' : '#F0FDF4',
                  color: isWomenSectionLocked ? '#DC2626' : '#16A34A',
                  border: isWomenSectionLocked ? '1px solid #FECACA' : '1px solid #BBF7D0',
                  letterSpacing: '0.3px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                  whiteSpace: 'nowrap'
                }}
              >
                {isWomenSectionLocked ? '🔒 LOCKED (CHAINED)' : '✓ LIVE (UNLOCKED)'}
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
              When locked, the Women's Fashion tab on the homepage is chained with a padlock and shows a luxury Coming Soon announcement modal upon click.
            </p>
          </div>
        </div>

        {/* Status & Toggle Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: isWomenSectionLocked ? '#FEF2F2' : '#F8FAFC',
            border: isWomenSectionLocked ? '1px solid #FECACA' : '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '10px 14px',
            gap: '12px'
          }}
        >
          <div style={{ minWidth: 0 }}>
            <span
              style={{
                fontSize: '12.5px',
                fontWeight: 800,
                color: isWomenSectionLocked ? '#B91C1C' : '#334155',
                display: 'block',
                lineHeight: 1.3
              }}
            >
              {isWomenSectionLocked ? "Women's Fashion: Locked" : "Women's Fashion: Active & Live"}
            </span>
            <small style={{ fontSize: '11px', color: isWomenSectionLocked ? '#EF4444' : '#64748B', display: 'block' }}>
              {isWomenSectionLocked ? 'Shoppers see 3D chains and coming soon modal' : 'Shoppers can browse and purchase items'}
            </small>
          </div>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={() => {
              const next = !isWomenSectionLocked;
              setWomenSectionLocked(next);
              toast(
                next
                  ? "Women's Fashion section is now LOCKED (Chained on homepage)"
                  : "Women's Fashion section is now UNLOCKED (Live for shoppers)",
                next ? 'warning' : 'success'
              );
            }}
            style={{
              width: '56px',
              height: '32px',
              minWidth: '56px',
              borderRadius: '999px',
              background: isWomenSectionLocked ? '#DC2626' : '#CBD5E1',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: '3px',
              transition: 'background 200ms ease',
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0
            }}
            title={isWomenSectionLocked ? "Click to Unlock Women's Fashion" : "Click to Lock Women's Fashion"}
            aria-label={isWomenSectionLocked ? "Unlock Women's Fashion Section" : "Lock Women's Fashion Section"}
          >
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: '#FFFFFF',
                boxShadow: '0 2px 6px rgba(0,0,0,0.25)',
                transform: isWomenSectionLocked ? 'translateX(24px)' : 'translateX(0px)',
                transition: 'transform 200ms ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isWomenSectionLocked ? <Lock size={13} color="#DC2626" /> : <Unlock size={13} color="#64748B" />}
            </div>
          </button>
        </div>

        {/* Realistic Live Storefront Switcher Preview */}
        <div
          style={{
            background: '#F8FAFC',
            borderRadius: '12px',
            padding: '12px 14px',
            border: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}
        >
          <div>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block' }}>
              Storefront Switcher Live Preview
            </span>
            <span style={{ fontSize: '11px', color: '#64748B' }}>
              {isWomenSectionLocked ? "Real luxury 3D chained pill active on store" : "Active tabs with needle and frock icons"}
            </span>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              background: 'linear-gradient(180deg, #113854 0%, #0c273b 100%)',
              padding: '3px 4px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.18)',
              boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              maxWidth: '100%',
              overflow: 'visible'
            }}
          >
            <div
              style={{
                padding: '6px 12px',
                borderRadius: '999px',
                background: '#FFFFFF',
                color: '#0F172A',
                fontSize: '11px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              <TailoringNeedleIcon size={14} color="#0284C7" /> Tailoring Tools
            </div>
            {isWomenSectionLocked ? (
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px', height: '28px' }}>
                <img
                  src="/chained_womens_fashion_pill.png"
                  alt="Chained Preview"
                  style={{ height: '34px', width: 'auto', display: 'block', pointerEvents: 'none', filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.3))' }}
                />
              </div>
            ) : (
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.15)',
                  color: '#FFFFFF',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FrockIcon size={14} /> Women's Fashion
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main CMS Layout (Sidebar Nav + Active Section View) */}
      <div className="cms-main-grid" style={{ display: 'grid', gap: '16px', width: '100%' }}>
        {/* Sidebar Nav — Desktop: vertical column / Mobile: horizontal scrollable pill row */}
        <div className="cms-sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveSection(item.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                  padding: '10px 14px', borderRadius: '12px', border: 'none',
                  background: isActive ? 'linear-gradient(135deg, #1E293B, #0F172A)' : 'transparent',
                  color: isActive ? '#FFFFFF' : '#475569', fontWeight: isActive ? 800 : 600,
                  fontSize: '13px', cursor: 'pointer', textAlign: 'left', transition: 'all 150ms ease'
                }}
              >
                <Icon size={16} color={isActive ? '#60A5FA' : '#64748B'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section View */}
        <div className="cms-section-content">
          {activeSection === 'announcement' && (
            <AnnouncementBarEditor
              barData={cmsDraft.announcementBar}
              onChange={val => updateCmsDraft({ announcementBar: val })}
            />
          )}

          {activeSection === 'hero' && (
            <HeroEditor
              heroData={cmsDraft.hero}
              onChange={val => updateCmsDraft({ hero: val })}
            />
          )}

          {activeSection === 'trust' && (
            <TrustBadgesEditor
              badgesData={cmsDraft.trustBadges}
              onChange={val => updateCmsDraft({ trustBadges: val })}
            />
          )}

          {activeSection === 'filter' && (
            <CategoryFilterEditor
              subcategoriesData={cmsDraft.subcategories}
              products={products}
              onChange={val => updateCmsDraft({ subcategories: val })}
            />
          )}

          {activeSection === 'flash' && (
            <FlashDealsEditor
              dealsData={cmsDraft.flashDeals}
              products={products}
              onChange={val => updateCmsDraft({ flashDeals: val })}
            />
          )}

          {activeSection === 'collections' && (
            <CollectionsEditor
              collectionsData={cmsDraft.collections}
              onChange={val => updateCmsDraft({ collections: val })}
            />
          )}

          {activeSection === 'arrivals' && (
            <NewArrivalsEditor
              arrivalsData={cmsDraft.newArrivals}
              products={products}
              onChange={val => updateCmsDraft({ newArrivals: val })}
            />
          )}

          {activeSection === 'picks' && (
            <TopPicksEditor
              picksData={cmsDraft.topPicks}
              products={products}
              onChange={val => updateCmsDraft({ topPicks: val })}
            />
          )}

          {activeSection === 'banners' && (
            <BannersEditor
              bannersData={cmsDraft.banners}
              onChange={val => updateCmsDraft({ banners: val })}
            />
          )}

          {activeSection === 'footer' && (
            <FooterEditor
              footerData={cmsDraft.footer}
              onChange={val => updateCmsDraft({ footer: val })}
            />
          )}

          {activeSection === 'seo' && (
            <SeoEditor
              seoData={cmsDraft.seo}
              onChange={val => updateCmsDraft({ seo: val })}
            />
          )}

          {activeSection === 'social' && (
            <SocialMediaManager />
          )}

          {activeSection === 'media' && (
            <MediaLibrary
              mediaList={cmsDraft.mediaLibrary}
              onUpdateMedia={val => updateCmsDraft({ mediaLibrary: val })}
            />
          )}
        </div>
      </div>

      {/* Live Preview Modal */}
      {showPreviewModal && (
        <CmsLivePreviewModal
          draftData={cmsDraft}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {/* Warning Confirmation Modal for Resetting Placeholders */}
      {showResetWarningModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99999,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#FFFFFF', borderRadius: '24px', maxWidth: '440px', width: '100%',
            padding: '28px', boxShadow: '0 24px 60px rgba(0,0,0,0.25)', border: '1px solid #E2E8F0',
            fontFamily: "'Plus Jakarta Sans', sans-serif", animation: 'fadeIn 200ms ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#FEF2F2', border: '1px solid #FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#DC2626', flexShrink: 0 }}>
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, color: '#0F172A', margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Reset Placeholder Values?</h3>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', margin: '2px 0 0' }}>⚠️ Warning: This action cannot be undone</p>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6, margin: '0 0 24px', fontWeight: 500 }}>
              Are you sure you want to reset all input values and placeholders in this section back to the original default store values? Any custom text, titles, or image URLs will be replaced.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowResetWarningModal(false)}
                style={{ padding: '10px 18px', borderRadius: '12px', background: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', fontSize: '13px', fontWeight: 800, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResetAll}
                style={{ padding: '10px 18px', borderRadius: '12px', background: '#DC2626', border: 'none', color: '#FFFFFF', fontSize: '13px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 14px rgba(220,38,38,0.25)' }}
              >
                Yes, Reset All Values
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
