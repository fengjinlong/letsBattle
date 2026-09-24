export type Page = 'setup' | 'draft' | 'battle' | 'result';

export type BossId = 'wood_giant' | 'wolf_fang' | 'great_axe' | 'witch';
export type BossTier = BossId | 'low' | 'mid' | 'high' | string;

export interface BossPreset {
  id: string;
  name: string;
  title: string;
  tier: BossTier;
  tierLabel: string;
  maxHP: number;
  attack: number;
  avatar: string;
  desc: string;
  themeColor: string;
}

export interface SupplyItem {
  id: string;
  name: string;
  healAmount: number;
  icon: string;
  desc: string;
  defaultCount: number;
  color: string;
  badge: string;
}

export interface GameConfig {
  playerHP: number;
  playerAttack: number;
  bossFluctuation: number; // e.g. 0.10 for 10%
  maxSupplies?: number; // legacy fallback
  suppliesInventory: Record<string, number>; // user configured initial inventory
  supplyHealAmount?: number; // legacy fallback
  halfHpThreshold: number; // e.g. 0.50 (50%)
  maxExtraReveals: number; // e.g. 2 (making 3 reveals total: 1 initial + 2 additional)
  playerCritChance?: number; // e.g. 0.20 for 20%
  playerCritBonus?: number; // e.g. 2.0 for +200% attack increase
}

export interface PlayerState {
  maxHP: number;
  currentHP: number;
  attack: number;
  suppliesLeft: number;
  inventory: Record<string, number>;
}

export interface BossState {
  preset: BossPreset;
  maxHP: number;
  currentHP: number;
  attack: number;
}

export type BattleResult = 'victory' | 'defeat' | 'flee';

export interface BattleStats {
  rounds: number;
  totalDamageDealt: number;
  totalDamageTaken: number;
  suppliesUsed: number;
  suppliesUsedDetails?: Record<string, number>;
  result: BattleResult;
  bossName: string;
  bossTier: BossTier;
  critCount?: number;
}

export interface FloatingDamage {
  id: string;
  target: 'player' | 'boss';
  amount: number | string;
  type: 'damage' | 'heal' | 'miss' | 'crit';
  color: string;
  isCrit?: boolean;
}

export interface RevealState {
  isOpen: boolean;
  count: number; // 1, 2, 3
  maxCount: number;
  playerPercent: number;
  bossPercent: number;
  playerCurrentHP: number;
  playerMaxHP: number;
  bossCurrentHP: number;
  bossMaxHP: number;
}
