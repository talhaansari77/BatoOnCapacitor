import CareText from "@/components/CareText";
import { selectCareLanguage } from "@/lib/careArabic";
import ProductImage from "@/components/shop/ProductImage";
import useShopCurrency from "@/hooks/useShopCurrency";
import ShopCurrencySelector from "./ShopCurrencySelector";
import { productCurrency, formatMoney } from "@/lib/commerce";
import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Trash2, CreditCard, Package } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import { useLocation } from "../LocationContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

export default function CartDrawer({ isOpen, onClose, cart, onUpdateCart, userEmail }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [fulfillmentMethod, setFulfillmentMethod] = useState("delivery");
  const countryEdited = useRef(false);
  const { location, language, isRTL, t } = useLocation();
  const { currency, unitPrice, formatProductPrice, rateDate } = useShopCurrency();
  const checkout = useRef({ fingerprint: "", key: "", busy: false });
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    zip: "",
    country: location === "kuwait" ? "Kuwait" : "United Arab Emirates",
    notes: ""
  });

  useEffect(() => {
    if (!countryEdited.current) setShippingInfo(info => ({...info, country: location === "kuwait" ? "Kuwait" : "United Arab Emirates"}));
  }, [location]);

  const updateQuantity = (productId, newQuantity) => {
    if (!Number.isInteger(newQuantity) || newQuantity < 0) return;
    const item = cart.find(i => i.id === productId);
    if (newQuantity > (item?.stock_quantity || 0)) { toast.error(t("Not enough stock", "الكمية المطلوبة غير متوفرة")); return; }
    if (newQuantity === 0) {
      removeItem(productId);
      return;
    }
    const newCart = cart.map(item =>
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    onUpdateCart(newCart);
  };

  const removeItem = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    onUpdateCart(newCart);
    toast.success(t("Item removed from cart", "تمت إزالة المنتج من السلة"));
  };

  const cartTotal = cart.every(item => unitPrice(item) !== null) ? cart.reduce((sum, item) => sum + (unitPrice(item) * item.quantity), 0) : null;
  const checkoutAllowed = cart.length > 0 && cart.every(item => unitPrice(item) !== null && (!item.clinic_branch || item.clinic_branch === location));

  const handleCheckout = async () => {
    if (checkout.current.busy) return;
    if (!userEmail) { toast.error(t("Please sign in", "يرجى تسجيل الدخول")); return; }
    if (!checkoutAllowed) { toast.error(t("Refresh rates or check the selected branch before continuing.", "حدّث أسعار الصرف أو تحقق من الفرع المختار قبل المتابعة.")); return; }
    if (fulfillmentMethod === "delivery" && (!shippingInfo.address.trim() || !shippingInfo.city.trim() || !shippingInfo.country.trim())) {
      toast.error(t("Please fill in all shipping details", "يرجى إكمال تفاصيل التوصيل"));
      return;
    }

    const payload = {
      clinic_branch: location, currency, rate_date: rateDate, shipping: shippingInfo, fulfillment_method: fulfillmentMethod,
      items: cart.map(item => ({ product_id: item.id, quantity: item.quantity, expected_price: item.price, expected_currency: productCurrency(item, location) }))
    };
    const fingerprint = JSON.stringify(payload);
    if (checkout.current.fingerprint !== fingerprint) checkout.current = {fingerprint, key: crypto.randomUUID(), busy: false};
    checkout.current.busy = true;
    setIsCheckingOut(true);
    try {
      const response = await base44.functions.invoke("place-order", {...payload, checkout_key: checkout.current.key});
      const order = response.data?.order;
      if (!order?.id) throw new Error("The order was not confirmed.");
      onUpdateCart([]);
      toast.success(t("Order request saved. Payment and fulfillment are awaiting confirmation.", "تم حفظ طلبك. ننتظر تأكيد ترتيبات الدفع والاستلام."));
      queryClient.invalidateQueries({queryKey: ["orders"]});
      onClose();
      navigate("/Orders");
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || t("Failed to save order request", "تعذر حفظ الطلب"));
    } finally {
      checkout.current.busy = false;
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent dir={isRTL ? "rtl" : "ltr"} className="w-full sm:max-w-lg overflow-y-auto bg-[#f9f8f6]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-2xl">
            <ShoppingCart className="w-6 h-6 text-[#3a2e1e]" />
            {t("Shopping Cart", "سلة التسوق")}
          </SheetTitle>
          <SheetDescription>
            {t(cart.length + " items in your cart", cart.length + " منتجات في سلتك")}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <ShopCurrencySelector disabled={isCheckingOut} />
          {/* Cart Items */}
          {cart.length > 0 ? (
            <div className="space-y-4">
              <AnimatePresence>
                {cart.map(item => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image_url ? (
                        <ProductImage src={item.image_url} name={item.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1"><CareText value={item.name} /></h4>
                      <p className="text-lg font-bold text-[#3a2e1e]">{formatProductPrice(item)}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          disabled={isCheckingOut}
                          aria-label={t("Decrease quantity of " + selectCareLanguage(item.name,isRTL?"ar":"en"), "تقليل كمية " + selectCareLanguage(item.name,isRTL?"ar":"en"))}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="font-semibold w-8 text-center">{item.quantity}</span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8"
                          disabled={isCheckingOut}
                          aria-label={t("Increase quantity of " + selectCareLanguage(item.name,isRTL?"ar":"en"), "زيادة كمية " + selectCareLanguage(item.name,isRTL?"ar":"en"))}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          disabled={isCheckingOut}
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                          aria-label={t("Remove " + selectCareLanguage(item.name,isRTL?"ar":"en"), "إزالة " + selectCareLanguage(item.name,isRTL?"ar":"en"))}
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-semibold text-gray-900">{t("Product subtotal", "المجموع الفرعي للمنتجات")}</span>
                  <span className="text-3xl font-bold text-[#3a2e1e]">
                    {formatMoney(cartTotal, currency, language)}
                  </span>
                </div>

                <div className="text-sm text-gray-600 mb-4 space-y-2">
                  <p>{t("This is an unpaid order request. Products are not reserved until the shop confirms availability and payment arrangements.", "هذا طلب شراء غير مدفوع. لا تُحجز المنتجات حتى يؤكد المتجر توفرها وترتيبات الدفع.")}</p>
                  <p>{t("Delivery fees and timing are not calculated here. Contact customer service to confirm the delivery total and payment arrangements before dispatch.", "تواصل مع خدمة العملاء لتأكيد رسوم التوصيل وموعده والإجمالي وترتيبات الدفع قبل الشحن.")}</p>
                  {!checkoutAllowed && <p>{t("Refresh rates or choose the base currency to continue.", "حدّث أسعار الصرف أو اختر العملة الأصلية للمتابعة.")}</p>}
                </div>
                <div className="mb-5 space-y-3">
                  <Label htmlFor="fulfillment">{t("Preferred fulfillment", "طريقة الاستلام المفضلة")}</Label>
                  <select id="fulfillment" value={fulfillmentMethod} disabled={isCheckingOut} onChange={e => setFulfillmentMethod(e.target.value)} className="w-full rounded-xl border border-[#c4aa8b]/30 bg-white p-3 text-sm">
                    <option value="delivery">{t("Request delivery", "طلب توصيل")}</option>
                    <option value="pickup">{t("Request pickup", "طلب استلام من الفرع")}</option>
                  </select>
                  <p className="text-xs text-[#7c8689]">{t("The shop will confirm service availability, fees and timing before fulfillment. No delivery fee is included in the subtotal.", "سيؤكد المتجر توفر التوصيل أو الاستلام، والرسوم والموعد قبل تجهيز الطلب. رسوم التوصيل غير مشمولة في المجموع الفرعي.")}</p>
                  {fulfillmentMethod === "pickup" && <p className="text-sm text-[#3a2e1e]">{t("Requested pickup branch: ", "فرع الاستلام المطلوب: ")}{location === "kuwait" ? t("Kuwait", "الكويت") : t("Dubai", "دبي")}</p>}
                </div>
                {/* Shipping Info */}
                <fieldset disabled={isCheckingOut} className="min-w-0 space-y-4 mb-6 border-0 p-0">
                  {fulfillmentMethod === "delivery" && <>
                  <h3 className="font-bold text-gray-900">{t("Shipping Information", "معلومات التوصيل")}</h3>
                  <div>
                    <Label htmlFor="address">{t("Street Address *", "عنوان الشارع *")}</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      placeholder={t("Building, street, area", "المبنى، الشارع، المنطقة")}
                      className="mt-1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="city">{t("City *", "المدينة *")}</Label>
                      <Input
                        id="city"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                        placeholder={location === "kuwait" ? t("Kuwait City", "مدينة الكويت") : t("Dubai", "دبي")}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip">{t("Postal code (optional)", "الرمز البريدي (اختياري)")}</Label>
                      <Input
                        id="zip"
                        value={shippingInfo.zip}
                        onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                        placeholder={t("If applicable", "إن وجد")}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="country">{t("Country *", "الدولة *")}</Label>
                    <Input
                      id="country"
                      value={shippingInfo.country}
                      onChange={(e) => { countryEdited.current = true; setShippingInfo({ ...shippingInfo, country: e.target.value }); }}
                      placeholder={location === "kuwait" ? t("Kuwait", "الكويت") : t("United Arab Emirates", "الإمارات العربية المتحدة")}
                      className="mt-1"
                    />
                  </div>
                  </>}
                  <div>
                    <Label htmlFor="notes">{t("Order Notes (Optional)", "ملاحظات الطلب (اختياري)")}</Label>
                    <Textarea
                      id="notes"
                      value={shippingInfo.notes}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                      placeholder={t("Any special delivery instructions...", "تعليمات خاصة بالتوصيل...")}
                      rows={2}
                      className="mt-1"
                    />
                  </div>
                </fieldset>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={handleCheckout}
                    disabled={isCheckingOut || !checkoutAllowed}
                    className="w-full bg-[#3a2e1e] hover:bg-[#51412c] py-6 text-lg shadow-xl"
                  >
                    {isCheckingOut ? (
                      t("Processing...", "جارٍ المعالجة...")
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        {t("Submit order request", "إرسال طلب الشراء")} · {formatMoney(cartTotal, currency, language)}
                      </>
                    )}
                  </Button>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">{t("Your cart is empty", "سلتك فارغة")}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}