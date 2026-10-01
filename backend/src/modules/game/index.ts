import { Router } from "express";
import multer from "multer";
import { session } from "../account/index.ts";
import { applyGameAction, newExpedition, type GameData } from "./state.ts";
import { changeState, readState } from "./store.ts";
import { summonPool } from "./summon.ts";
import { generatePdfExpedition } from "./pdf.ts";

const fail = (message: string, status = 400) => Object.assign(new Error(message), { status });
const snapshot = (game: GameData, rewards: string[] = []) => ({
  ...game, rewards, summonPool,
  expeditions: game.expeditions.map((expedition) => ({
    ...expedition,
    regions: expedition.regions.map(({ questionBank: _questionBank, ...region }) => region),
  })),
});

export const gameRouter = Router();

gameRouter.get("/game", async (_request, response) => {
  const { client, userId } = session(response.locals);
  response.json(snapshot((await readState(client, userId)).state));
});

gameRouter.post("/game", async (request, response) => {
  const body: Record<string, unknown> = request.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) throw fail("Invalid JSON");
  const { client, userId } = session(response.locals);
  const { game, result: rewards } = await changeState(client, userId, (game) => applyGameAction(game, body));
  response.json(snapshot(game, rewards));
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024, files: 1 } });
gameRouter.post("/game/forge", upload.single("file"), async (request, response) => {
  const file = request.file;
  if (!file || !/^[^\\/]{1,180}\.(pdf|docx)$/i.test(file.originalname) || !file.size) throw fail("Choose a PDF or DOCX up to 25 MB");
  const pdf = file.originalname.toLowerCase().endsWith(".pdf");
  if (pdf ? file.buffer.subarray(0, 4).toString() !== "%PDF" : file.buffer.subarray(0, 2).toString() !== "PK") throw fail("File content does not match its extension");
  const { client, userId } = session(response.locals);
  const expedition = pdf ? await generatePdfExpedition(file.originalname, file.buffer) : newExpedition(file.originalname);
  const path = `${userId}/${expedition.id}.${pdf ? "pdf" : "docx"}`;
  const stored = await client.storage.from("expeditions").upload(path, file.buffer, { contentType: pdf ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document", upsert: false });
  if (stored.error) throw stored.error;
  try {
    const { game } = await changeState(client, userId, (game) => { game.expeditions.push(expedition); });
    response.json(snapshot(game));
  } catch (error) {
    await client.storage.from("expeditions").remove([path]);
    throw error;
  }
});
