'use client';

/**
 * Placeholder image for listings without photos.
 * Recreates the "Reserva Verificada / Aguardando Imagem do Vendedor" design.
 */
export function ListingPlaceholder({ className }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: 'linear-gradient(135deg, #1a1040 0%, #2d1b69 40%, #1e1350 70%, #150d38 100%)',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
      }}
    >
      {/* Sparkle particles */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.06) 0%, transparent 50%), ' +
            'radial-gradient(circle at 75% 20%, rgba(255,255,255,0.04) 0%, transparent 40%), ' +
            'radial-gradient(circle at 50% 80%, rgba(255,255,255,0.03) 0%, transparent 50%), ' +
            'radial-gradient(circle at 85% 70%, rgba(255,255,255,0.05) 0%, transparent 35%)',
          pointerEvents: 'none',
        }}
      />

      {/* Calendar + Shield Icon */}
      <svg
        width="56"
        height="56"
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginBottom: '8px' }}
      >
        {/* Calendar outline */}
        <rect
          x="10"
          y="14"
          width="44"
          height="40"
          rx="4"
          stroke="#C9A96E"
          strokeWidth="2"
          fill="none"
        />
        {/* Calendar top tabs */}
        <line x1="22" y1="8" x2="22" y2="18" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round" />
        <line x1="42" y1="8" x2="42" y2="18" stroke="#C9A96E" strokeWidth="2" strokeLinecap="round" />
        {/* Calendar top bar */}
        <line x1="10" y1="24" x2="54" y2="24" stroke="#C9A96E" strokeWidth="1.5" />
        {/* Shield inside calendar */}
        <path
          d="M32 30 C32 30 22 33 22 38 C22 43 27 48 32 50 C37 48 42 43 42 38 C42 33 32 30 32 30Z"
          stroke="#C9A96E"
          strokeWidth="1.8"
          fill="none"
        />
        {/* Checkmark inside shield */}
        <path
          d="M27.5 39 L30.5 42 L36.5 36"
          stroke="#C9A96E"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* Text */}
      <span
        style={{
          color: '#C9A96E',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        Reserva Verificada
      </span>
      <span
        style={{
          color: '#C9A96E',
          fontSize: '9px',
          fontWeight: 400,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          opacity: 0.7,
          textAlign: 'center',
        }}
      >
        Aguardando imagem do vendedor
      </span>
    </div>
  );
}
