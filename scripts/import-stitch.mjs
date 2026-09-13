import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

// Preserve source URLs and deduplicate the exact artwork used by Stitch.
const root = path.resolve('docs/stitch/nerdungeon-educational-rpg-ui');
const output = path.resolve('frontend/assets/stitch');
fs.mkdirSync(output, { recursive: true });
const urls = new Map();
const screens = {};
for (const slug of ['home-page', 'adventure-page', 'gacha-page', 'inventory-page', 'battle-study-page']) {
  const html = fs.readFileSync(path.join(root, slug, 'index.html'), 'utf8');
  const matches = [...html.matchAll(/(?:src="|url\(')(https:\/\/lh3\.googleusercontent\.com\/[^"')]+)/g)];
  screens[slug] = matches.map((match) => {
    const url = match[1];
    if (!urls.has(url)) urls.set(url, `art-${String(urls.size).padStart(2, '0')}.png`);
    return urls.get(url);
  });
}
for (const [url, file] of urls) {
  const target = path.join(output, file);
  if (!fs.existsSync(target)) execFileSync('curl.exe', ['-L', '--fail', '--silent', '--show-error', url, '-o', target]);
}
fs.writeFileSync(path.join(output, 'sources.json'), JSON.stringify({ source: 'User-provided Stitch project 11414880717679601819', screens, artwork: Object.fromEntries([...urls].map(([url, file]) => [file, url])) }, null, 2) + '\n');
console.log(JSON.stringify(screens, null, 2));
