import { getAuth } from "@/lib/neon-auth";

/**
 * Proxies all Neon Auth traffic (sign-up, sign-in, OAuth callbacks, verification).
 *
 * The handler is resolved per request rather than at module load so that
 * importing this route during `next build` never requires the runtime auth
 * secret. getAuth() memoizes the instance, so this is cheap after the first hit.
 */
type Handlers = ReturnType<NeonAuthHandler>;
type NeonAuthHandler = ReturnType<typeof getAuth>["handler"];

let handlers: Handlers | null = null;
function h(): Handlers {
  if (!handlers) handlers = getAuth().handler();
  return handlers;
}

export const GET: Handlers["GET"] = (req, ctx) => h().GET(req, ctx);
export const POST: Handlers["POST"] = (req, ctx) => h().POST(req, ctx);
