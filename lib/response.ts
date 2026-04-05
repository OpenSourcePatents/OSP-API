import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "X-API-Key, Content-Type",
};

export function ok(data: unknown, meta?: Record<string, unknown>) {
  const body = meta ? { data, meta } : { data };
  return NextResponse.json(body, { status: 200, headers: corsHeaders });
}

export function paginated(
  data: unknown[],
  page: number,
  per_page: number,
  total: number
) {
  return NextResponse.json(
    { data, meta: { page, per_page, total } },
    { status: 200, headers: corsHeaders }
  );
}

export function err(message: string, status: number = 400) {
  return NextResponse.json(
    { error: message },
    { status, headers: corsHeaders }
  );
}

export function options() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
