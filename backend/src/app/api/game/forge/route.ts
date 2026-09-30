import { NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { demoAllowed, newExpedition, readGame, writeGame } from "@/lib/game";
import { summonPool } from "@/lib/summon";
const headers = { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
export function OPTIONS() { return new Response(null, { status: 204, headers }); }

export async function POST(request: NextRequest) {
  if (!demoAllowed()) return NextResponse.json({ error: "Demo game API disabled" }, { status: 503, headers });
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || !/^[^\\/]{1,180}\.(pdf|docx)$/i.test(file.name) || file.size < 1 || file.size > 25 * 1024 * 1024)
    return NextResponse.json({ error: "Choose a PDF or DOCX up to 25 MB" }, { status: 400, headers });
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdf = file.name.toLowerCase().endsWith(".pdf");
  if (pdf ? !(bytes[0] === 37 && bytes[1] === 80 && bytes[2] === 68 && bytes[3] === 70) : !(bytes[0] === 80 && bytes[1] === 75))
    return NextResponse.json({ error: "File content does not match its extension" }, { status: 400, headers });
  const expedition = newExpedition(file.name);
  const game = await readGame();
  await mkdir(join(process.cwd(), "data", "uploads"), { recursive: true });
  await writeFile(join(process.cwd(), "data", "uploads", `${expedition.id}.${pdf ? "pdf" : "docx"}`), bytes);
  game.expeditions.unshift(expedition);
  await writeGame(game);
  return NextResponse.json({ ...game, summonPool }, { headers });
}
