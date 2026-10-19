import React from "react";
import { Link } from "react-router-dom";
import { Home, CalendarDays, MessageCircle, UserRound } from "lucide-react";
import { useLocation } from "@/components/LocationContext";
import { isCurrentPage } from "@/lib/customerNavigation";

// Hair strand entering a follicle, with a short scalp contour.
function HairFollicle({ size = 24, strokeWidth = 1.7, ...props }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 3c-2.5 2.5 2.5 5 0 8v4" />
    <path d="M12 15c-1.5 1.5-2.5 3-2.5 4a2.5 2.5 0 0 0 5 0c0-1-1-2.5-2.5-4Z" />
    <path d="M3 12c2-1 4-1 6 0m6 0c2-1 4-1 6 0" />
  </svg>;
}

export default function MobileBottomNav({ pathname, unreadMessages = 0, onNavigate }) {
  const { t, isRTL } = useLocation();
  const items = [
    { url: "/Dashboard", label: t("Home", "الرئيسية"), icon: Home },
    { url: "/HairJourney", label: t("Hair", "الشعر"), icon: HairFollicle },
    { url: "/ClinicAppointments", label: t("Visits", "المواعيد"), icon: CalendarDays },
    { url: "/Messages", label: t("Messages", "الرسائل"), icon: MessageCircle, badge: unreadMessages },
    { url: "/Profile", label: t("Profile", "حسابي"), icon: UserRound },
  ];
  return (
    <nav className="bato-bottom-nav md:hidden" dir={isRTL ? "rtl" : "ltr"}
      aria-label={t("Main navigation", "التنقل الرئيسي")}>
      {items.map(({ url, label, icon: Icon, badge }) => {
        const active = isCurrentPage(pathname, url);
        const unread = badge > 0 ? t(`, ${badge} unread messages`, `، ${badge} رسائل غير مقروءة`) : "";
        return (
          <Link key={url} to={url} onClick={onNavigate}
            className="bato-bottom-nav-item" aria-current={active ? "page" : undefined}
            aria-label={label + unread}>
            <span className="bato-bottom-nav-icon">
              <Icon size={24} strokeWidth={active ? 2.2 : 1.7} aria-hidden="true" />
              {badge > 0 && <span className="bato-bottom-nav-badge" aria-hidden="true">{badge > 99 ? "99+" : badge}</span>}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
