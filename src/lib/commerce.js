export const SUPPORTED_CURRENCIES = ["AED", "KWD", "USD"];
export function formatMoney(amount, currency, locale = "en") {
  if (amount === null || amount === undefined || (typeof amount==="string"&&!amount.trim()) || !Number.isFinite(Number(amount))) return "—";
  if (!SUPPORTED_CURRENCIES.includes(currency)) return `${Number(amount).toLocaleString(locale)} (${locale.startsWith("ar")?"العملة غير محددة":"currency not set"})`;
  return new Intl.NumberFormat(locale, { style: "currency", currency, currencyDisplay: "code" }).format(Number(amount));
}
export function currencyTotals(records, amountField, locale = "en") {
  const totals = {};
  let unknown = false;
  let missingAmount=false;
  for (const record of records) {
    if(record[amountField]==null||(typeof record[amountField]==="string"&&!record[amountField].trim())||!Number.isFinite(Number(record[amountField]))){missingAmount=true;continue;}
    if (!SUPPORTED_CURRENCIES.includes(record.currency)) { unknown = true; continue; }
    totals[record.currency] = (totals[record.currency] || 0) + (Number(record[amountField]) || 0);
  }
  return [...Object.entries(totals).map(([currency, amount]) => formatMoney(amount, currency, locale)), ...(unknown ? [locale.startsWith("ar")?"العملة غير محددة":"Currency not set"] : []),...(missingAmount?[locale.startsWith("ar")?"المبلغ غير مسجل":"Amount not recorded"]:[])].join(" · ") || "—";
}
export function locationCurrency(location) { return location === "kuwait" ? "KWD" : "AED"; }
export function productCurrency(product) { return SUPPORTED_CURRENCIES.includes(product.currency)?product.currency:null; }
export function roundMoney(amount, currency) {
  const scale = currency === "KWD" ? 1000 : 100;
  return Math.round((amount + Number.EPSILON) * scale) / scale;
}
export function convertMoney(amount, from, to, rates) {
  if(amount==null||(typeof amount==="string"&&!amount.trim())||!Number.isFinite(Number(amount))||Number(amount)<0)return null;
  amount=Number(amount);
  if (!SUPPORTED_CURRENCIES.includes(from) || !SUPPORTED_CURRENCIES.includes(to)) return null;
  if (from === to) return roundMoney(amount, to);
  if (!(rates?.[from] > 0) || !(rates?.[to] > 0)) return null;
  return roundMoney(amount / rates[from] * rates[to], to);
}


export function confirmedOrderTotal(order) {
 if(order?.delivery_quote_status!=="confirmed")return null;
 const values=[order.total_amount,order.delivery_fee];
 if(values.some(v=>v==null||(typeof v==="string"&&!v.trim())||!Number.isFinite(Number(v))||Number(v)<0))return null;
 return roundMoney(Number(values[0])+Number(values[1]),order.currency);
}
