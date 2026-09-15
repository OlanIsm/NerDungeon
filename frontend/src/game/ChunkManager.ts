import { chunks, level, loop, WORLD } from "./level";
import type { Chunk } from "./types";

export class ChunkManager {
  readonly pool: Chunk[] = [];
  revision = 0;
  recycled = 0;
  private nextIndex = 0;
  private nextId = 0;

  constructor(public viewportHeight: number) {
    this.ensureCoverage();
  }

  private configure(chunk: Chunk, y: number) {
    const index = this.nextIndex++;
    const step = level[index];
    const type = step?.type ?? loop[(index - level.length) % loop.length];
    chunk.sequenceIndex = index;
    chunk.type = type;
    chunk.definition = chunks[type];
    chunk.spawn = chunks[type].spawn ? { ...chunks[type].spawn!, count: step?.enemyCount ?? chunks[type].spawn!.count } : undefined;
    chunk.y = y;
    chunk.generation++;
    chunk.canContainEncounter = chunks[type].triggerY !== undefined;
    chunk.encounterConsumed = false;
  }

  private ensureCoverage() {
    const count = Math.ceil(this.viewportHeight / WORLD.chunkHeight) + 2;
    while (this.pool.length < count) {
      const y = this.pool.length ? Math.min(...this.pool.map((chunk) => chunk.y)) - WORLD.chunkHeight : this.viewportHeight - WORLD.chunkHeight;
      const chunk: Chunk = {
        id: this.nextId++, sequenceIndex: 0, type: "forestStraight", height: WORLD.chunkHeight,
        y, generation: 0, definition: chunks.forestStraight, canContainEncounter: false, encounterConsumed: false,
      };
      this.configure(chunk, y);
      this.pool.push(chunk);
    }
  }

  resize(height: number, playerShift: number) {
    this.viewportHeight = height;
    for (const chunk of this.pool) chunk.y += playerShift;
    // Extend below the camera on a taller viewport without changing the upcoming route.
    let bottom = Math.max(...this.pool.map((chunk) => chunk.y + chunk.height));
    while (bottom < height) {
      this.pool.push({ id: this.nextId++, sequenceIndex: -1, type: "forestStraight", height: WORLD.chunkHeight,
        y: bottom, generation: 0, definition: chunks.forestStraight, canContainEncounter: false, encounterConsumed: true });
      bottom += WORLD.chunkHeight;
    }
    this.ensureCoverage();
    const limit = Math.ceil(height / WORLD.chunkHeight) + 2;
    while (this.pool.length > limit) {
      const top = this.pool.reduce((nearest, chunk) => chunk.y < nearest.y ? chunk : nearest);
      if (top.y + top.height > 0 || top.sequenceIndex !== this.nextIndex - 1) break;
      // Rewind unseen content so shrinking the pool cannot skip an authored encounter.
      this.nextIndex--;
      this.pool.splice(this.pool.indexOf(top), 1);
    }
    this.revision++;
  }

  advance(distance: number) {
    if (distance <= 0) return;
    for (const chunk of this.pool) chunk.y += distance;
    for (const chunk of this.pool) {
      while (chunk.y >= this.viewportHeight) {
        const top = Math.min(...this.pool.map((entry) => entry.y));
        this.configure(chunk, top - chunk.height);
        this.recycled++;
        this.revision++;
      }
    }
  }

  nextEncounter(playerY: number) {
    let nearest: Chunk | undefined;
    let distance = Infinity;
    for (const chunk of this.pool) {
      if (!chunk.canContainEncounter || chunk.encounterConsumed) continue;
      const remaining = playerY - (chunk.y + chunk.definition.triggerY!);
      if (remaining >= -0.01 && remaining < distance) { nearest = chunk; distance = Math.max(0, remaining); }
    }
    return { chunk: nearest, distance };
  }
}
