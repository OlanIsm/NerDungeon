import { useRef, useState } from "react";
import type { BattleView } from "../gameApi";
import { Button } from "./GameUI";

export function BattleQuiz({ battle, checkpoint, tutorial, onAnswer, onAdvance }: {
  battle: BattleView; checkpoint: number; tutorial: boolean;
  onAnswer: (questionId: string, selectedIndex: number) => Promise<void>;
  onAdvance: () => void;
}) {
  const [selected, setSelected] = useState<number>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const [acknowledged, setAcknowledged] = useState<string>();
  const pending = useRef(false);
  const previousCheckpoint = Math.ceil(battle.total * Math.min(checkpoint - 1, 3) / 3);
  const feedback = battle.feedback && battle.feedback.questionId !== acknowledged && battle.answers.length > previousCheckpoint ? battle.feedback : null;
  const question = battle.question;
  const cleared = battle.finished || battle.answers.length >= Math.ceil(battle.total * Math.min(checkpoint, 3) / 3);
  async function submit() {
    if (!question || selected === undefined || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError(undefined);
    try {
      await onAnswer(question.id, selected);
      setSelected(undefined);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save your answer. Try again.");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <section className="battle-quiz" aria-label="Chapter question">
      <p className="quiz-progress">{battle.answers.length} / {battle.total} answered · Finish with HP remaining to win</p>
      {feedback ? (
        <div className="quiz-feedback" role="status">
          <h2>{feedback.correct ? "Correct!" : "Not quite"}</h2>
          <p className="combat-damage">{feedback.correct ? "Enemy takes 50 damage." : "You take 50 damage."} {feedback.correct && battle.correct % 2 === 0 ? "Enemy defeated!" : ""}</p>
          <p>{feedback.prompt}</p>
          <p><strong>Answer:</strong> {feedback.options[feedback.answerIndex]}</p>
          <p>{feedback.explanation}</p>
          <p className="quiz-source">{tutorial ? "Tutorial material" : `PDF page ${feedback.sourcePage}`}</p>
          <Button label="Continue" tone="gold" onPress={() => {
            setAcknowledged(feedback.questionId);
            if (cleared) onAdvance();
          }} />
        </div>
      ) : cleared || !question ? (
        <Button label="Continue trail" tone="gold" onPress={onAdvance} />
      ) : (
        <form onSubmit={(event) => { event.preventDefault(); void submit(); }}>
          <fieldset disabled={busy}>
            <legend>{question.prompt}</legend>
            <div className="quiz-options">
              {question.options.map((option, index) => (
                <label key={`${question.id}-${index}`} className={`quiz-option ${selected === index ? "selected" : ""}`}>
                  <input type="radio" name={`answer-${question.id}`} value={index} checked={selected === index} onChange={() => setSelected(index)} />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <p className="quiz-source">{tutorial ? "Tutorial material" : `PDF page ${question.sourcePage}`}</p>
          {error && <p className="quiz-error" role="alert">{error}</p>}
          <Button label={busy ? "Saving answer…" : "Submit answer"} tone="gold" disabled={selected === undefined || busy} onPress={() => void submit()} />
        </form>
      )}
    </section>
  );
}
