const { spawn, execFileSync } = require('node:child_process');
const { resolve } = require('node:path');

// Run both services with one command; never fall back to an unrelated API port.
const root = resolve(__dirname, '..');
const children = [
  spawn(process.execPath, ['--watch', '--env-file-if-exists=.env', 'src/server.ts'], { cwd: resolve(root, 'backend'), stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/vite/bin/vite.js'], { cwd: resolve(root, 'frontend'), stdio: 'inherit' }),
];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  children.forEach(child => {
    if (child.exitCode !== null || child.signalCode !== null) return;
    if (process.platform === 'win32' && child.pid) {
      // Node watch spawns an API child; terminate our tree so it cannot keep the port occupied.
      try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore', windowsHide: true }); } catch { /* Child already exited. */ }
    } else child.kill();
  });
  process.exitCode = code;
}
children.forEach(child => {
  child.on('error', error => { console.error(error.message); stop(1); });
  child.on('exit', code => stop(code ?? 0));
});
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
