import { motion } from 'framer-motion';

export function BaksoLoginAnimation() {
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full">
      {/* Background Glow */}
      <defs>
        <radialGradient id="bowlGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bowlGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#EA580C" />
        </linearGradient>
        <linearGradient id="soupGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FCD34D" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>

      {/* Glow Background */}
      <circle cx="100" cy="100" r="80" fill="url(#bowlGlow)">
        <animate attributeName="r" values="70;80;70" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.2;0.3;0.2" dur="2s" repeatCount="indefinite" />
      </circle>

      {/* Bowl */}
      <ellipse cx="100" cy="140" rx="70" ry="20" fill="url(#bowlGradient)" />
      <path d="M30 140 C30 140 35 170 100 170 C165 170 170 140 170 140" fill="#EA580C" />

      {/* Soup */}
      <ellipse cx="100" cy="135" rx="60" ry="15" fill="url(#soupGradient)" />

      {/* Steam Animations */}
      <g className="steam">
        <path d="M70 120 Q75 100 70 85" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.6">
          <animate attributeName="d" values="M70 120 Q75 100 70 85;M70 118 Q72 98 68 83;M70 120 Q75 100 70 85" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M100 115 Q105 95 100 80" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.6">
          <animate attributeName="d" values="M100 115 Q105 95 100 80;M100 113 Q102 93 98 78;M100 115 Q105 95 100 80" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2.5s" repeatCount="indefinite" />
        </path>
        <path d="M130 120 Q135 100 130 85" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.6">
          <animate attributeName="d" values="M130 120 Q135 100 130 85;M130 118 Q132 98 128 83;M130 120 Q135 100 130 85" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite" />
        </path>
      </g>

      {/* Meatballs */}
      <circle cx="80" cy="135" r="12" fill="#F97316" />
      <circle cx="120" cy="135" r="12" fill="#F97316" />
      <circle cx="100" cy="140" r="14" fill="#F97316" />

      {/* Noodles */}
      <path d="M60 130 Q80 125 100 130 Q120 135 140 130" stroke="#FCD34D" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M65 138 Q85 133 105 138 Q125 143 145 138" stroke="#FCD34D" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Sparkles */}
      <g>
        <circle cx="150" cy="110" r="3" fill="#FEF3C7">
          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="50" cy="115" r="2" fill="#FEF3C7">
          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
        </circle>
        <circle cx="160" cy="130" r="2.5" fill="#FEF3C7">
          <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" begin="1s" />
        </circle>
      </g>

      {/* Bowl Highlight */}
      <ellipse cx="100" cy="135" rx="60" ry="15" fill="none" stroke="#FDBA74" strokeWidth="2" opacity="0.5" />
    </svg>
  );
}
