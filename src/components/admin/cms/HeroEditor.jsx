import { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff, Settings, ArrowUp, ArrowDown, Copy } from 'lucide-react';

export default function HeroEditor({ heroData = {}, onChange }) {
  const [activeTab, setActiveTab] = useState('tailoring');
  const [showCarouselSettings, setShowCarouselSettings] = useState(false);

  const hero = heroData || {};
  const currentHero = hero[activeTab] || {};
  const slides = hero.slides || [];
  const carouselSettings = hero.carouselSettings || { autoplay: true, slideDuration: 5000, transitionStyle: 'fade' };

  const updateCurrentHero = (field, value) => {
    onChange?.({ ...hero, [activeTab]: { ...currentHero, [field]: value } });
  };

  const updateCarouselSettings = (field, value) => {
    onChange?.({ ...hero, carouselSettings: { ...carouselSettings, [field]: value } });
  };

  const handleAddSlide = () => {
    const newSlide = {
      id: 'slide-' + Date.now(),
      title: 'New Headline',
      titleAccent: 'Accent',
      titleLine2: 'Collection Sub-headline',
      sub: 'Subtitle description here...',
      illustration: 'https://images.unsplash.com/photo-1617606002806-94e279c22567?w=800',
      badgeText: 'New 2026',
      btn1Text: 'Shop Now',
      btn1Link: '#products',
      active: true,
      category: activeTab,
    };
    onChange?.({ ...hero, slides: [...slides, newSlide] });
  };

  const handleUpdateSlide = (id, field, value) => {
    onChange?.({ ...hero, slides: slides.map(s => s.id === id ? { ...s, [field]: value } : s) });
  };

  const handleDeleteSlide = (id) => {
    onChange?.({ ...hero, slides: slides.filter(s => s.id !== id) });
  };

  const handleDuplicateSlide = (slide) => {
    const copy = { ...slide, id: 'slide-' + Date.now() };
    onChange?.({ ...hero, slides: [...slides, copy] });
  };

  const handleMoveSlide = (idx, dir) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= slides.length) return;
    const list = [...slides];
    [list[idx], list[newIdx]] = [list[newIdx], list[idx]];
    onChange?.({ ...hero, slides: list });
  };

  /* ─── inline style for the webkit scrollbar hide ─── */
  const scrollHide = { scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', boxSizing: 'border-box' }}>

      {/* ══ TAB BAR ══
          Horizontal scrollable tabs - always in one line
      */}
      <div className="cms-horizontal-options" style={{ background: '#FFFFFF', borderRadius: '16px', border: '1px solid #E2E8F0', padding: '12px 14px', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ display: 'flex', gap: '8px', minWidth: 'max-content', flexWrap: 'nowrap' }}>
          <button
            onClick={() => setActiveTab('tailoring')}
            style={{
              padding: '8px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '12px',
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              background: activeTab === 'tailoring' ? 'linear-gradient(135deg, #F3EEFA, #D4C3ED)' : '#F1F5F9',
              color: activeTab === 'tailoring' ? '#FFF' : '#475569',
              boxShadow: activeTab === 'tailoring' ? '0 4px 14px rgba(61,15,107,.3)' : 'none',
            }}
          >🪡 Tailoring Tools Hero</button>

          <button
            onClick={() => setActiveTab('fashion')}
            style={{
              padding: '8px 14px', borderRadius: '10px', fontWeight: 800, fontSize: '12px',
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              background: activeTab === 'fashion' ? 'linear-gradient(135deg,#0A2540,#1A4A7A)' : '#F1F5F9',
              color: activeTab === 'fashion' ? '#FFF' : '#475569',
              boxShadow: activeTab === 'fashion' ? '0 4px 14px rgba(10,37,64,.3)' : 'none',
            }}
          >👗 Women Fashion Hero</button>

          <button
            onClick={() => setShowCarouselSettings(v => !v)}
            style={{
              padding: '8px 12px', borderRadius: '9px', whiteSpace: 'nowrap', flexShrink: 0,
              background: showCarouselSettings ? '#0F172A' : '#F8FAFC',
              border: '1px solid #CBD5E1', fontSize: '11px', fontWeight: 700,
              cursor: 'pointer', color: showCarouselSettings ? '#FFF' : '#334155',
              display: 'inline-flex', alignItems: 'center', gap: '5px',
            }}
          ><Settings size={13} /> Carousel Settings</button>
        </div>
      </div>

      {/* ══ CAROUSEL SETTINGS (collapsible) ══ */}
      {showCarouselSettings && (
        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginBottom: '12px' }}>⚙️ Hero Carousel Settings</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(220px,100%),1fr))', gap: '12px' }}>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
              Autoplay Slides
              <select value={carouselSettings.autoplay ? 'true' : 'false'}
                onChange={e => updateCarouselSettings('autoplay', e.target.value === 'true')}
                style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}>
                <option value="true">Enabled</option>
                <option value="false">Disabled</option>
              </select>
            </label>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
              Slide Duration (ms)
              <input type="number" value={carouselSettings.slideDuration}
                onChange={e => updateCarouselSettings('slideDuration', parseInt(e.target.value) || 5000)}
                style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }} />
            </label>
            <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
              Transition Effect
              <select value={carouselSettings.transitionStyle}
                onChange={e => updateCarouselSettings('transitionStyle', e.target.value)}
                style={{ display: 'block', width: '100%', marginTop: '4px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px' }}>
                <option value="fade">Smooth Fade</option>
                <option value="slide">Horizontal Slide</option>
              </select>
            </label>
          </div>
        </div>
      )}

      {/* ══ FORM FIELDS ══ */}
      <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
          Hero Section Options ({activeTab.toUpperCase()})
        </h3>

        {/* 2-col grid on desktop, 1-col on mobile */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(240px,100%),1fr))', gap: '12px', marginBottom: '14px' }}>
          {[
            ['Main Title', 'title'],
            ['Accent Highlight Title', 'titleAccent'],
            ['Category Sub-line', 'titleLine2'],
            ['Badge Pill Text', 'badgeText'],
          ].map(([label, field]) => (
            <div key={field}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>{label}</label>
              <input type="text" value={currentHero[field] || ''}
                onChange={e => updateCurrentHero(field, e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box' }} />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Hero Description Subtitle</label>
          <textarea rows={2} value={currentHero.sub || ''}
            onChange={e => updateCurrentHero('sub', e.target.value)}
            style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '12px', boxSizing: 'border-box', resize: 'vertical' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(240px,100%),1fr))', gap: '12px' }}>
          {[
            ['Hero Photo URL', 'illustration'],
            ['Background Gradient CSS', 'grad'],
            ['Accent Glow Color (HEX)', 'accentColor'],
          ].map(([label, field]) => (
            <div key={field}>
              <label style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>{label}</label>
              <input type="text" value={currentHero[field] || ''}
                onChange={e => updateCurrentHero(field, e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '11px', boxSizing: 'border-box' }} />
            </div>
          ))}
        </div>
      </div>

      {/* ══ HERO SLIDES MANAGER ══ */}
      <div style={{ background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '16px', padding: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', gap: '8px', flexWrap: 'wrap' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', margin: 0 }}>
            📸 Hero Slides Manager ({slides.length} Slides)
          </h3>
          <button onClick={handleAddSlide}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: '8px', background: '#2563EB', color: '#FFF', fontSize: '12px', fontWeight: 700, border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            <Plus size={13} /> Add Slide
          </button>
        </div>

        {/* Slide list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {slides.map((slide, idx) => (
            <div key={slide.id} style={{
              borderRadius: '10px', border: '1px solid #E2E8F0',
              background: slide.active ? '#F8FAFC' : '#F1F5F9',
              opacity: slide.active ? 1 : 0.65,
            }}>
              {/* Mobile/Desktop responsive layout using className */}
              <div className="hero-slide-card-grid">
                {/* Sort arrows */}
                <div className="hero-slide-sort">
                  <button className="reorder-arrow-btn" onClick={() => handleMoveSlide(idx, -1)} disabled={idx === 0} title="Move Up">
                    <ArrowUp size={14} />
                  </button>
                  <button className="reorder-arrow-btn" onClick={() => handleMoveSlide(idx, 1)} disabled={idx === slides.length - 1} title="Move Down">
                    <ArrowDown size={14} />
                  </button>
                </div>

                {/* Thumbnail */}
                <img src={slide.illustration} alt=""
                  className="hero-slide-thumb"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1617606002806-94e279c22567?w=100'; }} />

                {/* Title + Accent stacked — takes remaining width */}
                <div className="hero-slide-info">
                  <input type="text" value={slide.title}
                    onChange={e => handleUpdateSlide(slide.id, 'title', e.target.value)}
                    style={{ width: '100%', fontWeight: 800, fontSize: '12px', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '3px 6px', boxSizing: 'border-box' }} />
                  <input type="text" value={slide.titleAccent}
                    onChange={e => handleUpdateSlide(slide.id, 'titleAccent', e.target.value)}
                    style={{ width: '100%', fontWeight: 700, fontSize: '11px', color: '#2563EB', border: '1px solid #CBD5E1', borderRadius: '6px', padding: '3px 6px', boxSizing: 'border-box' }} />
                </div>

                {/* Action buttons — fixed 92px column on desktop, full width on mobile */}
                <div className="hero-slide-actions">
                  <button onClick={() => handleUpdateSlide(slide.id, 'active', !slide.active)}
                    title={slide.active ? 'Hide Slide' : 'Show Slide'}
                    style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', cursor: 'pointer', flexShrink: 0 }}>
                    {slide.active ? <Eye size={12} color="#059669" /> : <EyeOff size={12} color="#94A3B8" />}
                  </button>
                  <button onClick={() => handleDuplicateSlide(slide)} title="Duplicate"
                    style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', cursor: 'pointer', flexShrink: 0 }}>
                    <Copy size={12} color="#3B82F6" />
                  </button>
                  <button onClick={() => handleDeleteSlide(slide.id)} title="Delete Slide"
                    style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFF', cursor: 'pointer', flexShrink: 0 }}>
                    <Trash2 size={12} color="#DC2626" />
                  </button>
                </div>
              </div>

              {/* Category badge row */}
              <div style={{ padding: '2px 12px 8px', fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
                Cat: <strong style={{ color: '#0F172A' }}>{slide.category || 'all'}</strong>
                &nbsp;·&nbsp;
                <span style={{ color: slide.active ? '#059669' : '#94A3B8' }}>{slide.active ? 'visible' : 'hidden'}</span>
              </div>
            </div>
          ))}

          {slides.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px', color: '#94A3B8', fontSize: '13px' }}>
              No slides yet — click <strong>+ Add Slide</strong> to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
