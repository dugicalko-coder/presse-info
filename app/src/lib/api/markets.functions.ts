import { createServerFn } from "@tanstack/react-start";

export type Markets = {
  goldOz: number | null; goldGram: number | null; goldChange: number | null;
  btc: number | null; btcChange: number | null; updated: string | null;
};

let cache: { at: number; data: Markets } | null = null;

/** Tageskurse Gold (Feinunze, ueber Tether Gold als Richtwert) und Bitcoin in Euro. Quelle: CoinGecko. */
export const getMarkets = createServerFn({ method: "GET" }).handler(async (): Promise<Markets> => {
  if (cache && Date.now() - cache.at < 5 * 60 * 1000) return cache.data;
  const empty: Markets = { goldOz: null, goldGram: null, goldChange: null, btc: null, btcChange: null, updated: null };
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether-gold&vs_currencies=eur&include_24hr_change=true&include_last_updated_at=true",
      { headers: { accept: "application/json", "user-agent": "presseinfo.at" }, cf: { cacheTtl: 300, cacheEverything: true } } as RequestInit,
    );
    if (!res.ok) return cache?.data ?? empty;
    const j = (await res.json()) as Record<string, { eur?: number; eur_24h_change?: number; last_updated_at?: number }>;
    const g = j["tether-gold"]; const b = j["bitcoin"];
    const data: Markets = {
      goldOz: g?.eur ?? null,
      goldGram: g?.eur ? g.eur / 31.1034768 : null,
      goldChange: g?.eur_24h_change ?? null,
      btc: b?.eur ?? null,
      btcChange: b?.eur_24h_change ?? null,
      updated: b?.last_updated_at ? new Date(b.last_updated_at * 1000).toISOString() : new Date().toISOString(),
    };
    cache = { at: Date.now(), data };
    return data;
  } catch {
    return cache?.data ?? empty;
  }
});
