import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/BaseComponents';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Bakso SVG Illustration */}
      <div className="w-64 h-64 mb-8">
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Bowl */}
          <ellipse cx="100" cy="150" rx="70" ry="25" fill="#E5E7EB" />
          <path
            d="M30 150C30 150 40 180 100 180C160 180 170 150 170 150"
            fill="#D1D5DB"
          />
          
          {/* Soup */}
          <ellipse cx="100" cy="145" rx="65" ry="20" fill="#FCD34D" />
          
          {/* Bakso Balls */}
          <circle cx="80" cy="140" r="15" fill="#92400E" />
          <circle cx="120" cy="140" r="15" fill="#92400E" />
          <circle cx="100" cy="130" r="15" fill="#92400E" />
          <circle cx="80" cy="140" r="8" fill="#B45309" />
          <circle cx="120" cy="140" r="8" fill="#B45309" />
          <circle cx="100" cy="130" r="8" fill="#B45309" />
          
          {/* Noodles */}
          <path
            d="M50 145C50 145 70 140 100 140C130 140 150 145 150 145"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M55 150C55 150 75 145 100 145C125 145 145 150 145 150"
            stroke="#F59E0B"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          
          {/* Steam */}
          <path
            d="M70 120C70 120 73 110 70 100M100 115C100 115 103 105 100 95M130 120C130 120 133 110 130 100"
            stroke="#9CA3AF"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
          
          {/* Chopsticks */}
          <rect
            x="140"
            y="80"
            width="8"
            height="80"
            fill="#78350F"
            transform="rotate(30 140 80)"
          />
          <rect
            x="150"
            y="80"
            width="8"
            height="80"
            fill="#92400E"
            transform="rotate(30 150 80)"
          />
          
          {/* 404 Text */}
          <text
            x="100"
            y="70"
            textAnchor="middle"
            className="text-4xl font-bold"
            fill="#000"
            style={{ fontSize: '24px', fontWeight: 'bold' }}
          >
            404
          </text>
        </svg>
      </div>

      {/* Error Message */}
      <h1 className="text-3xl font-bold text-text-primary mb-2">
        Ups! Halaman Tidak Ditemukan
      </h1>
      
      <p className="text-text-tertiary text-center mb-8 max-w-md">
        Maaf, halaman yang Anda cari tidak dapat ditemukan. 
        Mungkin URL salah atau halaman sudah dipindahkan.
      </p>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </Button>
        
        <Button
          variant="primary"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <Home className="w-5 h-5" />
          Beranda
        </Button>
      </div>

      {/* Quick Links */}
      <div className="mt-8 p-4 bg-surface rounded-xl">
        <p className="text-sm font-medium text-text-primary mb-3">
          🔍 Cari menu lainnya:
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/menu')}
            className="text-sm text-primary hover:underline"
          >
            🍜 Lihat Menu
          </button>
          <span className="text-text-tertiary">•</span>
          <button
            onClick={() => navigate('/orders')}
            className="text-sm text-primary hover:underline"
          >
            📋 Pesanan Saya
          </button>
          <span className="text-text-tertiary">•</span>
          <button
            onClick={() => navigate('/profile')}
            className="text-sm text-primary hover:underline"
          >
            👤 Profil
          </button>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-xs text-text-tertiary">
        © 2026 Bakso Premium. Dibuat dengan ❤️ untuk pecinta bakso.
      </p>
    </div>
  );
}
