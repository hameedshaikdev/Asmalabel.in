import { useLocation, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function Footer() {
  const location = useLocation();
  const { cmsData, cmsDraft } = useApp();
  if (location.pathname.startsWith('/admin')) return null;

  const isPreviewMode = window.location.search.includes('preview=draft');
  const activeCms = isPreviewMode ? (cmsDraft || cmsData) : cmsData;
  const f = activeCms?.footer || {};
  const s = f.socials || {};

  const fbUrl = s.facebook || 'https://facebook.com/share/166X2VepUx/?mibextid=wwXIfr';
  const igUrl = s.instagram || 'https://www.instagram.com/as_tailoring_tools_textiles';
  const ytUrl = s.youtube || 'https://youtube.com/@astailoringtoolstextiles';
  const waNum = s.whatsapp || '917013942909';
  const phone = f.phone || '7013942909';
  const email = f.email || 'as.businezzz@gmail.com';
  const copyright = f.copyright || '© 2026 Asmalabel · All Rights Reserved';

  const hasBottomNav = !['/checkout', '/login', '/signup'].includes(location.pathname);

  return (
    <footer style={{
      background: '#0F172A',
      marginTop: 'auto',
      width: '100%',
      paddingBottom: hasBottomNav ? 'calc(80px + env(safe-area-inset-bottom, 0px))' : 'calc(32px + env(safe-area-inset-bottom, 0px))'
    }}>
      <div style={{ maxWidth:'560px', margin:'0 auto',
        padding:'48px 24px 40px', textAlign:'center',
        display:'flex', flexDirection:'column', alignItems:'center', gap:'22px' }}>

        {/* Logo + name */}
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'48px', height:'48px', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.2)', background:'white', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, padding:'3px' }}>
            <img src="/logo.png" alt="Asmalabel"
              style={{ width:'100%', height:'100%', objectFit:'contain' }}
              onError={e => { e.target.style.display = 'none'; }} />
          </div>
          <div style={{ textAlign:'left' }}>
            <p style={{ fontSize:'20px', fontWeight:900, color:'white',
              letterSpacing:'-.3px', lineHeight:1, margin:0 }}>Asmalabel</p>
            <p style={{ fontSize:'11px', color:'rgba(255,255,255,.85)', marginTop:'3px', margin:0 }}>
              Tailoring &amp; Fashion
            </p>
          </div>
        </div>

        {/* Tagline / About */}
        <p style={{ fontSize:'13px', color:'rgba(255,255,255,.85)',
          lineHeight:1.75, maxWidth:'340px' }}>
          {f.aboutText || "Premium tailoring tools & women's fashion. Quality you can trust, delivered to your door."}
        </p>

        {/* Navigation Links for SEO & Crawlability */}
        <div style={{ display: 'flex', gap: '8px 12px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', fontSize: '13px', fontWeight: 600, maxWidth: '440px', margin: '0 auto' }}>
          <Link to="/" style={{ color: 'rgba(255,255,255,.9)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Home</Link>
          <span style={{ color: 'rgba(255,255,255,.3)', fontSize: '11px', lineHeight: 1 }}>|</span>
          <Link to="/about" style={{ color: 'rgba(255,255,255,.9)', textDecoration: 'none', whiteSpace: 'nowrap' }}>About Us</Link>
          <span style={{ color: 'rgba(255,255,255,.3)', fontSize: '11px', lineHeight: 1 }}>|</span>
          <Link to="/?category=tailoring" style={{ color: 'rgba(255,255,255,.9)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Tailoring Tools</Link>
          <span style={{ color: 'rgba(255,255,255,.3)', fontSize: '11px', lineHeight: 1 }}>|</span>
          <Link to="/?category=fashion" style={{ color: 'rgba(255,255,255,.9)', textDecoration: 'none', whiteSpace: 'nowrap' }}>Women's Fashion</Link>
        </div>

        {/* Social icons */}
        <div style={{ display:'flex', gap:'10px', alignItems: 'center' }}>

          {/* Facebook */}
          {fbUrl && (
            <a href={fbUrl}
              target="_blank" rel="noopener noreferrer" title="Facebook"
              style={{ width:'38px', height:'38px', borderRadius:'12px',
                background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center',
                justifyContent:'center', transition:'transform .2s, background .2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.background='rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.background='rgba(255,255,255,0.08)'; }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="12" fill="#1877F2"/>
                <path d="M13.67 19.5V12.65H16.02L16.37 9.94H13.67V8.21C13.67 7.42 13.89 6.89 15.02 6.89L16.46 6.89V4.46C15.82 4.37 15.18 4.33 14.54 4.33C12.64 4.33 11.34 5.49 11.34 7.62V9.94H9V12.65H11.34V19.5H13.67Z" fill="#FFFFFF"/>
              </svg>
            </a>
          )}

          {/* Instagram */}
          {igUrl && (
            <a href={igUrl}
              target="_blank" rel="noopener noreferrer" title="Instagram"
              style={{ width:'38px', height:'38px', borderRadius:'12px',
                background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center',
                justifyContent:'center', transition:'transform .2s, background .2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.background='rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.background='rgba(255,255,255,0.08)'; }}>
              <svg width="22" height="22" viewBox="0 0 24 24">
                <defs>
                  <linearGradient id="ig-fill-foot" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f09433" />
                    <stop offset="25%" stopColor="#e6683c" />
                    <stop offset="50%" stopColor="#dc2743" />
                    <stop offset="75%" stopColor="#cc2366" />
                    <stop offset="100%" stopColor="#bc1888" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="24" height="24" rx="6.5" ry="6.5" fill="url(#ig-fill-foot)" />
                <rect x="5.2" y="5.2" width="13.6" height="13.6" rx="3.8" ry="3.8" fill="none" stroke="#FFFFFF" strokeWidth="1.6" />
                <circle cx="12" cy="12" r="3.3" fill="none" stroke="#FFFFFF" strokeWidth="1.6" />
                <circle cx="16.1" cy="7.9" r="0.9" fill="#FFFFFF" />
              </svg>
            </a>
          )}

          {/* YouTube */}
          {ytUrl && (
            <a href={ytUrl}
              target="_blank" rel="noopener noreferrer" title="YouTube"
              style={{ width:'38px', height:'38px', borderRadius:'12px',
                background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center',
                justifyContent:'center', transition:'transform .2s, background .2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.background='rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.background='rgba(255,255,255,0.08)'; }}>
              <svg width="24" height="17" viewBox="0 0 24 17" fill="none">
                <path fill="#FF0000" d="M23.498 2.686A3.016 3.016 0 0 0 21.376.55C19.505.045 12 .045 12 .045s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 2.686C0 4.57 0 8.5 0 8.5s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 12.43 24 8.5 24 8.5s0-3.93-.502-5.814z"/>
                <path fill="#FFFFFF" d="M9.545 12.068V4.932L15.818 8.5l-6.273 3.568z"/>
              </svg>
            </a>
          )}

          {/* WhatsApp */}
          {waNum && (
            <a href={`https://wa.me/${waNum.replace(/\D/g, '')}`}
              target="_blank" rel="noopener noreferrer" title="WhatsApp"
              style={{ width:'38px', height:'38px', borderRadius:'12px',
                background:'rgba(255,255,255,0.08)', display:'flex', alignItems:'center',
                justifyContent:'center', transition:'transform .2s, background .2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.background='rgba(255,255,255,0.18)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.background='rgba(255,255,255,0.08)'; }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path fill="#25D366" d="M12.004 0a12 12 0 0 0-10.4 18L0 24l6.154-1.615A12 12 0 1 0 12.004 0z"/>
                <path fill="#FFFFFF" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a8.6 8.6 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.57-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
            </a>
          )}
        </div>

        {/* Contact details */}
        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap', justifyContent:'center', alignItems: 'center' }}>
          {email && (
            <a href={`mailto:${email}`}
              style={{ fontSize:'12px', color:'rgba(255,255,255,.85)', textDecoration:'none' }}>
              {email}
            </a>
          )}
          {email && phone && <span style={{ color:'rgba(255,255,255,.3)', fontSize:'11px', lineHeight:1 }}>|</span>}
          {phone && (
            <a href={`tel:+91${phone.replace(/\D/g, '')}`}
              style={{ fontSize:'12px', color:'rgba(255,255,255,.85)', textDecoration:'none' }}>
              +91 {phone}
            </a>
          )}
        </div>

        <p style={{ fontSize:'11px', color:'rgba(255,255,255,.4)' }}>
          {copyright}
        </p>
      </div>
    </footer>
  );
}
