import { randomInt } from "node:crypto";
import { summonPool } from "./summon.ts";
import { applyBattleAction, GameActionError, type Battle, type BattleResult } from "./battle.ts";
import { tutorialRegions } from "./tutorial.ts";
export { GameActionError } from "./battle.ts";

export type Question = { id: string; prompt: string; options: string[]; answerIndex: number; explanation: string; sourcePage: number };
export type Region = { chapter: number; title: string; summary: string; topics: string[]; questions: number; enemies: number; material?: string; sourcePages?: number[]; questionBank?: Question[] };
export type Expedition = { id: string; title: string; file: string; progress: number; regions: Region[] };
export type GameData = { gold: number; gems: number; xp: number; favor: number; inventory: string[]; expeditions: Expedition[]; lastAdventure: { expeditionId: string; chapter: number } | null; battle?: Battle; battleHistory?: BattleResult[] };

function chapters(titles: string[]) {
  return titles.map((title, index) => ({ chapter: index + 1, title, summary: `Kuasai konsep inti ${title.toLowerCase()} sebelum menghadapi encounter di akhir region.`, topics: [`Konsep dasar ${title}`, "Penerapan dan contoh penting", "Kesalahan umum yang harus dihindari"], questions: 10, enemies: index + 1 }));
}
export function initialGame(): GameData {
  return {
    gold: 1450, gems: 320, xp: 0, favor: 3,
    inventory: ["Blue Mage Robe", "Quill Staff", "Spectacles", "HP Elixir"],
    lastAdventure: null,
    expeditions: [{ id: "tutorial", title: "Tutorial — Fotosintesis", file: "Tutorial", progress: 0, regions: tutorialRegions() }],
  };
}
export function newExpedition(file: string): Expedition {
  const title = file.replace(/\.(pdf|docx)$/i, "").replace(/[_-]+/g, " ").trim();
  return { id: crypto.randomUUID(), title, file, progress: 0, regions: chapters(["Fundamentals", "Practice", "Review"]) };
}

export function applyGameAction(game: GameData, body: Record<string, unknown>): string[] {
  if (body.action === "start" || body.action === "answer" || body.action === "complete") {
    applyBattleAction(game, body);
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
