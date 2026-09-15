import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameConfig } from '../types';
import { SUPPLY_ITEMS, getTotalSuppliesCount } from '../data/supplies';
import { Button } from '../components/common/Button';
import {
  ChevronDown,
  ChevronUp,
  Swords,
  Heart,
  Sparkles,
  Volume2,
  VolumeX,
  Shield,
  Backpack,
  RotateCcw,
  Plus,
  Minus,
} from 'lucide-react';
import { sound } from '../sound';

interface SetupPageProps {
  config: GameConfig;
  onUpdateConfig: (newConfig: GameConfig) => void;
  onStart: () => void;
}

export const SetupPage: React.FC<SetupPageProps> = ({
  config,
  onUpdateConfig,
  onStart,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  const toggleMute = () => {
    sound.isMuted = !sound.isMuted;
    setIsMuted(sound.isMuted);
    if (!sound.isMuted) {
      sound.playButton();
    }
  };

  const updateField = <K extends keyof GameConfig>(key: K, value: GameConfig[K]) => {
    onUpdateConfig({
      ...config,
      [key]: value,
    });
  };

  const inventory = config.suppliesInventory || {};
  const totalSuppliesCount = getTotalSuppliesCount(inventory);

  // Update specific item count
  const updateItemCount = (itemId: string, count: number) => {
    const validCount = Math.max(0, Math.min(99, Math.floor(count) || 0));
    sound.playButton();
    onUpdateConfig({
      ...config,
      suppliesInventory: {
        ...inventory,
        [itemId]: validCount,
      },
    });
  };

  // Preset: Reset all to 0
  const handleResetAllToZero = () => {
    sound.playButton();
    const emptyInventory: Record<string, number> = {};
    SUPPLY_ITEMS.forEach((item) => {
      emptyInventory[item.id] = 0;
    });
    onUpdateConfig({
      ...config,
      suppliesInventory: emptyInventory,
    });
  };

  // Preset: Beginner pack (+1 of bread, water, cookie)
  const handleBeginnerPack = () => {
    sound.playButton();
    const newInventory = { ...inventory };
    newInventory['bread'] = (newInventory['bread'] || 0) + 1;
    newInventory['water'] = (newInventory['water'] || 0) + 1;
    newInventory['cookie'] = (newInventory['cookie'] || 0) + 1;
    onUpdateConfig({
      ...config,
      suppliesInventory: newInventory,
    });
  };

  // Preset: Full pack (+1 of all items)
  const handleAllPlusOne = () => {
    sound.playButton();
    const newInventory = { ...inventory };
    SUPPLY_ITEMS.forEach((item) => {
      newInventory[item.id] = (newInventory[item.id] || 0) + 1;
    });
    onUpdateConfig({
      ...config,
      suppliesInventory: newInventory,
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 sm:py-8 flex flex-col items-center">
      {/* Sound Mute Toggle in top corner */}
      <div className="w-full flex justify-end mb-2">
        <button
          onClick={toggleMute}
          className="p-2.5 rounded-full bg-[#FFFBF2] text-[#4A3323] border-2 border-[#EEDCC4] shadow-[0_2px_0_#E0CCA9] active:translate-y-[1px] hover:bg-[#FDF6E7] cursor-pointer"
          title={isMuted ? '开启音效' : '静音'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Header / Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="text-center mb-5"
      >
     
        <h2
          className="text-4xl sm:text-5xl font-black tracking-tight text-[#4A3323]"
          style={{
            textShadow: '0 4px 0 #FFF, 0 -2px 0 #FFF, 2px 0 0 #FFF, -2px 0 0 #FFF, 0 8px 12px rgba(214,98,23,0.18)',
          }}
        >
          阳光竞技场
        </h2>
        <p className="text-sm sm:text-base text-[#8A7A6D] mt-1 font-bold">
          配置勇士数值与随身补给，开启畅快对决！
        </p>
      </motion.div>

      {/* 1. Basic Attributes Card */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-[#FFFBF2] rounded-2xl border-4 border-[#EEDCC4] shadow-hard-card p-5 mb-5"
      >
        <h2 className="text-lg font-black text-[#4A3323] mb-4 flex items-center gap-2 border-b border-[#EEDCC4]/60 pb-2">
          <Shield className="w-5 h-5 text-[#4FB6E8]" />
          勇士基础属性
        </h2>

        {/* Player Max HP (Slider + Stepper) */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm sm:text-base font-bold text-[#4A3323] flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-[#FF6B6B]" />
              初始生命值 (HP)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateField('playerHP', Math.max(50, config.playerHP - 10))}
                className="w-8 h-8 rounded-full bg-[#EADBC8] text-[#4A3323] font-black text-base flex items-center justify-center hover:bg-[#DECABE] active:translate-y-[1px] shadow-sm cursor-pointer"
              >
                -
              </button>
              <span className="w-14 text-center font-extrabold text-xl text-[#4A3323]">
                {config.playerHP}
              </span>
              <button
                type="button"
                onClick={() => updateField('playerHP', Math.min(300, config.playerHP + 10))}
                className="w-8 h-8 rounded-full bg-[#EADBC8] text-[#4A3323] font-black text-base flex items-center justify-center hover:bg-[#DECABE] active:translate-y-[1px] shadow-sm cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
          <input
            type="range"
            min="50"
            max="300"
            step="5"
            value={config.playerHP}
            onChange={(e) => updateField('playerHP', Number(e.target.value))}
            className="w-full h-3 bg-[#EADBC8] rounded-full appearance-none cursor-pointer accent-[#4FB6E8]"
          />
          <div className="flex justify-between text-xs sm:text-sm text-[#8A7A6D] mt-1.5 font-bold">
            <span>50 脆弱</span>
            <span>100 标准</span>
            <span>300 泰坦</span>
          </div>
        </div>

        {/* Player Attack (Slider + Stepper) */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm sm:text-base font-bold text-[#4A3323] flex items-center gap-1.5">
              <Swords className="w-4 h-4 text-[#FF8C42]" />
              攻击力 (Attack)
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateField('playerAttack', Math.max(5, config.playerAttack - 5))}
                className="w-8 h-8 rounded-full bg-[#EADBC8] text-[#4A3323] font-black text-base flex items-center justify-center hover:bg-[#DECABE] active:translate-y-[1px] shadow-sm cursor-pointer"
              >
                -
              </button>
              <span className="w-14 text-center font-extrabold text-xl text-[#4A3323]">
                {config.playerAttack}
              </span>
              <button
                type="button"
                onClick={() => updateField('playerAttack', Math.min(60, config.playerAttack + 5))}
                className="w-8 h-8 rounded-full bg-[#EADBC8] text-[#4A3323] font-black text-base flex items-center justify-center hover:bg-[#DECABE] active:translate-y-[1px] shadow-sm cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
          <input
            type="range"
            min="5"
            max="60"
            step="1"
            value={config.playerAttack}
            onChange={(e) => updateField('playerAttack', Number(e.target.value))}
            className="w-full h-3 bg-[#EADBC8] rounded-full appearance-none cursor-pointer accent-[#FF8C42]"
          />
          <div className="flex justify-between text-xs sm:text-sm text-[#8A7A6D] mt-1.5 font-bold">
            <span>5 轻击</span>
            <span>20 强力</span>
            <span>60 毁灭</span>
          </div>
        </div>
      </motion.div>

      {/* 2. Supply Backpack Configuration Card */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-full bg-[#FFFBF2] rounded-2xl border-4 border-[#EEDCC4] shadow-hard-card p-4 sm:p-5 mb-5"
      >
        {/* Card Header & Total Counter */}
        <div className="flex items-center justify-between border-b border-[#EEDCC4]/60 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFE4D6] border border-[#FFD2BC] flex items-center justify-center text-lg">
              🎒
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#4A3323] flex items-center gap-1.5">
                <span>随身补给行囊</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-[#8A7A6D] font-bold">
                默认均为 0，按需自选，使用次数不设限！
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block text-xs sm:text-sm font-black text-[#56C93F] bg-[#E8F8E3] px-2.5 py-1 rounded-full border border-[#C5EEBA]">
              共携带: {totalSuppliesCount} 件
            </span>
          </div>
        </div>

        {/* Quick presets buttons */}
        <div className="flex items-center gap-1.5 mb-3.5 flex-wrap">
          <button
            type="button"
            onClick={handleResetAllToZero}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#F2ECE4] hover:bg-[#E5DACD] text-[#8A7A6D] border border-[#D9CABE] flex items-center gap-1 cursor-pointer active:translate-y-[1px] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            全部清零
          </button>
          <button
            type="button"
            onClick={handleBeginnerPack}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#EAF5FC] hover:bg-[#D4EBF9] text-[#2B79A2] border border-[#BCE1F5] flex items-center gap-1 cursor-pointer active:translate-y-[1px] transition-colors"
          >
            + 基础干粮包 (前3样+1)
          </button>
          <button
            type="button"
            onClick={handleAllPlusOne}
            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[#FEF3E8] hover:bg-[#FCE3CC] text-[#D96B27] border border-[#FAD2B0] flex items-center gap-1 cursor-pointer active:translate-y-[1px] transition-colors"
          >
            + 全套备齐 (各+1)
          </button>
        </div>

        {/* 9 Supply Items Grid */}
        <div className="space-y-2">
          {SUPPLY_ITEMS.map((item) => {
            const count = inventory[item.id] || 0;

            return (
              <div
                key={item.id}
                className={`
                  flex items-center justify-between p-2.5 rounded-xl border transition-all
                  ${
                    count > 0
                      ? 'bg-[#FFF9EE] border-[#FF8C42]/50 shadow-xs'
                      : 'bg-[#F9F4EC] border-[#EADBC8]/70 hover:border-[#DECABE]'
                  }
                `}
              >
                {/* Item Avatar & Name & Heal amount */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-xl border shadow-xs shrink-0"
                    style={{
                      backgroundColor: `${item.color}15`,
                      borderColor: `${item.color}40`,
                    }}
                  >
                    {item.icon}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-cartoon font-black text-sm text-[#4A3323]">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-black text-[#56C93F] bg-[#E8F8E3] px-1.5 py-0.2 rounded-full border border-[#C5EEBA] whitespace-nowrap">
                        +{item.healAmount} HP
                      </span>
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-[#8A7A6D] line-clamp-1">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Stepper & Direct Input */}
                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <button
                    type="button"
                    onClick={() => updateItemCount(item.id, count - 1)}
                    disabled={count <= 0}
                    className={`
                      w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black border transition-all cursor-pointer
                      ${
                        count <= 0
                          ? 'bg-[#EAE4DC] text-[#B8ACA0] border-[#DFD6CB] cursor-not-allowed opacity-50'
                          : 'bg-[#EADBC8] text-[#4A3323] border-[#DECABE] hover:bg-[#DECABE] active:translate-y-[1px]'
                      }
                    `}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={count}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      updateItemCount(item.id, isNaN(val) ? 0 : val);
                    }}
                    className={`
                      w-10 h-7 text-center font-black text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#FF8C42]
                      ${
                        count > 0
                          ? 'bg-white text-[#FF8C42] border-[#FF8C42] font-cartoon text-base'
                          : 'bg-[#F2ECE4] text-[#8A7A6D] border-[#DECABE]'
                      }
                    `}
                  />

                  <button
                    type="button"
                    onClick={() => updateItemCount(item.id, count + 1)}
                    disabled={count >= 99}
                    className="w-7 h-7 rounded-lg bg-[#EADBC8] text-[#4A3323] border border-[#DECABE] hover:bg-[#DECABE] active:translate-y-[1px] flex items-center justify-center text-sm font-black transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 3. Collapsible Advanced Settings */}
      <div className="w-full bg-[#FFFBF2] rounded-2xl border-4 border-[#EEDCC4] shadow-hard-card p-4 sm:p-5 mb-6">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full flex items-center justify-between text-sm sm:text-base font-extrabold text-[#8A7A6D] hover:text-[#4A3323] transition-colors py-1 cursor-pointer"
        >
          <span>高级对决规则 (BOSS浮动 / 半血揭示阈值)</span>
          {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-4 bg-[#F9F2E7] p-3.5 rounded-xl border border-[#EEDCC4]"
          >
            {/* BOSS Damage Fluctuation */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#4A3323] mb-1">
                <span>BOSS 攻击浮动区间</span>
                <span className="font-extrabold text-[#FF8C42]">
                  ±{Math.round(config.bossFluctuation * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.3"
                step="0.05"
                value={config.bossFluctuation}
                onChange={(e) => updateField('bossFluctuation', Number(e.target.value))}
                className="w-full h-2 bg-[#EADBC8] rounded-full appearance-none accent-[#FF8C42] cursor-pointer"
              />
            </div>

            {/* Half HP Threshold */}
            <div>
              <div className="flex justify-between text-xs font-bold text-[#4A3323] mb-1">
                <span>半血揭示触发阈值</span>
                <span className="font-extrabold text-[#E8432E]">
                  ≤{Math.round(config.halfHpThreshold * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="0.6"
                step="0.05"
                value={config.halfHpThreshold}
                onChange={(e) => updateField('halfHpThreshold', Number(e.target.value))}
                className="w-full h-2 bg-[#EADBC8] rounded-full appearance-none accent-[#E8432E] cursor-pointer"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* CTA Start Adventure */}
      <div className="w-full">
        <Button
          variant="primary"
          size="lg"
          fullWidth
          icon={<Swords className="w-5 h-5" />}
          onClick={onStart}
        >
          开始冒险 ⚔️
        </Button>
      </div>
    </div>
  );
};
