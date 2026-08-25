import React from 'react';
import { Tv, Play, ExternalLink } from 'lucide-react';
import { parseProductTags } from '../../utils/productImages';

function getYouTubeId(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') return null;
  const trimmed = urlStr.trim();
  const regExp = /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regExp);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

function VideoItem({ video, index }) {
  const vUrl = typeof video === 'string' ? video : (video.url || video.link || '');
  const vTitle = typeof video === 'object' && video.title ? video.title : `Product Demo ${index + 1}`;
  const ytId = getYouTubeId(vUrl);
  const isDirectVideo = /\.(mp4|webm|ogg|mov)($|\?)/i.test(vUrl);

  return (
    <div style={{ width: '100%', boxSizing: 'border-box' }}>
      {/* Title row with YouTube link */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        gap: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          overflow: 'hidden'
        }}>
          <span style={{
            width: '18px',
            height: '18px',
            borderRadius: '4px',
            background: '#FEE2E2',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Play size={9} color="#DC2626" fill="#DC2626" />
          </span>
          <span style={{
            fontSize: '12.5px',
            fontWeight: 700,
            color: '#1E293B',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {vTitle}
          </span>
        </div>

        {ytId && (
          <a
            href={`https://www.youtube.com/watch?v=${ytId}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in YouTube"
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#64748B',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0
            }}
          >
            <span>YouTube</span>
            <ExternalLink size={11} />
          </a>
        )}
      </div>

      {/* ── Responsive 16:9 iframe container ── */}
      <div
        className="pd-video-player-frame"
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          background: '#0F172A'
        }}
      >
        {ytId ? (
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?enablejsapi=1&origin=${encodeURIComponent(typeof window !== 'undefined' ? window.location.origin : '')}&rel=0&playsinline=1&fs=1&controls=1`}
            title={vTitle || 'Product demonstration video'}
            frameBorder="0"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 0,
              display: 'block',
              pointerEvents: 'auto'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            allowFullScreen
          />
        ) : isDirectVideo ? (
          <video
            src={vUrl}
            controls
            playsInline
            preload="metadata"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              background: '#000'
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: '#F1F5F9',
            padding: '16px',
            textAlign: 'center'
          }}>
            <p style={{ fontSize: '12px', color: '#64748B', margin: 0, fontWeight: 600 }}>External Video</p>
            <a
              href={vUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                background: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '12px',
                textDecoration: 'none'
              }}
            >
              <ExternalLink size={13} /> Watch Video
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductVideoPlayer({ product, compact = false }) {
  if (!product) return null;

  const parsed = parseProductTags(product);
  const rawV = (Array.isArray(product.video_links) && product.video_links.length > 0)
    ? product.video_links
    : (product.videos || parsed.video_links || []);
  let videoList = [];
  try {
    if (Array.isArray(rawV)) videoList = [...rawV];
    else if (typeof rawV === 'string' && rawV.trim()) videoList = JSON.parse(rawV);
  } catch (e) {
    if (typeof rawV === 'string' && rawV.startsWith('http')) videoList = [{ title: 'Product Demo', url: rawV }];
  }

  if (product.video_url && !videoList.some(v => (v.url || v) === product.video_url)) {
    videoList.push({ title: 'Product Overview', url: product.video_url });
  }

  if (videoList.length === 0) return null;

  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderRadius: '12px',
      overflow: 'hidden',
      marginTop: compact ? '10px' : '14px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      {/* Section header — matches Description & Specifications */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 14px',
        background: '#F8FAFC',
        borderBottom: '1px solid #F1F5F9'
      }}>
        <Tv size={16} color="#2563EB" />
        <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A' }}>
          Product Videos &amp; Demos
        </span>
      </div>

      {/* Videos list */}
      <div>
        {videoList.map((v, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <div style={{ height: '1px', background: '#F1F5F9' }} />}
            <VideoItem video={v} index={idx} />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}


