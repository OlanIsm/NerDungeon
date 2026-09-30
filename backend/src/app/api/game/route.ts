import { NextRequest, NextResponse } from "next/server";
import { demoAllowed, readGame, writeGame } from "@/lib/game";
import { randomInt } from "node:crypto";
import { summonPool } from "@/lib/summon";

export const dynamic = "force-dynamic";
const headers = { "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Allow-Methods": "GET, POST, OPTIONS" };
const fail = (error: string, status = 400) => NextResponse.json({ error }, { status, headers });

export function OPTIONS() { return new Response(null, { status: 204, headers }); }

export async function GET() {
  if (!demoAllowed()) return fail("Demo game API disabled", 503);
  return NextResponse.json({ ...await readGame(), summonPool }, { headers });
}

export async function POST(request: NextRequest) {
  if (!demoAllowed()) return fail("Demo game API disabled", 503);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return fail("Invalid JSON"); }
  const game = await readGame();
  let rewards: string[] = [];
  if (body.action === "start") {
    const expedition = game.expeditions.find((item) => item.id === body.expeditionId);
    const chapter = Number(body.chapter);
    if (!expedition || !Number.isInteger(chapter) || chapter < 1 || chapter > expedition.regions.length) return fail("Invalid chapter");
    game.lastAdventure = { expeditionId: expedition.id, chapter };
  } else if (body.action === "complete") {
    const last = game.lastAdventure;
    const expedition = game.expeditions.find((item) => item.id === last?.expeditionId);
    if (!last || !expedition) return fail("No active adventure");
    const progress = Math.round(last.chapter / expedition.regions.length * 100);
    if (progress > expedition.progress) {
      expedition.progress = progress;
      game.gold += 450;
      game.xp += 100;
    }
  } else if (body.action === "summon") {
    const count = body.count;
    const cost = count === 10 ? 900 : count === 1 ? 100 : 0;
    if (!cost) return fail("Invalid summon count");
    if (game.gems < cost) return fail("Not enough gems");
    game.gems -= cost;
    game.favor = (game.favor + Number(count)) % 10;
    rewards = Array.from({ length: Number(count) }, () => summonPool[randomInt(summonPool.length)].name);
    game.inventory.push(...rewards);
  } else return fail("Unknown action");
  await writeGame(game);
  return NextResponse.json({ ...game, rewards, summonPool }, { headers });
}
