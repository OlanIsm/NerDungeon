import "server-only";
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { join } from "node:path";

export type Expedition = { id: string; title: string; file: string; progress: number; regions: { chapter: number; title: string; summary: string; topics: string[]; questions: number; enemies: number }[] };
export type GameData = { gold: number; gems: number; xp: number; favor: number; inventory: string[]; expeditions: Expedition[]; lastAdventure: { expeditionId: string; chapter: number } | null };
const path = join(process.cwd(), "data", "game.json");
export function demoAllowed() { return process.env.NODE_ENV !== "production" || process.env.GAME_DEMO_MODE === "1"; }
const initial: GameData = {
  gold: 1450, gems: 320, xp: 1771, favor: 3,
  inventory: ["Blue Mage Robe", "Quill Staff", "Spectacles", "HP Elixir"],
  lastAdventure: { expeditionId: "biology", chapter: 2 },
  expeditions: [
    { id: "biology", title: "Biologi — Fotosintesis", file: "Fotosintesis_Lengkap_Revisi.pdf", progress: 33, regions: chapters(["Reaksi Terang", "Siklus Calvin", "Metabolisme"]) },
    { id: "physics", title: "Fisika Dasar — Gravitasi", file: "Fisika_Dasar.pdf", progress: 0, regions: chapters(["Gaya Gravitasi", "Medan Gravitasi", "Orbit"]) },
    { id: "solid", title: "SOLID Principles", file: "SOLID.pdf", progress: 66, regions: chapters(["Single Responsibility", "Open–Closed Principle", "Dependency Inversion"]) },
    { id: "oop", title: "Object-Oriented Programming", file: "OOP_Fundamentals.pdf", progress: 0, regions: chapters(["Encapsulation", "Inheritance", "Polymorphism"]) },
  ],
};
function chapters(titles: string[]) {
  return titles.map((title, index) => ({ chapter: index + 1, title, summary: `Kuasai konsep inti ${title.toLowerCase()} sebelum menghadapi encounter di akhir region.`, topics: [`Konsep dasar ${title}`, "Penerapan dan contoh penting", "Kesalahan umum yang harus dihindari"], questions: 10, enemies: index + 1 }));
}
export async function readGame(): Promise<GameData> {
  try { return JSON.parse(await readFile(path, "utf8")) as GameData; }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return structuredClone(initial); throw error; }
}
export async function writeGame(data: GameData) {
  await mkdir(join(process.cwd(), "data"), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, JSON.stringify(data, null, 2));
  await rename(temporary, path);
}
export function newExpedition(file: string): Expedition {
  const title = file.replace(/\.(pdf|docx)$/i, "").replace(/[_-]+/g, " ").trim();
  return { id: crypto.randomUUID(), title, file, progress: 0, regions: chapters(["Fundamentals", "Practice", "Review"]) };
}
