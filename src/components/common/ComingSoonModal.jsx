import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, MessageCircle, ArrowRight, Lock, Heart } from 'lucide-react';
import { FrockIcon } from './CategoryIcons';
import { WhatsAppIcon } from './UpiIcons';

export default function ComingSoonModal({ isOpen, onClose, onExploreTailoring }) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const whatsappMessage = encodeURIComponent(
    'Hi Asmalabel! Please notify me as soon as the Women\'s Fashion collection goes live on your store ✨'
  );
  const whatsappUrl = `https://wa.me/917013942909?text=${whatsappMessage}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="sh-coming-soon-portal">
          {/* Frosted Luxury Backdrop */}
          <motion.div
            className="sh-coming-soon-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            className="sh-coming-soon-card"
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cs-modal-title"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="sh-coming-soon-close"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Glowing Accent Ring with Frock & 3D Padlock */}
            <div className="sh-cs-hero-graphic">
              <div className="sh-cs-glow-orb" />
              <div className="sh-cs-icon-circle">
                <FrockIcon size={44} color="#BE123C" />
                <div className="sh-cs-lock-pip">
                  <svg width="18" height="22" viewBox="0 0 24 28" fill="none">
                    <path d="M6 12V7a6 6 0 1 1 12 0v5" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
                    <rect x="2" y="11" width="20" height="15" rx="3.5" fill="#F59E0B" stroke="#B45309" strokeWidth="1" />
                    <circle cx="12" cy="18" r="2" fill="#78350F" />
                    <line x1="12" y1="19" x2="12" y2="23" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Top Pill Badge */}
            <div className="sh-cs-pill-badge">
              <Sparkles size={13} className="sh-cs-sparkle-spin" />
              <span>COMING SOON • ASMALABEL EXCLUSIVE</span>
            </div>

            {/* Main Headline */}
            <h2 id="cs-modal-title" className="sh-cs-title">
              Women's Fashion Collection
            </h2>

            {/* Subtitle / Description */}
            <p className="sh-cs-desc">
              We are currently handcrafting and curating an exclusive catalog of
              high-quality women’s textiles, boutique fabrics, designer sarees, and modern outfits.
              This section will be unveiled shortly!
            </p>

            {/* Feature Highlights Grid */}
            <div className="sh-cs-features">
              <div className="sh-cs-feat-item">
                <span className="sh-cs-feat-dot">✨</span>
                <div>
                  <strong>Curated Boutique Fabrics</strong>
                  <p>Handpicked textures, ethnic weaves & vibrant prints</p>
                </div>
              </div>
              <div className="sh-cs-feat-item">
                <span className="sh-cs-feat-dot">👗</span>
                <div>
                  <strong>Boutique Tailored Attires</strong>
                  <p>Daily fashion, festive wear & modern silhouettes</p>
                </div>
              </div>
              <div className="sh-cs-feat-item">
                <span className="sh-cs-feat-dot">🚚</span>
                <div>
                  <strong>Direct Doorstep Delivery</strong>
                  <p>Crafted in Nellore, trusted across all over India</p>
                </div>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="sh-cs-actions">
              {/* WhatsApp VIP Notification Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="sh-cs-btn-whatsapp"
                onClick={onClose}
              >
                <div className="sh-cs-btn-wa-icon">
                  <WhatsAppIcon size={20} />
                </div>
                <div className="sh-cs-btn-wa-text">
                  <span>Notify Me on WhatsApp</span>
                  <small>Get early access VIP discounts</small>
                </div>
              </a>

              {/* Continue Shopping Tailoring Tools */}
              <button
                type="button"
                className="sh-cs-btn-browse"
                onClick={() => {
                  if (onExploreTailoring) onExploreTailoring();
                  onClose();
                }}
              >
                <span>Browse Tailoring Tools</span>
                <ArrowRight size={15} />
              </button>
            </div>

            {/* Sub-footer reassurance */}
            <div className="sh-cs-footer-note">
              <Heart size={12} color="#E11D48" fill="#E11D48" />
              <span>Made with love by Asmalabel • Crafting quality since day one</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
