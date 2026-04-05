const OSP_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const OSP_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const CONGRESS_URL = process.env.CONGRESS_SUPABASE_URL!;
const CONGRESS_KEY = process.env.CONGRESS_SUPABASE_SERVICE_KEY!;

interface QueryParams {
  select?: string;
  eq?: Record<string, string | number>;
  gte?: Record<string, string | number>;
  lte?: Record<string, string | number>;
  ilike?: Record<string, string>;
  textSearch?: Record<string, string>;
  order?: string;
  ascending?: boolean;
  limit?: number;
  offset?: number;
  single?: boolean;
  count?: boolean;
  head?: boolean;
}

interface QueryResult<T = Record<string, unknown>> {
  data: T | T[] | null;
  count: number | null;
  error: string | null;
}

interface InsertParams {
  returning?: string;
}

interface InsertResult<T = Record<string, unknown>> {
  data: T | null;
  error: string | null;
}

interface RpcResult {
  error: string | null;
}

async function query<T = Record<string, unknown>>(
  baseUrl: string,
  apiKey: string,
  table: string,
  params: QueryParams = {}
): Promise<QueryResult<T>> {
  const url = new URL(`${baseUrl}/rest/v1/${table}`);

  if (params.select) url.searchParams.set("select", params.select);
  if (params.eq) {
    for (const [col, val] of Object.entries(params.eq)) {
      url.searchParams.set(col, `eq.${val}`);
    }
  }
  if (params.gte) {
    for (const [col, val] of Object.entries(params.gte)) {
      url.searchParams.set(col, `gte.${val}`);
    }
  }
  if (params.lte) {
    for (const [col, val] of Object.entries(params.lte)) {
      url.searchParams.set(col, `lte.${val}`);
    }
  }
  if (params.ilike) {
    for (const [col, val] of Object.entries(params.ilike)) {
      url.searchParams.set(col, `ilike.${val}`);
    }
  }
  if (params.textSearch) {
    for (const [col, val] of Object.entries(params.textSearch)) {
      url.searchParams.set(col, `fts.${val}`);
    }
  }
  if (params.order) {
    const dir = params.ascending === false ? "desc" : "asc";
    url.searchParams.set("order", `${params.order}.${dir}`);
  }
  if (params.limit !== undefined) url.searchParams.set("limit", String(params.limit));
  if (params.offset !== undefined) url.searchParams.set("offset", String(params.offset));

  const headers: Record<string, string> = {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  if (params.count || params.head) {
    headers["Prefer"] = "count=exact";
  }
  if (params.single) {
    headers["Accept"] = "application/vnd.pgrst.object+json";
  }

  try {
    const res = await fetch(url.toString(), {
      method: params.head ? "HEAD" : "GET",
      headers,
    });

    const countHeader = res.headers.get("content-range");
    let count: number | null = null;
    if (countHeader) {
      const match = countHeader.match(/\/(\d+|\*)/);
      if (match && match[1] !== "*") count = parseInt(match[1]);
    }

    if (params.head) {
      return { data: null, count, error: null };
    }

    if (!res.ok) {
      const body = await res.text();
      return { data: null, count: null, error: body };
    }

    const data = await res.json();
    return { data, count, error: null };
  } catch (e) {
    return { data: null, count: null, error: (e as Error).message };
  }
}

async function insert<T = Record<string, unknown>>(
  baseUrl: string,
  apiKey: string,
  table: string,
  row: Record<string, unknown>,
  params: InsertParams = {}
): Promise<InsertResult<T>> {
  const url = new URL(`${baseUrl}/rest/v1/${table}`);
  if (params.returning) url.searchParams.set("select", params.returning);

  try {
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(row),
    });

    if (!res.ok) {
      const body = await res.text();
      return { data: null, error: body };
    }

    const data = await res.json();
    return { data: Array.isArray(data) ? data[0] : data, error: null };
  } catch (e) {
    return { data: null, error: (e as Error).message };
  }
}

async function rpc(
  baseUrl: string,
  apiKey: string,
  fn: string,
  args: Record<string, unknown>
): Promise<RpcResult> {
  const url = `${baseUrl}/rest/v1/rpc/${fn}`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
    if (!res.ok) {
      const body = await res.text();
      return { error: body };
    }
    return { error: null };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// --- Public API ---

export function queryOSPDB<T = Record<string, unknown>>(table: string, params?: QueryParams) {
  return query<T>(OSP_URL, OSP_KEY, table, params);
}

export function insertOSPDB<T = Record<string, unknown>>(
  table: string,
  row: Record<string, unknown>,
  params?: InsertParams
) {
  return insert<T>(OSP_URL, OSP_KEY, table, row, params);
}

export function rpcOSPDB(fn: string, args: Record<string, unknown>) {
  return rpc(OSP_URL, OSP_KEY, fn, args);
}

export function queryCongress<T = Record<string, unknown>>(table: string, params?: QueryParams) {
  return query<T>(CONGRESS_URL, CONGRESS_KEY, table, params);
}
