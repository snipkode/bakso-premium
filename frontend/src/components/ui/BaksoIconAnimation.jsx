import { motion } from 'framer-motion';

export function BaksoIconAnimation({ className = "w-8 h-8" }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      {/* Bowl */}
      <ellipse cx="50" cy="70" rx="35" ry="12" fill="#F97316" />
      <path d="M15 70 C15 70 20 90 50 90 C80 90 85 70 85 70" fill="#EA580C" />
      
      {/* Soup */}
      <ellipse cx="50" cy="65" rx="30" ry="10" fill="#FCD34D" />
      
      {/* Steam - Animated */}
      <g>
        <path d="M35 55 Q38 45 35 40" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.6">
          <animate attributeName="d" values="M35 55 Q38 45 35 40;M35 53 Q32 43 35 38;M35 55 Q38 45 35 40" dur="2s" repeatCount="indefinite" />
        </path>
        <path d="M50 55 Q53 45 50 40" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.6">
          <animate attributeName="d" values="M50 55 Q53 45 50 40;M50 53 Q47 43 50 38;M50 55 Q53 45 50 40" dur="2.5s" repeatCount="indefinite" />
        </path>
        <path d="M65 55 Q68 45 65 40" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.6">
          <animate attributeName="d" values="M65 55 Q68 45 65 40;M65 53 Q62 43 65 38;M65 55 Q68 45 65 40" dur="2s" repeatCount="indefinite" />
        </path>
      </g>
      
      {/* Meatballs */}
      <circle cx="40" cy="62" r="6" fill="#F97316" />
      <circle cx="60" cy="62" r="6" fill="#F97316" />
      <circle cx="50" cy="68" r="5" fill="#F97316" />
      
      {/* Noodles */}
      <path d="M25 65 Q35 60 50 60 Q65 60 75 65" stroke="#F59E0B" strokeWidth="3" fill="none" />
      <path d="M30 68 Q40 63 50 63 Q60 63 70 68" stroke="#F59E0B" strokeWidth="2" fill="none" />
      
      {/* Sparkles - Animated */}
      <circle cx="75" cy="50" r="3" fill="#FEF3C7">
        <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="25" cy="55" r="2" fill="#FEF3C7">
        <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" begin="0.5s" />
      </circle>
    </svg>
  );
}
