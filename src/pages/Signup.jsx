import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Phone, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react';
import { supabase } from '../config/supabase';
import SEO from '../components/common/SEO';

export default function Signup() {
  const navigate = useNavigate();

  const [form,       setForm]       = useState({ name:'', phone:'', password:'' });
  const [showPwd,    setShowPwd]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [googleLoad, setGoogleLoad] = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // ── Google Sign Up ────────────────────────────────────────────────────────
  const onGoogle = async () => {
    setGoogleLoad(true); setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
      setGoogleLoad(false);
    }
  };

  // ── Phone + Name signup (email auto-generated from phone) ────────────────
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const phone = form.phone.replace(/\D/g, '');
    if (phone.length !== 10) { setError('Enter a valid 10-digit mobile number'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (form.name.trim().length < 2) { setError('Please enter your name'); return; }

    // Generate a simple email from phone number
    const email = `${phone}@ashub.user`;

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: form.password,
        options: {
          data: {
            full_name: form.name.trim(),
            phone:     `+91${phone}`,
            signup_method: 'phone',
          },
        },
      });
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err.message.includes('already registered')) {
        setError('This mobile number is already registered. Please login instead.');
      } else {
        setError(err.message);
      }
    } finally { setLoading(false); }
  };

  // ── Success Screen ────────────────────────────────────────────────────────
  if (success) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'24px' }}>
        <div style={{ textAlign:'center', maxWidth:'380px' }}>
          <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:'#F0FDF4', border:'3px solid #16A34A', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
            <CheckCircle size={40} color="#16A34A" />
          </div>
          <h2 style={{ fontSize:'24px', fontWeight:900, color:'var(--text)', marginBottom:'8px' }}>Account Created! 🎉</h2>
          <p style={{ color:'var(--text-2)', fontSize:'14px', lineHeight:1.7, marginBottom:'8px' }}>
            Welcome to Asmalabel, <strong>{form.name}</strong>!<br/>
            Taking you to login...
          </p>
          <div style={{ width:'40px', height:'4px', background:'var(--primary-grad)', borderRadius:'99px', margin:'20px auto 0', animation:'grow 2.5s linear forwards' }} />
          <style>{`@keyframes grow { from { width:0 } to { width:100% } }`}</style>
        </div>
      </div>
    );
  }

  // ── Main Signup Screen ────────────────────────────────────────────────────
  return (
    <div style={{ flex:'1 0 auto', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'40px 20px', width:'100%', boxSizing:'border-box' }}>
      <SEO title="Create Account | Asmalabel" robots="noindex, nofollow" canonical="https://asmalabel.in/signup" />
      <div style={{ width:'100%', maxWidth:'420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '16px', border: '1px solid #E2E8F0', background: '#FFFFFF', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(15,23,42,0.06)', marginBottom: '8px' }}>
              <img src="/logo.png" alt="Asmalabel" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <h1 style={{
              fontFamily: '"Playfair Display", "Cinzel", "Cormorant Garamond", Georgia, serif',
              fontSize: '34px',
              fontWeight: 900,
              color: '#0F172A',
              margin: 0,
              letterSpacing: '-0.8px',
              lineHeight: 1.1
            }}>
              Asmalabel
            </h1>
          </Link>
          <p style={{ color: '#475569', fontSize: '12px', fontWeight: 700, letterSpacing: '0.3px', textTransform: 'uppercase', margin: 0 }}>
            Boutique Tailoring &amp; Fashion
          </p>
        </div>

        <div style={{ background:'white', borderRadius:'28px', padding:'28px', boxShadow:'var(--shadow-lg)', border:'1px solid var(--border)' }}>
          <h1 style={{ fontSize:'22px', fontWeight:900, color:'var(--text)', marginBottom:'4px', textAlign:'center' }}>Create Account ✨</h1>
          <p style={{ color:'var(--text-2)', fontSize:'13px', marginBottom:'24px', textAlign:'center' }}>
            Join thousands of happy customers!
          </p>

          {error && (
            <div style={{ background:'rgba(239,68,68,.07)', border:'1px solid rgba(239,68,68,.2)', borderRadius:'12px', padding:'10px 14px', fontSize:'13px', fontWeight:600, color:'#DC2626', marginBottom:'16px' }}>
              {error}
            </div>
          )}

          {/* Google Sign Up — Most Prominent */}
          <button onClick={onGoogle} disabled={googleLoad}
            style={{ width:'100%', padding:'14px', borderRadius:'14px', background:'white', border:'2px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', cursor:'pointer', fontSize:'15px', fontWeight:800, color:'var(--text)', boxShadow:'var(--shadow-sm)', marginBottom:'8px', transition:'all .2s', opacity:googleLoad?.7:1 }}
            onMouseEnter={e => { e.currentTarget.style.borderColor='#4285F4'; e.currentTarget.style.boxShadow='0 4px 20px rgba(66,133,244,.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor='#E2E8F0'; e.currentTarget.style.boxShadow='var(--shadow-sm)'; }}>
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            {googleLoad ? 'Opening Google...' : 'Sign up with Google (Easiest!)'}
          </button>
          <p style={{ textAlign:'center', fontSize:'11px', color:'var(--text-3)', marginBottom:'16px' }}>
            ✅ One tap with your Gmail — no password needed!
          </p>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'16px' }}>
            <div style={{ flex:1, height:'1px', background:'#E2E8F0' }} />
            <span style={{ fontSize:'12px', color:'var(--text-3)', fontWeight:600 }}>or use mobile number</span>
            <div style={{ flex:1, height:'1px', background:'#E2E8F0' }} />
          </div>

          {/* Simple Form — Name + Phone + Password only */}
          <form onSubmit={onSubmit} style={{ display:'flex', flexDirection:'column', gap:'14px' }}>

            {/* Name */}
            <div>
              <label style={{ display:'block', fontSize:'13px', fontWeight:700, color:'var(--text)', marginBottom:'7px' }}>
                Your Name
              </label>
              <div style={{ position:'relative' }}>
                <User size={16} color="var(--text-3)" style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)' }} />
                <input name="name" value={form.name} onChange={onChange} required
                  placeholder="e.g. Ramesh Kumar"
                  style={{ width:'100%', padding:'12px 14px 12px 42px', borderRadius:'14px', border:'1.5px solid #e5e7eb', fontSize:'14px', fontFamily:'inherit', outline:'none' }}
                  onFocus={e => e.target.style.borderColor='var(--primary)'}
                  onBlur={e => e.target.style.borderColor='#e5e7eb'} />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label style={{ display:'block', fontSize:'13px', fontWeight:700, color:'var(--text)', marginBottom:'7px' }}>
                Mobile Number
              </label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', fontSize:'13px', fontWeight:800, color:'#64748B', zIndex:1 }}>+91</span>
                <input name="phone" type="tel" value={form.phone} onChange={onChange} required
                  placeholder="9876543210" maxLength={10}
                  style={{ width:'100%', padding:'12px 14px 12px 46px', borderRadius:'14px', border:'1.5px solid #e5e7eb', fontSize:'14px', fontFamily:'inherit', outline:'none' }}
                  onFocus={e => e.target.style.borderColor='var(--primary)'}
                  onBlur={e => e.target.style.borderColor='#e5e7eb'} />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display:'block', fontSize:'13px', fontWeight:700, color:'var(--text)', marginBottom:'7px' }}>
                Password <span style={{ fontWeight:500, color:'var(--text-3)' }}>(min 6 characters)</span>
              </label>
              <div style={{ position:'relative' }}>
                <Lock size={16} color="var(--text-3)" style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)' }} />
                <input name="password" type={showPwd?'text':'password'} value={form.password} onChange={onChange} required
                  placeholder="Create a password"
                  style={{ width:'100%', padding:'12px 44px 12px 42px', borderRadius:'14px', border:'1.5px solid #e5e7eb', fontSize:'14px', fontFamily:'inherit', outline:'none' }}
                  onFocus={e => e.target.style.borderColor='var(--primary)'}
                  onBlur={e => e.target.style.borderColor='#e5e7eb'} />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position:'absolute', right:'14px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', padding:0, margin:0 }}>
                  {showPwd ? <EyeOff size={16} color="var(--text-3)"/> : <Eye size={16} color="var(--text-3)"/>}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="sh-btn"
              style={{ width:'100%', justifyContent:'center', padding:'13px', opacity:loading?.6:1 }}>
              {loading ? 'Creating Account…' : <><span>Create Account</span><ArrowRight size={16}/></>}
            </button>
          </form>

          {/* Benefits */}
          <div style={{ marginTop:'16px', background:'#F8FAFC', borderRadius:'14px', padding:'12px' }}>
            {['Free account — no charges ever', 'Track your orders easily', 'Save your address for faster checkout'].map(b => (
              <div key={b} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'5px 0', fontSize:'12px', color:'var(--text-2)', fontWeight:600 }}>
                <span style={{ color:'#16A34A' }}>✓</span> {b}
              </div>
            ))}
          </div>

          <p style={{ textAlign:'center', marginTop:'16px', fontSize:'13px', color:'var(--text-2)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--primary)', fontWeight:800, textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
