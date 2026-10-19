import { messageTags } from "@/lib/contactRouting";
import BatoEmptyState from "@/components/ui/BatoEmptyState";
import { formatDistanceToNow } from "@/lib/customerFormatting";
import { EXPLORER_STARTS, GENERAL_START } from "@/lib/explorerStart";
import CareText from "@/components/CareText";
import {shouldSendOnEnter} from "@/lib/messageKeyboard";
import {messageScrollTop} from "@/lib/messageScroll";
import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send, User, Paperclip, X, FileText, Image as ImageIcon,
  Loader2, CheckCheck, Check, ArrowLeft, Clock
} from "lucide-react";

import { toast } from "sonner";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import { validateUpload } from "@/lib/uploads";
import { ar } from "date-fns/locale";
import { BATO_SERVICE_DEPARTMENTS, findBatoService, serviceAppointmentUrl } from "@/lib/batoServices";
import { useNavigate } from "react-router-dom";

export default function ChannelInbox({ channel, user, caseFileId, onBack, isRTL, t }) {
  const navigate = useNavigate();
  const contactLabel = channel.role === "advisor" ? t("Connect with an advisor", "تواصل مع مرشد") : channel.role === "customer_service" ? t("Contact customer service", "تواصل مع خدمة العملاء") : t("Contact your specialist", "تواصل مع أخصائيك");
  const inquiryParams = new URLSearchParams(window.location.search);
  const inquiryService = inquiryParams.get("context") === "service_inquiry" ? findBatoService(inquiryParams.get("service")) : null;
  const service = channel.key === "advisors" && inquiryService ? inquiryService : null;
  const draftKey="bato-message-draft:"+encodeURIComponent(user.email)+":"+channel.key+":"+encodeURIComponent(window.location.search);
  const [newMessage, setNewMessage] = useState(() => {
    try{const saved=sessionStorage.getItem(draftKey);if(saved)return saved;}catch{/* Draft remains in memory if storage is unavailable. */}
    const params = new URLSearchParams(window.location.search);
    const order = params.get("order");
    if(params.get("context")==="explorer_start"){
      const start=[...EXPLORER_STARTS,GENERAL_START].find(s=>s.title===params.get("start")&&channel.key==="advisors");
      if(start)return t("I'd like to ask about ","أرغب في الاستفسار عن ")+(isRTL?start.ar:start.title)+".";
    }
    if(channel.key === "client_care" && params.get("context") === "vip_offer" && params.get("offer")) return t("I would like to check eligibility, availability and terms for member offer ","أرغب في التأكد من الأهلية والتوفر والشروط لعرض الأعضاء ")+params.get("offer").slice(0,200)+".";
    if(channel.key === "client_care" && params.get("context") === "community_report" && params.get("post")) return t("I'd like to report a concern about community post ","أرغب في الإبلاغ عن مشكلة في مشاركة المجتمع ")+params.get("post").slice(0,200)+".";
    if(channel.key === "client_care" && params.get("context") === "invoice" && params.get("invoice")) return t("I'd like help with invoice ","أرغب في المساعدة بخصوص الفاتورة ")+params.get("invoice").slice(0,200)+".";
    if (params.get("context") === "service_inquiry") {
      const service = BATO_SERVICE_DEPARTMENTS.flatMap(dept => dept.sections.flatMap(section => section.services))
        .find(item => item.nameEn === params.get("service") && channel.key === "advisors");
      if (service) return t("I'd like to ask about ", "أرغب في الاستفسار عن ") + (isRTL ? service.nameAr : service.nameEn) + ".";
    }
    return channel.key === "client_care" && params.get("context") === "shop_order" && order
      ? t("I'd like help with order ", "أرغب في المساعدة بخصوص الطلب ") + order.slice(0,200) + "."
      : "";
  });
  useEffect(()=>{try{if(newMessage)sessionStorage.setItem(draftKey,newMessage);else sessionStorage.removeItem(draftKey);}catch{/* Draft remains in memory if storage is unavailable. */}},[newMessage,draftKey]);
  const [attachments, setAttachments] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const messageListRef=useRef(null);
  const composerRef=useRef(null);
  const readingRef=useRef({nearBottom:true,top:0,height:0,newest:null,oldest:null,count:0});
  useEffect(()=>{
    const input=composerRef.current;
    if(input){input.style.height="auto";input.style.height=`${Math.min(120,Math.max(44,input.scrollHeight))}px`;}
  },[newMessage]);
  const queryClient = useQueryClient();
  const ChannelIcon = channel.icon;

  const sendBusy = useRef(false);
  const [sendError, setSendError] = useState("");
  const [readError, setReadError] = useState(false);
  const messageQuery = useInfiniteQuery({
    queryKey: ["messages", user?.email, channel.key],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => base44.entities.Message.filter(
      { client_email: user.email, tags: { $in: [channel.key] } }, "-created_date", 50, pageParam
    ),
    getNextPageParam: (lastPage, pages) => lastPage.length === 50 ? pages.length * 50 : undefined,
    enabled: !!user,
    refetchInterval: 10000,
  });
  const messages = Array.from(new Map((messageQuery.data?.pages.flat() || []).map(m => [m.id, m])).values());
  useEffect(() => {
    if (!user || !messages.length) return;
    let active = true;
    const unread = messages.filter(m => m.is_from_doctor && !m.is_read);
    if (!unread.length) return;
    Promise.all(unread.map(msg => base44.entities.Message.update(msg.id, { is_read: true, read_date: new Date().toISOString() })))
      .then(() => { if (active) { setReadError(false); queryClient.invalidateQueries({ queryKey: ["messages", user.email], exact: true }); } })
      .catch(() => { if (active) setReadError(true); });
    return () => { active = false; };
  }, [messageQuery.data, user?.email]);
  const newestId=messages[0]?.id,oldestId=messages.at(-1)?.id;
  useLayoutEffect(()=>{
    const list=messageListRef.current,previous=readingRef.current;
    if(!list||!messages.length)return;
    list.scrollTop=messageScrollTop({initial:previous.count===0,newestChanged:newestId!==previous.newest,
      olderAdded:messages.length>previous.count&&oldestId!==previous.oldest,nearBottom:previous.nearBottom,
      top:previous.top,previousHeight:previous.height,height:list.scrollHeight,clientHeight:list.clientHeight});
    readingRef.current={...previous,top:list.scrollTop,height:list.scrollHeight,
      newest:newestId,oldest:oldestId,count:messages.length};
  },[messages.length,newestId,oldestId]);

  const sendMutation = useMutation({
    mutationFn: async (draft) => base44.entities.Message.create({
      client_email: user.email,
      sender_email: user.email,
      sender_name: user.full_name,
      sender_role: "client",
      is_from_doctor: false,
      subject: `[${isRTL ? channel.nameAr : channel.name}] ${t("Message", "رسالة")}`,
      content: draft.content || t("(Attachment)", "(مرفق)"),
      attachments: draft.attachments,
      case_file_id: caseFileId,
      tags: messageTags(channel.key, inquiryParams.get("department")),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setSendError("");
      setNewMessage("");
      setAttachments([]);
      toast.success(t("Message sent", "تم إرسال الرسالة"));
      readingRef.current.nearBottom=true;
    },
    onError: () => setSendError(true),
    onSettled: () => { sendBusy.current = false; },
  });

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length || uploadingFiles || sendBusy.current) return;
    setUploadingFiles(true);
    let count = attachments.length;
    try {
      for (const file of files) {
        const reason = validateUpload(file, { count });
        if (reason) { toast.error(t("Use supported images, PDF or Word files under 10 MB; maximum 10 attachments.", "اختر صوراً مدعومة أو ملفات PDF أو Word، بحد أقصى ١٠ مرفقات وأقل من ١٠ ميغابايت للملف.")); continue; }
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          if (!file_url) throw new Error("Upload incomplete");
          setAttachments(prev => [...prev, { url: file_url, name: file.name, size: file.size, type: file.type }]);
          count++;
        } catch { toast.error(t("Couldn't upload: ", "تعذر رفع: ") + file.name); }
      }
    } finally { setUploadingFiles(false); }
  };
  const handleSend = (e) => {
    e.preventDefault();
    if (!user || sendBusy.current || uploadingFiles || (!newMessage.trim() && !attachments.length)) return;
    sendBusy.current = true;
    setSendError("");
    sendMutation.mutate({ content: newMessage.trim(), attachments: [...attachments] });
  };

  const displayMessages = [...messages].reverse();

  return (
    <div className="bato-conversation flex flex-col h-[calc(100dvh-120px)] max-h-[700px]">
      {/* Header */}
      <div className="bato-conversation-header bato-style-hero flex items-center gap-3 px-4 py-3 rounded-t-3xl"
        style={{ background: "linear-gradient(135deg, #3a2e1e, #3e352c)" }}>
        <button aria-label={t("Back to channels", "العودة إلى القنوات")} onClick={onBack} className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-white/10 transition-colors flex-shrink-0 bato-press">
          <ArrowLeft className={`w-4 h-4 text-white ${isRTL ? "rotate-180" : ""}`} />
        </button>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(196,170,139,0.15)" }}>
          <ChannelIcon className="w-4 h-4" style={{ color: channel.iconColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-sm">{isRTL ? channel.nameAr : channel.name}</p>
          <p className="text-xs leading-5" style={{ color: "rgba(196,170,139,0.65)" }}>
            {isRTL ? channel.descriptionAr : channel.description}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
          <Clock className="w-3 h-3" style={{ color: "rgba(196,170,139,0.5)" }} />
          <span className="text-[10px]" style={{ color: "rgba(196,170,139,0.5)" }}>
            {t("We'll get back to you", "سنرد عليك قريباً")}
          </span>
        </div>
      </div>

      {service && <div className="px-4 py-3 border-b border-[#c4aa8b]/20 bg-white">
        <p className="text-xs font-semibold text-[#3a2e1e] mb-2">{isRTL ? service.nameAr : service.nameEn}</p>
        <Button variant="outline" className="w-full rounded-xl text-xs border-[#c4aa8b] text-[#3a2e1e]" onClick={() => navigate(serviceAppointmentUrl(service))}>{t("Request an Appointment", "اطلب موعداً")}</Button>
      </div>}

      {/* Messages */}
      <div ref={messageListRef} onScroll={event=>{const list=event.currentTarget;readingRef.current={...readingRef.current,top:list.scrollTop,height:list.scrollHeight,nearBottom:list.scrollHeight-list.scrollTop-list.clientHeight<48};}} className="bato-message-list flex-1 min-h-0 overflow-y-auto p-4 space-y-3" style={{ background: "#f9f8f6" }}>
        {messageQuery.isPending && user ? <p role="status" className="text-sm text-[#7c8689]">{t("Loading messages…", "جارٍ تحميل الرسائل…")}</p> : null}
        {messageQuery.isError && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
          <p>{t("We couldn't load your messages.", "تعذر تحميل رسائلك.")}</p>
          <button onClick={() => messageQuery.refetch()} className="underline mt-2">{t("Try again", "حاول مرة أخرى")}</button>
        </div>}
        {readError && <p role="status" className="text-xs text-[#7c8689]">{t("Messages are visible, but read status couldn't be updated.", "يمكنك قراءة الرسائل، لكن تعذر تحديث حالة القراءة.")}</p>}
        {messageQuery.hasNextPage && <button className="w-full py-2 text-sm text-[#3a2e1e] underline" disabled={messageQuery.isFetchingNextPage} onClick={() => messageQuery.fetchNextPage()}>{t("Load older messages", "تحميل رسائل أقدم")}</button>}
        {!messageQuery.isPending && !messageQuery.isError && displayMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <BatoEmptyState tone="plain" icon={ChannelIcon}
              title={contactLabel}
              description={isRTL ? channel.descriptionAr : channel.description} />
            <div className="mt-4 px-4 py-3 rounded-2xl"
              style={{ background: "rgba(196,170,139,0.08)", border: "1px solid rgba(196,170,139,0.2)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#c4aa8b" }}>
                {t("Use for", "مواضيع هذه القناة")}
              </p>
              <ul className="space-y-1">
                {channel.topics.slice(0, 4).map((topic, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#c4aa8b" }} />
                    <p className="text-xs text-[#333435]">{isRTL && channel.topicsAr ? channel.topicsAr[i] : <CareText value={topic}/>}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {displayMessages.map((msg) => {
              const isFromDoctor = msg.is_from_doctor;
              return (
                <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${isFromDoctor ? "flex-row" : "flex-row-reverse"}`}>
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    <AvatarFallback style={{ background: isFromDoctor ? "rgba(196,170,139,0.15)" : "#eeebe6" }}>
                      {isFromDoctor
                        ? <ChannelIcon className="w-3.5 h-3.5" style={{ color: "#c4aa8b" }} />
                        : <User className="w-3.5 h-3.5 text-[#7c8689]" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`min-w-0 max-w-[75%] ${!isFromDoctor && "flex flex-col items-end"}`}>
                    <div className="rounded-2xl px-4 py-2.5"
                      style={isFromDoctor
                        ? { background: "#fff", border: "1px solid rgba(196,170,139,0.2)" }
                        : { background: "#3a2e1e" }}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                        style={{ color: isFromDoctor ? "#333435" : "rgba(238,235,230,0.9)" }}>
                        <CareText value={msg.content} prose />
                      </p>
                      {msg.attachments?.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map((att, idx) => (
                            <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-2 p-1.5 rounded text-xs"
                              style={{ background: isFromDoctor ? "#f9f8f6" : "rgba(255,255,255,0.1)", color: isFromDoctor ? "#333435" : "#c4aa8b" }}>
                              {att.type?.startsWith("image/") ? <ImageIcon className="w-3 h-3 flex-shrink-0" /> : <FileText className="w-3 h-3 flex-shrink-0" />}
                              <span className="truncate">{att.name}</span>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 px-1">
                      <span className="text-[10px] text-[#7c8689]">
                        {formatDistanceToNow(msg.created_date, { addSuffix: true, locale: isRTL ? ar : undefined })}
                      </span>
                      {!isFromDoctor && (
                        msg.is_read
                          ? <CheckCheck className="w-3 h-3" style={{ color: "#c4aa8b" }} />
                          : <Check className="w-3 h-3 text-[#7c8689]" />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="shrink-0 p-4 bg-white border-t border-[#eeebe6] rounded-b-3xl">
        {sendError && <p role="alert" className="mb-3 text-sm text-red-800">{t("Your message wasn't confirmed as sent. Your draft is still here. Check the conversation before retrying.", "لم يتم تأكيد إرسال رسالتك. مسودتك ما زالت هنا. تحقق من المحادثة قبل إعادة المحاولة.")}</p>}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {attachments.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs"
                style={{ background: "#eeebe6", color: "#333435" }}>
                <span className="truncate max-w-[100px]">{file.name}</span>
                <button type="button" disabled={sendMutation.isPending || uploadingFiles} className="w-11 h-11 flex items-center justify-center rounded-full" aria-label={t("Remove attachment", "إزالة المرفق")} onClick={() => setAttachments(a => a.filter((_, i) => i !== idx))}>
                  <X className="w-3 h-3 text-[#7c8689]" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="bato-composer-row flex items-end gap-2">
          <Textarea ref={composerRef}
            disabled={!user || sendMutation.isPending}
            aria-label={contactLabel}
            placeholder={contactLabel + "…"}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => { if (shouldSendOnEnter(e.nativeEvent,window.matchMedia("(min-width: 768px) and (pointer: fine)").matches)) { e.preventDefault(); handleSend(e); } }}
            className="resize-none min-h-[44px] max-h-[120px] border-[#eeebe6] bg-[#f9f8f6] text-[#333435]"
            rows={1}
          />
          <input type="file" id={`file-upload-${channel.key}`} multiple onChange={handleFileSelect}
            className="hidden" accept="image/*,.pdf,.doc,.docx" />
          <Button type="button" variant="outline" size="icon"
            onClick={() => document.getElementById(`file-upload-${channel.key}`).click()}
            aria-label={t("Attach a file", "إرفاق ملف")}
            disabled={!user || uploadingFiles || sendMutation.isPending} className="border-[#eeebe6] text-[#7c8689] flex-shrink-0">
            {uploadingFiles ? <Loader2 className="w-4 h-4 animate-spin" /> : <Paperclip className="w-4 h-4" />}
          </Button>
          <Button type="submit" size="icon" className="flex-shrink-0 border-0" style={{ background: "#3a2e1e" }}
            aria-label={t("Send message", "إرسال الرسالة")}
            disabled={!user || uploadingFiles || sendMutation.isPending || (!newMessage.trim() && !attachments.length)}>
            {sendMutation.isPending
              ? <Loader2 className="w-4 h-4 animate-spin text-[#c4aa8b]" />
              : <Send className="w-4 h-4 text-[#c4aa8b]" />}
          </Button>
        </div>
      </form>
    </div>
  );
}