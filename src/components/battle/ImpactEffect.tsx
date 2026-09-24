import React from 'react';
import { motion } from 'motion/react';

interface ImpactEffectProps {
  x?: number | string;
  y?: number | string;
  color?: string;
  isCrit?: boolean;
  onComplete?: () => void;
}

export const ImpactEffect: React.FC<ImpactEffectProps> = ({
  color = '#FF8C42',
  isCrit = false,
  onComplete,
}) => {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
      initial={{ scale: 0.2, opacity: 1, rotate: 0 }}
      animate={{
        scale: isCrit ? [0.3, 2.4, 2.0] : 1.6,
        opacity: [1, 1, 0],
        rotate: isCrit ? 75 : 45,
      }}
      transition={{ duration: isCrit ? 0.65 : 0.35, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    >
      <svg
        width={isCrit ? '180' : '120'}
        height={isCrit ? '180' : '120'}
        viewBox="0 0 100 100"
        fill="none"
        className="overflow-visible"
      >
        {/* Starburst rays */}
        <polygon
          points="50,5 57,35 88,20 68,45 95,58 66,68 82,95 54,77 45,98 38,70 12,85 28,58 5,42 33,38 18,12 44,28"
          fill={isCrit ? '#FF1E44' : color}
          stroke="#FFFFFF"
          strokeWidth={isCrit ? '4' : '3'}
        />
        {isCrit && (
          <polygon
            points="50,15 55,38 78,28 64,46 84,56 62,64 74,84 53,70 46,86 40,65 20,76 32,56 14,44 36,41 24,22 45,34"
            fill="#FFD700"
            opacity="0.85"
          />
        )}
        <circle cx="50" cy="50" r={isCrit ? '18' : '14'} fill="#FFFFFF" opacity="0.95" />
      </svg>
    </motion.div>
  );
};
