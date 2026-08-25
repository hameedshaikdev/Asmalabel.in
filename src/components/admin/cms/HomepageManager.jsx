import { useState } from 'react';
import {
  Sparkles, Zap, Grid, Star, Image as ImageIcon,
  Globe, FileText, Save, Send, RotateCcw, Eye,
  CheckCircle, ArrowLeft, Undo, Redo, Layers, Users, AlertTriangle
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
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
    undoCms, redoCms, canUndo, canRedo
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
