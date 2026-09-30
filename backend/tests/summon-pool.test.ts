import assert from "node:assert/strict";
import { test } from "node:test";
import { summonPool } from "../src/lib/summon.ts";

test("published odds match the uniform summon pool", () => {
  assert.equal(new Set(summonPool.map(item => item.name)).size, summonPool.length);
  assert.equal(summonPool.reduce((sum, item) => sum + item.chance, 0), 100);
  for (const item of summonPool) assert.equal(item.chance, 100 / summonPool.length);
  const totals = summonPool.reduce<Record<string, number>>((result, item) => {
    result[item.rarity] = (result[item.rarity] ?? 0) + item.chance;
    return result;
  }, {});
  assert.deepEqual(totals, { Rare: 50, Epic: 25, Common: 25 });
});
