// Kalshi API v2 client — runs server-side only
// Docs: https://docs.kalshi.com

const KALSHI_BASE_URL = "https://api.elections.kalshi.com/trade-api/v2";

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

async function getAuthToken(): Promise<string> {
  if (cachedToken && Date.now() < tokenExpiry - 300000) {
    return cachedToken;
  }

  if (process.env.KALSHI_API_KEY) {
    return process.env.KALSHI_API_KEY;
  }

  const res = await fetch(`${KALSHI_BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.KALSHI_API_EMAIL,
      password: process.env.KALSHI_API_PASSWORD,
    }),
  });

  if (!res.ok) throw new Error(`Kalshi auth failed: ${res.status}`);

  const data = await res.json();
  cachedToken = data.token;
  tokenExpiry = Date.now() + 23 * 60 * 60 * 1000;
  return cachedToken!;
}

export async function kalshiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = await getAuthToken();

  const res = await fetch(`${KALSHI_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Kalshi API error ${res.status}: ${error}`);
  }

  return res.json();
}

export const kalshi = {
  // Get individual markets (each is a tradeable contract)
  getMarkets: (params?: Record<string, string>) => {
    const query = params ? "?" + new URLSearchParams(params).toString() : "";
    return kalshiFetch(`/markets${query}`);
  },

  // Get single market by ticker
  getMarket: (ticker: string) => {
    return kalshiFetch(`/markets/${ticker}`);
  },

  // Get events with nested markets
  getEvents: (params?: Record<string, string>) => {
    const defaults: Record<string, string> = {
      with_nested_markets: "true",
      status: "open",
    };
    const merged = { ...defaults, ...params };
    const query = "?" + new URLSearchParams(merged).toString();
    return kalshiFetch(`/events${query}`);
  },

  // Get single event with markets
  getEvent: (eventTicker: string) => {
    return kalshiFetch(`/events/${eventTicker}?with_nested_markets=true`);
  },

  // Get market orderbook
  getOrderbook: (ticker: string) => {
    return kalshiFetch(`/markets/${ticker}/orderbook`);
  },

  // Portfolio
  getPortfolio: () => kalshiFetch("/portfolio/positions"),
  getBalance: () => kalshiFetch("/portfolio/balance"),

  // Place order
  placeOrder: (order: {
    ticker: string;
    action: "buy" | "sell";
    side: "yes" | "no";
    type: "market" | "limit";
    count: number;
    yes_price?: number;
    no_price?: number;
  }) => {
    return kalshiFetch("/portfolio/orders", {
      method: "POST",
      body: JSON.stringify(order),
    });
  },
};
