import React from 'react';
import { motion } from 'motion/react';
import { FloatingDamage } from '../../types';

interface DamageFloatProps {
  item: FloatingDamage;
  onDone?: (id: string) => void;
}

export const DamageFloat: React.FC<DamageFloatProps> = ({ item, onDone }) => {
  const isNumber = typeof item.amount === 'number';
  const val = isNumber ? (item.amount as number) : 0;
  const isCrit = item.isCrit || item.type === 'crit';

  // Dynamic size according to damage severity and crit
  const fontSizeClass = isCrit
    ? 'text-4xl sm:text-6xl font-black'
    : val > 25
    ? 'text-4xl sm:text-5xl font-black'
    : val > 15
    ? 'text-3xl sm:text-4xl font-extrabold'
    : 'text-2xl sm:text-3xl font-bold';

  return (
    <motion.div
      className={`absolute pointer-events-none z-50 select-none flex items-center gap-1.5 sm:gap-2.5 ${fontSizeClass}`}
      style={{
        color: isCrit ? '#FF1E44' : item.color,
        textShadow: isCrit
          ? '0 3px 0 #FFF, 0 -2px 0 #FFF, 3px 0 0 #FFF, -2px 0 0 #FFF, 0 6px 14px rgba(255,30,68,0.5), 0 4px 8px rgba(0,0,0,0.35)'
          : '0 2px 0 #FFF, 0 -2px 0 #FFF, 2px 0 0 #FFF, -2px 0 0 #FFF, 0 4px 6px rgba(0,0,0,0.3)',
      }}
      initial={{
        scale: 0.4,
        y: 0,
        opacity: 0,
        x: item.target === 'boss' ? 10 : -10,
      }}
      animate={{
        scale: isCrit ? [0.4, 1.45, 1.25, 1.25, 1] : [0.5, 1.25, 1],
        y: isCrit ? [-5, -45, -55, -68, -82] : -50,
        opacity: isCrit ? [0, 1, 1, 1, 0] : [0, 1, 1, 0],
        x: [item.target === 'boss' ? 10 : -10, item.target === 'boss' ? 16 : -16, item.target === 'boss' ? 10 : -10],
      }}
      transition={{
        duration: isCrit ? 1.8 : 0.8,
        times: isCrit ? [0, 0.15, 0.45, 0.75, 1] : [0, 0.3, 0.7, 1],
        ease: 'easeOut',
      }}
      onAnimationComplete={() => onDone?.(item.id)}
    >
      {isCrit && (
        <span className="text-sm sm:text-xl font-black bg-gradient-to-r from-[#FF1E44] via-[#FF453A] to-[#FF8C42] text-white px-2.5 py-1 rounded-xl border-2 sm:border-3 border-white shadow-[0_4px_12px_rgba(255,30,68,0.5)] tracking-wide inline-flex items-center gap-1">
          <span>💥</span>
          <span>暴击!</span>
        </span>
      )}
      <span className="inline-block tracking-wider font-cartoon">
        {item.type === 'heal' ? `+${item.amount}` : `-${item.amount}`}
        {!isCrit && item.type === 'damage' && val >= 20 && ' !'}
      </span>
    </motion.div>
  );
};
