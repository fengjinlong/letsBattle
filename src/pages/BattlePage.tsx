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

  // Animation & UI states
  const [isBusy, setIsBusy] = useState(false); // Disable actions during turn
  const [screenShake, setScreenShake] = useState<'none' | 'mild' | 'strong'>('none');
  const [playerAction, setPlayerAction] = useState<AvatarActionState>('idle');
  const [bossAction, setBossAction] = useState<AvatarActionState>('idle');
  const [impactEffect, setImpactEffect] = useState<{ show: boolean; color: string } | null>(null);
  const [showHealSwirl, setShowHealSwirl] = useState(false);
  const [floatingDamages, setFloatingDamages] = useState<FloatingDamage[]>([]);
  const [isMuted, setIsMuted] = useState(sound.isMuted);

  // Health bar visual feedback
  const [bossIsHit, setBossIsHit] = useState(false);
  const [playerIsHit, setPlayerIsHit] = useState(false);
  const [playerIsHealed, setPlayerIsHealed] = useState(false);

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
        setPlayerAction('fleeing');
      }

      setTimeout(() => {
        onFinishBattle({
          rounds,
          totalDamageDealt,
          totalDamageTaken,
          suppliesUsed,
          result,
          bossName: currentBoss.preset.name,
          bossTier: currentBoss.preset.tier,
        });
      }, 950);
    },
    [rounds, totalDamageDealt, totalDamageTaken, suppliesUsed, currentBoss, onFinishBattle]
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
        const dmg = playerRef.current.attack;
        setBossAction('hit');
        setBossIsHit(true);
        triggerShake('mild');
        sound.playHit(true);
        setImpactEffect({ show: true, color: '#FF8C42' });

        const nextBossHP = Math.max(0, bossRef.current.currentHP - dmg);
        setCurrentBoss((prev) => ({ ...prev, currentHP: nextBossHP }));
        setTotalDamageDealt((prev) => prev + dmg);

        // 550-700ms: Red floating damage on BOSS
        addFloatingDamage({
          target: 'boss',
          amount: dmg,
          type: 'damage',
          color: '#FF6B6B',
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

          // Check if half-HP reveal was triggered by this hit (note down revealed state)
          checkRevealNeeded(playerRef.current.currentHP, nextBossHP);

          // Crucial: It is now BOSS's turn to attack!
          // The BOSS will ALWAYS choose to continue attacking without pausing for player input.
          setTimeout(() => {
            executeBossTurn();
          }, 350);
        }, 350);
      }, 180);
    }, 200);
  };

  // Player supply action timeline
  const handleSupply = () => {
    if (isBusy || player.suppliesLeft <= 0 || player.currentHP <= 0) return;

    if (revealPanel.isOpen) {
      setRevealPanel((prev) => ({ ...prev, isOpen: false }));
    }

    setIsBusy(true);
    sound.playHeal();
    setSuppliesUsed((prev) => prev + 1);

    const healAmount = config.supplyHealAmount;
    const nextHP = Math.min(player.maxHP, player.currentHP + healAmount);
    const actualHealed = nextHP - player.currentHP;

    setPlayer((prev) => ({
      ...prev,
      currentHP: nextHP,
      suppliesLeft: prev.suppliesLeft - 1,
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

      // Player used supply. Check if reveal thresholds changed:
      checkRevealNeeded(nextHP, bossRef.current.currentHP);

      // Crucial: It is now BOSS's turn to attack! BOSS always attacks next.
      setTimeout(() => {
        executeBossTurn();
      }, 350);
    }, 600);
  };

  // Player flee action
  const handleFlee = () => {
    if (isBusy) return;
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
          <span className="font-cartoon text-xs sm:text-sm font-extrabold bg-[#FFFBF2] text-[#4A3323] px-3 py-1 rounded-full border border-[#EEDCC4] shadow-sm">
            回合 {rounds}
          </span>
          <span className="font-cartoon text-xs text-[#8A7A6D] hidden sm:inline-block bg-[#FFFBF2]/70 px-2.5 py-1 rounded-full border border-[#EEDCC4]/60">
            补给剩余: {player.suppliesLeft}/{config.maxSupplies}
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
                onComplete={() => setImpactEffect(null)}
              />
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
                  onComplete={() => setImpactEffect(null)}
                />
              )}
            </div>

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
      <div className="w-full bg-[#FFFBF2] border-t-4 border-[#EEDCC4] shadow-[0_-4px_12px_rgba(74,51,35,0.06)] px-4 py-3 sm:py-4 pb-[max(1rem,env(safe-area-inset-bottom))] z-20">
        <div className="w-full max-w-lg mx-auto flex items-center justify-center gap-2.5 sm:gap-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={isBusy || player.currentHP <= 0 || currentBoss.currentHP <= 0}
            icon={<Swords className="w-5 h-5" />}
            onClick={handleAttack}
          >
            攻击 💥
          </Button>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            disabled={
              isBusy ||
              player.suppliesLeft <= 0 ||
              player.currentHP <= 0 ||
              player.currentHP >= player.maxHP
            }
            icon={<HeartPulse className="w-5 h-5" />}
            onClick={handleSupply}
          >
            补给 ({player.suppliesLeft})
          </Button>
        
        </div>
      </div>

      {/* Half-HP Reveal Panel (Modal on Desktop / Bottom Sheet on Mobile) */}
      <RevealPanel
        revealState={revealPanel}
        suppliesLeft={player.suppliesLeft}
        onAttack={handleAttack}
        onSupply={handleSupply}
        onFlee={handleFlee}
      />
    </div>
  );
};
