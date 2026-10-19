import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useLocation } from "@/components/LocationContext";
import { convertMoney, formatMoney, productCurrency, locationCurrency } from "@/lib/commerce";

export default function useShopCurrency() {
  const context = useLocation();
  const location = context.location;
  const currency = context.shopCurrency || locationCurrency(location);
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["shopExchangeRates"],
    queryFn: async () => {
      const response = await base44.functions.invoke("exchange-rates", {});
      return response.data;
    },
    staleTime: 60 * 60 * 1000, retry: 1
  });
  const unitPrice = product => convertMoney(product.price, productCurrency(product, location), currency, data?.rates);
  const formatProductPrice = product => {
    const amount = unitPrice(product);
    return amount === null ? formatMoney(product.price, productCurrency(product, location), context.language) : formatMoney(amount, currency, context.language);
  };
  return {currency, preference: context.shopCurrencyPreference || "auto", setCurrency: context.setShopCurrency,
    location, language: context.language || "en", rates: data?.rates, rateDate: data?.updatedAt,
    loading: isLoading, refresh: refetch, unitPrice, formatProductPrice};
}
