import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error,  setError] = useState('');

  useEffect(() => {
    console.log('=== AuthCallback mounted ===');
    console.log('Full URL:', window.location.href);
    console.log('Search params:', window.location.search);
    console.log('Hash:', window.location.hash);

    // Error comes back in HASH from Supabase, code comes in search params
    const searchParams   = new URLSearchParams(window.location.search);
    const hashParams     = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const targetRedirect = searchParams.get('redirect') || '/';

    const code      = searchParams.get('code');
    const errorCode = searchParams.get('error')        || hashParams.get('error');
    const errorDesc = searchParams.get('error_description') || hashParams.get('error_description');

    console.log('code:', code ? code.substring(0, 20) + '...' : 'NONE');
    console.log('error:', errorCode);
    console.log('error_description:', errorDesc);

    // If there's an error in the URL, show it immediately — don't spin forever
    if (errorCode) {
      let msg = 'Google sign-in failed. Please try again.';
      if (errorDesc?.includes('Unable to exchange external code')) {
        msg = 'Google sign-in configuration error. Please contact support.';
      }
      setError(msg);
      setTimeout(() => navigate(`/login?redirect=${encodeURIComponent(targetRedirect)}`, { replace: true }), 3000);
      return;
    }

    let redirected = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('=== Auth event:', event, '| session:', session ? 'YES' : 'NO');
        if (redirected) return;

        if (event === 'SIGNED_IN' && session) {
          redirected = true;
          navigate(targetRedirect, { replace: true });
          return;
        }

        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          redirected = true;
          setError('Login was cancelled or failed. Please try again.');
          setTimeout(() => navigate(`/login?redirect=${encodeURIComponent(targetRedirect)}`, { replace: true }), 2500);
        }
      }
    );

    // Also check if the session is already available
    // (SDK may have already exchanged the code synchronously)
    supabase.auth.getSession().then(({ data: { session }, error: err }) => {
      console.log('=== getSession result:', session ? 'HAS SESSION' : 'NO SESSION', '| error:', err?.message);
      if (redirected) return;
      if (err) {
        redirected = true;
        setError(err.message);
        setTimeout(() => navigate(`/login?redirect=${encodeURIComponent(targetRedirect)}`, { replace: true }), 2500);
        return;
      }
      if (session) {
        redirected = true;
        navigate(targetRedirect, { replace: true });
      }
    });

    // Safety timeout — if nothing fires after 10 seconds, something is wrong
    const timeout = setTimeout(() => {
      if (!redirected) {
        redirected = true;
        setError('Login timed out. Please try again.');
        navigate('/login', { replace: true });
      }
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#F8FAFC', gap:'16px' }}>
      <div style={{ fontSize:'32px', fontWeight:900, fontFamily: '"Playfair Display", "Cinzel", Georgia, serif', color: '#0F172A' }}>
        Asmalabel
      </div>

      {error ? (
        <div style={{ textAlign:'center', padding:'0 24px' }}>
          <div style={{ fontSize:'40px', marginBottom:'12px' }}>❌</div>
          <p style={{ color:'#EF4444', fontWeight:700, marginBottom:'8px' }}>{error}</p>
          <p style={{ color:'#94A3B8', fontSize:'14px' }}>Redirecting to login...</p>
        </div>
      ) : (
        <>
          <div style={{ width:'40px', height:'40px', border:'3px solid #E2E8F0', borderTop:'3px solid #FC8019', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
          <p style={{ color:'#64748B', fontSize:'14px', fontWeight:600 }}>Signing you in with Google...</p>
        </>
      )}

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
