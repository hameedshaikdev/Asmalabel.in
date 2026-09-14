import React from 'react';

/**
 * Vintage Sewing Machine Icon
 * Derived directly from the user's uploaded reference image (img4).
 */
export function SewingMachineIcon({ size = 22, className = '', ...props }) {
  return (
    <img
      src="/sewing_machine_icon.png"
      alt="Tailoring Tools"
      style={{
        width: size,
        height: 'auto',
        maxHeight: size,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle'
      }}
      className={`sh-category-icon sh-icon-sewing-machine ${className}`}
      {...props}
    />
  );
}

/**
 * Teal Evening Gown / Dress Icon
 * Derived directly from the user's uploaded reference image (img3).
 */
export function FrockIcon({ size = 22, className = '', ...props }) {
  return (
    <img
      src="/teal_dress_icon.png"
      alt="Women's Fashion"
      style={{
        width: 'auto',
        height: size,
        maxHeight: size,
        objectFit: 'contain',
        display: 'inline-block',
        verticalAlign: 'middle'
      }}
      className={`sh-category-icon sh-icon-frock ${className}`}
      {...props}
    />
  );
}

export function TailoringNeedleIcon({ size = 20, color = '#0284C7', className = '', ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={`sh-category-icon ${className}`}
      {...props}
    >
      <path
        d="M17 7 C14 3.5, 9.5 5, 11.5 8.5 C13 11.5, 18 14, 15.5 17.5 C13.5 20, 10.5 19, 11.5 16.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <line
        x1="18.5"
        y1="5.5"
        x2="5"
        y2="19"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Minimal 3D Lock unit component (used in modal and fallbacks)
 */
export function ChainedLock3D() {
  return (
    <span className="sh-lock-minimal-unit" aria-hidden="true">
      <svg className="sh-lock-min-chain" width="17" height="13" viewBox="0 0 18 13" fill="none">
        <defs>
          <linearGradient id="sh-min-steel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#E2E8F0" />
            <stop offset="70%" stopColor="#64748B" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
        </defs>
        <rect x="0.8" y="3.5" width="9.5" height="6" rx="3" fill="url(#sh-min-steel)" stroke="#FFF" strokeWidth="0.5" />
        <rect x="2.8" y="5" width="5.5" height="3" rx="1.5" fill="#1E293B" />
        <rect x="8" y="1" width="5" height="11" rx="2.5" fill="url(#sh-min-steel)" stroke="#334155" strokeWidth="0.5" />
        <rect x="9.5" y="3" width="2" height="7" rx="1" fill="#1E293B" />
        <rect x="12" y="3.5" width="5.5" height="6" rx="2.75" fill="url(#sh-min-steel)" stroke="#FFF" strokeWidth="0.5" />
      </svg>

      <svg className="sh-lock-min-padlock" width="16" height="19" viewBox="0 0 16 19" fill="none">
        <defs>
          <linearGradient id="sh-min-shackle" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#64748B" />
            <stop offset="35%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>
          <linearGradient id="sh-min-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="30%" stopColor="#F59E0B" />
            <stop offset="75%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>
        <path d="M4.5 7V4.5C4.5 2.57 6.07 1 8 1C9.93 1 11.5 2.57 11.5 4.5V7" stroke="url(#sh-min-shackle)" strokeWidth="2.3" strokeLinecap="round" />
        <rect x="2" y="6.8" width="12" height="11.2" rx="2.8" fill="url(#sh-min-gold)" stroke="#78350F" strokeWidth="0.7" />
        <line x1="3.5" y1="8" x2="12.5" y2="8" stroke="#FFFBEB" strokeWidth="0.8" strokeLinecap="round" opacity="0.85" />
        <circle cx="8" cy="11.6" r="1.3" fill="#3B1502" />
        <path d="M7.4 12L7.1 14.8H8.9L8.6 12" fill="#3B1502" />
      </svg>
    </span>
  );
}
