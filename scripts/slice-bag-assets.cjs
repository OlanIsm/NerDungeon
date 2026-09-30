const fs = require("node:fs");
const path = require("node:path");
const { PNG } = require("pngjs");

const root = path.join(__dirname, "..", "frontend", "assets");

function read(file) {
  return PNG.sync.read(fs.readFileSync(path.join(root, file)));
}

function write(file, source, x0, y0, x1, y1) {
  const width = x1 - x0;
  const height = y1 - y0;
  const target = new PNG({ width, height });
  for (let y = 0; y < height; y++) {
    const from = ((y + y0) * source.width + x0) * 4;
    source.data.copy(target.data, y * width * 4, from, from + width * 4);
  }
  const destination = path.join(root, file);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, PNG.sync.write(target));
}

const icons = read("mini icon/mini icon.png");
if (icons.width !== 1254 || icons.height !== 1254) throw new Error("Unexpected mini-icon sheet size");
const columns = [[22, 309], [323, 612], [642, 923], [945, 1236]];
const rows = [[139, 466], [512, 817], [844, 1158]];
const names = [
  ["crossed-swords", "oak-tome", "hp-potion", "chest"],
  ["heart", "water", "golden-swords", "shield"],
  ["clue-bulb", "attack-bolt", "heal-plus", "retry-scroll"],
];
rows.forEach(([y0, y1], row) => {
  columns.forEach(([x0, x1], column) => {
    write(`mini icon/sliced/${names[row][column]}.png`, icons, x0, y0, x1, y1);
  });
});

for (const panel of ["top", "bottom"]) {
  const image = read(`GUI/bag-scroll-${panel}.png`);
  if (image.width !== 1536 || image.height !== 1024) throw new Error(`Unexpected bag-scroll-${panel} size`);
  const xs = [0, 150, 1386, image.width];
  const ys = [0, 150, 874, image.height];
  const pieces = [
    ["top-left", 0, 0], ["top", 1, 0], ["top-right", 2, 0],
    ["left", 0, 1], ["center", 1, 1], ["right", 2, 1],
    ["bottom-left", 0, 2], ["bottom", 1, 2], ["bottom-right", 2, 2],
  ];
  pieces.forEach(([name, column, row]) => {
    write(`GUI/bag-scroll-${panel}-9/${name}.png`, image, xs[column], ys[row], xs[column + 1], ys[row + 1]);
  });
}

console.log("12 mini icons and 18 bag-scroll slices");
