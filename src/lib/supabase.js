export function trackEvent(eventType, data) {
  console.log('Event tracked:', eventType, data);
}

export function fetchClaimedProfiles() {
  return Promise.resolve([]);
}
