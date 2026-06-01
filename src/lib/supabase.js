import { createClient } from "@supabase/supabase-js";
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = url && key ? createClient(url, key) : null;
export async function trackEvent(event, data = {}) {
  try {
    await fetch("/api/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ event, ...data }) });
  } catch {}
}
export async function fetchClaimedProfiles(zip, industry) {
  if (!supabase) return {};
  try {
    const { data, error } = await supabase.from("claimed_businesses").select("*").eq("zip", zip).eq("industry", industry);
    if (error || !data) return {};
    return Object.fromEntries(data.map((b) => [b.place_id, b]));
  } catch {
    return {};
  }
}
