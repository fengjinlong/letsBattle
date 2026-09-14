import { BossPreset, GameConfig } from './types';

export const DEFAULT_CONFIG: GameConfig = {
  playerHP: 100,
  playerAttack: 20,
  bossFluctuation: 0.1, // +/- 10%
  maxSupplies: 3,
  supplyHealAmount: 35,
  halfHpThreshold: 0.5,
  maxExtraReveals: 2,
};

export const BOSS_PRESETS: Record<string, BossPreset> = {
  low: {
    id: 'low',
    name: '小石怪·布布',
    title: '普通的森林巡逻者',
    tier: 'low',
    tierLabel: '低阶魔物',
    maxHP: 80,
    attack: 8,
    avatar: '🪨',
    desc: '看起来呆萌笨拙，动作迟缓，但有一颗坚固的心。',
    themeColor: '#8A9A5B',
  },
  mid: {
    id: 'mid',
    name: '暗夜狼王·芬里尔',
    title: '嗜血的雪原猎手',
    tier: 'mid',
    tierLabel: '中阶统领',
    maxHP: 120,
    attack: 15,
    avatar: '🐺',
    desc: '擅长在阴影中穿梭扑咬，利爪带着刺骨寒气。',
    themeColor: '#6C5CE7',
  },
  high: {
    id: 'high',
    name: '烈焰炎魔·拉格纳',
    title: '深渊的烈焰领主',
    tier: 'high',
    tierLabel: '高阶霸主',
    maxHP: 180,
    attack: 25,
    avatar: '🔥',
    desc: '从熔岩核心苏醒的庞然大物，每一击都伴随爆裂烈焰。',
    themeColor: '#E8432E',
  },
};
