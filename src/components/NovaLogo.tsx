import { useId } from 'react';

interface NovaLogoProps {
  variant?: 'full' | 'icon' | 'emblem';
  size?: number;
}

export function NovaLogo({ variant = 'full', size = 40 }: NovaLogoProps) {
  const uid = useId().replace(/:/g, '');
  const ringId = `ncRing-${uid}`;
  const diamondId = `ncDiamond-${uid}`;
  const crownId = `ncCrown-${uid}`;
  const boltId = `ncBolt-${uid}`;

  return (
    <div className={`nc-logo is-${variant}`} aria-label="Nova Coins · Recargas y Servicios Digitales">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="nc-logo-mark"
      >
        <defs>
          <linearGradient id={ringId} x1="6" y1="6" x2="58" y2="58" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D946EF" />
            <stop offset="50%" stopColor="#7C1FFF" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
          <linearGradient id={diamondId} x1="18" y1="22" x2="46" y2="50" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C084FC" />
            <stop offset="50%" stopColor="#7C1FFF" />
            <stop offset="100%" stopColor="#3B0764" />
          </linearGradient>
          <linearGradient id={crownId} x1="20" y1="10" x2="44" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="55%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </linearGradient>
          <linearGradient id={boltId} x1="36" y1="18" x2="28" y2="46" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#F5D0FE" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="28" fill="#070112" stroke={`url(#${ringId})`} strokeWidth="2.4" />
        <ellipse
          cx="32"
          cy="34"
          rx="22"
          ry="7"
          transform="rotate(-14 32 34)"
          stroke="#A855F7"
          strokeWidth="1.5"
          strokeOpacity="0.72"
        />
        <polygon
          points="21,25 43,25 49,33 32,51 15,33"
          fill={`url(#${diamondId})`}
          stroke="#E879F9"
          strokeWidth="1.2"
        />
        <polygon points="21,25 32,25 32,51 15,33" fill="#6D28D9" fillOpacity="0.45" />
        <polygon points="24,25 32,33 40,25" fill="#C084FC" fillOpacity="0.55" />
        <path
          d="M21 24L18 14L26 19L32 11L38 19L46 14L43 24H21Z"
          fill={`url(#${crownId})`}
          stroke="#E2E8F0"
          strokeWidth="0.9"
        />
        <circle cx="18" cy="13.5" r="1.5" fill="#FFFFFF" />
        <circle cx="32" cy="10.5" r="1.8" fill="#FFFFFF" />
        <circle cx="46" cy="13.5" r="1.5" fill="#FFFFFF" />
        <polygon points="32,17 30,20 32,22 34,20" fill="#9333EA" />
        <polygon points="40,18 33,31 38,31 29,46 34,34 29,34" fill={`url(#${boltId})`} />
        <path
          d="M13 18L14.3 21.2L17.5 22.5L14.3 23.8L13 27L11.7 23.8L8.5 22.5L11.7 21.2L13 18Z"
          fill="#F0ABFC"
        />
        <path
          d="M51 39L52 41.2L54.2 42.2L52 43.2L51 45.4L50 43.2L47.8 42.2L50 41.2L51 39Z"
          fill="#F0ABFC"
        />
      </svg>

      {variant === 'full' && (
        <div className="nc-logo-text">
          <div className="nc-logo-wordmark">
            <span className="nc-logo-nova">NOVA</span>
            <span className="nc-logo-coins">COINS</span>
          </div>
          <span className="nc-logo-sub">RECARGAS DIGITALES</span>
        </div>
      )}
    </div>
  );
}
