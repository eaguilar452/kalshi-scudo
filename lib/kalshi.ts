import crypto from "crypto";

const BASE = "https://api.elections.kalshi.com/trade-api/v2";

function sign(method: string, path: string, ts: number): string {
  const key = process.env.KALSHI_RSA_PRIVATE_KEY;
  if (!key) throw new Error("KALSHI_RSA_PRIVATE_KEY not set");
  const pem = key.replace(/\\n/g, "\n");
  const msg = `${ts}${method.toUpperCase()}${path}`;
  const s = crypto.createSign("RSA-SHA256");
  s.update(msg);
  s.end();
  return s.sign({ key: pem, padding: crypto.constants.RSA_PKCS1_PSS_PADDING, saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST }, "base64");
}

async function authFetch(endpoint: string, opts: RequestInit = {}): Promise<any> {
  const keyId = process.env.KALSHI_API_KEY_ID;
  if (!keyId) throw new Error("KALSHI_API_KEY_ID not set");
  const method = (opts.method || "GET").toUpperCase();
  const path = `/trade-api/v2${endpoint}`;
  const ts = Date.now();
  const sig = sign(method, path, ts);
  const res = await fetch(`${BASE}${endpoint}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      "KALSHI-ACCESS-KEY": keyId,
      "KALSHI-ACCESS-TIMESTAMP": ts.toString(),
      "KALSHI-ACCESS-SIGNATURE": sig,
      ...opts.headers,
    },
  });
  if (!res.ok) { const e = await res.text(); throw new Error(`Kalshi ${res.status}: ${e}`); }
  return res.json();
}

async function pubFetch(endpoint: string): Promise<any> {
  const res = await fetch(`${BASE}${endpoint}`, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) { const e = await res.text(); throw new Error(`Kalshi ${res.status}: ${e}`); }
  return res.json();
}

export const kalshi = {
  getMarkets: (p?: Record<string, string>) => pubFetch(`/markets${p ? "?" + new URLSearchParams(p) : ""}`),
  getMarket: (t: string) => pubFetch(`/markets/${t}`),
  getEvents: (p?: Record<string, string>) => {
    const d: Record<string, string> = { with_nested_markets: "true", status: "open", ...p };
    return pubFetch(`/events?${new URLSearchParams(d)}`);
  },
  getEvent: (t: string) => pubFetch(`/events/${t}?with_nested_markets=true`),
  getOrderbook: (t: string) => pubFetch(`/markets/${t}/orderbook`),
  getPortfolio: () => authFetch("/portfolio/positions"),
  getBalance: () => authFetch("/portfolio/balance"),
  placeOrder: (o: any) => authFetch("/portfolio/orders", { method: "POST", body: JSON.stringify(o) }),
};
