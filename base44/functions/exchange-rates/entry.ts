let cachedRates: {rates: Record<string, number>; updatedAt: string; cachedAt: number} | null = null;
async function getRates() {
  if (cachedRates && Date.now() - cachedRates.cachedAt < 60 * 60 * 1000) return cachedRates;
  const response = await fetch("https://open.er-api.com/v6/latest/USD", {signal: AbortSignal.timeout(8000)});
  if (!response.ok) throw new Error("Currency conversion is unavailable. Try the product's base currency.");
  const data = await response.json();
  const updated = Number(data.time_last_update_unix) * 1000;
  if (data.result !== "success" || data.base_code !== "USD" || !Number.isFinite(updated) || updated > Date.now() + 60000 || Date.now() - updated > 72 * 60 * 60 * 1000) throw new Error("Exchange rates are out of date. Please refresh.");
  const rates: Record<string, number> = {};
  for (const code of ["AED", "KWD", "USD"]) {
    if (!(Number.isFinite(data.rates?.[code]) && data.rates[code] > 0)) throw new Error("Invalid exchange rates.");
    rates[code] = data.rates[code];
  }
  cachedRates = {rates, updatedAt: new Date(updated).toISOString(), cachedAt: Date.now()};
  return cachedRates;
}

Deno.serve(async () => {
  try {
    const {rates, updatedAt} = await getRates();
    return Response.json({rates, updatedAt});
  } catch (error) {
    return Response.json({error: error instanceof Error ? error.message : "Rates unavailable"}, {status: 503});
  }
});
