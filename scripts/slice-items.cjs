const fs = require("node:fs");
const path = require("node:path");
const { PNG } = require("pngjs");

const sheets = {
  armor: {
    file: "a.png",
    names: ["blue-mage-robe", "flame-mage-robe", "forest-mage-robe", "celestial-mage-robe", "scholar-armor", "shadow-armor", "ranger-armor", "royal-armor"],
  },
  weapon: {
    file: "s.png",
    names: ["quill-staff", "scholar-sword", "crystal-staff", "training-sword", "astral-staff", "oak-tome", "flame-quill", "orb-staff"],
  },
  accessories: {
    file: "w.png",
    names: ["arcane-amulet", "spectacles", "star-gem", "sapphire-ring", "scholar-ribbon", "moon-bracelet", "prism-pendant", "clock-amulet"],
  },
  potion: {
    file: "s.png",
    names: ["hp-elixir", "mp-elixir", "nature-elixir", "gold-elixir", "revival-elixir", "mind-elixir", "attack-elixir", "healing-pouch"],
  },
};

for (const [group, { file, names }] of Object.entries(sheets)) {
  const source = path.join(__dirname, "..", "frontend", "assets", "item", group, file);
  const target = path.join(__dirname, "..", "frontend", "assets", "item", "sliced", group);
  const sheet = PNG.sync.read(fs.readFileSync(source));
  if (sheet.width !== 1254 || sheet.height !== 1254) throw new Error(`Unexpected dimensions: ${source}`);
  fs.mkdirSync(target, { recursive: true });
  names.forEach((name, index) => {
    const column = index % 4;
    const row = Math.floor(index / 4);
    const startX = Math.floor((column * sheet.width) / 4);
    const endX = Math.floor(((column + 1) * sheet.width) / 4);
    const startY = Math.floor((row * sheet.height) / 2);
    const endY = Math.floor(((row + 1) * sheet.height) / 2);
    let minX = endX, minY = endY, maxX = startX - 1, maxY = startY - 1;
    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        if (sheet.data[(y * sheet.width + x) * 4 + 3] <= 8) continue;
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);
      }
    }
    if (maxX < minX) throw new Error(`Empty sprite: ${group}/${name}`);
    const padding = 8;
    const width = maxX - minX + 1 + padding * 2;
    const height = maxY - minY + 1 + padding * 2;
    const sprite = new PNG({ width, height });
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const from = (y * sheet.width + x) * 4;
        const to = ((y - minY + padding) * width + x - minX + padding) * 4;
        sheet.data.copy(sprite.data, to, from, from + 4);
      }
    }
    fs.writeFileSync(path.join(target, `${name}.png`), PNG.sync.write(sprite));
  });
  console.log(`${group}: ${names.length} sprites`);
}
