export const DEPTH = { farScale: 0.65, nearScale: 1.15, farSpread: 0.42, nearSpread: 1.16, roadTop: 56, roadBottom: 254 };
const fraction = (y: number, height: number) => Math.max(0, Math.min(1, y / height));
export const depthAt = (y: number, height: number) => DEPTH.farScale + (DEPTH.nearScale - DEPTH.farScale) * fraction(y, height);
export const spreadAt = (y: number, height: number) => DEPTH.farSpread + (DEPTH.nearSpread - DEPTH.farSpread) * fraction(y, height);
export const projectedX = (x: number, y: number, height: number) => 180 + (x - 180) * spreadAt(y, height);
