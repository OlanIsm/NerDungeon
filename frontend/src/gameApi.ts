import type { Expedition } from "./screens/AdventureScreen";
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
export async function gameRequest(
  action?: Record<string, unknown>,
): Promise<GameData> {
  const response = await fetch(
    `${url}/api/game`,
    action
      ? {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(action),
        }
      : undefined,
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
    body: form,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Forge failed");
  return data as GameData;
}
