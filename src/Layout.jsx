import React, { useState, useEffect, useRef } from "react";
import useMobileViewport from "@/hooks/useMobileViewport";
import { useLocation as useRouterLocation, Link } from "react-router-dom";
import { LocationProvider, useLocation as useLocationContext } from "./components/LocationContext";
import LocationSelector from "./components/LocationSelector";
import { base44 } from "@/api/base44Client";
import { queryClientInstance } from "@/lib/query-client";
import {
  LayoutDashboard, Calendar, FileText, MessageSquare, TrendingUp, User, LogOut,
  Bell, ShoppingCart, Package, Users, Users2, Receipt, Trophy,
  GraduationCap, Search, ChevronDown, ChevronRight, Stethoscope, Heart,
  ShoppingBag, Activity, MapPin, Menu, X
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { createPageUrl } from "@/utils";
import {isCurrentPage, searchNavigation} from "@/lib/customerNavigation";
import NotificationBell from "./components/notifications/NotificationBell";
import ReferralButton from "./components/referral/ReferralButton";
import MobileBottomNav from "./components/navigation/MobileBottomNav";

const getNavigationGroups = (t) => [
  {
    title: t("Overview", "نظرة عامة"),
    items: [{ title: t("Dashboard", "لوحة التحكم"), url: createPageUrl("Dashboard"), icon: LayoutDashboard, keywords: ["home", "overview", "main"] }]
  },
  {
    title: t("My Journey", "رحلتي"), icon: Heart,
    items: [
      { title: t("Hair Journey", "رحلة الشعر"), url: createPageUrl("HairJourney"), icon: TrendingUp, keywords: ["hair"] },
      { title: t("Skin Journey", "رحلة البشرة"), url: createPageUrl("SkinJourney"), icon: Stethoscope, keywords: ["skin"] },
      { title: t("Health Journey", "رحلة الصحة"), url: createPageUrl("HealthJourney"), icon: Activity, keywords: ["health"] },
      { title: t("Aesthetic Care", "العناية التجميلية"), url: "/AestheticCare", icon: Stethoscope, keywords: ["aesthetic", "botox", "fillers", "injections", "تجميل"] },
      { title: t("Laser Journey", "رحلة الليزر"), url: createPageUrl("LaserJourney"), icon: FileText, keywords: ["laser"] },
    ]
  },
  {
    title: t("Clinic", "العيادة"), icon: Calendar,
    items: [
      { title: t("Appointments", "المواعيد"), url: "/ClinicAppointments", icon: Calendar, keywords: ["appointments", "booking", "موعد", "حجز"] },
      { title: t("Services", "الخدمات"), url: "/ClinicServices", icon: Stethoscope, keywords: ["services"] },
      { title: t("Team", "الفريق"), url: "/ClinicTeam", icon: Users, keywords: ["team", "doctor"] },
      { title: t("Location", "الموقع"), url: "/ClinicLocation", icon: MapPin, keywords: ["location", "address"] },
    ]
  },
  {
    title: t("Communication", "التواصل"), icon: MessageSquare,
    items: [
      { title: t("Messages", "الرسائل"), url: createPageUrl("Messages"), icon: MessageSquare, keywords: ["messages", "chat"] },
      { title: t("Updates", "التحديثات"), url: "/Updates", icon: Bell, keywords: ["updates"] },
      { title: t("Community", "المجتمع"), url: createPageUrl("Community"), icon: Users, keywords: ["community"] },
      { title: t("BATO Circles", "دوائر باتو"), url: "/BATOCircles", icon: Users2, keywords: ["circles"] },
    ]
  },
  {
    title: t("Growth & Rewards", "النقاط والمكافآت"), icon: Trophy,
    items: [
      { title: t("BATO's Academy", "أكاديمية باتو"), url: createPageUrl("Academy"), icon: GraduationCap, keywords: ["academy"] },
      { title: t("Rewards", "المكافآت"), url: createPageUrl("Rewards"), icon: Trophy, keywords: ["rewards"] },
    ]
  },
  {
    title: t("Shopping", "التسوق"), icon: ShoppingBag,
    items: [
      { title: t("Shop", "المتجر"), url: createPageUrl("Shop"), icon: ShoppingCart, keywords: ["shop"] },
      { title: t("My Orders", "طلباتي"), url: createPageUrl("Orders"), icon: Package, keywords: ["orders"] },
    ]
  },
  {
    title: t("Account", "الحساب"), icon: User,
    items: [
      { title: t("Billing", "الفواتير"), url: createPageUrl("MyBilling"), icon: Receipt, keywords: ["billing"] },
      { title: t("Profile", "الملف الشخصي"), url: createPageUrl("Profile"), icon: User, keywords: ["profile"] },
    ]
  },
];

// ─── Custom Nav Group (collapsible) ─────────────────────────────────────────
function NavGroup({ group, routerLocation, unreadMessages, isRTL, expandedGroups, toggleGroup, onNavigate }) {
  if (group.items.length === 1) {
    const item = group.items[0];
    const isActive = isCurrentPage(routerLocation.pathname, item.url);
    const showBadge = (item.title === "Messages" || item.title === "الرسائل") && unreadMessages > 0;
    return (
      <Link
        to={item.url}
        aria-current={isActive ? "page" : undefined}
        onClick={onNavigate}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive ? "text-white" : "text-gray-700 hover:bg-gray-100"}`}
        style={isActive ? { background: "#3a2e1e" } : {}}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        <span className="font-medium text-sm flex-1">{item.title}</span>
        {showBadge && <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium flex-shrink-0">{unreadMessages}</span>}
      </Link>
    );
  }

  const GroupIcon = group.icon;
  const isExpanded = expandedGroups[group.title];

  return (
    <div>
      <button
        aria-expanded={!!isExpanded}
        onClick={() => toggleGroup(group.title)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
          <GroupIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <span>{group.title}</span>{!isExpanded&&unreadMessages>0&&group.items.some(i=>i.url.toLowerCase()==="/messages")&&<span aria-label={isRTL?"رسائل غير مقروءة":"Unread messages"} className="rounded-full bg-red-500 text-white text-xs px-2">{unreadMessages>99?"99+":unreadMessages}</span>}
        </div>
        {isExpanded
          ? <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
          : <ChevronRight className={`w-4 h-4 text-gray-500 flex-shrink-0 ${isRTL ? "rotate-180" : ""}`} />
        }
      </button>
      {isExpanded && (
        <div className={`mt-1 space-y-0.5 ${isRTL ? "mr-4" : "ml-4"}`}>
          {group.items.map((item) => {
            const isActive = isCurrentPage(routerLocation.pathname, item.url);
            const showBadge = (item.title === "Messages" || item.title === "الرسائل") && unreadMessages > 0;
            return (
              <Link
                key={item.title}
                to={item.url}
                onClick={onNavigate}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isActive ? "text-white" : "text-gray-700 hover:bg-gray-100"}`}
                style={isActive ? { background: "#3a2e1e" } : {}}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm flex-1">{item.title}</span>
                {showBadge && <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium flex-shrink-0">{unreadMessages}</span>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar panel (shared between desktop + mobile drawer) ──────────────────
function SidebarPanel({ routerLocation, navigationGroups, isRTL, t, unreadMessages, expandedGroups, toggleGroup, user, showUserMenu, setShowUserMenu, previousUsers, handleLogout, switchUser, onNavigate }) {
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 p-5 flex-shrink-0">
        <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="bato-style-emblem w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#3a2e1e" }}>
            <Stethoscope className="w-5 h-5" style={{ color: "#c4aa8b" }} />
          </div>
          <div className={isRTL ? "text-right" : ""}>
            <h2 className="font-semibold text-gray-900">{t("BATO Clinic", "عيادة باتو")}</h2>
            <LocationSelector compact />
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {navigationGroups.map((group) => (
          <NavGroup
            key={group.title}
            group={group}
            routerLocation={routerLocation}
            unreadMessages={unreadMessages}
            isRTL={isRTL}
            expandedGroups={expandedGroups}
            toggleGroup={toggleGroup}
            onNavigate={onNavigate}
          />
        ))}

      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 p-4 bg-gray-50 flex-shrink-0">
        {user && (
          <div className="space-y-2">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`w-full flex items-center gap-3 px-2 py-2 hover:bg-gray-100 rounded-lg transition-colors ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
            >
              <Avatar className="w-11 h-11 ring-2 ring-gray-200 flex-shrink-0">
                <AvatarImage src={user.profile_photo} />
                <AvatarFallback style={{ background: "#3a2e1e", color: "#c4aa8b" }} className="font-semibold">
                  {user.full_name?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{user.full_name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform flex-shrink-0 ${showUserMenu ? "rotate-180" : ""}`} />
            </button>
            {showUserMenu && previousUsers.length > 0 && (
              <div className={`${isRTL ? "mr-1 border-r-2 pr-2" : "ml-1 border-l-2 pl-2"} border-gray-200 space-y-1`}>
                {previousUsers.filter(email => email !== user.email).map((email) => (
                  <button key={email} onClick={() => { switchUser(email); setShowUserMenu(false); }}
                    className={`w-full px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors truncate text-gray-600 ${isRTL ? "text-right" : "text-left"}`}>
                    {email}
                  </button>
                ))}
              </div>
            )}
            <Button variant="outline" size="sm" className={`w-full gap-2 text-gray-700 hover:bg-gray-100 border-gray-200 ${isRTL ? "flex-row-reverse justify-end" : "justify-start"}`} onClick={handleLogout}>
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {t("Logout", "تسجيل الخروج")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────
function LayoutContent({ children, currentPageName }) {
  useMobileViewport();
  const pageContentRef=useRef(null);
  const routerLocation = useRouterLocation();
  useEffect(() => {
    if (routerLocation.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    pageContentRef.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [routerLocation.pathname, routerLocation.hash]);
  const { isRTL, t } = useLocationContext();
  const [user, setUser] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchButtonRef=useRef(null);
  const closeMobileSearch=()=>{setMobileSearchOpen(false);searchButtonRef.current?.focus({preventScroll:true});};
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({
    "My Journey": true, "Clinic": false, "Communication": false,
    "Growth & Rewards": false, "Shopping": false, "Account": false,
    "رحلتي": true, "العيادة": false, "التواصل": false,
    "النقاط والمكافآت": false, "التسوق": false, "الحساب": false,
  });
  const [previousUsers, setPreviousUsers] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('bato_previous_users') || '[]');
      return Array.isArray(saved) ? saved.filter(email => typeof email === 'string') : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    loadUser();
    loadUnreadMessages();
  }, []);

  useEffect(() => { if (user && !user.is_test_persona) addToPreviousUsers(user.email); }, [user]);

  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => loadUnreadMessages(), 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    setMobileOpen(false);
    setMobileSearchOpen(false);
  }, [routerLocation.pathname]);
  useEffect(() => {
    const closeOnEscape = event => { if (event.key === "Escape") { setMobileOpen(false); if(mobileSearchOpen)closeMobileSearch(); } };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [mobileSearchOpen]);

  const loadUser = async () => {
    try { const u = await base44.auth.me(); setUser(u); } catch { /* Auth may be unavailable while a session is changing. */ }
  };

  const loadUnreadMessages = async () => {
    try {
      const u = user || await base44.auth.me();
      if (!u) return;
      const msgs = await base44.entities.Message.filter({ client_email: u.email, is_from_doctor: true, is_read: false });
      setUnreadMessages(msgs.length);
    } catch { /* Auth may be unavailable while a session is changing. */ }
  };

  const handleLogout = () => { queryClientInstance.clear(); base44.auth.logout(); };

  const switchUser = (email) => {
    if (email === user?.email) return;
    localStorage.removeItem('bato_cached_user');
    queryClientInstance.clear();
    const signInUrl = new URL('/SwitchAccount', window.location.origin);
    signInUrl.searchParams.set('email', email);
    // SDK logout completes on the server before redirecting to selected-account sign-in.
    base44.auth.logout(signInUrl.toString());
  };

  const addToPreviousUsers = (email) => {
    if (!previousUsers.includes(email)) {
      const updated = [email, ...previousUsers].slice(0, 5);
      setPreviousUsers(updated);
      localStorage.setItem('bato_previous_users', JSON.stringify(updated));
    }
  };

  const toggleGroup = (title) => setExpandedGroups(prev => ({ ...prev, [title]: !prev[title] }));

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim().length < 2) { setSearchResults([]); setShowSearchResults(false); return; }
    const lq = query.trim().toLowerCase();
    const bilingualItems = getNavigationGroups((en, ar) => en + " " + ar).flatMap(group => group.items);
    const results=searchNavigation(navigationGroups,lq,bilingualItems);
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const navigationGroups = getNavigationGroups(t);

  // Grouped search presentation: results under their navigation-group heading.
  const groupedSearchResults = Object.entries(
    searchResults.reduce((acc, r) => { (acc[r.group] = acc[r.group] || []).push(r); return acc; }, {})
  );

  useEffect(() => {
    const active=getNavigationGroups(t).find(group=>group.items.length>1&&group.items.some(item=>isCurrentPage(routerLocation.pathname,item.url)));
    if(active)setExpandedGroups(prev=>({...prev,[active.title]:true}));
  },[routerLocation.pathname,isRTL]);

  const sidebarProps = {
    routerLocation, navigationGroups, isRTL, t,
    unreadMessages, expandedGroups, toggleGroup, user, showUserMenu, setShowUserMenu,
    previousUsers, handleLogout, switchUser, onNavigate: () => setMobileOpen(false),
  };

  const SIDEBAR_W = "w-64";
  const showBottomNav = !["/onboarding", "/testexploreronboarding", "/profileconnection"].includes(routerLocation.pathname.toLowerCase().replace(/\/$/, ""));


  return (
    <div className={`min-h-screen flex w-full ${showBottomNav ? "bato-with-bottom-nav" : ""}`} dir={isRTL ? "rtl" : "ltr"} style={{ background: "#eeebe6" }}>
      <style>{`
        .bato-sidebar { position: fixed; top: 0; bottom: 0; width: 256px; z-index: 40; overflow: hidden; display: flex; flex-direction: column; }
        [dir="ltr"] .bato-sidebar { left: 0; border-right: 1px solid #f3f4f6; }
        [dir="rtl"] .bato-sidebar { right: 0; border-left: 1px solid #f3f4f6; }
        [dir="ltr"] .bato-main { margin-left: 256px; }
        [dir="rtl"] .bato-main { margin-right: 256px; }
        @media (max-width: 767px) {
          .bato-sidebar { display: none; }
          .bato-main { margin-left: 0 !important; margin-right: 0 !important; }
        }
        .bato-drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 50; }
        .bato-drawer { position: fixed; top: 0; bottom: 0; width: 280px; z-index: 51; overflow: hidden; display: flex; flex-direction: column; background: white; }
        [dir="ltr"] .bato-drawer { left: 0; border-right: 1px solid #f3f4f6; animation: slideInLeft 0.25s ease; }
        [dir="rtl"] .bato-drawer { right: 0; border-left: 1px solid #f3f4f6; animation: slideInRight 0.25s ease; }
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>

      {/* ── Desktop Sidebar ── */}
      <aside className="bato-sidebar hidden md:flex">
        <SidebarPanel {...sidebarProps} />
      </aside>

      {/* ── Mobile Drawer ── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent id="bato-mobile-navigation" side={isRTL ? "right" : "left"}
          className="md:hidden w-[280px] sm:max-w-[280px] p-0 flex flex-col [&>button]:hidden">
          <SheetTitle className="sr-only">{t("Navigation", "القائمة")}</SheetTitle>
          <SheetDescription className="sr-only">{t("Explore BATO and manage your account.", "تصفّح باتو وإعدادات حسابك.")}</SheetDescription>
          <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
            <span className="font-semibold text-gray-800">{t("BATO","باتو")}</span>
            <button aria-label={t("Close navigation", "إغلاق القائمة")} onClick={() => setMobileOpen(false)} className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-gray-100 bato-press">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden"><SidebarPanel {...sidebarProps} /></div>
        </SheetContent>
      </Sheet>

      {/* ── Main Content ── */}
      <div className="bato-main flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
          <div className={`flex items-center justify-between gap-3 min-w-0 ${isRTL ? "flex-row-reverse" : ""}`}>
            <div className={`flex items-center gap-3 flex-1 min-w-0 ${isRTL ? "flex-row-reverse" : ""}`}>
              {/* Mobile menu toggle */}
              <button
                className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 flex-shrink-0 bato-press"
                type="button"
                aria-label={t("Open navigation", "فتح القائمة")}
                aria-expanded={mobileOpen}
                aria-controls="bato-mobile-navigation"
                onClick={() => setMobileOpen(true)}
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              {/* Desktop search */}
              <div data-bato-search className="hidden md:flex relative flex-1 max-w-md">
                <Search className={`absolute ${isRTL ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400`} />
                <Input
                  placeholder={t("Search", "بحث")}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  aria-label={t("Search BATO", "ابحث في باتو")}
                  onFocus={() => searchQuery.trim().length >= 2 && setShowSearchResults(true)}
                  onBlur={event=>{if(!event.relatedTarget?.closest("[data-bato-search]"))setShowSearchResults(false);}}
                  onKeyDown={event=>{if(event.key==="Escape")setShowSearchResults(false);}}
                  className={`${isRTL ? "pr-9 text-right" : "pl-9"} bg-gray-50 border-gray-200 text-sm h-9`}
                />
                {showSearchResults && (
                  <div className={`absolute top-full ${isRTL ? "right-0" : "left-0"} right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-72 overflow-y-auto z-50`}>
                    {searchResults.length === 0 && <p role="status" className="p-4 text-sm text-gray-500">{t("No results found. Try a shorter word, like \u201chair\u201d.", "لا توجد نتائج. جرّب كلمة أقصر مثل \u201cالشعر\u201d.")}</p>}
                    {groupedSearchResults.map(([groupName, items]) => (
                      <div key={groupName}>
                        <p className={`px-4 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[#7c8689] bg-gray-50 ${isRTL ? "text-right" : ""}`}>{groupName}</p>
                        {items.map((result, idx) => (
                          <Link key={idx} to={result.url}
                            className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${isRTL ? "flex-row-reverse text-right" : ""}`}
                            onClick={() => { setSearchQuery(''); setShowSearchResults(false); }}
                          >
                            <result.icon className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                            <p className="font-medium text-gray-900 text-sm truncate flex-1 min-w-0">{result.title}</p>
                            <span className="text-[11px] text-[#7c8689] flex-shrink-0" aria-hidden="true">{isRTL ? "افتح ←" : "Open →"}</span>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile search */}
              <button ref={searchButtonRef}
                className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 flex-shrink-0 bato-press"
                aria-label={t("Search BATO", "ابحث في باتو")}
                aria-expanded={mobileSearchOpen}
                onClick={() => mobileSearchOpen?closeMobileSearch():setMobileSearchOpen(true)}
              >
                <Search className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {user && (
              <div className={`flex items-center gap-2 flex-shrink-0 ${isRTL ? "flex-row-reverse" : ""}`}>
                <ReferralButton userEmail={user.email} />
                <NotificationBell userEmail={user.email} />
              </div>
            )}
          </div>
        </header>

        {mobileSearchOpen && (
          <section className="bato-mobile-search md:hidden bg-white border-b border-gray-200 p-4" aria-label={t("Search BATO", "ابحث في باتو")}>
            <div className="flex items-center gap-2">
              <Input
                autoFocus
                aria-label={t("Search", "بحث")}
                placeholder={t("Search", "بحث")}
                value={searchQuery}
                onChange={event => handleSearch(event.target.value)}
                onKeyDown={event => { if (event.key === 'Escape') {event.stopPropagation();closeMobileSearch();} }}
                className={isRTL ? "text-right" : ""}
              />
              <button aria-label={t("Close search", "إغلاق البحث")} onClick={closeMobileSearch} className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl hover:bg-gray-50 bato-press">
                <X className="w-5 h-5" />
              </button>
            </div>
            {searchQuery.trim().length >= 2 && (
              <div className="bato-search-results mt-2 max-h-72 overflow-y-auto">
                {searchResults.length === 0
                  ? <p role="status" className="p-3 text-sm text-gray-500">{t("No results found. Try another word or browse the menu.", "لا توجد نتائج. جرّب كلمة أخرى أو تصفح القائمة.")}</p>
                  : groupedSearchResults.map(([groupName, items]) => (
                    <div key={groupName}>
                      <p className={`px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-[#7c8689] ${isRTL ? "text-right" : ""}`}>{groupName}</p>
                      {items.map(result => (
                        <Link key={result.url} to={result.url} onClick={() => { setMobileSearchOpen(false); setSearchQuery(''); setShowSearchResults(false); }}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                          <result.icon className="w-4 h-4 shrink-0 text-[#3a2e1e]" />
                          <p className="text-sm font-medium flex-1 min-w-0 truncate">{result.title}</p>
                          <span className="text-[11px] text-[#7c8689] flex-shrink-0" aria-hidden="true">{isRTL ? "افتح ←" : "Open →"}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}

        {/* Page content */}
        <main data-bato-area={routerLocation.pathname.toLowerCase().startsWith("/academy") ? "academy" : "care"} data-bato-page={currentPageName} id="bato-main-content" ref={pageContentRef} tabIndex={-1} className="flex-1 overflow-y-auto overflow-x-hidden w-full">
          {children}
        </main>
        {showBottomNav && <MobileBottomNav pathname={routerLocation.pathname} unreadMessages={unreadMessages}
          onNavigate={() => { setMobileOpen(false); setMobileSearchOpen(false); }} />}
      </div>
    </div>
  );
}

function Layout({ children, currentPageName }) {
  return (
    <LocationProvider>
      <LayoutContent children={children} currentPageName={currentPageName} />
    </LocationProvider>
  );
}

export default Layout;