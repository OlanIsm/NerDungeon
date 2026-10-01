import type { GameData, Question, Region } from "./state.ts";

export class GameActionError extends Error {}
export type Answer = { questionId: string; selectedIndex: number; correct: boolean };
export type Battle = { id: string; expeditionId: string; chapter: number; answers: Answer[]; status: "active" | "passed" | "failed"; goldReward: number; xpReward: number };
export type BattleResult = Battle & { total: number; correct: number; completedAt: string };

function activeRegion(game: GameData, battle: Pick<Battle, "expeditionId" | "chapter">): Region {
  const region = game.expeditions.find((item) => item.id === battle.expeditionId)?.regions.find((item) => item.chapter === battle.chapter);
  if (!region?.questionBank?.length) throw new GameActionError("This chapter has no generated questions. Upload a PDF to study.");
  return region;
}

export function applyBattleAction(game: GameData, body: Record<string, unknown>): void {
  if (body.action === "start") {
    const expedition = game.expeditions.find((item) => item.id === body.expeditionId);
    const chapter = body.chapter;
    const unlocked = expedition ? Math.min(expedition.regions.length, Math.round(expedition.progress * expedition.regions.length / 100) + 1) : 0;
    if (!expedition || typeof chapter !== "number" || !Number.isInteger(chapter) || chapter < 1 || chapter > unlocked) throw new GameActionError("Invalid chapter");
    activeRegion(game, { expeditionId: expedition.id, chapter });
    const existing = game.battle;
    if (!existing || existing.status !== "active" || existing.expeditionId !== expedition.id || existing.chapter !== chapter) {
      game.battle = { id: crypto.randomUUID(), expeditionId: expedition.id, chapter, answers: [], status: "active", goldReward: 0, xpReward: 0 };
    }
    game.lastAdventure = { expeditionId: expedition.id, chapter };
    return;
  }
  const battle = game.battle;
  if (!battle || body.battleId !== battle.id) throw new GameActionError("Invalid battle. Start or resume the chapter first.");
  const questions = activeRegion(game, battle).questionBank!;
  if (body.action === "answer") {
    const selected = body.selectedIndex;
    if (typeof selected !== "number" || !Number.isInteger(selected)) throw new GameActionError("Choose a valid answer");
    const previous = battle.answers.find((answer) => answer.questionId === body.questionId);
    if (previous) {
      if (previous.selectedIndex !== selected) throw new GameActionError("This question has already been answered");
      return; // A retry after a lost response must not submit or score the answer twice.
    }
    const question = questions[battle.answers.length];
    if (battle.status !== "active" || !question || body.questionId !== question.id || selected < 0 || selected >= question.options.length) throw new GameActionError("Invalid or out-of-order question");
    battle.answers.push({ questionId: question.id, selectedIndex: selected, correct: selected === question.answerIndex });
    return;
  }
  if (body.action !== "complete") throw new GameActionError("Unknown action");
  if (battle.status !== "active") return;
  if (battle.answers.length !== questions.length) throw new GameActionError("Answer every question before completing the chapter");
  const correct = battle.answers.filter((answer) => answer.correct).length;
  battle.status = correct >= Math.ceil(questions.length * 0.6) ? "passed" : "failed";
  const expedition = game.expeditions.find((item) => item.id === battle.expeditionId)!;
  const progress = Math.round(battle.chapter / expedition.regions.length * 100);
  if (battle.status === "passed" && progress > expedition.progress) {
    expedition.progress = progress;
    battle.goldReward = 450;
    battle.xpReward = 100;
    game.gold += battle.goldReward;
    game.xp += battle.xpReward;
  }
  // ponytail: retain the latest 20 completed attempts in the state row; use a result table for longer history.
  game.battleHistory = [...(game.battleHistory ?? []), { ...structuredClone(battle), total: questions.length, correct, completedAt: new Date().toISOString() }].slice(-20);
}

export function battleSnapshot(game: GameData) {
  const battle = game.battle;
  if (!battle) return null;
  const questions = activeRegion(game, battle).questionBank!;
  const next = battle.status === "active" ? questions[battle.answers.length] : undefined;
  const previous = battle.answers.at(-1);
  const answered = previous ? questions.find((question) => question.id === previous.questionId) : undefined;
  const publicQuestion = (question: Question) => ({ id: question.id, prompt: question.prompt, options: question.options, sourcePage: question.sourcePage });
  return {
    ...battle, total: questions.length, correct: battle.answers.filter((answer) => answer.correct).length,
    requiredCorrect: Math.ceil(questions.length * 0.6),
    question: next ? publicQuestion(next) : null,
    feedback: previous && answered ? { ...publicQuestion(answered), ...previous, answerIndex: answered.answerIndex, explanation: answered.explanation } : null,
  };
}
