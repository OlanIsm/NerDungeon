import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { startAuthFixture } from "./auth-server.ts";

const require = createRequire(import.meta.url);
const fixture = await startAuthFixture({ port: 54329, controls: true });
const app = spawn(process.execPath, [require.resolve("next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", "3102"], {
  stdio: "inherit",
  windowsHide: true,
  env: {
    ...process.env,
    NEXT_PUBLIC_SUPABASE_URL: fixture.url,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: fixture.anonKey,
  },
});

app.once("error", async (error) => {
  console.error(error.message);
  await fixture.close();
  process.exitCode = 1;
});
app.once("exit", async (code) => {
  await fixture.close();
  process.exitCode = code ?? 0;
});
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.once(signal, () => app.kill());
}
