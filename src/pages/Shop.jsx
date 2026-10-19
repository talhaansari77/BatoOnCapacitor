import BatoEmptyState from "@/components/ui/BatoEmptyState";
import CareText from "@/components/CareText";
import { selectCareLanguage } from "@/lib/careArabic";
import {productCategory} from "@/lib/productLabels";
import CustomerLoadState from "@/components/CustomerLoadState";
import ProductImage from "@/components/shop/ProductImage";
import useShopCurrency from "@/hooks/useShopCurrency";
import ShopCurrencySelector from "../components/shop/ShopCurrencySelector";
import React, { useState, useEffect } from "react";
import { base44, previewCartKey, previewCartStorage } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShoppingCart, Search, Package, Sparkles, Star, Check, Plus } from "lucide-react";
import { IlluHairCare } from "../components/illustrations/BatoIllustrations";
import { motion } from "@/components/motion/BatoMotion";
import { toast } from "sonner";
import ProductDetailModal from "../components/shop/ProductDetailModal";
import CartDrawer from "../components/shop/CartDrawer";
import PersonalizedProductRecommendations from "../components/upsell/PersonalizedProductRecommendations";
import { useLocation } from "../components/LocationContext";

const getCategories = (t) => [
  { value: "all",          label: t("All", "الكل"),          icon: Package },
  { value: "shampoo",      label: t("Shampoos", "شامبو"),     icon: Sparkles },
  { value: "conditioner", label: t("Conditioners", "بلسم"), icon: Sparkles },
  { value: "supplements",  label: t("Supplements", "مكملات"),  icon: Star },
  { value: "serum",        label: t("Serums", "سيروم"),       icon: Sparkles },
  { value: "medication",   label: t("Medications", "أدوية"),  icon: Plus },
  { value: "tools",        label: t("Tools", "أدوات"),        icon: Package },
  { value: "aftercare",    label: t("Aftercare", "العناية بعد العلاج"), icon: Check },
];

export default function Shop() {
  const [user, setUser] = useState(null);
  const [accountError,setAccountError]=useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { isRTL, t, location } = useLocation();
  const { unitPrice, formatProductPrice } = useShopCurrency();
  const CATEGORIES = getCategories(t);

  useEffect(() => { loadUser(); }, []);
  const loadUser = async () => {
    try { const d = await base44.auth.me(); setUser(d); }
    catch (e) { setAccountError(true); }
  };
  useEffect(()=>{if(user)loadCart();},[user?.email]);
  const loadCart = () => {
    try {
      const saved = previewCartStorage().getItem(previewCartKey(user?.email));
      const parsed = saved ? JSON.parse(saved) : [];
      setCart(Array.isArray(parsed) ? parsed.filter(i => i && typeof i.id === "string" && Number.isInteger(i.quantity) && i.quantity > 0) : []);
    } catch { setCart([]); }
  };
  const saveCart = (newCart) => {
    setCart(newCart);
    try{previewCartStorage().setItem(previewCartKey(user?.email), JSON.stringify(newCart));}catch{toast.error(t("Your cart is available until you leave this page. Browser storage is unavailable.","سلتك متاحة حتى مغادرة هذه الصفحة. تخزين المتصفح غير متاح."));}
  };

  const { data: products = [], isPending: productsPending, isError: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: async () => base44.entities.Product.filter({ is_active: true }),
  });

  const { data: caseFile } = useQuery({
    queryKey: ['caseFile', user?.email],
    queryFn: async () => { const c = await base44.entities.CaseFile.filter({ client_email: user.email }); return c[0]; },
    enabled: !!user,
  });

  const { data: recentSessions } = useQuery({
    queryKey: ['recentSessions', user?.email],
    queryFn: async () => base44.entities.TreatmentSession.filter({ client_email: user.email }, '-session_date', 3),
    enabled: !!user,
  });

  if(accountError||productsError)return <CustomerLoadState error/>;
  if(!user||productsPending)return <CustomerLoadState/>;
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    const matchSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch && (!p.clinic_branch || p.clinic_branch === location);
  });

  const addToCart = (product) => {
    const existing = cart.find(i => i.id === product.id);
    if (!Number.isInteger(product.stock_quantity) || product.stock_quantity <= (existing?.quantity || 0)) { toast.error(t("Not enough stock","المخزون غير كافٍ")); return; }
    if (unitPrice(product) === null) { toast.error(t("We cannot confirm this price in the selected currency. Check the product currency or ask Customer service.", "تعذر تأكيد السعر بالعملة المختارة. تحقق من عملة المنتج أو اسأل خدمة العملاء.")); return; }
    if (product.clinic_branch && product.clinic_branch !== location) { toast.error(t("Product unavailable in this branch.","هذا المنتج غير متاح في هذا الفرع.")); return; }
    if (cart.some(i => i.clinic_branch && i.clinic_branch !== location)) { toast.error(t("Use a separate cart for another branch.","استخدم سلة منفصلة للفرع الآخر.")); return; }
    if (existing) {
      saveCart(cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
      toast.success(t("Added another item: ","أُضيفت وحدة أخرى: ")+selectCareLanguage(product.name,isRTL?"ar":"en"));
    } else {
      saveCart([...cart, { ...product, quantity: 1 }]);
      toast.success(t("Added to cart: ","أُضيف إلى السلة: ")+selectCareLanguage(product.name,isRTL?"ar":"en"));
    }
  };

  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className={`min-h-screen pb-8 ${isRTL ? 'text-right' : 'text-left'}`}
      style={{ background: "#eeebe6" }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Header */}
        <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 `}>
          <div>
            <h1 className="text-2xl font-bold text-[#333435]">{t("Care Products", "منتجات العناية")}</h1>
            <p className="text-xs text-[#7c8689]">{t("Browse care products available at your branch", "تصفح منتجات العناية المتاحة في فرعك")}</p>
          </div>
          <Button
            onClick={() => setShowCart(true)}
            size="sm"
            className="relative rounded-xl min-h-11 text-sm font-semibold border-0"
            style={{ background: "#3a2e1e", color: "#c4aa8b" }}
          >
            <ShoppingCart className="w-4 h-4 me-1.5" />
            {t("Cart", "السلة")}
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold"
                style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
                {cartCount}
              </span>
            )}
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7c8689]" />
          <Input
            placeholder={t("Search products...", "ابحث عن منتجات...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-10 bg-white border-[#eeebe6] text-[#333435]"
          />
        </div>

        {/* Category Filter */}
        <p className="text-xs text-[#7c8689]">{t("Swipe categories to explore more","مرّر خيارات التصنيف لاستكشاف المزيد")}</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              aria-pressed={selectedCategory === cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className="bato-filter-option flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex-shrink-0"
              style={selectedCategory === cat.value
                ? { background: "#3a2e1e", color: "#c4aa8b" }
                : { background: "#ffffff", color: "#7c8689", border: "1px solid #eeebe6" }
              }
            >
              <cat.icon className="w-3 h-3" />
              {cat.label}
            </button>
          ))}
        </div>

        {/* Currency — compact, just before products */}
        <ShopCurrencySelector />

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((product) => (
              <motion.div
                key={product.id}
                whileTap={{ scale: 0.97 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-[#eeebe6] cursor-pointer group flex flex-col"
              >
                <button type="button" aria-label={t("View product: ","عرض المنتج: ")+selectCareLanguage(product.name,isRTL?"ar":"en")} onClick={()=>setSelectedProduct(product)} className="relative w-full h-40 bg-[#f9f8f6] flex items-center justify-center">
                  {product.image_url
                    ? <ProductImage src={product.image_url} name={product.name} className="w-full h-full object-contain group-hover:opacity-90 transition-opacity" />
                    : <Package className="w-12 h-12" style={{ color: "rgba(196,170,139,0.4)" }} />
                  }
                  <span className="bato-product-category absolute top-2 end-2 text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.9)", color: "#7c8689" }}>
                    {productCategory(product.category,isRTL)}
                  </span>
                </button>
                <div className="p-3 flex flex-col flex-1 min-w-0">
                  <h3 className="font-semibold text-[#333435] text-sm leading-6 mb-1 min-h-12"><button className="text-start w-full leading-6 line-clamp-2" type="button" onClick={()=>setSelectedProduct(product)}><CareText value={product.name} /></button></h3>
                  <p className="text-sm text-[#7c8689] leading-6 line-clamp-2 min-h-12 mb-3"><CareText value={product.description} prose /></p>
                  <div className="flex flex-col gap-2 mt-auto">
                    <p className="font-bold text-[#333435]">{formatProductPrice(product)}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                      disabled={!Number.isInteger(product.stock_quantity) || product.stock_quantity <= 0 || unitPrice(product) == null}
                      className="bato-product-add w-full text-sm font-semibold px-4 min-h-11 rounded-lg transition-opacity disabled:opacity-40"
                      style={{ background: "#c4aa8b", color: "#3a2e1e" }}
                    >
                      {!Number.isInteger(product.stock_quantity) || product.stock_quantity <= 0 ? t("Unavailable", "غير متوفر") : t("Add", "أضف")}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <BatoEmptyState icon={Package}
            title={searchQuery.trim() || selectedCategory!=="all" ? t("No products match","لا توجد منتجات مطابقة") : t("No products available yet","لا توجد منتجات متاحة بعد")}
            description={searchQuery.trim() || selectedCategory!=="all" ? t("Clear your search and filters to explore the catalogue.","أزل البحث والخيارات لاستكشاف المنتجات.") : t("Products appear here when the team makes them available.","تظهر المنتجات هنا عندما يتيحها الفريق.")}
            action={(searchQuery.trim() || selectedCategory!=="all") && <Button variant="outline" onClick={()=>{setSearchQuery("");setSelectedCategory("all");}}>{t("Clear filters","إزالة الخيارات")}</Button>} />
        )}
        {/* Secondary recommendations follow the searchable catalogue. */}
        {user && caseFile && !searchQuery.trim() && selectedCategory === "all" && (
          <details className="rounded-2xl bg-white border border-[#eeebe6]"><summary className="p-4 text-sm font-semibold cursor-pointer">{t("Explore products related to your care","استكشف منتجات مرتبطة برعايتك")}</summary><PersonalizedProductRecommendations
            clientEmail={user.email}
            caseFile={caseFile}
            recentSessions={recentSessions}
            products={products.filter(p => !p.clinic_branch || p.clinic_branch === location)}
            onAddToCart={addToCart}
          /></details>
        )}

      </div>

      <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} cart={cart} onUpdateCart={saveCart} userEmail={user?.email} />
      {selectedProduct && (
        <ProductDetailModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />
      )}
    </div>
  );
}