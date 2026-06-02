export const INDUSTRY_CONFIG = {
  laundromat: { label: 'Laundromats', emoji: '🧺', color: '#0099cc' },
  barbershop: { label: 'Barbershops & Salons', emoji: '✂️', color: '#d45030' },
  restaurant: { label: 'Restaurants & Cafes', emoji: '🍽️', color: '#b89900' },
  autorepair: { label: 'Auto Repair Shops', emoji: '🔧', color: '#00aa55' },
  gym: { label: 'Gyms & Fitness', emoji: '💪', color: '#8844cc' },
  liquorstore: { label: 'Liquor Stores', emoji: '🍷', color: '#cc7722' },
  drycleaning: { label: 'Dry Cleaning', emoji: '👔', color: '#6699dd' },
  accounting: { label: 'Tax & Accounting', emoji: '📊', color: '#ff9900' },
  dentist: { label: 'Dental Practices', emoji: '🦷', color: '#00ccaa' },
  plumbing: { label: 'Plumbing Services', emoji: '🔩', color: '#8855dd' },
  cleaning: { label: 'Commercial Cleaning', emoji: '🧹', color: '#99cc00' },
  hvac: { label: 'HVAC Services', emoji: '❄️', color: '#0088ff' },
  electrician: { label: 'Electrical Services', emoji: '⚡', color: '#ffcc00' },
  pest: { label: 'Pest Control', emoji: '🐛', color: '#dd4444' },
  landscaping: { label: 'Landscaping', emoji: '🌱', color: '#00bb55' },
  childcare: { label: 'Childcare Centers', emoji: '👶', color: '#ff69b4' },
  tutoring: { label: 'Tutoring Services', emoji: '📚', color: '#4466ff' },
  veterinary: { label: 'Veterinary Clinics', emoji: '🐾', color: '#cc6633' },
  realtor: { label: 'Real Estate Offices', emoji: '🏠', color: '#dd7722' },
  insurance: { label: 'Insurance Agencies', emoji: '🛡️', color: '#0066cc' },
  storage: { label: 'Self Storage', emoji: '📦', color: '#885522' },
  photography: { label: 'Photography Studios', emoji: '📷', color: '#ff6666' }
};

export function enrichWithRevenueModel(biz, industry) {
  return {
    ...biz,
    val: { lo: biz.sde * 2, hi: biz.sde * 3.5 }
  };
}

export function fmtMoney(n) {
  if (!n) return '$0';
  return '$' + (n / 1000).toFixed(0) + 'K';
}
