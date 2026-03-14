import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export function BaksoLoadingAnimation({ size = 'md', text = 'Menyiapkan menu lezat...' }) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [dots, setDots] = useState('');

  // 2 second delay before showing animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowAnimation(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const sizes = {
    sm: { container: 150, text: 'text-sm' },
    md: { container: 200, text: 'text-base' },
    lg: { container: 250, text: 'text-lg' },
  };

  const { container, text: textSize } = sizes[size];

  if (!showAnimation) {
    return (
      <div className="flex flex-col items-center justify-center p-8 min-h-[300px]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
        <p className={`mt-4 text-gray-500 dark:text-gray-400 font-medium ${textSize}`}>
          Memuat{dots}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8">
      {/* Animated SVG - Happy Bakso Seller Character */}
      <div className="relative" style={{ width: container, height: container }}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            {/* Gradients */}
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FED7AA"/>
              <stop offset="100%" stopColor="#FDBA74"/>
            </linearGradient>
            <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B35"/>
              <stop offset="100%" stopColor="#EA580C"/>
            </linearGradient>
            <linearGradient id="bowlGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D"/>
              <stop offset="100%" stopColor="#F59E0B"/>
            </linearGradient>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFEDD5"/>
              <stop offset="100%" stopColor="#FED7AA"/>
            </linearGradient>
            <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFA94D" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#FF6B35" stopOpacity="0"/>
            </radialGradient>
          </defs>

          {/* Background Glow */}
          <circle cx="100" cy="100" r="90" fill="url(#glowGrad)">
            <animate attributeName="r" values="85;95;85" dur="2s" repeatCount="indefinite"/>
          </circle>

          {/* Background Circle */}
          <circle cx="100" cy="100" r="85" fill="url(#bgGrad)" opacity="0.5"/>
          
          {/* Rotating Dashed Circle */}
          <circle cx="100" cy="100" r="80" fill="none" stroke="#FFA94D" strokeWidth="2" strokeDasharray="8,8" opacity="0.4">
            <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="20s" repeatCount="indefinite"/>
          </circle>

          {/* Ground Shadow */}
          <ellipse cx="100" cy="175" rx="50" ry="10" fill="#000" opacity="0.1">
            <animate attributeName="rx" values="48;52;48" dur="1s" repeatCount="indefinite"/>
          </ellipse>

          {/* Body - Standing */}
          <ellipse cx="100" cy="145" rx="35" ry="30" fill="url(#shirtGrad)">
            <animate attributeName="ry" values="29;31;29" dur="0.8s" repeatCount="indefinite"/>
          </ellipse>

          {/* Legs */}
          <g>
            <rect x="75" y="170" width="10" height="20" rx="5" fill="#1F2937"/>
            <rect x="115" y="170" width="10" height="20" rx="5" fill="#1F2937"/>
            <animateTransform attributeName="transform" type="translate" values="0,0;0,-3;0,0" dur="0.6s" repeatCount="indefinite"/>
          </g>

          {/* Arms Holding Bowl */}
          <path d="M70 135 Q55 145 50 130" stroke="url(#skinGrad)" strokeWidth="7" strokeLinecap="round" fill="none">
            <animate attributeName="d" values="M70 135 Q55 145 50 130;M70 133 Q55 143 50 128;M70 135 Q55 145 50 130" dur="0.8s" repeatCount="indefinite"/>
          </path>
          <path d="M130 135 Q145 145 150 130" stroke="url(#skinGrad)" strokeWidth="7" strokeLinecap="round" fill="none">
            <animate attributeName="d" values="M130 135 Q145 145 150 130;M130 133 Q145 143 150 128;M130 135 Q145 145 150 130" dur="0.8s" repeatCount="indefinite"/>
          </path>

          {/* Head */}
          <circle cx="100" cy="90" r="32" fill="url(#skinGrad)"/>

          {/* Hair */}
          <motion.path
            d="M68 85 Q72 55 100 55 Q128 55 132 85 Q138 75 132 65 Q128 45 100 45 Q72 45 68 65 Q62 75 68 85"
            fill="#1F2937"
            animate={{ d: [
              "M68 85 Q72 55 100 55 Q128 55 132 85 Q138 75 132 65 Q128 45 100 45 Q72 45 68 65 Q62 75 68 85",
              "M68 87 Q72 57 100 57 Q128 57 132 87 Q138 77 132 67 Q128 47 100 47 Q72 47 68 67 Q62 77 68 87",
              "M68 85 Q72 55 100 55 Q128 55 132 85 Q138 75 132 65 Q128 45 100 45 Q72 45 68 65 Q62 75 68 85",
            ]}}
            transition={{ duration: 0.6, repeat: Infinity }}
          />

          {/* Happy Eyes - Closed (Smiling) */}
          <motion.path
            d="M78 88 Q85 82 92 88"
            stroke="#1F2937"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            animate={{ d: [
              "M78 88 Q85 82 92 88",
              "M78 90 Q85 86 92 90",
              "M78 88 Q85 82 92 88",
            ]}}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
          <motion.path
            d="M108 88 Q115 82 122 88"
            stroke="#1F2937"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            animate={{ d: [
              "M108 88 Q115 82 122 88",
              "M108 90 Q115 86 122 90",
              "M108 88 Q115 82 122 88",
            ]}}
            transition={{ duration: 0.4, repeat: Infinity }}
          />

          {/* Big Smile */}
          <motion.path
            d="M85 100 Q100 115 115 100"
            stroke="#1F2937"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            animate={{ d: [
              "M85 100 Q100 112 115 100",
              "M85 100 Q100 118 115 100",
              "M85 100 Q100 112 115 100",
            ]}}
            transition={{ duration: 0.5, repeat: Infinity }}
          />

          {/* Blush */}
          <motion.ellipse
            cx="72"
            cy="95"
            rx="6"
            ry="4"
            fill="#FCA5A5"
            opacity="0.6"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.ellipse
            cx="128"
            cy="95"
            rx="6"
            ry="4"
            fill="#FCA5A5"
            opacity="0.6"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />

          {/* Bakso Bowl with Stirring Animation */}
          <g>
            {/* Bowl bouncing */}
            <animateTransform attributeName="transform" type="translate" values="0,0;0,-4;0,0" dur="0.6s" repeatCount="indefinite"/>
            
            {/* Bowl */}
            <ellipse cx="100" cy="125" rx="35" ry="12" fill="url(#bowlGrad)"/>
            <path d="M65 125 Q70 145 100 145 Q130 145 135 125" fill="#D97706"/>
            
            {/* Soup - Rotating */}
            <g>
              <animateTransform attributeName="transform" type="rotate" values="0 100 122;360 100 122" dur="3s" repeatCount="indefinite"/>
              <ellipse cx="100" cy="122" rx="30" ry="10" fill="#F59E0B"/>
            </g>

            {/* Noodles - Being Stirred */}
            <motion.g
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* Noodle strands */}
              <motion.path
                d="M75 120 Q85 115 95 120 Q105 125 115 120"
                stroke="#FCD34D"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                animate={{ d: [
                  "M75 120 Q85 115 95 120 Q105 125 115 120",
                  "M75 118 Q85 113 95 118 Q105 123 115 118",
                  "M75 122 Q85 117 95 122 Q105 127 115 122",
                  "M75 120 Q85 115 95 120 Q105 125 115 120",
                ]}}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
              <motion.path
                d="M80 125 Q90 120 100 125 Q110 130 120 125"
                stroke="#FCD34D"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                animate={{ d: [
                  "M80 125 Q90 120 100 125 Q110 130 120 125",
                  "M80 123 Q90 118 100 123 Q110 128 120 123",
                  "M80 127 Q90 122 100 127 Q110 132 120 127",
                  "M80 125 Q90 120 100 125 Q110 130 120 125",
                ]}}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
              />
              <motion.path
                d="M70 118 Q80 113 90 118 Q100 123 110 118"
                stroke="#FCD34D"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                animate={{ d: [
                  "M70 118 Q80 113 90 118 Q100 123 110 118",
                  "M70 116 Q80 111 90 116 Q100 121 110 116",
                  "M70 120 Q80 115 90 120 Q100 125 110 120",
                  "M70 118 Q80 113 90 118 Q100 123 110 118",
                ]}}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
              />
            </motion.g>

            {/* Chopsticks Stirring */}
            <motion.g
              animate={{ rotate: [-20, 20, -20] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ originX: 0.7, originY: 0.3 }}
            >
              <rect x="120" y="90" width="5" height="50" rx="2" fill="#D97706" transform="rotate(-45 120 90)"/>
              <rect x="128" y="90" width="5" height="50" rx="2" fill="#B45309" transform="rotate(-45 128 90)"/>
            </motion.g>

            {/* Bakso Balls in Bowl - Bouncing */}
            <motion.circle
              cx="85"
              cy="118"
              r="7"
              fill="#92400E"
              animate={{ cy: [118, 115, 118], cx: [85, 87, 85] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            <motion.circle
              cx="100"
              cy="116"
              r="7"
              fill="#92400E"
              animate={{ cy: [116, 113, 116], cx: [100, 102, 100] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.15 }}
            />
            <motion.circle
              cx="115"
              cy="118"
              r="7"
              fill="#92400E"
              animate={{ cy: [118, 115, 118], cx: [115, 117, 115] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.3 }}
            />

            {/* Steam */}
            <g opacity="0.6">
              <motion.path
                d="M80 110 Q82 100 80 90"
                stroke="#9CA3AF"
                strokeWidth="2"
                fill="none"
                animate={{ d: ["M80 110 Q82 100 80 90", "M80 108 Q78 98 80 88", "M80 110 Q82 100 80 90"] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <motion.path
                d="M100 108 Q102 98 100 88"
                stroke="#9CA3AF"
                strokeWidth="2"
                fill="none"
                animate={{ d: ["M100 108 Q102 98 100 88", "M100 106 Q98 96 100 86", "M100 108 Q102 98 100 88"] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              />
              <motion.path
                d="M120 110 Q122 100 120 90"
                stroke="#9CA3AF"
                strokeWidth="2"
                fill="none"
                animate={{ d: ["M120 110 Q122 100 120 90", "M120 108 Q118 98 120 88", "M120 110 Q122 100 120 90"] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
              />
            </g>
          </g>

          {/* Sparkles */}
          <motion.text
            x="40"
            y="50"
            fontSize="14"
            opacity="0.8"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            ✨
          </motion.text>
          <motion.text
            x="150"
            y="60"
            fontSize="12"
            opacity="0.7"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
          >
            ✨
          </motion.text>
          <motion.text
            x="160"
            y="100"
            fontSize="10"
            opacity="0.6"
            animate={{ opacity: [0.4, 1, 0.4], scale: [0.9, 1.1, 0.9] }}
            transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
          >
            ⭐
          </motion.text>

          {/* Floating Food Emojis */}
          <motion.text
            x="30"
            y="80"
            fontSize="16"
            animate={{ y: [80, 75, 80], rotate: [-10, 10, -10] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🍜
          </motion.text>
          <motion.text
            x="165"
            y="130"
            fontSize="14"
            animate={{ y: [130, 125, 130], rotate: [10, -10, 10] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          >
            🍲
          </motion.text>
        </svg>
      </div>

      {/* Loading Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`mt-6 text-gray-600 dark:text-gray-400 font-semibold ${textSize}`}
      >
        {text}{dots}
      </motion.p>

      {/* Progress Dots */}
      <div className="flex gap-2 mt-3">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 1, opacity: 0.4 }}
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.4, 1, 0.4],
              backgroundColor: ['#FF6B35', '#FFA94D', '#FF6B35']
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15,
              ease: 'easeInOut',
            }}
            className="w-2.5 h-2.5 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}

export function XHRLoadingOverlay({ isLoading, text = 'Loading...' }) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-2xl max-w-sm mx-4">
        <BaksoLoadingAnimation size="lg" text={text} />
      </div>
    </div>
  );
}
