import { BossPreset, GameConfig } from './types';
import { SUPPLY_ITEMS, getTotalSuppliesCount, createInitialInventory } from './data/supplies';

export * from './data/supplies';

export const DEFAULT_CONFIG: GameConfig = {
  playerHP: 500,
  playerAttack: 100,
  bossFluctuation: 0.3, // +/- 30%
  maxSupplies: 0,
  suppliesInventory: createInitialInventory(), // default 0 for all items
  supplyHealAmount: 20, // fallback
  halfHpThreshold: 0.5,
  maxExtraReveals: 2,
  playerCritChance: 0.2, // 20% 暴击率
  playerCritBonus: 2.0, // 暴击时攻击力增加 200% (即达到 300% 伤害)
};

/**
 * 4 个经典怪物配置：
 * 1. 木巨人：血量 2000，伤害 20
 * 2. 狼牙：血量 3000，伤害 30
 * 3. 巨斧：血量 4000，伤害 30
 * 4. 女巫：血量 5000，伤害 50
 */
export const BOSS_PRESETS: Record<string, BossPreset> = {
  wood_giant: {
    id: 'wood_giant',
    name: '木巨人',
    title: '远古苍木巨灵',
    tier: 'wood_giant',
    tierLabel: '一阶守卫',
    maxHP: 2000,
    attack: 20,
    avatar: '🪵',
    desc: '由茂密苍翠古林与原木灵核汇聚而成的沉稳巨灵，躯干厚重苍劲。',
    themeColor: '#739E52',
  },
  wolf_fang: {
    id: 'wolf_fang',
    name: '狼牙',
    title: '暗影撕咬霜首',
    tier: 'wolf_fang',
    tierLabel: '二阶统领',
    maxHP: 3000,
    attack: 30,
    avatar: '🐺',
    desc: '荒原群狼的嗜血头目，獠牙冷若寒铁，在夜幕中发动撕裂之击。',
    themeColor: '#4B7B9E',
  },
  great_axe: {
    id: 'great_axe',
    name: '巨斧',
    title: '重装狂怒破阵狂客',
    tier: 'great_axe',
    tierLabel: '三阶霸主',
    maxHP: 4000,
    attack: 30,
    avatar: '🪓',
    desc: '身着坚硬玄铁重甲，挥舞比身躯还宽大的裂地巨斧，战威赫赫。',
    themeColor: '#E07A2B',
  },
  witch: {
    id: 'witch',
    name: '女巫',
    title: '深渊禁咒大魔尊',
    tier: 'witch',
    tierLabel: '终阶魔尊',
    maxHP: 5000,
    attack: 50,
    avatar: '🧙‍♀️',
    desc: '掌控暗夜秘法与禁忌黑魔法的强大女巫，黑焰与咒语可毁灭一切。',
    themeColor: '#8A5CF6',
  },
};

// Compatibility aliases
BOSS_PRESETS['low'] = BOSS_PRESETS.wood_giant;
BOSS_PRESETS['mid'] = BOSS_PRESETS.wolf_fang;
BOSS_PRESETS['high'] = BOSS_PRESETS.witch;

export const BOSS_LIST: BossPreset[] = [
  BOSS_PRESETS.wood_giant,
  BOSS_PRESETS.wolf_fang,
  BOSS_PRESETS.great_axe,
  BOSS_PRESETS.witch,
];
