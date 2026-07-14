import { auth } from "@/lib/neon-auth";

/** Proxies all Neon Auth traffic (sign-up, sign-in, OAuth callbacks, verification). */
export const { GET, POST } = auth.handler();
