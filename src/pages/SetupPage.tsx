import React, { useState } from 'react';
import { motion } from 'motion/react';
import { GameConfig } from '../types';
import { Button } from '../components/common/Button';
import { ChevronDown, ChevronUp, Swords, Heart, Sparkles, Volume2, VolumeX, Shield } from 'lucide-react';
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

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-6 sm:py-10 flex flex-col items-center">
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
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 bg-[#FFFBF2] px-4 py-1 rounded-full border-2 border-[#EEDCC4] shadow-sm text-xs font-bold text-[#FF8C42] mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>卡通扁平风 · 回合对决</span>
        </div>
        <h1
          className="text-4xl sm:text-5xl font-black tracking-tight text-[#4A3323]"
          style={{
            textShadow: '0 4px 0 #FFF, 0 -2px 0 #FFF, 2px 0 0 #FFF, -2px 0 0 #FFF, 0 8px 12px rgba(214,98,23,0.18)',
          }}
        >
          阳光竞技场
        </h1>
        <p className="text-sm sm:text-base text-[#8A7A6D] mt-1 font-semibold">
          配置勇士数值，抽取未知魔物，开启对决！
        </p>
      </motion.div>

      {/* Main Settings Card */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full bg-[#FFFBF2] rounded-2xl border-4 border-[#EEDCC4] shadow-hard-card p-5 sm:p-6 mb-6"
      >
        <h2 className="text-lg font-bold text-[#4A3323] mb-4 flex items-center gap-2 border-b border-[#EEDCC4]/60 pb-2">
          <Shield className="w-5 h-5 text-[#4FB6E8]" />
          勇士属性设定
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
          <div className="flex justify-between text-[11px] text-[#8A7A6D] mt-1 font-semibold">
            <span>50 脆弱</span>
            <span>100 标准</span>
            <span>300 泰坦</span>
          </div>
        </div>

        {/* Player Attack (Slider + Stepper) */}
        <div className="mb-5">
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
          <div className="flex justify-between text-[11px] text-[#8A7A6D] mt-1 font-semibold">
            <span>5 轻击</span>
            <span>20 强力</span>
            <span>60 毁灭</span>
          </div>
        </div>

        {/* Collapsible Advanced Settings */}
        <div className="mt-4 pt-3 border-t border-[#EEDCC4]/60">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-xs sm:text-sm font-bold text-[#8A7A6D] hover:text-[#4A3323] transition-colors py-1 cursor-pointer"
          >
            <span>高级规则调整 (BOSS浮动 / 补给限制 / 揭露阈值)</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 space-y-4 bg-[#F9F2E7] p-4 rounded-xl border border-[#EEDCC4]"
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
                  className="w-full h-2 bg-[#EADBC8] rounded-full appearance-none accent-[#FF8C42]"
                />
              </div>

              {/* Max Supplies */}
              <div>
                <div className="flex justify-between text-xs font-bold text-[#4A3323] mb-1">
                  <span>最大补给次数</span>
                  <span className="font-extrabold text-[#4FB6E8]">{config.maxSupplies} 次</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={config.maxSupplies}
                  onChange={(e) => updateField('maxSupplies', Number(e.target.value))}
                  className="w-full h-2 bg-[#EADBC8] rounded-full appearance-none accent-[#4FB6E8]"
                />
              </div>

              {/* Supply Heal Amount */}
              <div>
                <div className="flex justify-between text-xs font-bold text-[#4A3323] mb-1">
                  <span>单次补给回血量</span>
                  <span className="font-extrabold text-[#56C93F]">+{config.supplyHealAmount} HP</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={config.supplyHealAmount}
                  onChange={(e) => updateField('supplyHealAmount', Number(e.target.value))}
                  className="w-full h-2 bg-[#EADBC8] rounded-full appearance-none accent-[#56C93F]"
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
                  className="w-full h-2 bg-[#EADBC8] rounded-full appearance-none accent-[#E8432E]"
                />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

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
