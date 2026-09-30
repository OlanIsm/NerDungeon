import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { initialGame, type GameData } from "./game.ts";

export function authClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase is not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export function dataClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase is not configured");
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

type Client = SupabaseClient;
type Row = { state: GameData; version: number };

export async function readState(client: Client, userId: string): Promise<Row> {
  const existing = await client.from("game_states").select("state,version").eq("user_id", userId).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return existing.data as Row;
  const created = await client.from("game_states").insert({ user_id: userId, state: initialGame() }).select("state,version").single();
  if (!created.error) return created.data as Row;
  if (created.error.code !== "23505") throw created.error;
  const raced = await client.from("game_states").select("state,version").eq("user_id", userId).single();
  if (raced.error) throw raced.error;
  return raced.data as Row;
}

export async function changeState<T>(client: Client, userId: string, change: (game: GameData) => T): Promise<{ game: GameData; result: T }> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const row = await readState(client, userId);
    const game = structuredClone(row.state);
    const result = change(game);
    const updated = await client.from("game_states")
      .update({ state: game, version: row.version + 1 })
      .eq("user_id", userId).eq("version", row.version).select("version").maybeSingle();
    if (updated.error) throw updated.error;
    if (updated.data) return { game, result };
  }
  throw new Error("Concurrent update limit reached");
}
