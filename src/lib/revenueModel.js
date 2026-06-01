export const INDUSTRY_CONFIG = {
  laundromat: { label: "Laundromats", emoji: "🧺", googleType: "laundry", revenueBase: 280000, revenueMax: 480000, marginRange: [0.20, 0.35], multipleRange: [2.5, 3.5], color: "#0099cc" },
  barbershop: { label: "Barbershops & Salons", emoji: "✂️", googleType: "hair_care", revenueBase: 160000, revenueMax: 380000, marginRange: [0.15, 0.28], multipleRange: [1.5, 2.5], color: "#d45030" },
  restaurant: { label: "Restaurants & Cafés", emoji: "🍽️", googleType: "restaurant", revenueBase: 480000, revenueMax: 1400000, marginRange: [0.03, 0.09], multipleRange: [1.5, 2.5], color: "#b89900" },
  autorepair: { label: "Auto Repair Shops", emoji: "🔧", googleType: "car_repair", revenueBase: 380000, revenueMax: 960000, marginRange: [0.15, 0.25], multipleRange: [2.5, 3.5], color: "#00aa55" },
  gym: { label: "Gyms & Fitness", emoji: "🏋️", googleType: "gym", revenueBase: 180000, revenueMax: 620000, marginRange: [0.10, 0.20], multipleRange: [2.0, 3.0], color: "#8844cc" },
  liquorstore: { label: "Liquor Stores", emoji: "🥃", googleType: "liquor_store", revenueBase: 750000, revenueMax: 2800000, marginRange: [0.20, 0.30], multipleRange: [2.0, 3.0], color: "#cc7722" }
};
const rnd = (n, k = 1000) => Math.round(n / k) * k;
export function estimateRevenue(industry, rating = 4.0, reviewCount = 80, priceLevel = 1, addJitter = false) {
  const cfg = INDUSTRY_CONFIG[industry];
  if (!cfg) return 0;
  const reviewScore = Math.min(reviewCount / 300, 1);
  const ratingScore = Math.max((rating - 2.5) / 2.5, 0);
  const priceScore = priceLevel / 3;
  const composite = reviewScore * 0.45 + ratingScore * 0.35 + priceScore * 0.20;
  const raw = cfg.revenueBase + composite * (cfg.revenueMax - cfg.revenueBase);
  const jitter = addJitter ? (1 + (Math.random() * 0.12 - 0.06)) : 1;
  return rnd(raw * jitter);
}
export function estimateSDE(revenue, industry) {
  const cfg = INDUSTRY_CONFIG[industry];
  if (!cfg) return 0;
  const margin = cfg.marginRange[0] + Math.random() * (cfg.marginRange[1] - cfg.marginRange[0]);
  return rnd(revenue * margin);
}
export function estimateValuation(sde, industry) {
  const cfg = INDUSTRY_CONFIG[industry];
  if (!cfg) return { lo: 0, hi: 0 };
  return { lo: rnd(sde * cfg.multipleRange[0]), hi: rnd(sde * cfg.multipleRange[1]) };
}
export function calcSignalScore(rating, reviewCount, revenue, industry) {
  const cfg = INDUSTRY_CONFIG[industry];
  if (!cfg) return 50;
  return Math.min(99, Math.max(28, Math.round((rating / 5) * 40 + (Math.min(reviewCount, 300) / 300) * 30 + (revenue / cfg.revenueMax) * 30)));
}
export function fmtMoney(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}
export function enrichWithRevenueModel(place, industry) {
  const { rating = 4.0, reviewCount = 80, priceLevel = 1 } = place;
  const revenue = estimateRevenue(industry, rating, reviewCount, priceLevel, false);
  const sde = estimateSDE(revenue, industry);
  const val = estimateValuation(sde, industry);
  const sig = calcSignalScore(rating, reviewCount, revenue, industry);
  return { ...place, rev: revenue, sde, val, sig, yrs: null };
}
