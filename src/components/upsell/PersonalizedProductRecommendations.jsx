import CareText from "@/components/CareText";
import {productCategory} from "@/lib/productLabels";
import ProductImage from "@/components/shop/ProductImage";
import useShopCurrency from "@/hooks/useShopCurrency";
import { formatMoney } from "@/lib/commerce";

import React, { useContext, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, ShoppingCart, Package, Sparkles, Crown } from "lucide-react";
import { motion } from "@/components/motion/BatoMotion";
import { useLocation } from "../LocationContext";
import { toast } from "sonner";

export default function PersonalizedProductRecommendations({ clientEmail, caseFile, recentSessions, onAddToCart }) {
  const { location, t,isRTL } = useLocation();
  const { formatProductPrice } = useShopCurrency();
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const { data: lifecycle } = useQuery({
    queryKey: ['clientLifecycle', clientEmail],
    queryFn: async () => {
      const result = await base44.entities.ClientLifecycle.filter({ client_email: clientEmail });
      return result[0] || null;
    },
    enabled: !!clientEmail,
    initialData: null,
  });

  const { data: products } = useQuery({
    queryKey: ['recommendedProducts', caseFile?.primary_department, location],
    queryFn: async () => {
      const available = await base44.entities.Product.filter({ is_active: true });
      const allProducts = available.filter(p => !p.clinic_branch || p.clinic_branch === location);
      
      if (!caseFile?.primary_department) return allProducts.slice(0, 4);
      
      const departmentProducts = allProducts.filter(p => 
        p.recommended_for?.toLowerCase().includes(caseFile.primary_department.toLowerCase()) ||
        p.category === caseFile.primary_department
      );
      
      return departmentProducts.length > 0 ? departmentProducts : allProducts.slice(0, 4);
    },
    enabled: !!caseFile,
    initialData: [],
  });

  const { data: vipOffers } = useQuery({
    queryKey: ['vipProductOffers', lifecycle?.loyalty_level],
    queryFn: async () => {
      if (!lifecycle?.vip_status) return [];
      
      const offers = await base44.entities.VIPOffer.filter({ 
        is_active: true,
        category: 'product'
      });
      
      return offers.filter(offer => {
        if (offer.tier_requirement === 'any_vip') return true;
        if (offer.tier_requirement === 'platinum') return lifecycle.loyalty_level === 'platinum' || lifecycle.loyalty_level === 'diamond';
        if (offer.tier_requirement === 'diamond') return lifecycle.loyalty_level === 'diamond';
        return false;
      });
    },
    enabled: !!lifecycle?.vip_status,
    initialData: [],
  });

  const getVIPDiscount = (price) => {
    if (!lifecycle?.vip_status) return 0;
    return price * 0.15;
  };

  // Discounts require clinic confirmation; checkout uses the recorded product price.
  const getFinalPrice = (product) => product.price;

  const handleAddToCart = (product) => {
    if (onAddToCart) onAddToCart(product);
    else toast.info(t("Open Care Products to add this item to your cart.","افتح منتجات العناية لإضافة المنتج إلى سلتك."));
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#3a2e1e]" />
          {t("Products to explore", "منتجات للاستكشاف")}
          {lifecycle?.vip_status && (
            <Badge className="bg-[#3a2e1e] text-white ml-2">
              {t("VIP Member", "عضو مميز")}
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          {t("Browse options related to your care interests. Ask your team which products suit you.", "استكشف خيارات مرتبطة باهتماماتك واسأل فريقك عن المنتجات المناسبة لك.")}
        </p>
      </CardHeader>
      <CardContent className="p-6">
        {vipOffers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-[#f9f8f6] border-2 border-[#c4aa8b] rounded-xl"
          >
            <div className="flex items-start gap-3">
              <Crown className="w-6 h-6 text-[#3a2e1e] flex-shrink-0" />
              <div>
                <h4 className="font-bold text-[#3a2e1e] mb-1">{t("Exclusive member product offers","عروض منتجات حصرية للأعضاء")}</h4>
                <p className="text-sm text-[#3a2e1e] mb-3">
                  {t("Recorded member offers: ","عروض الأعضاء المسجلة: ")}{vipOffers.length}
                </p>
                <div className="space-y-2">
                  {vipOffers.slice(0, 2).map((offer, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium text-[#3a2e1e]"><CareText value={offer.title} /></span>
                      {offer.discount_percentage && (
                        <Badge className="bg-[#3a2e1e] text-white text-xs">
                          {offer.discount_percentage}% {t("recorded discount","خصم مسجل")}
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {products.slice(0, 4).map((product, idx) => {
            const finalPrice = getFinalPrice(product);
            const savings = product.price - finalPrice;
            const hasVIPDiscount = lifecycle?.vip_status && savings > 0;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-gray-200 hover:border-[#c4aa8b] hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    {hasVIPDiscount && (
                      <div className="mb-3">
                        <Badge className="bg-[#3a2e1e] text-white">
                          {t("Member pricing","سعر الأعضاء")}
                        </Badge>
                      </div>
                    )}

                    <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-100">
                      {product.image_url ? (
                        <ProductImage src={product.image_url} name={product.name} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <h4 className="font-semibold text-gray-900 mb-2"><CareText value={product.name} /></h4>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2"><CareText value={product.description} prose /></p>

                    <div className="flex items-center justify-between mb-3">
                      <div>
                        {hasVIPDiscount ? (
                          <>
                            <p className="text-xs text-gray-500 line-through">{formatProductPrice(product)}</p>
                            <p className="text-lg font-bold text-[#3a2e1e]">{formatMoney(finalPrice, product.currency)}</p>
                            <p className="text-xs text-green-600 font-semibold">{t("Save ","وفّر ")}{formatMoney(savings, product.currency)}</p>
                          </>
                        ) : (
                          <p className="text-lg font-bold text-gray-900">{formatProductPrice(product)}</p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {productCategory(product.category,isRTL)}
                      </Badge>
                    </div>

                    <Button
                      onClick={() => handleAddToCart(product)}
                      disabled={!Number.isInteger(product.stock_quantity)||product.stock_quantity<=0}
                      className="w-full bg-[#3a2e1e] hover:bg-[#51412c]"
                      size="sm"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {t("Add to Cart", "أضف إلى السلة")}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 text-center">
          <Button
            variant="outline"
            className="border-[#c4aa8b] text-[#3a2e1e] hover:bg-[#f9f8f6]"
            onClick={() => window.location.href = '/Shop'}
          >
            <ShoppingBag className="w-4 h-4 mr-2" />
            {t("View All Products", "عرض جميع المنتجات")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
