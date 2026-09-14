import React from 'react';
import { motion } from 'motion/react';

export type AvatarActionState =
  | 'idle'
  | 'charging'
  | 'dashing'
  | 'hit'
  | 'healing'
  | 'defeated'
  | 'celebrating'
  | 'fleeing';

interface AvatarProps {
  emoji: string;
  name: string;
  isBoss?: boolean;
  actionState?: AvatarActionState;
  isLowHP?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  silhouette?: boolean;
  themeColor?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  emoji,
  name,
  isBoss = false,
  actionState = 'idle',
  isLowHP = false,
  size = 'hero',
  silhouette = false,
  themeColor = isBoss ? '#FF6B6B' : '#4FB6E8',
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'w-12 h-12 text-2xl';
      case 'md':
        return 'w-16 h-16 text-3xl';
      case 'lg':
        return 'w-24 h-24 text-5xl';
      case 'hero':
      default:
        return 'w-28 h-28 sm:w-36 sm:h-36 text-5xl sm:text-7xl';
    }
  };

  // Define motion variants based on cartoon animation requirements
  const getAnimationProps = () => {
    switch (actionState) {
      case 'charging':
        return {
          scale: 0.9,
          rotate: isBoss ? 8 : -8,
          transition: { duration: 0.2 },
        };
      case 'dashing':
        return {
          scale: 1.05,
          x: isBoss ? -40 : 40,
          transition: { duration: 0.15, ease: 'easeOut' },
        };
      case 'hit':
        return {
          scale: [1, 0.85, 1.1, 1],
          x: isBoss ? 20 : -20,
          rotate: isBoss ? -12 : 12,
          filter: ['brightness(2)', 'brightness(1.5)', 'brightness(1)'],
          transition: { duration: 0.25 },
        };
      case 'healing':
        return {
          scale: [1, 1.2, 0.95, 1.05, 1],
          y: [0, -18, 0, -6, 0],
          transition: { duration: 0.45, ease: 'easeOut' },
        };
      case 'defeated':
        return {
          scale: 0.85,
          rotate: isBoss ? 90 : -90,
          y: 40,
          opacity: 0.6,
          filter: 'grayscale(100%)',
          transition: { duration: 0.7, ease: 'easeInOut' },
        };
      case 'celebrating':
        return {
          y: [0, -24, 0, -14, 0],
          scale: [1, 1.15, 1, 1.08, 1],
          transition: { repeat: Infinity, duration: 1.2, ease: 'easeInOut' },
        };
      case 'fleeing':
        return {
          scale: 0.3,
          x: -120,
          opacity: 0,
          transition: { duration: 0.45, ease: 'easeIn' },
        };
      case 'idle':
      default:
        return {
          y: [0, -6, 0],
          transition: {
            repeat: Infinity,
            duration: isLowHP ? 0.8 : 2.0, // Panting when low HP
            ease: 'easeInOut',
          },
        };
    }
  };

  return (
    <div className="flex flex-col items-center select-none">
      <motion.div
        animate={getAnimationProps()}
        className={`
          relative rounded-full border-4 border-white flex items-center justify-center
          shadow-hard-avatar transition-colors
          ${getSizeStyles()}
        `}
        style={{
          backgroundColor: silhouette ? '#B8B0A6' : themeColor,
        }}
      >
        {/* Cartoon highlight sheen */}
        <div className="absolute top-1.5 left-2 w-1/3 h-1/3 rounded-full bg-white/35 pointer-events-none" />

        {/* Character Display */}
        {silhouette ? (
          <div className="flex items-center justify-center filter grayscale opacity-40 font-black text-[#4A3323]">
            ?
          </div>
        ) : (
          <span className="leading-none drop-shadow-md select-none transform transition-transform">
            {emoji}
          </span>
        )}

        {/* Low HP sweat drops effect */}
        {isLowHP && actionState === 'idle' && (
          <motion.div
            animate={{ y: [0, 4, 8], opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute -top-2 -right-1 text-sm sm:text-base pointer-events-none"
          >
            💦
          </motion.div>
        )}
      </motion.div>

      {/* Shadow ellipse beneath character */}
      <div className="w-16 sm:w-24 h-3 bg-[#4A3323]/15 rounded-full mt-2 blur-[1px]" />

      {/* Tag name */}
      <div className="mt-1 font-bold text-xs sm:text-sm text-[#4A3323] bg-[#FFFBF2]/90 px-2.5 py-0.5 rounded-full border border-[#EEDCC4] shadow-sm">
        {silhouette ? '未知魔物' : name}
      </div>
    </div>
  );
};
