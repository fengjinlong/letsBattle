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
  Volume2,
  VolumeX,
  Shield,
  RotateCcw,
  Plus,
  Minus,
  Zap,
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
                onClick={() => updateField('playerHP', Math.max(100, config.playerHP - 50))}
                className="w-8 h-8 rounded-full bg-[#EADBC8] text-[#4A3323] font-black text-base flex items-center justify-center hover:bg-[#DECABE] active:translate-y-[1px] shadow-sm cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min="100"
                max="10000"
                value={config.playerHP}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateField('playerHP', isNaN(val) ? 100 : Math.max(10, Math.min(10000, val)));
                }}
                className="w-16 text-center font-extrabold text-lg text-[#4A3323] bg-[#F2ECE4] rounded-lg border border-[#DECABE] py-0.5 focus:outline-none focus:ring-2 focus:ring-[#4FB6E8]"
              />
              <button
                type="button"
                onClick={() => updateField('playerHP', Math.min(10000, config.playerHP + 50))}
                className="w-8 h-8 rounded-full bg-[#EADBC8] text-[#4A3323] font-black text-base flex items-center justify-center hover:bg-[#DECABE] active:translate-y-[1px] shadow-sm cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
          <input
            type="range"
            min="100"
            max="5000"
            step="50"
            value={Math.min(5000, config.playerHP)}
            onChange={(e) => updateField('playerHP', Number(e.target.value))}
            className="w-full h-3 bg-[#EADBC8] rounded-full appearance-none cursor-pointer accent-[#4FB6E8]"
          />
          <div className="flex justify-between text-xs sm:text-sm text-[#8A7A6D] mt-1.5 font-bold">
            <span>100 挑战</span>
            <span>500 平衡</span>
            <span>5000 泰坦</span>
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
                onClick={() => updateField('playerAttack', Math.max(10, config.playerAttack - 10))}
                className="w-8 h-8 rounded-full bg-[#EADBC8] text-[#4A3323] font-black text-base flex items-center justify-center hover:bg-[#DECABE] active:translate-y-[1px] shadow-sm cursor-pointer"
              >
                -
              </button>
              <input
                type="number"
                min="10"
                max="2000"
                value={config.playerAttack}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  updateField('playerAttack', isNaN(val) ? 10 : Math.max(1, Math.min(2000, val)));
                }}
                className="w-16 text-center font-extrabold text-lg text-[#4A3323] bg-[#F2ECE4] rounded-lg border border-[#DECABE] py-0.5 focus:outline-none focus:ring-2 focus:ring-[#FF8C42]"
              />
              <button
                type="button"
                onClick={() => updateField('playerAttack', Math.min(2000, config.playerAttack + 10))}
                className="w-8 h-8 rounded-full bg-[#EADBC8] text-[#4A3323] font-black text-base flex items-center justify-center hover:bg-[#DECABE] active:translate-y-[1px] shadow-sm cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={Math.min(1000, config.playerAttack)}
            onChange={(e) => updateField('playerAttack', Number(e.target.value))}
            className="w-full h-3 bg-[#EADBC8] rounded-full appearance-none cursor-pointer accent-[#FF8C42]"
          />
          <div className="flex justify-between text-xs sm:text-sm text-[#8A7A6D] mt-1.5 font-bold">
            <span>10 试炼</span>
            <span>100 强攻</span>
            <span>1000 斩杀</span>
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
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#FFB300] fill-[#FFB300]" />
            <span>高级对决规则 (暴击几率 / 暴击增伤 / 浮动规则)</span>
          </div>
          {showAdvanced ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-4 bg-[#F9F2E7] p-3.5 rounded-xl border border-[#EEDCC4]"
          >
            {/* 1. Player Critical Strike Chance */}
            <div className="bg-white/80 p-3 rounded-xl border border-[#EEDCC4]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs sm:text-sm font-extrabold text-[#4A3323] flex items-center gap-1.5">
                  <span className="text-base">💥</span>
                  <span>玩家暴击几率</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        'playerCritChance',
                        Math.max(0, Number(((config.playerCritChance ?? 0.2) - 0.05).toFixed(2)))
                      )
                    }
                    className="w-6 h-6 rounded bg-[#EADBC8] text-[#4A3323] font-black text-xs flex items-center justify-center hover:bg-[#DECABE] cursor-pointer"
                  >
                    -
                  </button>
                  <span className="min-w-[52px] text-center font-black text-sm text-[#FF2D55] bg-[#FFEAEF] px-1.5 py-0.5 rounded-md border border-[#FFD0DB]">
                    {Math.round((config.playerCritChance ?? 0.2) * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        'playerCritChance',
                        Math.min(1.0, Number(((config.playerCritChance ?? 0.2) + 0.05).toFixed(2)))
                      )
                    }
                    className="w-6 h-6 rounded bg-[#EADBC8] text-[#4A3323] font-black text-xs flex items-center justify-center hover:bg-[#DECABE] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="1.0"
                step="0.05"
                value={config.playerCritChance ?? 0.2}
                onChange={(e) => updateField('playerCritChance', Number(e.target.value))}
                className="w-full h-2 bg-[#EADBC8] rounded-full appearance-none accent-[#FF2D55] cursor-pointer"
              />

              {/* Quick presets for crit chance */}
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#F2ECE4]">
                <span className="text-[11px] text-[#8A7A6D] font-bold">快捷预设:</span>
                <div className="flex gap-1">
                  {[
                    { label: '0% 关闭', value: 0 },
                    { label: '20% 标准', value: 0.2 },
                    { label: '50% 强力', value: 0.5 },
                    { label: '100% 必爆', value: 1.0 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => updateField('playerCritChance', preset.value)}
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                        Math.round((config.playerCritChance ?? 0.2) * 100) === Math.round(preset.value * 100)
                          ? 'bg-[#FF2D55] text-white shadow-xs'
                          : 'bg-[#EADBC8]/70 text-[#4A3323] hover:bg-[#EADBC8]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Critical Strike Attack Bonus (+200% default) */}
            <div className="bg-white/80 p-3 rounded-xl border border-[#EEDCC4]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs sm:text-sm font-extrabold text-[#4A3323] flex items-center gap-1.5">
                  <span className="text-base">⚡</span>
                  <span>暴击攻击力增加</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        'playerCritBonus',
                        Math.max(0.2, Number(((config.playerCritBonus ?? 2.0) - 0.25).toFixed(2)))
                      )
                    }
                    className="w-6 h-6 rounded bg-[#EADBC8] text-[#4A3323] font-black text-xs flex items-center justify-center hover:bg-[#DECABE] cursor-pointer"
                  >
                    -
                  </button>
                  <span className="min-w-[64px] text-center font-black text-sm text-[#FF8C42] bg-[#FFF2E6] px-1.5 py-0.5 rounded-md border border-[#FFD9B3]">
                    +{Math.round((config.playerCritBonus ?? 2.0) * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateField(
                        'playerCritBonus',
                        Math.min(5.0, Number(((config.playerCritBonus ?? 2.0) + 0.25).toFixed(2)))
                      )
                    }
                    className="w-6 h-6 rounded bg-[#EADBC8] text-[#4A3323] font-black text-xs flex items-center justify-center hover:bg-[#DECABE] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="0.5"
                max="5.0"
                step="0.25"
                value={config.playerCritBonus ?? 2.0}
                onChange={(e) => updateField('playerCritBonus', Number(e.target.value))}
                className="w-full h-2 bg-[#EADBC8] rounded-full appearance-none accent-[#FF8C42] cursor-pointer"
              />

              {/* Dynamic Damage Calculation Preview */}
              <div className="mt-2 bg-[#FFF9EE] px-2.5 py-1.5 rounded-lg border border-[#FFE7BA] text-xs font-bold text-[#8A7A6D] flex items-center justify-between">
                <span>暴击输出预览:</span>
                <span className="font-extrabold text-[#4A3323]">
                  基础 {config.playerAttack} ➔{' '}
                  <span className="text-[#FF2D55] font-black">
                    {Math.round(config.playerAttack * (1 + (config.playerCritBonus ?? 2.0)))}
                  </span>{' '}
                  <span className="text-[11px] text-[#8A7A6D]">
                    ({Math.round((1 + (config.playerCritBonus ?? 2.0)) * 100)}% 伤害)
                  </span>
                </span>
              </div>

              {/* Quick presets for crit bonus */}
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#F2ECE4]">
                <span className="text-[11px] text-[#8A7A6D] font-bold">加成预设:</span>
                <div className="flex gap-1">
                  {[
                    { label: '+100%', value: 1.0 },
                    { label: '+200% 默认', value: 2.0 },
                    { label: '+300%', value: 3.0 },
                    { label: '+500% 毁灭', value: 5.0 },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => updateField('playerCritBonus', preset.value)}
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded transition-colors cursor-pointer ${
                        Math.round((config.playerCritBonus ?? 2.0) * 100) === Math.round(preset.value * 100)
                          ? 'bg-[#FF8C42] text-white shadow-xs'
                          : 'bg-[#EADBC8]/70 text-[#4A3323] hover:bg-[#EADBC8]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. BOSS Damage Fluctuation */}
            <div className="bg-white/80 p-3 rounded-xl border border-[#EEDCC4]">
              <div className="flex justify-between text-xs font-bold text-[#4A3323] mb-1">
                <span>BOSS 攻击浮动区间</span>
                <span className="font-extrabold text-[#FF8C42]">
                  ±{Math.round(config.bossFluctuation * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={config.bossFluctuation}
                onChange={(e) => updateField('bossFluctuation', Number(e.target.value))}
                className="w-full h-2 bg-[#EADBC8] rounded-full appearance-none accent-[#FF8C42] cursor-pointer"
              />
            </div>

            {/* 4. Half HP Threshold */}
            <div className="bg-white/80 p-3 rounded-xl border border-[#EEDCC4]">
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
