import CareText from "@/components/CareText";
import {productCategory} from "@/lib/productLabels";
import ProductImage from "@/components/shop/ProductImage";
import useShopCurrency from "@/hooks/useShopCurrency";
import React from "react";
import { useLocation } from "../LocationContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Check, Package } from "lucide-react";
import { motion } from "@/components/motion/BatoMotion";

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart }) {
  const { t,isRTL } = useLocation();
  const { formatProductPrice } = useShopCurrency();


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dir={isRTL?"rtl":"ltr"} className="max-w-3xl max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl leading-7 text-start pe-6"><CareText value={product.name} /></DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Image */}
          <div className="relative h-56 sm:h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden">
            {product.image_url ? (
              <ProductImage src={product.image_url} name={product.name} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="w-32 h-32 text-gray-300" />
              </div>
            )}
            <Badge className="absolute top-4 right-4 bg-[#3a2e1e] text-white border-0 shadow-lg">
              {productCategory(product.category,isRTL)}
            </Badge>
          </div>

          {/* Price */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-2xl sm:text-4xl font-bold text-[#3a2e1e]">
                {formatProductPrice(product)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {product.stock_quantity > 0 ? (
                  <span className="text-green-600 font-medium">{t("In Stock (" + product.stock_quantity + " available)", "متوفر (" + product.stock_quantity + ")")}</span>
                ) : (
                  <span className="text-red-600 font-medium">{t("Out of Stock", "نفد المخزون")}</span>
                )}
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                disabled={!Number.isInteger(product.stock_quantity) || product.stock_quantity <= 0}
                className="w-full sm:w-auto bg-[#3a2e1e] hover:bg-[#51412c] min-h-12 px-8 py-3.5 text-base shadow-xl"
              >
                <ShoppingCart className="w-5 h-5 me-2" />
                {t("Add to Cart", "أضف إلى السلة")}
              </Button>
            </motion.div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2">{t("Description", "الوصف")}</h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words"><CareText value={product.description} prose /></p>
          </div>

          {/* Features */}
          {product.features && product.features.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">{t("Key Features", "مميزات المنتج")}</h3>
              <div className="space-y-2">
                {product.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-[#f9f8f6] rounded-lg">
                    <Check className="w-5 h-5 text-[#3a2e1e] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700"><CareText value={feature} prose /></span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage Instructions */}
          {product.usage_instructions && (
            <div className="bg-[#f9f8f6] border border-[#c4aa8b] rounded-xl p-4">
              <h3 className="font-bold text-[#3a2e1e] mb-2">{t("How to Use", "طريقة الاستخدام")}</h3>
              <p className="text-[#3a2e1e] text-sm leading-relaxed"><CareText value={product.usage_instructions} prose /></p>
            </div>
          )}

          {/* Recommended For */}
          {product.recommended_for && (
            <div className="bg-[#f9f8f6] border border-[#c4aa8b] rounded-xl p-4">
              <h3 className="font-bold text-[#3a2e1e] mb-2">{t("Recommended For", "مناسب لـ")}</h3>
              <p className="text-[#3a2e1e] text-sm"><CareText value={product.recommended_for} prose /></p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}