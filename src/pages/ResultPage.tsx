import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { BattleStats } from '../types';
import { Button } from '../components/common/Button';
import { Trophy, Skull, RefreshCw, Flame, Award, Heart, Shield, ArrowRight } from 'lucide-react';
import { sound } from '../sound';

interface ResultPageProps {
  stats: BattleStats;
  onPlayAgain: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({ stats, onPlayAgain }) => {
  const isVictory = stats.result === 'victory';
  const isDefeat = stats.result === 'defeat';
  const isFlee = stats.result === 'flee';

  // Trigger confetti on victory
  useEffect(() => {
    if (isVictory) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF8C42', '#4FB6E8', '#56C93F', '#FFD3A3', '#FFD700'],
        });

        const timer = setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#FF8C42', '#56C93F', '#FFD700'],
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#4FB6E8', '#56C93F', '#FFD700'],
          });
        }, 300);

        return () => clearTimeout(timer);
      } catch {
        // Fallback gracefully if canvas-confetti is unsupported
      }
    }
  }, [isVictory]);

  const getResultBadge = () => {
    if (isVictory) {
      return (
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.2, rotate: -20 }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#56C93F] border-4 border-white shadow-hard-green flex items-center justify-center text-5xl sm:text-6xl mb-3"
          >
            🏆
          </motion.div>
          <span className="text-xs font-black bg-[#56C93F]/15 text-[#56C93F] px-3 py-1 rounded-full mb-1">
            大获全胜 · 荣耀加冕
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-[#56C93F] tracking-tight">
            胜利！
          </h2>
          <p className="text-sm font-bold text-[#8A7A6D] mt-1">
            你成功击败了强大的对手，守护了竞技场的荣光！
          </p>
        </div>
      );
    }

    if (isDefeat) {
      return (
        <div className="flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#E8432E] border-4 border-white shadow-[0_4px_0_#B82816] flex items-center justify-center text-5xl sm:text-6xl mb-3"
          >
            💀
          </motion.div>
          <span className="text-xs font-black bg-[#E8432E]/15 text-[#E8432E] px-3 py-1 rounded-full mb-1">
            力战不敌 · 壮烈受挫
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-[#E8432E] tracking-tight">
            倒下了…
          </h2>
          <p className="text-sm font-bold text-[#8A7A6D] mt-1">
            不要气馁！调整属性配置，再次向它发起挑战！
          </p>
        </div>
      );
    }

    // Flee
    return (
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#8A7A6D] border-4 border-white shadow-hard-brown flex items-center justify-center text-5xl sm:text-6xl mb-3">
          💨
        </div>
        <span className="text-xs font-black bg-[#8A7A6D]/15 text-[#8A7A6D] px-3 py-1 rounded-full mb-1">
          审时度势 · 保全战力
        </span>
        <h2 className="text-4xl sm:text-5xl font-black text-[#8A7A6D] tracking-tight">
          撤退
        </h2>
        <p className="text-sm font-bold text-[#8A7A6D] mt-1">
          你机智地脱离了战场，留得青山在，不怕没柴烧。
        </p>
      </div>
    );
  };

  return (
    <div
      className={`
        w-full min-h-[90vh] max-w-md mx-auto px-4 py-8 flex flex-col justify-between items-center select-none
        ${isDefeat ? 'filter saturate-75' : ''}
      `}
    >
      {/* Result Graphic & Title */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full text-center mt-4"
      >
        {getResultBadge()}
      </motion.div>

      {/* Battle Stats Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-full bg-[#FFFBF2] rounded-3xl border-4 border-[#EEDCC4] shadow-hard-card p-5 my-6"
      >
        <h3 className="text-base font-bold text-[#4A3323] border-b border-[#EEDCC4] pb-2.5 mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-[#FF8C42]" />
          <span>战斗数据结算清单</span>
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[#F9F2E7] p-3 rounded-2xl border border-[#EEDCC4] text-center">
            <div className="text-xs text-[#8A7A6D] font-bold">对决对手</div>
            <div className="text-base font-black text-[#4A3323] truncate mt-0.5">
              {stats.bossName}
            </div>
          </div>

          <div className="bg-[#F9F2E7] p-3 rounded-2xl border border-[#EEDCC4] text-center">
            <div className="text-xs text-[#8A7A6D] font-bold">交锋回合数</div>
            <div className="text-xl font-black text-[#FF8C42] mt-0.5">
              {stats.rounds} <span className="text-xs font-bold text-[#8A7A6D]">回合</span>
            </div>
          </div>

          <div className="bg-[#F9F2E7] p-3 rounded-2xl border border-[#EEDCC4] text-center">
            <div className="text-xs text-[#8A7A6D] font-bold">累计造成伤害</div>
            <div className="text-xl font-black text-[#E8432E] mt-0.5">
              {stats.totalDamageDealt}
            </div>
          </div>

          <div className="bg-[#F9F2E7] p-3 rounded-2xl border border-[#EEDCC4] text-center">
            <div className="text-xs text-[#8A7A6D] font-bold">累计承受伤害</div>
            <div className="text-xl font-black text-[#4FB6E8] mt-0.5">
              {stats.totalDamageTaken}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between bg-[#F9F2E7] px-3.5 py-2.5 rounded-xl border border-[#EEDCC4] text-xs font-bold text-[#8A7A6D]">
          <span>消耗补给次数</span>
          <span className="font-extrabold text-[#4A3323]">
            {stats.suppliesUsed} 次
          </span>
        </div>
      </motion.div>

      {/* Action Restart */}
      <div className="w-full">
        <Button
          variant={isVictory ? 'success' : 'primary'}
          size="lg"
          fullWidth
          icon={<RefreshCw className="w-5 h-5" />}
          onClick={onPlayAgain}
        >
          再来一局 🔄
        </Button>
      </div>
    </div>
  );
};
