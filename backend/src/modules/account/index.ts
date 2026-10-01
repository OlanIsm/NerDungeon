import { Router, type RequestHandler } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import { authClient, dataClient } from "../../platform/supabase.ts";

type Session = { client: SupabaseClient; userId: string; email: string | null };
export const session = (locals: Record<string, unknown>) => locals as Session;

export const authenticate: RequestHandler = async (request, response, next) => {
  const token = /^Bearer (\S+)$/.exec(request.headers.authorization ?? "")?.[1];
  if (!token) return void response.status(401).json({ error: "unauthenticated" });
  try {
    const { data, error } = await authClient().auth.getUser(token);
    if (error || !data.user) {
      const unavailable = !!error && ![400, 401, 403, 404].includes(error.status ?? 0);
      return void response.status(unavailable ? 503 : 401).json({ error: unavailable ? "auth_unavailable" : "unauthenticated" });
    }
    Object.assign(response.locals, { client: dataClient(), userId: data.user.id, email: data.user.email ?? null });
    next();
  } catch (error) { next(error); }
};

export const accountRouter = Router();
accountRouter.get("/me", (_request, response) => {
  const { userId, email } = session(response.locals);
  response.json({ user: { id: userId, email }, entitlements: null });
});
