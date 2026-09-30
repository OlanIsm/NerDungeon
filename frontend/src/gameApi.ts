import type { Expedition } from "./screens/AdventureScreen";
import type { DocumentPickerAsset } from "expo-document-picker";

export type GameData = { gold: number; gems: number; xp: number; favor: number; inventory: string[]; expeditions: Expedition[]; lastAdventure: { expeditionId: string; chapter: number } | null; rewards?: string[] };
const url = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";
export async function gameRequest(action?: Record<string, unknown>): Promise<GameData> {
  const response = await fetch(`${url}/api/game`, action ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action) } : undefined);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Server unavailable");
  return data as GameData;
}
export async function forgeRequest(asset: DocumentPickerAsset): Promise<GameData> {
  const form = new FormData();
  form.append("file", asset.file ?? ({ uri: asset.uri, name: asset.name, type: asset.mimeType ?? (asset.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document") } as unknown as Blob));
  const response = await fetch(`${url}/api/game/forge`, { method: "POST", body: form });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Forge failed");
  return data as GameData;
}
