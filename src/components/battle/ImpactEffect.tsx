import React from 'react';
import { motion } from 'motion/react';

interface ImpactEffectProps {
  x?: number | string;
  y?: number | string;
  color?: string;
  onComplete?: () => void;
}

export const ImpactEffect: React.FC<ImpactEffectProps> = ({
  color = '#FF8C42',
  onComplete,
}) => {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
      initial={{ scale: 0.2, opacity: 1, rotate: 0 }}
      animate={{ scale: 1.6, opacity: 0, rotate: 45 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    >
      <svg width="120" height="120" viewBox="0 0 100 100" fill="none" className="overflow-visible">
        {/* Starburst rays */}
        <polygon
          points="50,5 57,35 88,20 68,45 95,58 66,68 82,95 54,77 45,98 38,70 12,85 28,58 5,42 33,38 18,12 44,28"
          fill={color}
          stroke="#FFFFFF"
          strokeWidth="3"
        />
        <circle cx="50" cy="50" r="14" fill="#FFFFFF" opacity="0.9" />
      </svg>
    </motion.div>
  );
};
