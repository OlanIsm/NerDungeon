import assert from "node:assert/strict";
import { test } from "node:test";
import { applyGameAction, GameActionError, initialGame } from "../src/lib/game.ts";
import { app } from "../src/app.ts";

test("new accounts start with only the tutorial and chapter rewards cannot be claimed twice", () => {
  const game = initialGame();
  assert.deepEqual(game.expeditions.map((item) => item.id), ["tutorial"]);
  applyGameAction(game, { action: "complete" });
  assert.equal(game.expeditions[0].progress, 33);
  assert.equal(game.gold, 1900);
  applyGameAction(game, { action: "complete" });
  assert.equal(game.gold, 1900);
  assert.throws(() => applyGameAction(game, { action: "start", expeditionId: "tutorial", chapter: 4 }), GameActionError);
});

test("summons charge the requested amount and reject invalid counts", () => {
  const game = initialGame();
  assert.equal(applyGameAction(game, { action: "summon", count: 1 }).length, 1);
  assert.equal(game.gems, 220);
  assert.throws(() => applyGameAction(game, { action: "summon", count: 2 }), GameActionError);
  assert.equal(game.gems, 220);
});

test("game API rejects requests without an access token", async () => {
  const server = app.listen(0);
  try {
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const response = await fetch(`http://127.0.0.1:${address.port}/api/game`);
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: "unauthenticated" });
  } finally {
    server.close();
  }
});
