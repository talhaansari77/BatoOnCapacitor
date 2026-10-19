import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "@/components/LocationContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Package, Loader2 } from "lucide-react";
import BatoEmptyState from "@/components/ui/BatoEmptyState";
import {customerDate} from "@/lib/customerDate";
import { formatMoney,confirmedOrderTotal } from "@/lib/commerce";

export default function Orders() {
  const { t, isRTL, language } = useLocation();
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(false);
  const queryClient = useQueryClient();
  const [cancelError, setCancelError] = useState("");
  const loadUser = () => {
    setAuthError(false);
    base44.auth.me().then(setUser).catch(() => setAuthError(true));
  };
  useEffect(loadUser, []);
  const query = useQuery({
    // Keep enriched orders separate from the raw lists used by Rewards and billing.
    // The shared "orders" prefix still lets checkout and cancellation invalidate them.
    queryKey: ["orders", user?.email, "with-items"],
    enabled: !!user,
    queryFn: async () => {
      const orders = [];
      for (let skip = 0; ; skip += 100) {
        const page = await base44.entities.Order.filter({client_email: user.email}, "-created_date", 100, skip);
        orders.push(...page);
        if (page.length < 100) break;
      }
      return Promise.all(orders.map(async order => {
        if (Array.isArray(order.items)) return order;
        const items = [];
        for (let skip = 0; ; skip += 100) {
          const page = await base44.entities.OrderItem.filter({order_id: order.id}, "-created_date", 100, skip);
          items.push(...page);
          if (page.length < 100) break;
        }
        return {...order, items};
      }));
    }
  });
  const cancel = useMutation({
    mutationFn: id => base44.functions.invoke("cancel-shop-order", {order_id: id}),
    onMutate: () => setCancelError(""),
    onSuccess: () => queryClient.invalidateQueries({queryKey: ["orders"]}),
    onError: () => setCancelError(t("Cancellation wasn't confirmed. Refresh your orders or contact the shop.", "لم يتم تأكيد الإلغاء. حدّث طلباتك أو تواصل مع المتجر."))
  });
  const statusLabels = {
    pending: t("Awaiting shop confirmation", "بانتظار تأكيد المتجر"),
    processing: t("Preparing your order", "جارٍ تجهيز طلبك"),
    shipped: t("Shipped", "تم الشحن"),
    delivered: t("Delivered", "تم التسليم"),
    cancelled: t("Cancelled", "ملغى")
  };
  const paymentLabels = {
    unpaid: t("Payment pending", "بانتظار الدفع"),
    paid: t("Paid", "مدفوع"),
    refunded: t("Refunded", "تم رد المبلغ")
  };
  const dateLabel = date => customerDate(date,isRTL);
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen bg-[#eeebe6] p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-white p-3"><Package className="w-6 h-6 text-[#c4aa8b]" /></div>
          <div>
            <h1 className="text-2xl font-bold text-[#333435]">{t("My Orders", "طلباتي")}</h1>
            <p className="text-sm text-[#7c8689] mt-1">{t("Order requests, payment and fulfillment", "طلبات الشراء والدفع والاستلام")}</p>
          </div>
        </div>
        {(authError || query.isError) && <div role="alert" className="rounded-2xl bg-white border border-red-200 p-4">
          <p className="text-sm text-red-800">{t("We couldn't load your orders.", "تعذر تحميل طلباتك.")}</p>
          <Button variant="outline" className="mt-3" onClick={() => authError ? loadUser() : query.refetch()}>{t("Try again", "حاول مرة أخرى")}</Button>
        </div>}
        {!authError && (!user || query.isPending) && <p role="status" className="flex gap-2 text-sm text-[#7c8689]"><Loader2 className="w-4 h-4 animate-spin" />{t("Loading orders…", "جارٍ تحميل الطلبات…")}</p>}
        {cancelError && <p role="alert" className="text-sm text-red-800">{cancelError}<button onClick={() => query.refetch()} className="underline mx-2">{t("Refresh", "تحديث")}</button></p>}
        {query.data?.map(order => {
          const canCancel = order.status === "pending" && order.payment_status === "unpaid" && order.inventory_status === "not_reserved";
          const awaitingQuote = order.delivery_quote_status !== "confirmed";
          const confirmedTotal=confirmedOrderTotal(order);
          return (
            <section key={order.id} className="rounded-2xl border border-[#c4aa8b]/20 bg-white overflow-hidden">
              <header className="p-4 md:p-5 bg-[#f9f8f6] border-b border-[#eeebe6] space-y-2">
                <p className="font-semibold text-[#333435] break-all text-sm">{t("Order", "طلب")} <bdi>{order.order_number || order.id}</bdi></p>
                <p className="text-xs text-[#7c8689]">{dateLabel(order.created_date)} · {order.clinic_branch === "kuwait" ? t("Kuwait", "الكويت") : order.clinic_branch === "dubai" ? t("Dubai", "دبي") : t("Branch not specified", "الفرع غير محدد")}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#eeebe6] px-3 py-1 text-xs text-[#3a2e1e]">{statusLabels[order.status] || t("Status unavailable", "الحالة غير متاحة")}</span>
                  <span className="rounded-full border border-[#c4aa8b]/30 px-3 py-1 text-xs text-[#3a2e1e]">{paymentLabels[order.payment_status] || t("Payment status unavailable", "حالة الدفع غير متاحة")}</span>
                </div>
              </header>
              <div className="p-4 md:p-5 space-y-4">
                {(Array.isArray(order.items) ? order.items : []).map(item => (
                  <div key={item.id || item.product_id} className="flex justify-between gap-3 text-sm">
                    <div><p className="font-medium text-[#333435]">{item.product_name}</p><p className="text-xs text-[#7c8689] mt-1">{t("Quantity", "الكمية")}: {item.quantity} × {formatMoney(item.product_price, item.currency || order.currency, language)}</p></div>
                    <span className="text-[#3a2e1e] shrink-0">{formatMoney(item.subtotal, item.currency || order.currency, language)}</span>
                  </div>
                ))}
                {(!Array.isArray(order.items) || order.items.length === 0) && <p className="text-sm text-[#7c8689]">{t("Product details are unavailable. Contact the shop for help with this order.", "تفاصيل المنتجات غير متاحة. تواصل مع المتجر للمساعدة بخصوص هذا الطلب.")}</p>}
                <div className="rounded-xl bg-[#f9f8f6] p-4 text-sm space-y-2 text-[#7c8689]">
                  <p className="font-semibold text-[#333435]">{order.fulfillment_method === "pickup" ? t("Requested pickup", "الاستلام من الفرع") : t("Delivery", "التوصيل")}</p>
                  {order.fulfillment_method !== "pickup" && <p className="break-words">{[order.shipping_address, order.shipping_city, order.shipping_zip, order.shipping_country].filter(Boolean).join(" · ") || t("Contact the shop to confirm your address.", "تواصل مع المتجر لتأكيد عنوانك.")}</p>}
                  {order.status !== "cancelled" && awaitingQuote && <p>{t("Availability, fees and timing are awaiting shop confirmation.", "ينتظر الطلب تأكيد التوفر والرسوم وموعد الاستلام من المتجر.")}</p>}
                  {order.delivery_estimate && <p>{order.delivery_estimate}</p>}
                  {order.tracking_number && <p>{t("Tracking number", "رقم التتبع")}: <bdi>{order.tracking_number}</bdi></p>}
                  {order.status === "pending" && order.inventory_status === "not_reserved" && <p>{t("Products are not reserved yet.", "لم تُحجز المنتجات بعد.")}</p>}
                </div>
                <div className="border-t border-[#eeebe6] pt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-3"><span className="text-[#7c8689]">{t("Product subtotal", "المجموع الفرعي للمنتجات")}</span><strong className="text-[#3a2e1e]">{formatMoney(order.total_amount, order.currency, language)}</strong></div>
                  <div className="flex justify-between gap-3"><span className="text-[#7c8689]">{order.fulfillment_method === "pickup" ? t("Pickup fee", "رسوم الاستلام") : t("Delivery fee", "رسوم التوصيل")}</span><span>{typeof order.delivery_fee === "number" && order.delivery_quote_status === "confirmed" ? formatMoney(order.delivery_fee, order.currency, language) : t("Not quoted", "لم تُحدد بعد")}</span></div>
                  {confirmedTotal!==null && <div className="flex justify-between font-semibold text-[#3a2e1e]"><span>{t("Confirmed total", "الإجمالي المؤكد")}</span><span>{formatMoney(confirmedTotal, order.currency, language)}</span></div>}
                </div>
                {order.payment_status === "unpaid" && order.status !== "cancelled" && <p className="text-sm text-[#7c8689]">{t("No online payment has been collected. Contact the shop to arrange payment and fulfillment.", "لم تُسدد قيمة الطلب إلكترونياً. تواصل مع المتجر لترتيب الدفع والاستلام.")}</p>}
                <div className="flex flex-wrap gap-3">
                  <Button asChild className="bg-[#3a2e1e] hover:bg-[#51412c]"><Link to={"/Messages?channel=client_care&context=shop_order&order=" + encodeURIComponent(order.order_number || order.id)}>{t("Ask about this order", "استفسر عن هذا الطلب")}</Link></Button>
                  {canCancel && <Button variant="outline" disabled={cancel.isPending} onClick={() => cancel.mutate(order.id)}>{cancel.isPending && cancel.variables === order.id ? t("Cancelling…", "جارٍ الإلغاء…") : t("Cancel request", "إلغاء الطلب")}</Button>}
                </div>
              </div>
            </section>
          );
        })}
        {query.isSuccess && !query.data.length && <BatoEmptyState
          icon={Package}
          title={t("No orders yet", "لا توجد طلبات بعد")}
          description={t("Your order requests will appear here.", "ستظهر طلبات الشراء هنا.")}
          action={<Button asChild className="bg-[#3a2e1e]"><Link to="/Shop">{t("Visit the shop", "زيارة المتجر")}</Link></Button>}
        />}
      </div>
    </div>
  );
}