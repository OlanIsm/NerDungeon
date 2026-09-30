export type Expedition = { id: string; title: string; file: string; progress: number; regions: { chapter: number; title: string; summary: string; topics: string[]; questions: number; enemies: number }[] };
export type GameData = { gold: number; gems: number; xp: number; favor: number; inventory: string[]; expeditions: Expedition[]; lastAdventure: { expeditionId: string; chapter: number } | null };
export class GameActionError extends Error {}

function chapters(titles: string[]) {
  return titles.map((title, index) => ({ chapter: index + 1, title, summary: `Kuasai konsep inti ${title.toLowerCase()} sebelum menghadapi encounter di akhir region.`, topics: [`Konsep dasar ${title}`, "Penerapan dan contoh penting", "Kesalahan umum yang harus dihindari"], questions: 10, enemies: index + 1 }));
}
export function initialGame(): GameData {
  return {
    gold: 1450, gems: 320, xp: 0, favor: 3,
    inventory: ["Blue Mage Robe", "Quill Staff", "Spectacles", "HP Elixir"],
    lastAdventure: { expeditionId: "tutorial", chapter: 1 },
    expeditions: [{ id: "tutorial", title: "Tutorial — Fotosintesis", file: "Tutorial", progress: 0, regions: chapters(["Reaksi Terang", "Siklus Calvin", "Metabolisme"]) }],
  };
}
export function newExpedition(file: string): Expedition {
  const title = file.replace(/\.(pdf|docx)$/i, "").replace(/[_-]+/g, " ").trim();
  return { id: crypto.randomUUID(), title, file, progress: 0, regions: chapters(["Fundamentals", "Practice", "Review"]) };
}

export function applyGameAction(game: GameData, body: Record<string, unknown>): string[] {
  if (body.action === "start") {
    const expedition = game.expeditions.find((item) => item.id === body.expeditionId);
    const chapter = body.chapter;
    if (!expedition || typeof chapter !== "number" || !Number.isInteger(chapter) || chapter < 1 || chapter > expedition.regions.length) throw new GameActionError("Invalid chapter");
    game.lastAdventure = { expeditionId: expedition.id, chapter };
  } else if (body.action === "complete") {
    const last = game.lastAdventure;
    const expedition = game.expeditions.find((item) => item.id === last?.expeditionId);
    if (!last || !expedition) throw new GameActionError("No active adventure");
    const progress = Math.round(last.chapter / expedition.regions.length * 100);
    if (progress > expedition.progress) {
      expedition.progress = progress;
      game.gold += 450;
      game.xp += 100;
    }
  } else if (body.action === "summon") {
    const cost = body.count === 10 ? 900 : body.count === 1 ? 100 : 0;
    if (!cost) throw new GameActionError("Invalid summon count");
    if (game.gems < cost) throw new GameActionError("Not enough gems");
    game.gems -= cost;
    game.favor = (game.favor + Number(body.count)) % 10;
    const rewards = Array.from({ length: Number(body.count) }, () => summonPool[randomInt(summonPool.length)].name);
    game.inventory.push(...rewards);
    return rewards;
  } else throw new GameActionError("Unknown action");
  return [];
}
import { randomInt } from "node:crypto";
import { summonPool } from "./summon.ts";
