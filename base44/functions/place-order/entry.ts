import { createClientFromRequest } from "npm:@base44/sdk";
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

const inFlight = new Set<string>();
const currencies = ["AED", "KWD", "USD"];
const money = (value: number, currency: string) => Math.round(value * (currency === "KWD" ? 1000 : 100)) / (currency === "KWD" ? 1000 : 100);

Deno.serve(async (req) => {
  let lockKey: string | undefined;
  let ownsLock = false;
  let entities: any;
  let email = "";
  let checkoutKey = "";
  let creating = false;
  try {
    const client = createClientFromRequest(req);
    const user = await client.auth.me();
    if (!user?.email) return Response.json({error: "Sign in before placing an order."}, {status: 401});
    email = user.email;
    const input = await req.json();
    checkoutKey = input.checkout_key;
    if (typeof checkoutKey !== "string" || !/^[a-zA-Z0-9-]{16,80}$/.test(checkoutKey)) throw new Error("Invalid checkout reference.");
    if (!["dubai", "kuwait"].includes(input.clinic_branch)) throw new Error("Select a clinic branch.");
    if (!currencies.includes(input.currency)) throw new Error("Choose AED, KWD or USD.");
    lockKey = email + ":" + checkoutKey;
    if (inFlight.has(lockKey)) return Response.json({error: "This order is already being processed. Please wait."}, {status: 409});
    inFlight.add(lockKey);
    ownsLock = true;
    entities = client.asServiceRole.entities;
    const existing = await entities.Order.filter({client_email: email, checkout_key: checkoutKey});
    if (existing[0]) return Response.json({order: existing[0]});
    if (!Array.isArray(input.items) || input.items.length < 1 || input.items.length > 50) throw new Error("Your cart must contain 1–50 items.");
    const shipping = input.shipping || {};
    if (shipping.zip !== undefined && (typeof shipping.zip !== "string" || shipping.zip.length > 50)) throw new Error("Invalid postal code.");
    const fulfillmentMethod = input.fulfillment_method || "delivery";
    if (!["delivery", "pickup"].includes(fulfillmentMethod)) throw new Error("Choose delivery or pickup.");
    for (const key of fulfillmentMethod === "delivery" ? ["address", "city", "country"] : []) {
      if (typeof shipping[key] !== "string" || !shipping[key].trim() || shipping[key].length > 500) throw new Error("Complete your shipping details.");
    }
    const quantities = new Map<string, number>();
    const prices = new Map<string, number>();
    const expectedCurrencies = new Map<string, string>();
    for (const item of input.items) {
      if (typeof item.product_id !== "string" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) throw new Error("Invalid item quantity.");
      quantities.set(item.product_id, (quantities.get(item.product_id) || 0) + item.quantity);
      prices.set(item.product_id, item.expected_price);
      if (item.expected_currency) expectedCurrencies.set(item.product_id, item.expected_currency);
    }
    const snapshots: any[] = [];
    const currency = input.currency;
    let quote: Awaited<ReturnType<typeof getRates>> | null = null;
    for (const [id, quantity] of quantities) {
      if (quantity > 100) throw new Error("Maximum 100 units per product.");
      const product = await entities.Product.get(id);
      if (!product || product.is_active !== true) throw new Error("A product is no longer available.");
      const sourceCurrency = product.currency || (input.clinic_branch === "kuwait" ? "KWD" : "AED");
      if (!currencies.includes(sourceCurrency)) throw new Error("Unsupported product currency.");
      if (expectedCurrencies.has(id) && expectedCurrencies.get(id) !== sourceCurrency) throw new Error("A product currency changed. Refresh the shop before ordering.");
      if (product.clinic_branch && product.clinic_branch !== input.clinic_branch) throw new Error("A product is unavailable in this branch.");
      let conversionRate = 1;
      if (sourceCurrency !== currency) {
        if (!input.rate_date) throw new Error("Refresh exchange rates before ordering.");
        quote = quote || await getRates();
        if (input.rate_date !== quote.updatedAt) throw new Error("Exchange rates changed. Refresh before ordering.");
        conversionRate = quote.rates[currency] / quote.rates[sourceCurrency];
      }
      if (!Number.isFinite(product.price) || product.price < 0) throw new Error("Invalid product price. Please contact the clinic.");
      if (product.price !== prices.get(id)) throw new Error("A product price changed. Refresh the shop before ordering.");
      if (!Number.isInteger(product.stock_quantity) || product.stock_quantity < quantity) throw new Error(product.name + " has insufficient stock.");
      const convertedPrice = money(product.price * conversionRate, currency);
      snapshots.push({product_id: id, product_name: product.name, product_price: convertedPrice, quantity, subtotal: money(convertedPrice * quantity, currency), currency, source_currency: sourceCurrency, source_price: product.price, conversion_rate: conversionRate});
    }
    // Unpaid requests do not reserve inventory. The shop must check availability
    // and record the stock deduction when confirming fulfillment.
    creating = true;
    // Items are a snapshot in the same record: no partially-written OrderItems.
    const order = await entities.Order.create({
      client_email: email, checkout_key: checkoutKey, order_number: "ORD-" + crypto.randomUUID(),
      status: "pending", payment_status: "unpaid", inventory_status: "not_reserved", fulfillment_method: fulfillmentMethod, delivery_quote_status: "awaiting_confirmation", clinic_branch: input.clinic_branch, currency,
      total_amount: money(snapshots.reduce((sum, item) => sum + item.subtotal, 0), currency), items: snapshots,
      ...(quote ? {exchange_rate_date: quote.updatedAt} : {}),
      shipping_address: fulfillmentMethod === "delivery" ? shipping.address.trim() : "", shipping_city: fulfillmentMethod === "delivery" ? shipping.city.trim() : "",
      shipping_zip: (shipping.zip || "").trim(), shipping_country: fulfillmentMethod === "delivery" ? shipping.country.trim() : "",
      notes: typeof shipping.notes === "string" ? shipping.notes.slice(0, 2000) : ""
    });
    return Response.json({order});
  } catch (error) {
    // A timed-out create can have succeeded. Check before releasing its inventory.
    if (creating && entities) {
      try {
        const completed = await entities.Order.filter({client_email: email, checkout_key: checkoutKey});
        if (completed[0]) return Response.json({order: completed[0]});
      } catch {
        console.error("Order outcome requires reconciliation", {email, checkoutKey});
        return Response.json({error: "Order status could not be confirmed. Keep this checkout reference and contact the clinic: " + checkoutKey}, {status: 503});
      }
    }
    return Response.json({error: error instanceof Error ? error.message : "Unable to place order."}, {status: 400});
  } finally {
    if (ownsLock && lockKey) inFlight.delete(lockKey);
  }
});
