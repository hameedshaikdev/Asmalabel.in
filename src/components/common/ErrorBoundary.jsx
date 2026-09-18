import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });

    const isChunkError =
      error?.message?.includes('Failed to fetch dynamically imported module') ||
      error?.message?.includes('Importing a module script failed') ||
      error?.message?.includes('error loading dynamically imported module') ||
      error?.name === 'ChunkLoadError';

    if (isChunkError) {
      const lastReload = sessionStorage.getItem('last_chunk_reload');
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem('last_chunk_reload', String(now));
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      const isChunkError =
        this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
        this.state.error?.message?.includes('Importing a module script failed') ||
        this.state.error?.message?.includes('error loading dynamically imported module') ||
        this.state.error?.name === 'ChunkLoadError';

      return (
        <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', background:'#F8FAFC' }}>
          <div style={{ background:'white', borderRadius:'24px', padding:'32px', maxWidth:'640px', width:'100%', boxShadow:'0 20px 48px rgba(15,23,42,0.12)', border:'1px solid #E2E8F0', textAlign:'center' }}>
            <AlertTriangle size={56} color="#EF4444" style={{ margin:'0 auto 16px' }} />
            <h1 style={{ fontSize:'24px', fontWeight:900, color:'#0F172A', marginBottom:'8px' }}>
              {isChunkError ? 'New Version Available' : 'Something went wrong'}
            </h1>
            <p style={{ color:'#64748B', fontSize:'14px', marginBottom:'20px' }}>
              {isChunkError
                ? 'A new version of the website has just been published. Please reload to update.'
                : 'An unexpected application error occurred.'}
            </p>

            {this.state.error && !isChunkError && (
              <div style={{ textAlign:'left', background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'12px', padding:'14px', marginBottom:'20px', overflowX:'auto' }}>
                <p style={{ fontSize:'13px', fontWeight:800, color:'#991B1B', marginBottom:'4px' }}>
                  Error: {this.state.error.toString()}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <pre style={{ fontSize:'11px', color:'#7F1D1D', whiteSpace:'pre-wrap', margin:0, fontFamily:'monospace' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'12px 28px', borderRadius:'9999px', background:'linear-gradient(135deg,#1A1A2E,#0F3460)', color:'white', fontWeight:800, border:'none', cursor:'pointer', boxShadow:'0 6px 20px rgba(26,26,46,0.3)' }}
            >
              <RefreshCw size={18} />
              {isChunkError ? 'Update & Refresh' : 'Reload Page'}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;