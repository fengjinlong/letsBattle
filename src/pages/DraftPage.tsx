import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BossPreset, BossId } from '../types';
import { BOSS_PRESETS } from '../constants';
import { Button } from '../components/common/Button';
import { sound } from '../sound';
import { RefreshCw, Swords, Sparkles, Flame, Shield, ArrowLeft, Skull } from 'lucide-react';

interface DraftPageProps {
  onConfirmBoss: (boss: BossPreset) => void;
  onBack: () => void;
}

const BOSS_KEYS: BossId[] = ['wood_giant', 'wolf_fang', 'great_axe', 'witch'];

export const DraftPage: React.FC<DraftPageProps> = ({
  onConfirmBoss,
  onBack,
}) => {
  const [selectedKey, setSelectedKey] = useState<BossId>(() => {
    return BOSS_KEYS[Math.floor(Math.random() * BOSS_KEYS.length)];
  });
  const [isOpened, setIsOpened] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const currentBoss = BOSS_PRESETS[selectedKey] || BOSS_PRESETS.wood_giant;

  const handleOpenChest = () => {
    if (isOpened || isOpening) return;
    setIsOpening(true);
    sound.playDash();

    setTimeout(() => {
      setIsOpening(false);
      setIsOpened(true);
      sound.playHit(true);
    }, 600);
  };

  const handleReroll = () => {
    sound.playButton();
    setIsOpened(false);
    // Pick another boss randomly from the remaining 3
    const remaining = BOSS_KEYS.filter((k) => k !== selectedKey);
    const nextKey = remaining[Math.floor(Math.random() * remaining.length)];
    setSelectedKey(nextKey);

    // Auto-open with quick animation
    setTimeout(() => {
      setIsOpening(true);
      setTimeout(() => {
        setIsOpening(false);
        setIsOpened(true);
        sound.playReveal();
      }, 500);
    }, 200);
  };

  // Card theme style for each boss
  const getBossCardStyle = (key: BossId) => {
    switch (key) {
      case 'witch':
        return {
          border: 'border-4 border-[#8A5CF6]',
          shadow: 'shadow-[0_8px_0_#6234CE]',
          badgeBg: 'bg-[#8A5CF6]',
          badgeText: 'text-white',
          glow: 'ring-4 ring-[#8A5CF6]/35',
          bannerBg: 'bg-[#8A5CF6]',
          bannerText: '极阶魔尊 · 禁咒降临!',
          bannerIcon: <Skull className="w-3.5 h-3.5" />,
        };
      case 'great_axe':
        return {
          border: 'border-4 border-[#E07A2B]',
          shadow: 'shadow-[0_8px_0_#A85312]',
          badgeBg: 'bg-[#E07A2B]',
          badgeText: 'text-white',
          glow: 'ring-4 ring-[#E07A2B]/25',
          bannerBg: 'bg-[#E07A2B]',
          bannerText: '三阶霸主 · 狂怒破阵!',
          bannerIcon: <Flame className="w-3.5 h-3.5" />,
        };
      case 'wolf_fang':
        return {
          border: 'border-4 border-[#4B7B9E]',
          shadow: 'shadow-[0_8px_0_#2E5675]',
          badgeBg: 'bg-[#4B7B9E]',
          badgeText: 'text-white',
          glow: 'ring-4 ring-[#4B7B9E]/25',
          bannerBg: 'bg-[#4B7B9E]',
          bannerText: '二阶统领 · 嗜血撕裂!',
          bannerIcon: <Sparkles className="w-3.5 h-3.5" />,
        };
      case 'wood_giant':
      default:
        return {
          border: 'border-4 border-[#739E52]',
          shadow: 'shadow-[0_8px_0_#4E7234]',
          badgeBg: 'bg-[#739E52]',
          badgeText: 'text-white',
          glow: 'ring-4 ring-[#739E52]/25',
          bannerBg: 'bg-[#739E52]',
          bannerText: '一阶守卫 · 苍木厚甲!',
          bannerIcon: <Shield className="w-3.5 h-3.5" />,
        };
    }
  };

  const cardStyle = getBossCardStyle(selectedKey);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 sm:py-8 flex flex-col items-center min-h-[90vh] justify-between">
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-[#8A7A6D] hover:text-[#4A3323] px-3 py-1.5 rounded-full bg-[#FFFBF2] border border-[#EEDCC4] shadow-sm active:translate-y-[1px] cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>返回调整属性</span>
        </button>
        <span className="text-xs font-extrabold text-[#4A3323] bg-[#FFFBF2] px-3 py-1 rounded-full border border-[#EEDCC4]">
          阶段 2/3 · 抽取魔物
        </span>
      </div>

      {/* Main Center Area */}
      <div className="w-full flex flex-col items-center my-auto">
        <AnimatePresence mode="wait">
          {!isOpened ? (
            /* Unopened Mystery Chest */
            <motion.div
              key="chest"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              onClick={handleOpenChest}
              className="cursor-pointer group flex flex-col items-center"
            >
              <motion.div
                animate={
                  isOpening
                    ? { rotate: [-4, 4, -6, 6, 0], scale: [1, 1.1, 1.15] }
                    : { y: [0, -6, 0] }
                }
                transition={{
                  repeat: isOpening ? 2 : Infinity,
                  duration: isOpening ? 0.2 : 2.2,
                  ease: 'easeInOut',
                }}
                className="
                  w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-[#FFFBF2] border-4 border-[#EEDCC4]
                  shadow-hard-card flex flex-col items-center justify-center relative select-none
                  group-hover:border-[#FF8C42] transition-colors
                "
              >
                {/* Chest Icon */}
                <span className="text-7xl sm:text-8xl drop-shadow-md transform transition-transform group-hover:scale-105">
                  🎁
                </span>
                <div className="absolute -top-3 bg-[#FF8C42] text-white text-xs font-black px-3 py-0.5 rounded-full shadow-sm">
                  点击开启神秘对决
                </div>
                <div className="mt-2 text-xs font-bold text-[#8A7A6D]">
                  {isOpening ? '正在破开封印…' : '点击开启挑战宝箱'}
                </div>
              </motion.div>
              <div className="w-36 h-4 bg-[#4A3323]/15 rounded-full mt-4 blur-xs" />
            </motion.div>
          ) : (
            /* Opened Boss Card */
            <motion.div
              key="card"
              initial={{ scale: 0.6, rotateY: 90, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 18, stiffness: 200 }}
              className={`
                w-full bg-[#FFFBF2] rounded-3xl p-6 text-center select-none relative
                ${cardStyle.border} ${cardStyle.shadow} ${cardStyle.glow}
              `}
            >
              {/* Boss Tier Banner */}
              <div className={`absolute -top-3.5 left-1/2 -translate-x-1/2 ${cardStyle.bannerBg} text-white text-xs font-black px-3 py-1 rounded-full shadow-md flex items-center gap-1`}>
                {cardStyle.bannerIcon}
                <span>{cardStyle.bannerText}</span>
              </div>

              {/* Boss Silhouette and Avatar */}
              <div className="my-5 flex flex-col items-center">
                <div
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white flex items-center justify-center shadow-hard-avatar relative mb-3"
                  style={{ backgroundColor: currentBoss.themeColor }}
                >
                  <span className="text-6xl sm:text-7xl leading-none drop-shadow-md">
                    {currentBoss.avatar}
                  </span>
                  <div className="absolute top-1.5 left-2 w-1/3 h-1/3 rounded-full bg-white/35" />
                </div>

                <div className={`px-3.5 py-1 rounded-full text-xs sm:text-sm font-black ${cardStyle.badgeBg} ${cardStyle.badgeText} mb-1.5`}>
                  {currentBoss.tierLabel}
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-[#4A3323] tracking-tight">
                  {currentBoss.name}
                </h3>
                <p className="text-sm sm:text-base text-[#FF8C42] font-extrabold mt-0.5">{currentBoss.title}</p>
              </div>

              {/* Mystery Concealed Stats Panel */}
              <div className="bg-[#F9F2E7] rounded-2xl p-4 border border-[#EEDCC4] mb-4">
                <p className="text-sm text-[#8A7A6D] mb-2.5 leading-relaxed font-medium">
                  {currentBoss.desc}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm font-extrabold text-[#4A3323] bg-[#EADBC8]/70 py-2 px-3.5 rounded-xl border border-[#DFC9AF]">
                  <span>🛡️ 生命值：<span className="text-[#8A7A6D]">??? (隐藏待揭示)</span></span>
                  <span>⚔️ 攻击力：<span className="text-[#8A7A6D]">??? (隐藏待揭示)</span></span>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-[#8A7A6D] font-bold">
                提示：魔物具体生命将在半血阶段提供侦察情报！
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom CTA Operations */}
      <div className="w-full mt-6 space-y-3">
        {isOpened ? (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              icon={<Swords className="w-5 h-5" />}
              onClick={() => onConfirmBoss(currentBoss)}
            >
              开始决斗 💥
            </Button>
            <Button
              variant="ghost"
              size="md"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={handleReroll}
            >
              重新抽取
            </Button>
          </div>
        ) : (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            icon={<Sparkles className="w-5 h-5" />}
            onClick={handleOpenChest}
          >
            开启挑战宝箱 ✨
          </Button>
        )}
      </div>
    </div>
  );
};
