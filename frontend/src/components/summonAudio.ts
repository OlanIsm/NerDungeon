// Short synthesized effects; no downloaded audio or background music.
export function summonAudio(enabled: boolean) {
  let context: AudioContext | undefined;
  try { context = new AudioContext(); void context.resume().catch(() => {}); } catch { /* Sound is optional. */ }
  let audible = enabled;
  function tone(frequency: number, delay: number, duration: number, volume = .055, type: OscillatorType = "sine") {
    if (!context || !audible || document.hidden || context.state === "closed") return;
    const at = context.currentTime + delay;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, at);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(volume, at + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, at + duration);
    oscillator.connect(gain); gain.connect(context.destination);
    oscillator.start(at); oscillator.stop(at + duration + .02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  function visibility() {
    if (!context || context.state === "closed") return;
    if (document.hidden) void context.suspend().catch(() => {});
    else if (audible) void context.resume().catch(() => {});
  }
  document.addEventListener("visibilitychange", visibility);
  return {
    setEnabled(value: boolean) {
      audible = value;
      if (context && context.state !== "closed") {
        if (value) void context.resume().catch(() => {});
        else void context.suspend().catch(() => {});
      }
    },
    play(kind: "gather" | "charge" | "open" | "reveal" | "slide", rare = false) {
      if (kind === "gather") [196, 247, 294, 392].forEach((note, i) => tone(note, i * .09, .5, .035));
      if (kind === "charge") [0, .18, .34, .48, .6, .7, .78].forEach((delay, i) => tone(65 + i * 11, delay, .13, .065, "triangle"));
      if (kind === "open") {
        tone(65, 0, .55, .12, "triangle");
        [262, 330, 392, 523, 659, 784].forEach((note, i) => tone(note, i * .065, .9, .05));
      }
      if (kind === "reveal") [523, 659, 784, ...(rare ? [1047, 1319] : [])].forEach((note, i) => tone(note, i * .07, .65, .045));
      if (kind === "slide") { tone(180, 0, .09, .045, "triangle"); tone(110, .03, .12, .025); }
    },
    close() {
      document.removeEventListener("visibilitychange", visibility);
      if (context && context.state !== "closed") void context.close().catch(() => {});
    },
  };
}
export type SummonAudio = ReturnType<typeof summonAudio>;
