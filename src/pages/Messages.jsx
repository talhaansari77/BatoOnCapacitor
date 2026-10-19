import CustomerLoadState from "@/components/CustomerLoadState";
import CareText from "@/components/CareText";
import { formatDistanceToNow } from "@/lib/customerFormatting";
import {useNavigate} from "react-router-dom";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import { MessageSquare, ChevronRight, Plus } from "lucide-react";

import { ar } from "date-fns/locale";
import { useLocation } from "../components/LocationContext";
import { CHANNELS, QUICK_TOPICS } from "../components/messages/channelsConfig";
import ChannelInbox from "../components/messages/ChannelInbox";
import RescheduleForm from "../components/messages/RescheduleForm";
import { useLocation as useRouterLocation } from "react-router-dom";
import { departmentForChannel } from "@/lib/serviceFlow";
import { IlluMessages } from "../components/illustrations/BatoIllustrations";

export default function Messages() {
  const [user, setUser] = useState(null);
  const [accountError,setAccountError]=useState(false);
  const route = useRouterLocation();
  const navigate=useNavigate();
  const openChannel=key=>{const params=new URLSearchParams(route.search);if(key)params.set("channel",key);else {params.delete("channel");params.delete("context");}navigate({pathname:route.pathname,search:params.toString()});};
  const { isRTL, t } = useLocation();

  // Read URL params: ?channel=hair_team&context=hair_assessment
  const urlParams = new URLSearchParams(route.search);
  const urlChannel = urlParams.get("channel");
  const validChannelKey = urlChannel === "reschedule" ? "reschedule" : CHANNELS.find(c => c.key === urlChannel)?.key || null;
  const [activeChannel, setActiveChannel] = useState(validChannelKey); // channel key or "reschedule"

  useEffect(() => {
    base44.auth.me().then(async (userData) => {
      setUser(userData);

    }).catch(() => setAccountError(true));
  }, []);

  useEffect(() => { setActiveChannel(validChannelKey); }, [route.search, validChannelKey]);
  const careDepartment = departmentForChannel(activeChannel);
  const { data: currentCase = null } = useQuery({
    queryKey: ["caseFile", user?.email, careDepartment],
    queryFn: async () => {
      const cases = await base44.entities.CaseFile.filter({ client_email: user.email, primary_department: careDepartment }, "-created_date");
      return cases[0] || null;
    },
    enabled: !!user && !!careDepartment && careDepartment !== "general_consultation",
  });
  const caseFileId = careDepartment && careDepartment !== "general_consultation" ? currentCase?.id || null : null;

  const { data: allMessages = [], isPending, isError, refetch } = useQuery({
    queryKey: ["messages", user?.email],
    queryFn: () => (async () => {
      const all = [];
      for (let skip = 0; ; skip += 100) {
        const page = await base44.entities.Message.filter({ client_email: user.email }, "-created_date", 100, skip);
        all.push(...page);
        if (page.length < 100) return all;
      }
    })(),
    enabled: !!user,
    refetchInterval: 8000,
  });

  // Per-channel last message and unread count
  const getChannelStats = (channelKey) => {
    const msgs = allMessages.filter(m => m.tags?.includes(channelKey));
    const unread = msgs.filter(m => m.is_from_doctor && !m.is_read).length;
    const last = msgs[0] || null;
    return { unread, last };
  };

  const currentChannel = CHANNELS.find(c => c.key === activeChannel);

  if(accountError)return <CustomerLoadState error/>;
  if(!user)return <CustomerLoadState/>;
  // If a channel is open, show inbox
  if (activeChannel === "reschedule") {
    return (
      <div style={{ background: "#eeebe6" }} className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-lg mx-auto px-4 py-5">
          <RescheduleForm
            user={user}
            caseFileId={caseFileId}
            onBack={() => openChannel(null)}
            isRTL={isRTL}
            t={t}
          />
        </div>
      </div>
    );
  }

  if (currentChannel) {
    return (
      <div style={{ background: "#eeebe6" }} className="min-h-screen" dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-lg mx-auto px-4 py-5">
          <div className="bg-white rounded-3xl shadow-sm border border-[#eeebe6] overflow-hidden">
            <ChannelInbox
              key={activeChannel + route.search}
              channel={currentChannel}
              user={user}
              caseFileId={caseFileId}
              onBack={() => openChannel(null)}
              isRTL={isRTL}
              t={t}
            />
          </div>
        </div>
      </div>
    );
  }

  // Main channels list view
  return (
    <div className={`min-h-screen pb-10 ${isRTL ? "text-right" : "text-left"}`}
      style={{ background: "#eeebe6" }} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-lg mx-auto px-4 py-5 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <IlluMessages size={44} color="#c4aa8b" />
          <div>
            <h1 className="text-2xl font-bold text-[#3a2e1e]">{t("Messages", "الرسائل")}</h1>
            <p className="text-xs text-[#7c8689] mt-0.5">
              {t("Advisors for your first consultation, specialists for care, customer service for admin", "المرشدون للاستشارة الأولى، والأخصائيون للرعاية، وخدمة العملاء للشؤون الإدارية")}
            </p>
          </div>
        </div>

        {isPending && user && <p role="status" className="text-sm text-[#7c8689]">{t("Loading conversations…", "جارٍ تحميل المحادثات…")}</p>}
        {isError && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
          <p>{t("Couldn't load conversations. Your messages haven't been deleted.", "تعذر تحميل المحادثات. لم تُحذف رسائلك.")}</p>
          <button className="underline mt-2" onClick={() => refetch()}>{t("Try again", "حاول مرة أخرى")}</button>
        </div>}
        {/* Active Conversations */}
        <section>
          <p className="bato-section-title mb-3">
            {t("Who can help you?", "من يمكنه مساعدتك؟")}
          </p>
          <div className="space-y-2">
            {CHANNELS.map((channel, idx) => {
              const { unread, last } = getChannelStats(channel.key);
              const ChannelIcon = channel.icon;
              return (
                <motion.button
                  key={channel.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  onClick={() => openChannel(channel.key)}
                  className="w-full grid grid-cols-[44px_minmax(0,1fr)] items-center gap-3 bg-white rounded-2xl p-4 shadow-sm border text-start hover:shadow-md transition-shadow"
                  style={{ borderColor: unread > 0 ? "rgba(196,170,139,0.5)" : "rgba(196,170,139,0.15)" }}
                >
                  <div className="bato-channel-icon w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(196,170,139,0.1)" }}>
                    <ChannelIcon className="w-5 h-5" style={{ color: channel.iconColor }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-[#3a2e1e] text-base leading-6">
                        {isRTL ? channel.nameAr : channel.name}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {unread > 0 && (
                          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ background: "#3a2e1e" }}>
                            {unread}
                          </span>
                        )}
                        <ChevronRight className={`w-4 h-4 text-[#7c8689] ${isRTL ? "rotate-180" : ""}`} />
                      </div>
                    </div>
                    {last ? (
                      <p className="text-xs text-[#7c8689] truncate"><CareText value={last.content} prose /></p>
                    ) : (
                      <p className="text-xs text-[#7c8689]">
                        {isRTL ? channel.descriptionAr : channel.description}
                      </p>
                    )}
                    {last && (
                      <p className="text-[10px] mt-0.5" style={{ color: "#7c8689" }}>
                        {formatDistanceToNow(last.created_date, { addSuffix: true, locale: isRTL ? ar : undefined })}
                        {unread > 0 && (
                          <span className="ms-2 font-semibold" style={{ color: "#3a2e1e" }}>
                            {t("· New reply", "· رد جديد")}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* Quick Topics */}
        <section>
          <p className="bato-section-title mb-3">
            {t("Quick Topics", "استفسارات سريعة")}
          </p>
          <div className="grid grid-cols-1 min-[390px]:grid-cols-2 gap-2">
            {QUICK_TOPICS.map((topic, idx) => (
              <motion.button
                key={topic.labelEn}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.04 }}
                onClick={() => openChannel(topic.isReschedule ? "reschedule" : topic.channel)}
                className="flex items-start gap-2.5 bg-white rounded-2xl p-3.5 text-start border hover:shadow-sm transition-shadow"
                style={{ borderColor: "rgba(196,170,139,0.15)" }}
              >
                <span className="text-lg leading-none flex-shrink-0">{topic.icon}</span>
                <p className="text-sm font-medium text-[#333435] leading-6">{isRTL ? topic.labelAr : topic.labelEn}</p>
              </motion.button>
            ))}
          </div>
        </section>

        {/* How it works note */}
        <div className="bato-style-hero bato-closing-invitation relative overflow-hidden rounded-2xl p-5"
          style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 100%)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle at 80% 20%, rgba(231,203,80,0.08) 0%, transparent 55%)" }} />
          <div className="relative z-10 flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5 opacity-80">
              <IlluMessages size={36} color="#c4aa8b" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm mb-1">
                {t("How messaging works", "كيف تتواصل معنا؟")}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(238,235,230,0.6)" }}>
                {t(
                  "Connect with an advisor before your consultation. Contact specialists about consultation and treatment. Customer service handles complaints, rescheduling and administrative help.",
                  "تواصل مع مرشد قبل الاستشارة، ومع الأخصائيين بخصوص الاستشارة والعلاج. تتولى خدمة العملاء الشكاوى وتعديل المواعيد والمساعدة الإدارية."
                )}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}