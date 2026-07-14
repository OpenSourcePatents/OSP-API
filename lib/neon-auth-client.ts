"use client";

import { createAuthClient } from "@neondatabase/auth/next";

/** Browser-side auth. Talks to our own /api/auth/* proxy, not Neon directly. */
export const authClient = createAuthClient();
