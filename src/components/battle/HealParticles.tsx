import React from 'react';
import { motion } from 'motion/react';

interface HealParticlesProps {
  onComplete?: () => void;
}

export const HealParticles: React.FC<HealParticlesProps> = ({ onComplete }) => {
  // 8 sparkling healing motes
  const particles = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const radius = 35 + (i % 3) * 10;
    const startX = Math.cos(angle) * radius;
    const startY = 30 + (i % 2) * 15;
    return {
      id: i,
      startX,
      startY,
      endX: startX * 0.7 + (i % 2 === 0 ? 10 : -10),
      endY: -70 - (i % 3) * 15,
      delay: i * 0.05,
      size: 6 + (i % 3) * 3,
    };
  });

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
      {particles.map((p, idx) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#56C93F] shadow-[0_0_8px_#56C93F] border border-white"
          style={{
            width: p.size,
            height: p.size,
          }}
          initial={{
            x: p.startX,
            y: p.startY,
            scale: 0.2,
            opacity: 0,
          }}
          animate={{
            x: p.endX,
            y: p.endY,
            scale: [0.2, 1.4, 0.8, 0],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 0.65,
            delay: p.delay,
            ease: 'easeOut',
          }}
          onAnimationComplete={idx === particles.length - 1 ? onComplete : undefined}
        />
      ))}
      {/* Healing glow ring */}
      <motion.div
        className="absolute w-28 h-28 rounded-full border-4 border-[#56C93F]/40"
        initial={{ scale: 0.6, opacity: 0.8 }}
        animate={{ scale: 1.4, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
};
