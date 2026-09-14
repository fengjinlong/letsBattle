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
  // Dynamic size according to damage severity
  const fontSizeClass =
    val > 25
      ? 'text-4xl sm:text-5xl font-black'
      : val > 15
      ? 'text-3xl sm:text-4xl font-extrabold'
      : 'text-2xl sm:text-3xl font-bold';

  return (
    <motion.div
      className={`absolute pointer-events-none z-40 select-none ${fontSizeClass}`}
      style={{
        color: item.color,
        textShadow: '0 2px 0 #FFF, 0 -2px 0 #FFF, 2px 0 0 #FFF, -2px 0 0 #FFF, 0 4px 6px rgba(0,0,0,0.3)',
      }}
      initial={{
        scale: 0.5,
        y: 0,
        opacity: 0,
        x: item.target === 'boss' ? 10 : -10,
      }}
      animate={{
        scale: [0.5, 1.25, 1],
        y: -50,
        opacity: [0, 1, 1, 0],
        x: [item.target === 'boss' ? 10 : -10, item.target === 'boss' ? 14 : -14, item.target === 'boss' ? 10 : -10],
      }}
      transition={{
        duration: 0.75,
        times: [0, 0.3, 0.7, 1],
        ease: 'easeOut',
      }}
      onAnimationComplete={() => onDone?.(item.id)}
    >
      <span className="inline-block tracking-wider font-cartoon">
        {item.type === 'heal' ? `+${item.amount}` : `-${item.amount}`}
        {item.type === 'damage' && val >= 20 && ' !'}
      </span>
    </motion.div>
  );
};
