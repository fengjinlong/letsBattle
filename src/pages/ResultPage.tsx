import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { BattleStats } from '../types';
import { Button } from '../components/common/Button';
import { RefreshCw, Award, HeartPulse, SlidersHorizontal } from 'lucide-react';
import { sound } from '../sound';

interface ResultPageProps {
  stats: BattleStats;
  onPlayAgain: () => void;
  onBackToSetup?: () => void;
}

export const ResultPage: React.FC<ResultPageProps> = ({
  stats,
  onPlayAgain,
  onBackToSetup,
}) => {
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
            你成功击败了对手，守护了竞技场的荣光！
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
            不要气馁！可在属性设置中多备些补给美食，再次向它发起挑战！
          </p>
        </div>
      );
    }

    // Flee (逃跑/放弃 相当于 失败)
    return (
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0.8, y: -10 }}
          animate={{ scale: 1, y: 0 }}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#E8432E] border-4 border-white shadow-[0_4px_0_#B82816] flex items-center justify-center text-5xl sm:text-6xl mb-3"
        >
          💨
        </motion.div>
        <span className="text-xs font-black bg-[#E8432E]/15 text-[#E8432E] px-3 py-1 rounded-full mb-1">
          {stats.rounds === 0 ? '放弃迎战 · 判定失败' : '脱离战场 · 逃跑失败'}
        </span>
        <h2 className="text-4xl sm:text-5xl font-black text-[#E8432E] tracking-tight">
          {stats.rounds === 0 ? '放弃挑战' : '逃跑失败！'}
        </h2>
        <p className="text-sm font-bold text-[#8A7A6D] mt-1">
          {stats.rounds === 0
            ? `面对【${stats.bossName}】选择放弃迎战，根据竞技场规则判定失败！`
            : `在对决途中选择逃跑脱离，根据竞技场规则判定挑战失败！`}
        </p>
      </div>
    );
  };

  const usedDetails = stats.suppliesUsedDetails || {};
  const hasUsedDetails = Object.keys(usedDetails).length > 0;

  return (
    <div
      className={`
        w-full min-h-[90vh] max-w-md mx-auto px-4 py-6 sm:py-8 flex flex-col justify-between items-center select-none
        ${isDefeat || isFlee ? 'filter saturate-75' : ''}
      `}
    >
      {/* Result Graphic & Title */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full text-center mt-2"
      >
        {getResultBadge()}
      </motion.div>

      {/* Battle Stats Card */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-full bg-[#FFFBF2] rounded-3xl border-4 border-[#EEDCC4] shadow-hard-card p-4 sm:p-5 my-5"
      >
        <h3 className="text-lg font-black text-[#4A3323] border-b border-[#EEDCC4] pb-2.5 mb-3.5 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#FF8C42]" />
          <span>战斗数据结算清单</span>
        </h3>

        {/* 4 Major Stats */}
        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          <div className="bg-[#F9F2E7] p-3 rounded-2xl border border-[#EEDCC4] text-center">
            <div className="text-xs text-[#8A7A6D] font-extrabold">对决对手</div>
            <div className="text-base sm:text-lg font-black text-[#4A3323] truncate mt-0.5">
              {stats.bossName}
            </div>
          </div>

          <div className="bg-[#F9F2E7] p-3 rounded-2xl border border-[#EEDCC4] text-center">
            <div className="text-xs text-[#8A7A6D] font-extrabold">交锋回合数</div>
            <div className="text-xl sm:text-2xl font-black text-[#FF8C42] mt-0.5">
              {stats.rounds} <span className="text-xs font-bold text-[#8A7A6D]">回合</span>
            </div>
          </div>

          <div className="bg-[#F9F2E7] p-3 rounded-2xl border border-[#EEDCC4] text-center">
            <div className="text-xs text-[#8A7A6D] font-extrabold">累计造成伤害</div>
            <div className="text-xl sm:text-2xl font-black text-[#E8432E] mt-0.5">
              {stats.totalDamageDealt}
            </div>
          </div>

          <div className="bg-[#F9F2E7] p-3 rounded-2xl border border-[#EEDCC4] text-center">
            <div className="text-xs text-[#8A7A6D] font-extrabold">累计承受伤害</div>
            <div className="text-xl sm:text-2xl font-black text-[#4FB6E8] mt-0.5">
              {stats.totalDamageTaken}
            </div>
          </div>
        </div>

        {/* Critical strike trigger statistics if triggered */}
        {(stats.critCount ?? 0) > 0 && (
          <div className="mb-3.5 bg-[#FFF0F3] px-3.5 py-2.5 rounded-2xl border border-[#FFD0DB] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">💥</span>
              <div>
                <span className="text-xs font-bold text-[#8A7A6D] block">对决暴击次数</span>
                <span className="text-xs sm:text-sm font-black text-[#FF1E44]">成功触发致命一击</span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-cartoon text-xl font-black text-[#FF1E44]">
                {stats.critCount}
              </span>
              <span className="text-xs font-black text-[#8A7A6D] ml-1">次</span>
            </div>
          </div>
        )}

        {/* Highlighted Supply Usage Section */}
        <div className="bg-[#F9F2E7] p-3.5 rounded-2xl border-2 border-[#EEDCC4]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E8F8E3] border border-[#C5EEBA] flex items-center justify-center text-[#56C93F]">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#8A7A6D] block">补给消耗统计</span>
                <span className="text-sm font-black text-[#4A3323]">
                  {stats.suppliesUsed > 0 ? '本次对决已使用补给' : '未消耗任何补给'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="font-cartoon text-xl sm:text-2xl font-black text-[#56C93F]">
                {stats.suppliesUsed}
              </span>
              <span className="text-xs font-black text-[#8A7A6D] ml-1">件</span>
            </div>
          </div>

          {/* Detailed items consumed if any */}
          {hasUsedDetails && (
            <div className="mt-2.5 pt-2 border-t border-[#EEDCC4]/60">
              <div className="text-[11px] font-bold text-[#8A7A6D] mb-1.5">消耗补给清单：</div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(usedDetails).map(([name, count]) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 text-xs font-black bg-[#FFFBF2] text-[#4A3323] px-2 py-0.5 rounded-lg border border-[#E0CCA9] shadow-2xs"
                  >
                    <span>{name}</span>
                    <span className="text-[#FF8C42] font-cartoon font-bold">x{count}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {stats.suppliesUsed === 0 && (
            <p className="text-[11px] text-[#8A7A6D] mt-1.5 font-bold">
              💡 纯靠硬实力硬碰硬！若对决艰难，可在出征前配置更多补给品哦。
            </p>
          )}
        </div>
      </motion.div>

      {/* Action Buttons */}
      <div className="w-full space-y-2.5">
        <Button
          variant={isVictory ? 'success' : 'primary'}
          size="lg"
          fullWidth
          icon={<RefreshCw className="w-5 h-5" />}
          onClick={onPlayAgain}
        >
          再战一局 🔄
        </Button>

        {onBackToSetup && (
          <Button
            variant="weak"
            size="md"
            fullWidth
            icon={<SlidersHorizontal className="w-4 h-4" />}
            onClick={onBackToSetup}
          >
            调整属性与补给背包 ⚙️
          </Button>
        )}
      </div>
    </div>
  );
};
