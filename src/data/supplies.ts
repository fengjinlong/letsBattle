import { SupplyItem } from '../types';

/**
 * 补给物品独立数据配置表
 * - 面包：回复 2 滴血
 * - 水：回复 3 滴血
 * - 饼干：回复 5 滴血
 * - 火腿肠：回复 10 滴血
 * - 可乐：回复 12 滴血
 * - 压缩饼干：回复 20 滴血
 * - 月饼：回复 30 滴血
 * - 牛肉：回复 40 滴血
 * - 能量饮料：回复 70 滴血
 * 
 * 默认数量均为 0，由玩家在进入游戏前的属性设置中自行配置数量。
 */
export const SUPPLY_ITEMS: SupplyItem[] = [
  {
    id: 'bread',
    name: '面包',
    healAmount: 2,
    icon: '🍞',
    desc: '松软的基础切片面包，可轻微垫肚子充饥。',
    defaultCount: 0,
    color: '#D4A373',
    badge: '日常便粮',
  },
  {
    id: 'water',
    name: '水',
    healAmount: 3,
    icon: '💧',
    desc: '清凉甘冽的纯净泉水，及时解渴润喉。',
    defaultCount: 0,
    color: '#4FB6E8',
    badge: '清凉甘泉',
  },
  {
    id: 'cookie',
    name: '饼干',
    healAmount: 5,
    icon: '🍪',
    desc: '酥脆香甜的烘烤小饼干，补充少许体力。',
    defaultCount: 0,
    color: '#C08552',
    badge: '香脆点心',
  },
  {
    id: 'sausage',
    name: '火腿肠',
    healAmount: 10,
    icon: '🌭',
    desc: '方便携带的风味肉肠，咸香可口开胃。',
    defaultCount: 0,
    color: '#E05780',
    badge: '美味肉肠',
  },
  {
    id: 'cola',
    name: '可乐',
    healAmount: 12,
    icon: '🥤',
    desc: '冰镇带气的碳酸饮料，迅速提神振奋。',
    defaultCount: 0,
    color: '#E63946',
    badge: '活力汽水',
  },
  {
    id: 'hardtack',
    name: '压缩饼干',
    healAmount: 20,
    icon: '🥠',
    desc: '高密度军用硬质干粮，饱腹感强劲抗饿。',
    defaultCount: 0,
    color: '#B08968',
    badge: '军工干粮',
  },
  {
    id: 'mooncake',
    name: '月饼',
    healAmount: 30,
    icon: '🥮',
    desc: '皮薄馅足的传统豆沙蛋黄月饼，高糖高脂满血复活。',
    defaultCount: 0,
    color: '#FFB703',
    badge: '传统甜点',
  },
  {
    id: 'beef',
    name: '牛肉',
    healAmount: 40,
    icon: '🥩',
    desc: '扎实多汁的风干熟牛肉，富含蛋白质强健筋骨。',
    defaultCount: 0,
    color: '#9B2226',
    badge: '强力肉食',
  },
  {
    id: 'energy_drink',
    name: '能量饮料',
    healAmount: 70,
    icon: '⚡',
    desc: '特浓高能电解质饮料，瞬间爆发极速焕发全身生机。',
    defaultCount: 0,
    color: '#06D6A0',
    badge: '特级秘药',
  },
];

/**
 * 生成勇士出征时的初始补给品背包
 * 默认均为 0
 */
export function createInitialInventory(items: SupplyItem[] = SUPPLY_ITEMS): Record<string, number> {
  const inventory: Record<string, number> = {};
  for (const item of items) {
    inventory[item.id] = item.defaultCount;
  }
  return inventory;
}

/**
 * 计算当前背包中剩余的补给品总数
 */
export function getTotalSuppliesCount(inventory: Record<string, number>): number {
  if (!inventory) return 0;
  return Object.values(inventory).reduce((total, count) => total + (Math.max(0, count) || 0), 0);
}

/**
 * 根据 ID 获取特定补给品信息
 */
export function getSupplyItemById(id: string): SupplyItem | undefined {
  return SUPPLY_ITEMS.find((item) => item.id === id);
}
