import assert from "node:assert/strict";
import { PDFDocument } from "pdf-lib";
import { app } from "../src/app.ts";
import { authClient, dataClient } from "../src/platform/supabase.ts";
import type { GameData } from "../src/modules/game/state.ts";

// Live smoke test: uses Gemini quota and a temporary anonymous Supabase account.
const client = dataClient();
const schema = await client.from("game_states").select("user_id").limit(0);
if (schema.error) throw new Error("Apply backend/supabase/migrations/20260930000000_game_backend.sql before running live PDF verification.");
const auth = authClient();
const signedIn = await auth.auth.signInAnonymously();
if (signedIn.error || !signedIn.data.session) throw new Error("Live verification could not create an anonymous account. Check Supabase Auth settings.");
const userId = signedIn.data.user!.id;
const server = app.listen(0);
let storedPath: string | undefined;
try {
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const base = `http://127.0.0.1:${address.port}/api/game`;
  const headers = { Authorization: `Bearer ${signedIn.data.session.access_token}` };
  const document = await PDFDocument.create();
  const page = document.addPage();
  const lines = [
    "Kinetic energy is the energy of motion.",
    "Formula: Ek = 1/2 m v^2. Mass m is in kilograms, speed v in meters per second.",
    "The unit of kinetic energy is the joule.",
    "A 2 kg object moving at 3 m/s has 9 joules of kinetic energy.",
    "Doubling mass at fixed speed doubles kinetic energy.",
    "Doubling speed at fixed mass multiplies kinetic energy by four.",
    "An object at rest has zero kinetic energy.",
  ];
  lines.forEach((line, index) => page.drawText(line, { x: 35, y: 740 - index * 30, size: 12 }));
  const bytes = await document.save();
  const form = new FormData();
  form.append("file", new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), "verify-kinetic-energy.pdf");
  const response = await fetch(`${base}/forge`, { method: "POST", headers, body: form });
  console.log("Live PDF forge HTTP", response.status);
  const snapshot = await response.json();
  if (!response.ok) throw new Error(snapshot.error ?? "Live PDF forge failed");
  const expedition = snapshot.expeditions.find((item: { id: string }) => item.id !== "tutorial");
  assert.ok(expedition);
  storedPath = `${userId}/${expedition.id}.pdf`;
  assert.match(JSON.stringify(expedition.regions), /kinetik|kinetic/i);
  assert.equal(expedition.regions[0].questionBank, undefined);
  const row = await client.from("game_states").select("state").eq("user_id", userId).single();
  if (row.error) throw new Error("Live verification could not read saved game state");
  const saved = (row.data.state as GameData).expeditions.find((item) => item.id === expedition.id)!;
  assert.ok(saved.regions.every((region) => region.material && region.questionBank && region.questionBank.length >= 3));
  const file = await client.storage.from("expeditions").download(storedPath);
  if (file.error || !file.data) throw new Error("Live verification could not download saved source PDF");
  assert.deepEqual(Buffer.from(await file.data.arrayBuffer()), Buffer.from(bytes));
  const reloaded = await fetch(base, { headers });
  assert.equal(reloaded.status, 200);
  assert.equal((await reloaded.json()).expeditions.length, 2);
  console.log("PASS: PDF content, validated questions, source pages, Storage and reload", { chapters: saved.regions.length, questions: saved.regions.reduce((count, region) => count + region.questions, 0) });
} finally {
  server.close();
  if (storedPath) {
    const removed = await client.storage.from("expeditions").remove([storedPath]);
    if (removed.error) console.error("Could not clean up the verification PDF");
  }
  const deleted = await client.auth.admin.deleteUser(userId);
  if (deleted.error) console.error("Could not clean up the verification account");
}
