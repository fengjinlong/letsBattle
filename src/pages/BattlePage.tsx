import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GameConfig,
  PlayerState,
  BossState,
  BattleStats,
  FloatingDamage,
  RevealState,
  BattleResult,
} from '../types';
import { Button } from '../components/common/Button';
import { HealthBar } from '../components/common/HealthBar';
import { Avatar, AvatarActionState } from '../components/common/Avatar';
import { ImpactEffect } from '../components/battle/ImpactEffect';
import { DamageFloat } from '../components/battle/DamageFloat';
import { HealParticles } from '../components/battle/HealParticles';
import { RevealPanel } from '../components/battle/RevealPanel';
import { SupplyModal } from '../components/battle/SupplyModal';
import { SupplyItem } from '../types';
import { getTotalSuppliesCount } from '../data/supplies';
import { sound } from '../sound';
import { Swords, HeartPulse, LogOut, ShieldAlert, Volume2, VolumeX } from 'lucide-react';

interface BattlePageProps {
  config: GameConfig;
  initialPlayer: PlayerState;
  boss: BossState;
  onFinishBattle: (stats: BattleStats) => void;
}

export const BattlePage: React.FC<BattlePageProps> = ({
  config,
  initialPlayer,
  boss,
  onFinishBattle,
}) => {
  // Battle state
  const [player, setPlayer] = useState<PlayerState>(initialPlayer);
  const [currentBoss, setCurrentBoss] = useState<BossState>(boss);
  const [rounds, setRounds] = useState(1);
  const [totalDamageDealt, setTotalDamageDealt] = useState(0);
  const [totalDamageTaken, setTotalDamageTaken] = useState(0);
  const [suppliesUsed, setSuppliesUsed] = useState(0);
  const [suppliesUsedDetails, setSuppliesUsedDetails] = useState<Record<string, number>>({});
  const [critCount, setCritCount] = useState(0);

  // Animation & UI states
  const [isBusy, setIsBusy] = useState(false); // Disable actions during turn
  const [screenShake, setScreenShake] = useState<'none' | 'mild' | 'strong'>('none');
  const [playerAction, setPlayerAction] = useState<AvatarActionState>('idle');
  const [bossAction, setBossAction] = useState<AvatarActionState>('idle');
  const [impactEffect, setImpactEffect] = useState<{ show: boolean; color: string; isCrit?: boolean } | null>(null);
  const [critBanner, setCritBanner] = useState<{ show: boolean; damage: number } | null>(null);
  const [showHealSwirl, setShowHealSwirl] = useState(false);
  const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([]);
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  // Health bar visual feedback
  const [bossIsHit, setBossIsHit] = useState(false);
  const [playerIsHit, setPlayerIsHit] = useState(false);
  const [playerIsHealed, setPlayerIsHealed] = useState(false);

  // Supply Selection Modal state
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);

  // Half-HP Reveal State
  const [revealsCount, setRevealsCount] = useState(0);
  const [hasFirstRevealed, setHasFirstRevealed] = useState(false);
  const [lastRevealedPlayerPercent, setLastRevealedPlayerPercent] = useState(100);
  const [lastRevealedBossPercent, setLastRevealedBossPercent] = useState(100);

  const hasFirstRevealedRef = useRef(false);
  const revealsCountRef = useRef(0);
  const lastRevealedPlayerPercentRef = useRef(100);
  const lastRevealedBossPercentRef = useRef(100);

  const [revealPanel, setRevealPanel] = useState<RevealState>({
    isOpen: false,
    count: 1,
    maxCount: 1 + config.maxExtraReveals,
    playerPercent: 100,
    bossPercent: 100,
    playerCurrentHP: initialPlayer.currentHP,
    playerMaxHP: initialPlayer.maxHP,
    bossCurrentHP: boss.currentHP,
    bossMaxHP: boss.maxHP,
  });

  // Track latest references for async timeouts
  const playerRef = useRef(player);
  playerRef.current = player;
  const bossRef = useRef(currentBoss);
  bossRef.current = currentBoss;
  const isBusyRef = useRef(isBusy);
  isBusyRef.current = isBusy;

  // Add floating damage popup
  const addFloatingDamage = (item: Omit<FloatingDamage, 'id'>) => {
    const id = `${Date.now()}-${Math.random()}`;
    setFloatingDamages((prev) => [...prev, { ...item, id }]);
  };

  const removeFloatingDamage = (id: string) => {
    setFloatingDamages((prev) => prev.filter((d) => d.id !== id));
  };

  // Helper: Trigger screen shake
  const triggerShake = (intensity: 'mild' | 'strong') => {
    setScreenShake(intensity);
    setTimeout(() => setScreenShake('none'), 300);
  };

  // Reveal check logic: Only called when checking if player should be presented with choices
  const checkRevealNeeded = useCallback(
    (nextPlayerHP: number, nextBossHP: number): boolean => {
      const pPercent = Math.round((nextPlayerHP / playerRef.current.maxHP) * 100);
      const bPercent = Math.round((nextBossHP / bossRef.current.maxHP) * 100);
      const thresholdPercent = Math.round(config.halfHpThreshold * 100);

      // Condition 1: First time either party <= halfHpThreshold
      if (!hasFirstRevealedRef.current) {
        if (pPercent <= thresholdPercent || bPercent <= thresholdPercent) {
          hasFirstRevealedRef.current = true;
          revealsCountRef.current = 1;
          lastRevealedPlayerPercentRef.current = pPercent;
          lastRevealedBossPercentRef.current = bPercent;

          setHasFirstRevealed(true);
          setRevealsCount(1);
          setLastRevealedPlayerPercent(pPercent);
          setLastRevealedBossPercent(bPercent);

          setRevealPanel({
            isOpen: true,
            count: 1,
            maxCount: 1 + config.maxExtraReveals,
            playerPercent: pPercent,
            bossPercent: bPercent,
            playerCurrentHP: nextPlayerHP,
            playerMaxHP: playerRef.current.maxHP,
            bossCurrentHP: nextBossHP,
            bossMaxHP: bossRef.current.maxHP,
          });
          return true;
        }
      } else {
        // Condition 2: Subsequent rounds if either % dropped further and revealsCount < maxCount
        const maxTotalReveals = 1 + config.maxExtraReveals;
        if (revealsCountRef.current < maxTotalReveals) {
          if (
            pPercent < lastRevealedPlayerPercentRef.current ||
            bPercent < lastRevealedBossPercentRef.current
          ) {
            const nextCount = revealsCountRef.current + 1;
            revealsCountRef.current = nextCount;
            lastRevealedPlayerPercentRef.current = pPercent;
            lastRevealedBossPercentRef.current = bPercent;

            setRevealsCount(nextCount);
            setLastRevealedPlayerPercent(pPercent);
            setLastRevealedBossPercent(bPercent);

            setRevealPanel({
              isOpen: true,
              count: nextCount,
              maxCount: maxTotalReveals,
              playerPercent: pPercent,
              bossPercent: bPercent,
              playerCurrentHP: nextPlayerHP,
              playerMaxHP: playerRef.current.maxHP,
              bossCurrentHP: nextBossHP,
              bossMaxHP: bossRef.current.maxHP,
            });
            return true;
          }
        }
      }
      return false;
    },
    [config]
  );

  // Finish match handler
  const handleEndBattle = useCallback(
    (result: BattleResult) => {
      setIsBusy(true);
      if (result === 'victory') {
        sound.playVictory();
        setBossAction('defeated');
        setPlayerAction('celebrating');
      } else if (result === 'defeat') {
        sound.playDefeat();
        setPlayerAction('defeated');
      } else if (result === 'flee') {
        sound.playDefeat();
        setPlayerAction('fleeing');
      }

      setTimeout(() => {
        onFinishBattle({
          rounds,
          totalDamageDealt,
          totalDamageTaken,
          suppliesUsed,
          suppliesUsedDetails,
          result,
          bossName: currentBoss.preset.name,
          bossTier: currentBoss.preset.tier,
          critCount,
        });
      }, 950);
    },
    [rounds, totalDamageDealt, totalDamageTaken, suppliesUsed, suppliesUsedDetails, currentBoss, critCount, onFinishBattle]
  );

  // BOSS counter attack timeline
  const executeBossTurn = useCallback(() => {
    // Check if boss already dead
    if (bossRef.current.currentHP <= 0) return;

    // Boss charge (10% scale up)
    setBossAction('charging');

    setTimeout(() => {
      // Boss dash toward player
      setBossAction('dashing');
      sound.playDash();

      setTimeout(() => {
        // Impact hit on player
        const baseAtk = bossRef.current.attack;
        const fluc = config.bossFluctuation;
        const multiplier = 1 + (Math.random() * 2 * fluc - fluc);
        const actualDmg = Math.max(1, Math.round(baseAtk * multiplier));

        setPlayerAction('hit');
        setPlayerIsHit(true);
        triggerShake('mild');
        sound.playHit(false);
        setImpactEffect({ show: true, color: '#FF6B6B' });

        const nextPlayerHP = Math.max(0, playerRef.current.currentHP - actualDmg);
        setPlayer((prev) => ({ ...prev, currentHP: nextPlayerHP }));
        setTotalDamageTaken((prev) => prev + actualDmg);

        addFloatingDamage({
          target: 'player',
          amount: actualDmg,
          type: 'damage',
          color: '#4FB6E8', // Blue floating damage for player受击 as instructed!
        });

        setTimeout(() => {
          setPlayerIsHit(false);
          setBossAction('idle');
          setPlayerAction('idle');
          setRounds((r) => r + 1);

          // Check if player died
          if (nextPlayerHP <= 0) {
            handleEndBattle('defeat');
            return;
          }

          // Check reveal after full round
          checkRevealNeeded(nextPlayerHP, bossRef.current.currentHP);
          setIsBusy(false);
        }, 400);
      }, 200);
    }, 250);
  }, [config, checkRevealNeeded, handleEndBattle]);

  // Player attack action timeline (~900ms)
  const handleAttack = () => {
    if (isBusy || player.currentHP <= 0 || currentBoss.currentHP <= 0) return;

    // Close reveal panel if it was open
    if (revealPanel.isOpen) {
      setRevealPanel((prev) => ({ ...prev, isOpen: false }));
    }

    setIsBusy(true);

    // 150ms: Charge up
    setPlayerAction('charging');

    setTimeout(() => {
      // 350-500ms: Dash forward
      setPlayerAction('dashing');
      sound.playDash();

      setTimeout(() => {
        // 500-550ms: Hit impact
        const baseAttack = playerRef.current.attack;
        const critChance = config.playerCritChance ?? 0.2;
        const critBonus = config.playerCritBonus ?? 2.0;
        const isCrit = Math.random() < critChance;
        const dmg = isCrit ? Math.round(baseAttack * (1 + critBonus)) : baseAttack;

        setBossAction('hit');
        setBossIsHit(true);
        triggerShake(isCrit ? 'strong' : 'mild');
        sound.playHit(true);
        setImpactEffect({ show: true, color: isCrit ? '#FF1E44' : '#FF8C42', isCrit });

        const nextBossHP = Math.max(0, bossRef.current.currentHP - dmg);
        setCurrentBoss((prev) => ({ ...prev, currentHP: nextBossHP }));
        setTotalDamageDealt((prev) => prev + dmg);
        if (isCrit) {
          setCritCount((prev) => prev + 1);
          setCritBanner({ show: true, damage: dmg });
          setTimeout(() => {
            setCritBanner(null);
          }, 1600);
        }

        // 550-700ms: Floating damage on BOSS
        addFloatingDamage({
          target: 'boss',
          amount: dmg,
          type: isCrit ? 'crit' : 'damage',
          color: isCrit ? '#FF1E44' : '#FF6B6B',
          isCrit: isCrit,
        });

        setTimeout(() => {
          setBossIsHit(false);
          setPlayerAction('idle');
          setBossAction('idle');

          // Check if boss died
          if (nextBossHP <= 0) {
            handleEndBattle('victory');
            return;
          }

          // Note: If player's hit brings boss <= 50%, do NOT trigger reveal dialog here.
          // In turn-based sequence, BOSS MUST counter-attack next without dialog interruption.
          // The reveal dialog will be checked and presented to the player AFTER boss attacks!
          setTimeout(() => {
            executeBossTurn();
          }, isCrit ? 750 : 350);
        }, isCrit ? 550 : 350);
      }, 180);
    }, 200);
  };

  // Open supply selection modal
  const handleOpenSupplyModal = () => {
    if (isBusy || player.suppliesLeft <= 0 || player.currentHP <= 0) return;
    sound.playButton();
    setIsSupplyModalOpen(true);
  };

  // Player confirmed consuming a specific supply item
  const handleSelectSupplyItem = (item: SupplyItem) => {
    if (isBusy || player.currentHP <= 0) return;
    const currentInventory = player.inventory || {};
    const count = currentInventory[item.id] || 0;
    if (count <= 0) return;

    setIsSupplyModalOpen(false);
    if (revealPanel.isOpen) {
      setRevealPanel((prev) => ({ ...prev, isOpen: false }));
    }

    setIsBusy(true);
    sound.playHeal();
    setSuppliesUsed((prev) => prev + 1);
    setSuppliesUsedDetails((prev) => ({
      ...prev,
      [item.name]: (prev[item.name] || 0) + 1,
    }));

    const healAmount = item.healAmount;
    const nextHP = Math.min(player.maxHP, player.currentHP + healAmount);
    const actualHealed = nextHP - player.currentHP;

    const nextInventory = {
      ...currentInventory,
      [item.id]: Math.max(0, count - 1),
    };
    const nextSuppliesLeft = getTotalSuppliesCount(nextInventory);

    setPlayer((prev) => ({
      ...prev,
      currentHP: nextHP,
      suppliesLeft: nextSuppliesLeft,
      inventory: nextInventory,
    }));

    setPlayerAction('healing');
    setPlayerIsHealed(true);
    setShowHealSwirl(true);

    addFloatingDamage({
      target: 'player',
      amount: actualHealed,
      type: 'heal',
      color: '#56C93F',
    });

    setTimeout(() => {
      setShowHealSwirl(false);
      setPlayerIsHealed(false);
      setPlayerAction('idle');

      // Crucial: It is now BOSS's turn to attack! BOSS always attacks next.
      // Reveal will be evaluated after BOSS finishes attacking.
      setTimeout(() => {
        executeBossTurn();
      }, 350);
    }, 600);
  };

  // Player flee action
  const handleFlee = () => {
    if (isBusy || player.currentHP <= 0 || currentBoss.currentHP <= 0) return;
    if (revealPanel.isOpen) {
      setRevealPanel((prev) => ({ ...prev, isOpen: false }));
    }
    sound.playDash();
    handleEndBattle('flee');
  };

  const toggleMute = () => {
    sound.isMuted = !sound.isMuted;
    setIsMuted(sound.isMuted);
    if (!sound.isMuted) sound.playButton();
  };

  const playerPercent = Math.max(0, Math.min(100, Math.round((player.currentHP / player.maxHP) * 100)));
  const bossPercent = Math.max(0, Math.min(100, Math.round((currentBoss.currentHP / currentBoss.maxHP) * 100)));

  return (
    <div
      className={`
        w-full min-h-[100dvh] flex flex-col justify-between select-none relative overflow-hidden
        ${screenShake === 'mild' ? 'shake-mild' : screenShake === 'strong' ? 'shake-strong' : ''}
      `}
    >
      {/* Top Floating Status / Header Bar */}
      <div className="w-full max-w-4xl mx-auto px-4 pt-3 sm:pt-4 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <span className="font-cartoon text-sm sm:text-base font-black bg-[#FFFBF2] text-[#4A3323] px-3.5 py-1.5 rounded-full border-2 border-[#EEDCC4] shadow-sm">
            回合 {rounds}
          </span>
          <span className="font-cartoon text-xs sm:text-sm text-[#8A7A6D] hidden sm:inline-block bg-[#FFFBF2]/85 px-3 py-1 rounded-full border border-[#EEDCC4]">
            补给行囊: 余 {player.suppliesLeft} 件
          </span>
        </div>

        {/* BOSS Name & Mute Switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-full bg-[#FFFBF2] text-[#4A3323] border border-[#EEDCC4] shadow-sm active:translate-y-[1px] hover:bg-[#FDF6E7] cursor-pointer"
            title={isMuted ? '开启音效' : '静音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Responsive Battle Arena */}
      <div className="w-full max-w-4xl mx-auto px-4 flex-1 flex flex-col justify-between py-2 sm:py-6">
        {/* ===================== MOBILE LAYOUT (< 768px) ===================== */}
        <div className="flex md:hidden flex-col flex-1 justify-between gap-3">
          {/* Top Fixed Boss Health Bar */}
          <div className="bg-[#FFFBF2] p-3 rounded-2xl border-2 border-[#EEDCC4] shadow-hard-card">
            <HealthBar
              name={currentBoss.preset.name}
              currentHP={currentBoss.currentHP}
              maxHP={currentBoss.maxHP}
              color="#FF6B6B"
              avatar={currentBoss.preset.avatar}
              showNumbers={hasFirstRevealed}
              isUnknown={!hasFirstRevealed}
              isHit={bossIsHit}
            />
          </div>

          {/* Central Animated Combat Stage */}
          <div className="relative flex-1 min-h-[260px] flex flex-col items-center justify-around py-2">
            {/* Boss Character (Top) */}
            <div className="relative flex flex-col items-center">
              <Avatar
                emoji={currentBoss.preset.avatar}
                name={currentBoss.preset.name}
                isBoss
                actionState={bossAction}
                isLowHP={bossPercent <= 25}
                size="hero"
                themeColor={currentBoss.preset.themeColor}
              />
              {/* Boss Floating Damage anchor */}
              <div className="absolute top-0 right-2">
                {floatingDamages
                  .filter((d) => d.target === 'boss')
                  .map((item) => (
                    <DamageFloat key={item.id} item={item} onDone={removeFloatingDamage} />
                  ))}
              </div>
            </div>

            {/* Impact Starburst Particle layer */}
            {impactEffect && (
              <ImpactEffect
                color={impactEffect.color}
                isCrit={impactEffect.isCrit}
                onComplete={() => setImpactEffect(null)}
              />
            )}

            {/* Critical Strike Center Announcement Banner */}
            {critBanner && (
              <motion.div
                initial={{ scale: 0.4, y: 15, opacity: 0 }}
                animate={{ scale: [0.4, 1.15, 1], y: 0, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-[92%] max-w-xs text-center drop-shadow-2xl"
              >
                <div className="bg-gradient-to-r from-[#FF1E44] via-[#FF3B30] to-[#FF9500] text-white py-2.5 px-4 rounded-2xl border-3 border-white shadow-[0_8px_25px_rgba(255,30,68,0.55)] flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-base sm:text-xl font-black tracking-wider text-yellow-200">
                    <span>⚡</span>
                    <span>致命暴击！</span>
                    <span>💥</span>
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-white/95 mt-0.5">
                    攻击力暴增 · 造成 <span className="text-yellow-200 font-cartoon text-base sm:text-lg font-black">{critBanner.damage}</span> 伤害
                  </div>
                </div>
              </motion.div>
            )}

            {/* Player Character (Bottom) */}
            <div className="relative flex flex-col items-center">
              {showHealSwirl && <HealParticles />}
              <Avatar
                emoji="🤠"
                name="勇士 (你)"
                isBoss={false}
                actionState={playerAction}
                isLowHP={playerPercent <= 25}
                size="hero"
                themeColor="#4FB6E8"
              />
              {/* Player Floating Damage anchor */}
              <div className="absolute top-0 left-2">
                {floatingDamages
                  .filter((d) => d.target === 'player')
                  .map((item) => (
                    <DamageFloat key={item.id} item={item} onDone={removeFloatingDamage} />
                  ))}
              </div>
            </div>
          </div>

          {/* Player Health Bar (Above action bar) */}
          <div className="bg-[#FFFBF2] p-3 rounded-2xl border-2 border-[#EEDCC4] shadow-hard-card">
            <HealthBar
              name="勇士"
              currentHP={player.currentHP}
              maxHP={player.maxHP}
              color="#4FB6E8"
              avatar="🤠"
              showNumbers
              isHit={playerIsHit}
              isHealed={playerIsHealed}
            />
          </div>
        </div>

        {/* ===================== PC LAYOUT (>= 768px Horizontal) ===================== */}
        <div className="hidden md:flex flex-col flex-1 justify-between gap-6 my-auto">
          {/* Dual Top Health Bars */}
          <div className="grid grid-cols-2 gap-8">
            <div className="bg-[#FFFBF2] p-4 rounded-2xl border-2 border-[#EEDCC4] shadow-hard-card">
              <HealthBar
                name="勇士 (你)"
                currentHP={player.currentHP}
                maxHP={player.maxHP}
                color="#4FB6E8"
                avatar="🤠"
                showNumbers
                isHit={playerIsHit}
                isHealed={playerIsHealed}
              />
            </div>
            <div className="bg-[#FFFBF2] p-4 rounded-2xl border-2 border-[#EEDCC4] shadow-hard-card">
              <HealthBar
                name={currentBoss.preset.name}
                currentHP={currentBoss.currentHP}
                maxHP={currentBoss.maxHP}
                color="#FF6B6B"
                avatar={currentBoss.preset.avatar}
                showNumbers={hasFirstRevealed}
                isUnknown={!hasFirstRevealed}
                isHit={bossIsHit}
              />
            </div>
          </div>

          {/* Central Confrontation Area */}
          <div className="relative min-h-[300px] flex items-center justify-around bg-[#FFFBF2]/50 rounded-3xl border-2 border-[#EEDCC4]/60 p-6 shadow-inner">
            {/* Left: Player */}
            <div className="relative flex flex-col items-center">
              {showHealSwirl && <HealParticles />}
              <Avatar
                emoji="🤠"
                name="勇士"
                isBoss={false}
                actionState={playerAction}
                isLowHP={playerPercent <= 25}
                size="hero"
                themeColor="#4FB6E8"
              />
              <div className="absolute top-0 -right-6">
                {floatingDamages
                  .filter((d) => d.target === 'player')
                  .map((item) => (
                    <DamageFloat key={item.id} item={item} onDone={removeFloatingDamage} />
                  ))}
              </div>
            </div>

            {/* Central Versus Icon / Impact */}
            <div className="relative flex flex-col items-center justify-center">
              <div className="text-3xl font-cartoon font-black text-[#8A7A6D]/40">VS</div>
              {impactEffect && (
                <ImpactEffect
                  color={impactEffect.color}
                  isCrit={impactEffect.isCrit}
                  onComplete={() => setImpactEffect(null)}
                />
              )}
            </div>

            {/* Critical Strike Center Announcement Banner (PC) */}
            {critBanner && (
              <motion.div
                initial={{ scale: 0.4, y: 15, opacity: 0 }}
                animate={{ scale: [0.4, 1.15, 1], y: 0, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-full max-w-sm text-center drop-shadow-2xl"
              >
                <div className="bg-gradient-to-r from-[#FF1E44] via-[#FF3B30] to-[#FF9500] text-white py-3 px-5 rounded-2xl border-4 border-white shadow-[0_8px_25px_rgba(255,30,68,0.55)] flex flex-col items-center">
                  <div className="flex items-center gap-2 text-xl font-black tracking-wide text-yellow-200">
                    <span>⚡</span>
                    <span>致命暴击！</span>
                    <span>💥</span>
                  </div>
                  <div className="text-sm font-extrabold text-white/95 mt-0.5">
                    攻击力暴增 · 造成 <span className="text-yellow-200 font-cartoon text-xl font-black">{critBanner.damage}</span> 伤害
                  </div>
                </div>
              </motion.div>
            )}

            {/* Right: Boss */}
            <div className="relative flex flex-col items-center">
              <Avatar
                emoji={currentBoss.preset.avatar}
                name={currentBoss.preset.name}
                isBoss
                actionState={bossAction}
                isLowHP={bossPercent <= 25}
                size="hero"
                themeColor={currentBoss.preset.themeColor}
              />
              <div className="absolute top-0 -left-6">
                {floatingDamages
                  .filter((d) => d.target === 'boss')
                  .map((item) => (
                    <DamageFloat key={item.id} item={item} onDone={removeFloatingDamage} />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===================== BOTTOM ACTION BAR (Sticky & Safe Area) ===================== */}
      <div className="w-full bg-[#FFFBF2] border-t-4 border-[#EEDCC4] shadow-[0_-4px_12px_rgba(74,51,35,0.06)] px-2 sm:px-4 py-2.5 sm:py-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] z-20">
        <div className="w-full max-w-lg mx-auto flex items-center justify-between gap-1.5 sm:gap-3">
          {/* 攻击按钮 (约 35% 宽度) */}
          <div className="w-[35%] min-w-0">
            <Button
              variant="primary"
              size="md"
              fullWidth
              disabled={isBusy || player.currentHP <= 0 || currentBoss.currentHP <= 0}
              icon={<Swords className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
              className="px-1.5 sm:px-5 text-xs sm:text-base min-h-[42px] sm:min-h-[48px] gap-1 sm:gap-2 shadow-hard-orange"
              onClick={handleAttack}
            >
              <span className="truncate">攻击 💥</span>
            </Button>
          </div>

          {/* 补给按钮 (约 38% 宽度) */}
          <div className="w-[38%] min-w-0">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              disabled={
                isBusy ||
                player.suppliesLeft <= 0 ||
                player.currentHP <= 0 ||
                player.currentHP >= player.maxHP
              }
              icon={<HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
              className="px-1.5 sm:px-5 text-xs sm:text-base min-h-[42px] sm:min-h-[48px] gap-1 sm:gap-2 shadow-hard-blue"
              onClick={handleOpenSupplyModal}
            >
              <span className="truncate">补给 ({player.suppliesLeft})</span>
            </Button>
          </div>

          {/* 逃离按钮 (约 27% 宽度) */}
          <div className="w-[27%] min-w-0">
            <Button
              variant="ghost"
              size="md"
              fullWidth
              disabled={isBusy || player.currentHP <= 0 || currentBoss.currentHP <= 0}
              icon={<LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />}
              onClick={handleFlee}
              className="px-1.5 sm:px-4 text-xs sm:text-base min-h-[42px] sm:min-h-[48px] gap-1 sm:gap-1.5 text-[#E8432E] hover:text-[#B82816] hover:bg-[#FEEAE6] border-[#F8D2CB] whitespace-nowrap"
              title="脱离对决，逃跑判负"
            >
              <span className="truncate">逃离 💨</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Half-HP Reveal Panel (Modal on Desktop / Bottom Sheet on Mobile) */}
      <RevealPanel
        revealState={revealPanel}
        suppliesLeft={player.suppliesLeft}
        isBusy={isBusy}
        onAttack={handleAttack}
        onSupply={handleOpenSupplyModal}
        onFlee={handleFlee}
      />

      {/* Supply Selection Modal */}
      <SupplyModal
        isOpen={isSupplyModalOpen}
        inventory={player.inventory || {}}
        playerCurrentHP={player.currentHP}
        playerMaxHP={player.maxHP}
        isBusy={isBusy}
        onSelect={handleSelectSupplyItem}
        onClose={() => setIsSupplyModalOpen(false)}
      />
    </div>
  );
};
