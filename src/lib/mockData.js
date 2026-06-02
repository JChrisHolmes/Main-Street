export function generateMockBusinesses(industry, zip, count) {
  const businesses = [];
  for (let i = 0; i < count; i++) {
    businesses.push({
      id: `biz_${i}`,
      name: `Business ${i + 1}`,
      address: `${100 + i} Main St, ${zip}`,
      rating: 4 + Math.random(),
      reviewCount: Math.floor(Math.random() * 200),
      yrs: Math.floor(Math.random() * 15) + 1,
      rev: Math.floor(Math.random() * 500000) + 100000,
      sde: Math.floor(Math.random() * 100000) + 20000,
      sig: Math.floor(Math.random() * 100),
      isListed: Math.random() > 0.8,
      isClaimed: Math.random() > 0.9
    });
  }
  return businesses;
}
