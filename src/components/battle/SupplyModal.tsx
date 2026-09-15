import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SupplyItem } from '../../types';
import { SUPPLY_ITEMS, getTotalSuppliesCount } from '../../data/supplies';
import { Button } from '../common/Button';
import { sound } from '../../sound';
import { X, Heart, AlertCircle, Sparkles, PackageOpen } from 'lucide-react';

interface SupplyModalProps {
  isOpen: boolean;
  inventory: Record<string, number>;
  playerCurrentHP: number;
  playerMaxHP: number;
  isBusy?: boolean;
  onSelect: (item: SupplyItem) => void;
  onClose: () => void;
}

export const SupplyModal: React.FC<SupplyModalProps> = ({
  isOpen,
  inventory,
  playerCurrentHP,
  playerMaxHP,
  isBusy = false,
  onSelect,
  onClose,
}) => {
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  if (!isOpen) return null;

  const isFullHP = playerCurrentHP >= playerMaxHP;
  const totalAvailable = getTotalSuppliesCount(inventory);

  const handleSelectItem = (item: SupplyItem) => {
    const count = inventory[item.id] || 0;
    if (isBusy || count <= 0 || isFullHP) {
      sound.playButton();
      return;
    }
    sound.playButton();
    onSelect(item);
  };

  const handleClose = () => {
    sound.playButton();
    onClose();
  };

  const hoveredItem = hoveredItemId
    ? SUPPLY_ITEMS.find((i) => i.id === hoveredItemId)
    : null;

  const previewHP = hoveredItem
    ? Math.min(playerMaxHP, playerCurrentHP + hoveredItem.healAmount)
    : playerCurrentHP;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-[2px]">
        {/* Click backdrop to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 10 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="relative w-full max-w-lg max-h-[90vh] flex flex-col bg-[#FFFBF2] rounded-3xl border-4 border-[#EEDCC4] shadow-hard-card p-4 sm:p-6 z-10 select-none overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-[#EEDCC4]/70 pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FFE4D6] border-2 border-[#FFD2BC] flex items-center justify-center text-2xl shadow-inner">
                🍱
              </div>
              <div>
                <h3 className="text-xl font-black text-[#4A3323] tracking-tight flex items-center gap-2">
                  <span>选择补给物品</span>
                  <span className="text-xs font-extrabold bg-[#4FB6E8]/15 text-[#2B79A2] px-2 py-0.5 rounded-full">
                    余 {totalAvailable} 件
                  </span>
                </h3>
                <p className="text-xs text-[#8A7A6D] font-bold">
                  无使用次数限制，直到背包耗尽！
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 rounded-full bg-[#EADBC8] text-[#4A3323] hover:bg-[#DECABE] active:translate-y-[1px] transition-colors cursor-pointer"
              title="关闭"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Health Overview & Dynamic Recovery Preview */}
          <div className="bg-[#F9F2E7] rounded-2xl p-3 border-2 border-[#EEDCC4] mb-3 shrink-0">
            <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold text-[#4A3323] mb-1.5">
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-[#FF6B6B] fill-[#FF6B6B]" />
                勇士当前生命值
              </span>
              <span className="font-cartoon">
                <span className="text-[#FF6B6B]">{playerCurrentHP}</span>
                <span className="text-[#8A7A6D]"> / {playerMaxHP} HP</span>
                {hoveredItem && (inventory[hoveredItem.id] || 0) > 0 && !isFullHP && (
                  <span className="ml-2 text-[#56C93F] font-black animate-pulse">
                    ➔ 回复至 {previewHP}
                  </span>
                )}
              </span>
            </div>

            {/* Health Bar with preview extension */}
            <div className="w-full h-3 bg-[#EADBC8] rounded-full overflow-hidden relative border border-[#E0CCA9]">
              <div
                className="h-full bg-[#56C93F] transition-all duration-300 rounded-full"
                style={{
                  width: `${Math.min(100, Math.round((playerCurrentHP / playerMaxHP) * 100))}%`,
                }}
              />
              {hoveredItem && (inventory[hoveredItem.id] || 0) > 0 && !isFullHP && (
                <div
                  className="h-full bg-[#99E585]/70 absolute top-0 rounded-full transition-all duration-300"
                  style={{
                    left: `${Math.min(100, Math.round((playerCurrentHP / playerMaxHP) * 100))}%`,
                    width: `${Math.min(
                      100 - Math.round((playerCurrentHP / playerMaxHP) * 100),
                      Math.round((hoveredItem.healAmount / playerMaxHP) * 100)
                    )}%`,
                  }}
                />
              )}
            </div>

            {isFullHP && (
              <div className="flex items-center gap-1 text-[11px] text-[#FF8C42] font-black mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>当前生命值已满，无需使用补给品！</span>
              </div>
            )}
          </div>

          {/* Supply Items Scrollable List */}
          <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-2 mb-3 min-h-[140px] custom-scrollbar">
            {totalAvailable === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-[#8A7A6D]">
                <PackageOpen className="w-12 h-12 text-[#C5B4A3] mb-2" />
                <p className="font-extrabold text-base text-[#4A3323]">行囊空空如也</p>
                <p className="text-xs mt-1 text-[#8A7A6D]">
                  在开始游戏前的属性设置中添加补给物资后再来吧！
                </p>
              </div>
            ) : (
              SUPPLY_ITEMS.map((item) => {
                const count = inventory[item.id] || 0;
                const isAvailable = count > 0 && !isFullHP && !isBusy;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredItemId(item.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                    onClick={() => isAvailable && handleSelectItem(item)}
                    className={`
                      w-full flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border-2 transition-all
                      ${
                        count <= 0
                          ? 'bg-[#F2ECE4]/60 border-[#E5DACD] opacity-45 cursor-not-allowed'
                          : isFullHP
                          ? 'bg-[#FFFBF2] border-[#EEDCC4] opacity-75 cursor-not-allowed'
                          : 'bg-[#FFFBF2] border-[#EEDCC4] hover:border-[#FF8C42] hover:shadow-sm active:translate-y-[1px] cursor-pointer'
                      }
                    `}
                  >
                    {/* Left: Icon & Info */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center text-2xl border-2 shadow-xs shrink-0"
                        style={{
                          backgroundColor: `${item.color}15`,
                          borderColor: `${item.color}35`,
                        }}
                      >
                        {item.icon}
                      </div>

                      <div className="text-left min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-cartoon font-black text-sm sm:text-base text-[#4A3323]">
                            {item.name}
                          </span>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.2 rounded-md shrink-0"
                            style={{
                              backgroundColor: `${item.color}20`,
                              color: item.color,
                            }}
                          >
                            {item.badge}
                          </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-[#8A7A6D] line-clamp-1 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    {/* Right: Heal amount & Count */}
                    <div className="flex flex-col items-end shrink-0 pl-2">
                      <span className="text-xs sm:text-sm font-black text-[#56C93F] bg-[#E8F8E3] px-2 py-0.5 rounded-full border border-[#C5EEBA] whitespace-nowrap">
                        +{item.healAmount} HP
                      </span>

                      <span
                        className={`text-xs font-black mt-1 ${
                          count > 0 ? 'text-[#4A3323]' : 'text-[#A09388]'
                        }`}
                      >
                        {count > 0 ? `剩余: x${count}` : '已耗尽'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom Close Button */}
          <div className="w-full shrink-0 pt-1">
            <Button
              variant="weak"
              size="md"
              fullWidth
              onClick={handleClose}
            >
              返回战场
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
