import type { Expedition } from "./screens/AdventureScreen";
import { createClient } from "@supabase/supabase-js";
export type SummonItem = {
  name: string;
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  chance: number;
};

export type GameData = {
  gold: number;
  gems: number;
  xp: number;
  favor: number;
  inventory: string[];
  expeditions: Expedition[];
  lastAdventure: { expeditionId: string; chapter: number } | null;
  rewards?: string[];
  summonPool?: SummonItem[];
};
const url = import.meta.env.VITE_API_URL ?? "";
const supabase = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY)
  : null;
async function token() {
  if (!supabase) throw new Error("Supabase is not configured");
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (session) return session.access_token;
  const signedIn = await supabase.auth.signInAnonymously();
  if (signedIn.error || !signedIn.data.session) throw signedIn.error ?? new Error("Could not sign in");
  return signedIn.data.session.access_token;
}
export async function gameRequest(
  action?: Record<string, unknown>,
): Promise<GameData> {
  const response = await fetch(
    `${url}/api/game`,
    action
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
          body: JSON.stringify(action),
        }
      : { headers: { Authorization: `Bearer ${await token()}` } },
  );
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Server unavailable");
  return data as GameData;
}
export async function forgeRequest(asset: File): Promise<GameData> {
  const form = new FormData();
  form.append("file", asset);
  const response = await fetch(`${url}/api/game/forge`, {
    method: "POST",
    headers: { Authorization: `Bearer ${await token()}` },
    body: form,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Forge failed");
  return data as GameData;
}
