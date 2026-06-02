export const INDUSTRY_CONFIG = {
  laundromat: { label: 'Laundromats', emoji: '🧺', color: '#0099cc' },
  barbershop: { label: 'Barbershops & Salons', emoji: '✂️', color: '#d45030' },
  restaurant: { label: 'Restaurants & Cafes', emoji: '🍽️', color: '#b89900' },
  autorepair: { label: 'Auto Repair Shops', emoji: '🔧', color: '#00aa55' },
  gym: { label: 'Gyms & Fitness', emoji: '💪', color: '#8844cc' },
  liquorstore: { label: 'Liquor Stores', emoji: '🍷', color: '#cc7722' }
};

export function enrichWithRevenueModel(biz, industry) {
  const cfg = INDUSTRY_CONFIG[industry] || {};
  return {
    ...biz,
    val: { lo: biz.sde * 2, hi: biz.sde * 3.5 }
  };
}

export function fmtMoney(n) {
  if (!n) return '$0';
  return '$' + (n / 1000).toFixed(0) + 'K';
}
