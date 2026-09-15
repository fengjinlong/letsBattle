import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface HealthBarProps {
  currentHP: number;
  maxHP: number;
  color: string; // '#4FB6E8' for player, '#FF6B6B' for boss
  name: string;
  showNumbers?: boolean;
  isUnknown?: boolean;
  avatar?: string;
  isHit?: boolean;
  isHealed?: boolean;
}

export const HealthBar: React.FC<HealthBarProps> = ({
  currentHP,
  maxHP,
  color,
  name,
  showNumbers = true,
  isUnknown = false,
  avatar,
  isHit = false,
  isHealed = false,
}) => {
  const percentage = Math.max(0, Math.min(100, Math.round((currentHP / maxHP) * 100)));
  const isLowHP = percentage <= 25 && percentage > 0;
  const [displayHP, setDisplayHP] = useState(currentHP);

  // Odometer effect for smooth number transition
  useEffect(() => {
    let start = displayHP;
    const end = currentHP;
    if (start === end) return;

    const duration = 400; // ms
    const startTime = performance.now();

    const animateNumber = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      // easeOutQuad
      const eased = 1 - (1 - progress) * (1 - progress);
      const current = Math.round(start + (end - start) * eased);
      setDisplayHP(current);

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      } else {
        setDisplayHP(end);
      }
    };

    const animId = requestAnimationFrame(animateNumber);
    return () => cancelAnimationFrame(animId);
  }, [currentHP]);

  return (
    <div className="w-full select-none">
      {/* Header with Name & Numbers */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          {avatar && <span className="text-2xl sm:text-2xl leading-none">{avatar}</span>}
          <span className="font-extrabold text-base sm:text-lg text-[#4A3323] tracking-tight">{name}</span>
          {isLowHP && (
            <span className="text-xs sm:text-sm bg-[#E8432E] text-white px-2.5 py-0.5 rounded-full font-bold animate-pulse">
              危机!
            </span>
          )}
        </div>
        <div className="font-bold text-sm sm:text-base text-[#8A7A6D]">
          {showNumbers ? (
            <span className="text-[#4A3323]">
              <span className="text-lg sm:text-xl font-black">{displayHP}</span>
              <span className="opacity-75 text-sm sm:text-base font-bold"> / {maxHP}</span>
            </span>
          ) : isUnknown ? (
            <span className="text-[#8A7A6D] text-xs sm:text-sm font-bold bg-[#EADBC8] px-2.5 py-1 rounded-full">数值隐藏 🔒</span>
          ) : (
            <span className="text-base sm:text-lg font-black text-[#4A3323]">{percentage}%</span>
          )}
        </div>
      </div>

      {/* Capsule Health Bar Container */}
      <div className="relative h-6 sm:h-7 w-full bg-[#EADBC8] rounded-full p-1 shadow-inner border border-[#DFC9AF] overflow-hidden">
        {/* Background track stripes */}
        <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#000,#000_6px,transparent_6px,transparent_12px)] pointer-events-none rounded-full" />

        {/* Fill Motion Bar */}
        <motion.div
          className={`h-full rounded-full relative transition-colors duration-300 ${
            isLowHP ? 'animate-pulse-hp' : ''
          }`}
          style={{
            backgroundColor: isHit ? '#FFF' : isHealed ? '#56C93F' : color,
            boxShadow: `inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.15)`,
          }}
          initial={{ width: `${percentage}%` }}
          animate={{
            width: `${percentage}%`,
            transition: {
              type: 'spring',
              stiffness: 120,
              damping: 18,
              mass: 0.8,
            },
          }}
        >
          {/* Top gloss highlight */}
          <div className="absolute top-0 left-1 right-1 h-[35%] bg-white/40 rounded-full" />
        </motion.div>
      </div>
    </div>
  );
};
