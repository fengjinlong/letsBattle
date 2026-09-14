import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RevealState } from '../../types';
import { Button } from '../common/Button';
import { sound } from '../../sound';
import { ShieldAlert, Swords, HeartPulse, LogOut } from 'lucide-react';

interface RevealPanelProps {
  revealState: RevealState;
  suppliesLeft: number;
  onAttack: () => void;
  onSupply: () => void;
  onFlee: () => void;
}

export const RevealPanel: React.FC<RevealPanelProps> = ({
  revealState,
  suppliesLeft,
  onAttack,
  onSupply,
  onFlee,
}) => {
  useEffect(() => {
    if (revealState.isOpen) {
      sound.playReveal();
    }
  }, [revealState.isOpen]);

  const { count, maxCount, playerPercent, bossPercent } = revealState;

  // Circular gauge component
  const CircularGauge = ({
    percent,
    color,
    label,
    avatar,
  }: {
    percent: number;
    color: string;
    label: string;
    avatar: string;
  }) => {
    const radius = 38;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative w-28 h-28 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
            {/* Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-[#EADBC8]"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Animated Gauge */}
            <motion.circle
              cx="50"
              cy="50"
              r={radius}
              stroke={color}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeLinecap="round"
              fill="transparent"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl leading-none">{avatar}</span>
            <span className="text-xl font-black text-[#4A3323] tracking-tight mt-0.5">
              {percent}%
            </span>
          </div>
        </div>
        <span className="font-bold text-sm text-[#4A3323] mt-1">{label}</span>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {revealState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#4A3323]/60 backdrop-blur-xs"
          />

          {/* Content Box (Modal on desktop, Bottom Sheet on mobile) */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 24, stiffness: 220 }}
            className="
              relative z-10 w-full sm:max-w-md bg-[#FFFBF2] border-t-4 sm:border-4 border-[#EEDCC4]
              rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl text-center select-none
              pb-[max(1.5rem,env(safe-area-inset-bottom))]
            "
          >
            {/* Top Badge & Counter */}
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center gap-1.5 bg-[#FF8C42]/15 text-[#FF8C42] px-3 py-1 rounded-full text-xs font-bold">
                <ShieldAlert className="w-4 h-4" />
                战况警报·半血揭示
              </div>
              <div className="bg-[#EADBC8] text-[#4A3323] text-xs font-extrabold px-2.5 py-1 rounded-full">
                提示 {count} / {maxCount}
              </div>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-[#4A3323] tracking-tight">
              敌我血量态势揭晓
            </h3>
            <p className="text-xs sm:text-sm text-[#8A7A6D] mt-1 mb-5">
              双方已进入白热化战斗！请根据目前血量差距选择后续策略：
            </p>

            {/* Dual Gauges */}
            <div className="flex items-center justify-around bg-[#F9F2E7] rounded-2xl p-4 border border-[#EEDCC4] mb-6">
              <CircularGauge
                percent={playerPercent}
                color="#4FB6E8"
                label="勇士 (玩家)"
                avatar="🤠"
              />
              <div className="font-cartoon font-black text-2xl text-[#8A7A6D]">VS</div>
              <CircularGauge
                percent={bossPercent}
                color="#FF6B6B"
                label="魔物 (BOSS)"
                avatar="👾"
              />
            </div>

            {/* 3 Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Button
                variant="primary"
                fullWidth
                size="md"
                icon={<Swords className="w-4 h-4" />}
                onClick={onAttack}
              >
                继续攻击
              </Button>
              <Button
                variant="secondary"
                fullWidth
                size="md"
                disabled={suppliesLeft <= 0}
                icon={<HeartPulse className="w-4 h-4" />}
                onClick={onSupply}
              >
                补给 ({suppliesLeft})
              </Button>
              <Button
                variant="weak"
                fullWidth
                size="md"
                icon={<LogOut className="w-4 h-4" />}
                onClick={onFlee}
              >
                逃离战场
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
