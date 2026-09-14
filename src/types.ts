export type Page = 'setup' | 'draft' | 'battle' | 'result';

export type BossTier = 'low' | 'mid' | 'high';

export interface BossPreset {
  id: BossTier;
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

export interface GameConfig {
  playerHP: number;
  playerAttack: number;
  bossFluctuation: number; // e.g. 0.10 for 10%
  maxSupplies: number; // e.g. 3
  supplyHealAmount: number; // e.g. 35
  halfHpThreshold: number; // e.g. 0.50 (50%)
  maxExtraReveals: number; // e.g. 2 (making 3 reveals total: 1 initial + 2 additional)
}

export interface PlayerState {
  maxHP: number;
  currentHP: number;
  attack: number;
  suppliesLeft: number;
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
  result: BattleResult;
  bossName: string;
  bossTier: BossTier;
}

export interface FloatingDamage {
  id: string;
  target: 'player' | 'boss';
  amount: number | string;
  type: 'damage' | 'heal' | 'miss';
  color: string;
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
