import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'EventSwap';
  const description = searchParams.get('description') || 'Marketplace de Reservas de Eventos';
  const type = searchParams.get('type') || 'default';

  return new ImageResponse(
    (
      <div style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0A0A0F',
        backgroundImage: 'linear-gradient(135deg, rgba(108, 60, 225, 0.3) 0%, rgba(14, 165, 233, 0.1) 50%, rgba(16, 185, 129, 0.1) 100%)',
      }}>
        {/* EventSwap logo text */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 40 }}>
          <span style={{ fontSize: 48, fontWeight: 800, color: '#6C3CE1' }}>Event</span>
          <span style={{ fontSize: 48, fontWeight: 800, color: '#FFFFFF' }}>Swap</span>
        </div>
        {/* Title */}
        <div style={{
          fontSize: type === 'listing' ? 36 : 44,
          fontWeight: 700,
          color: '#FFFFFF',
          textAlign: 'center',
          maxWidth: 900,
          padding: '0 40px',
          lineHeight: 1.2,
        }}>
          {title}
        </div>
        {/* Description */}
        <div style={{
          fontSize: 20,
          color: '#A1A1AA',
          textAlign: 'center',
          maxWidth: 700,
          marginTop: 16,
          padding: '0 40px',
        }}>
          {description}
        </div>
        {/* Bottom bar */}
        <div style={{
          position: 'absolute',
          bottom: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{ fontSize: 16, color: '#71717A' }}>eventswap.com</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
