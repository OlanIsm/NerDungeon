import { app } from "./app.ts";

for (const name of ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "SUPABASE_SECRET_KEY"]) {
  if (!process.env[name]) throw new Error(`${name} is required. Fill backend/.env before starting the API.`);
}
const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`Nerdungeon API listening on http://localhost:${port}`));
