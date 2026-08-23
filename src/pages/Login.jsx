import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase } from '../config/supabase';
import { useApp } from '../context/AppContext';
import SEO from '../components/common/SEO';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, setUser, loading: appLoading } = useApp();
  const redirect = searchParams.get('redirect') || '/';

  // If user is already logged in, redirect immediately without asking to log in again
  useEffect(() => {
    if (!appLoading && user) {
      navigate(redirect, { replace: true });
    }
  }, [user, appLoading, redirect, navigate]);

  const [form,         setForm]         = useState({ email:'', password:'' });
  const [showPwd,      setShowPwd]      = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [googleLoad,   setGoogleLoad]   = useState(false);
  const [error,        setError]        = useState('');
  const [forgotMode,   setForgotMode]   = useState(false);
  const [forgotEmail,  setForgotEmail]  = useState('');
  const [forgotSent,   setForgotSent]   = useState(false);
  const [forgotLoad,   setForgotLoad]   = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // ── Email / Password Login ───────────────────────────────────────────────
  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      if (error) throw error;
      setUser(data.user);
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Invalid email or password. Please check your credentials and try again.'
        : err.message);
    } finally { setLoading(false); }
  };

  // ── Google Sign In ───────────────────────────────────────────────────────
  const onGoogle = async () => {
    setGoogleLoad(true); setError('');
    try {
      const callbackUrl = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
    } catch (err) {
      setError('Google sign-in failed. Please try again.');
      setGoogleLoad(false);
    }
  };

  // ── Forgot Password ──────────────────────────────────────────────────────
  const onForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { setError('Please enter your email address.'); return; }
    setForgotLoad(true); setError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        forgotEmail.trim(),
        { redirectTo: `${window.location.origin}/reset-password` }
      );
      if (error) throw error;
      setForgotSent(true);
    } catch (err) {
      setError(err.message);
    } finally { setForgotLoad(false); }
  };

  // ── Forgot Password Screen ───────────────────────────────────────────────
  if (forgotMode) {
    return (
      <div style={{
        flex: '1 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
        padding: '40px 20px', width: '100%', boxSizing: 'border-box', minHeight: 'calc(100vh - 120px)'
      }}>
        <SEO title="Reset Password | Asmalabel" robots="noindex, nofollow" canonical="https://asmalabel.in/login" />
        <div style={{ width: '100%', maxWidth: '420px' }}>
          
          <button
            onClick={() => { setForgotMode(false); setForgotSent(false); setError(''); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '99px',
              padding: '8px 16px', cursor: 'pointer', color: '#475569',
              fontSize: '13px', fontWeight: 700, marginBottom: '20px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)', transition: 'all .15s ease'
            }}
          >
            ← Back to Sign In
          </button>

          <div style={{
            background: '#FFFFFF', borderRadius: '28px', padding: '36px 28px',
            boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)',
            border: '1.5px solid #E2E8F0', textAlign: 'left'
          }}>
            {forgotSent ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', background: '#DCFCE7',
                  border: '2px solid #86EFAC', display: 'inline-flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '28px', marginBottom: '16px'
                }}>
                  📧
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginBottom: '8px', letterSpacing: '-0.3px' }}>
                  Check Your Inbox
                </h2>
                <p style={{ color: '#64748B', fontSize: '13.5px', lineHeight: 1.6, marginBottom: '20px' }}>
                  We've sent a password reset link to<br />
                  <strong style={{ color: '#0F172A', wordBreak: 'break-all' }}>{forgotEmail}</strong>
                </p>
                <p style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '20px' }}>
                  Didn't see it? Please check your spam folder or request a new link below.
                </p>
                <button
                  onClick={() => setForgotSent(false)}
                  style={{
                    width: '100%', padding: '14px', borderRadius: '14px',
                    background: '#0F172A', color: '#FFFFFF', fontWeight: 800,
                    fontSize: '14px', border: 'none', cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)'
                  }}
                >
                  Resend Reset Email
                </button>
              </div>
            ) : (
              <>
                <div style={{
                  width: '54px', height: '54px', borderRadius: '18px', background: '#F1F5F9',
                  border: '1px solid #CBD5E1', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: '24px', marginBottom: '16px'
                }}>
                  🔑
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginBottom: '6px', letterSpacing: '-0.3px' }}>
                  Forgot Password?
                </h2>
                <p style={{ color: '#64748B', fontSize: '13.5px', marginBottom: '22px', lineHeight: 1.5 }}>
                  Enter your registered email address and we'll send you an instant password reset link.
                </p>

                {error && (
                  <div style={{
                    background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px',
                    padding: '10px 14px', fontSize: '13px', fontWeight: 700, color: '#DC2626', marginBottom: '16px'
                  }}>
                    {error}
                  </div>
                )}

                <form onSubmit={onForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '7px' }}>
                      Email Address
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={e => { setForgotEmail(e.target.value); setError(''); }}
                        placeholder="e.g. name@domain.com"
                        required
                        style={{
                          width: '100%', padding: '13px 14px 13px 42px', borderRadius: '14px',
                          border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none',
                          boxSizing: 'border-box', background: '#FFFFFF', color: '#0F172A'
                        }}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoad}
                    style={{
                      padding: '14px', borderRadius: '14px', background: '#0F172A', color: '#FFFFFF',
                      fontWeight: 800, fontSize: '14.5px', border: 'none', cursor: 'pointer',
                      opacity: forgotLoad ? 0.7 : 1, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.15)',
                      transition: 'all .15s ease'
                    }}
                  >
                    {forgotLoad ? 'Sending...' : 'Send Reset Link →'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main Luxury Login Screen ─────────────────────────────────────────────
  return (
    <div style={{
      flex: '1 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 100%)',
      padding: '40px 20px', width: '100%', boxSizing: 'border-box', minHeight: 'calc(100vh - 120px)',
      position: 'relative', overflow: 'hidden'
    }}>
      <SEO title="Sign In | Asmalabel" robots="noindex, nofollow" canonical="https://asmalabel.in/login" />

      {/* Decorative ambient background glow */}
      <div style={{
        position: 'absolute', width: '380px', height: '380px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(96, 165, 250, 0.12) 0%, rgba(192, 132, 252, 0.08) 50%, transparent 80%)',
        top: '10%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'none'
      }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* ── Main Professional Login Panel ── */}
        <div style={{
          background: '#FFFFFF',
          borderRadius: '28px',
          padding: '36px 28px 32px',
          boxShadow: '0 20px 45px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)',
          border: '1.5px solid #E2E8F0'
        }}>
          {/* Brand Header inside Login Panel */}
          <div style={{ textAlign: 'center', marginBottom: '22px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '1.5px solid #E2E8F0', background: '#F5EBE0', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(15,23,42,0.06)', marginBottom: '10px' }}>
                <img src="/logo.png" alt="Asmalabel" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%', background: '#F5EBE0' }} />
              </div>
              <h1 style={{
                fontFamily: '"Playfair Display", "Cinzel", "Cormorant Garamond", Georgia, serif',
                fontSize: '32px',
                fontWeight: 900,
                color: '#0F172A',
                margin: 0,
                letterSpacing: '-0.8px',
                lineHeight: 1.1
              }}>
                Asmalabel
              </h1>
            </Link>
            <p style={{
              color: '#475569',
              fontSize: '11.5px',
              fontWeight: 750,
              letterSpacing: '0.4px',
              textTransform: 'uppercase',
              margin: '4px 0 0'
            }}>
              Boutique Tailoring &amp; Fashion
            </p>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#0F172A', marginBottom: '4px', textAlign: 'center', letterSpacing: '-0.3px' }}>
            Welcome Back 👋
          </h2>
          <p style={{ color: '#64748B', fontSize: '13px', marginBottom: '24px', textAlign: 'center', fontWeight: 500 }}>
            Sign in to access your orders, wishlist &amp; profile
          </p>

          {error && (
            <div style={{
              background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '14px',
              padding: '11px 14px', fontSize: '13px', fontWeight: 700, color: '#DC2626',
              marginBottom: '18px', textAlign: 'left', lineHeight: 1.5
            }}>
              {error}
            </div>
          )}

          {/* ── Google Sign In Button ── */}
          <button
            onClick={onGoogle}
            disabled={googleLoad}
            style={{
              width: '100%', padding: '13px 16px', borderRadius: '14px',
              background: '#FFFFFF', border: '1.5px solid #CBD5E1',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              cursor: 'pointer', fontSize: '14px', fontWeight: 800, color: '#0F172A',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)', marginBottom: '20px',
              opacity: googleLoad ? 0.7 : 1, transition: 'all .15s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#0F172A'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#CBD5E1'}
          >
            {/* Official Google Multicolor G Logo */}
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>{googleLoad ? 'Opening Google...' : 'Continue with Google'}</span>
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
            <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              or sign in with email
            </span>
            <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }} />
          </div>

          {/* Email Login Form */}
          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 800, color: '#334155', marginBottom: '7px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  placeholder="you@example.com"
                  style={{
                    width: '100%', padding: '13px 14px 13px 42px', borderRadius: '14px',
                    border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box', background: '#FFFFFF', color: '#0F172A',
                    transition: 'all .15s ease'
                  }}
                  onFocus={e => e.target.style.borderColor = '#0F172A'}
                  onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 800, color: '#334155' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotMode(true)}
                  style={{
                    fontSize: '12px', fontWeight: 800, color: '#0F172A',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    textDecoration: 'underline'
                  }}
                >
                  Forgot password?
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={onChange}
                  required
                  placeholder="••••••••"
                  style={{
                    width: '100%', padding: '13px 44px 13px 42px', borderRadius: '14px',
                    border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box', background: '#FFFFFF', color: '#0F172A',
                    transition: 'all .15s ease'
                  }}
                  onFocus={e => e.target.style.borderColor = '#0F172A'}
                  onBlur={e => e.target.style.borderColor = '#CBD5E1'}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{
                    position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', padding: 0, margin: 0
                  }}
                  title={showPwd ? 'Hide Password' : 'Show Password'}
                >
                  {showPwd ? <EyeOff size={16} color="#64748B" /> : <Eye size={16} color="#64748B" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '14px', borderRadius: '14px',
                background: '#0F172A', color: '#FFFFFF', fontWeight: 900,
                fontSize: '15px', border: 'none', cursor: 'pointer',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: loading ? 0.7 : 1, boxShadow: '0 4px 14px rgba(15, 23, 42, 0.18)',
                transition: 'all .15s ease'
              }}
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* New Customer Callout */}
          <div style={{
            marginTop: '22px', paddingTop: '18px', borderTop: '1px solid #F1F5F9',
            textAlign: 'center', fontSize: '13px', color: '#64748B'
          }}>
            New customer?{' '}
            <Link to="/signup" style={{ color: '#0F172A', fontWeight: 900, textDecoration: 'none' }}>
              Create an account →
            </Link>
          </div>

        </div>

        {/* Security Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
          marginTop: '20px', color: '#94A3B8', fontSize: '11.5px', fontWeight: 600
        }}>
          <ShieldCheck size={14} color="#64748B" />
          <span>256-bit SSL Encrypted &amp; Secure Authentication</span>
        </div>

      </div>
    </div>
  );
}
