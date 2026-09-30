import express, { type ErrorRequestHandler } from "express";
import multer from "multer";
import { type SupabaseClient } from "@supabase/supabase-js";
import { applyGameAction, GameActionError, newExpedition, type GameData } from "./lib/game.ts";
import { authClient, changeState, dataClient, readState } from "./lib/store.ts";
import { summonPool } from "./lib/summon.ts";

type Session = { client: SupabaseClient; userId: string; email: string | null };
const session = (locals: Record<string, unknown>) => locals as Session;
const fail = (message: string, status = 400) => Object.assign(new Error(message), { status });
const snapshot = (game: GameData, rewards: string[] = []) => ({ ...game, rewards, summonPool });

export const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use("/api", async (request, response, next) => {
  response.set("Cache-Control", "private, no-store");
  const origin = process.env.CORS_ORIGIN;
  if (origin && request.headers.origin === origin) {
    response.set("Access-Control-Allow-Origin", origin);
    response.set("Vary", "Origin");
    response.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
    response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  }
  if (request.method === "OPTIONS") return void response.sendStatus(204);
  const token = /^Bearer (\S+)$/.exec(request.headers.authorization ?? "")?.[1];
  if (!token) return void response.status(401).json({ error: "unauthenticated" });
  try {
    const { data, error } = await authClient().auth.getUser(token);
    if (error || !data.user) {
      const unavailable = !!error && ![400, 401, 403, 404].includes(error.status ?? 0);
      return void response.status(unavailable ? 503 : 401).json({ error: unavailable ? "auth_unavailable" : "unauthenticated" });
    }
    const client = dataClient();
    Object.assign(response.locals, { client, userId: data.user.id, email: data.user.email ?? null });
    next();
  } catch (error) { next(error); }
});

app.get("/api/me", (_request, response) => {
  const { userId, email } = session(response.locals);
  response.json({ user: { id: userId, email }, entitlements: null });
});

app.get("/api/game", async (_request, response) => {
  const { client, userId } = session(response.locals);
  response.json(snapshot((await readState(client, userId)).state));
});

app.post("/api/game", async (request, response) => {
  const body: Record<string, unknown> = request.body;
  if (!body || typeof body !== "object" || Array.isArray(body)) throw fail("Invalid JSON");
  const { client, userId } = session(response.locals);
  const { game, result: rewards } = await changeState(client, userId, (game) => applyGameAction(game, body));
  response.json(snapshot(game, rewards));
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 25 * 1024 * 1024, files: 1 } });
app.post("/api/game/forge", upload.single("file"), async (request, response) => {
  const file = request.file;
  if (!file || !/^[^\\/]{1,180}\.(pdf|docx)$/i.test(file.originalname) || !file.size) throw fail("Choose a PDF or DOCX up to 25 MB");
  const pdf = file.originalname.toLowerCase().endsWith(".pdf");
  if (pdf ? file.buffer.subarray(0, 4).toString() !== "%PDF" : file.buffer.subarray(0, 2).toString() !== "PK") throw fail("File content does not match its extension");
  const { client, userId } = session(response.locals);
  const expedition = newExpedition(file.originalname);
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

const errors: ErrorRequestHandler = (error: Error & { status?: number; type?: string }, _request, response, _next) => {
  if (error instanceof multer.MulterError) return void response.status(400).json({ error: "Choose a PDF or DOCX up to 25 MB" });
  if (error.type === "entity.parse.failed") return void response.status(400).json({ error: "Invalid JSON" });
  if (error.status && error.status < 500) return void response.status(error.status).json({ error: error.message });
  if (error instanceof GameActionError) return void response.status(400).json({ error: error.message });
  console.error(error);
  response.status(500).json({ error: "Server unavailable" });
};
app.use(errors);
