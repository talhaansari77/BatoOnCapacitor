import { formatDistanceToNow } from "@/lib/customerFormatting";
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sparkles, Send, Loader2, X, MessageCircle, Calendar, Heart, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {useLocation} from "@/components/LocationContext";
import {ar} from "date-fns/locale";
import {Link} from "react-router-dom";
import {DialogDescription} from "@/components/ui/dialog";


export default function PersonalConciergeChat({ userEmail, trigger, open:controlledOpen, onClose }) {
  const {t,isRTL}=useLocation();
  const [localOpen,setLocalOpen]=useState(false);
  const open=controlledOpen===undefined ? localOpen : (controlledOpen || localOpen);
  const setOpen=value=>{setLocalOpen(value);if(!value)onClose?.();};
  const busy=useRef(false);
  const [chatError,setChatError]=useState("");
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (open && !conversation) {
      loadOrCreateConversation();
    }
  }, [open]);

  const loadOrCreateConversation = async () => {
    try {
      setLoading(true); setChatError("");
      
      // Try to load existing conversation
      const conversations = await base44.agents.listConversations({
        agent_name: "personal_concierge"
      });
      
      const userConv = conversations.find(c => c.metadata?.user_email === userEmail);
      
      if (userConv) {
        setConversation(userConv);
        setMessages(userConv.messages || []);
      } else {
        // Create new conversation
        const newConv = await base44.agents.createConversation({
          agent_name: "personal_concierge",
          metadata: {
            user_email: userEmail,
            name: "Personal Concierge Chat"
          }
        });
        setConversation(newConv);
        setMessages([]);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      setChatError(t("The assistant could not be loaded. Try again or contact Customer service.","تعذر تحميل المساعد. حاول مرة أخرى أو تواصل مع خدمة العملاء."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!conversation) return;

    const unsubscribe = base44.agents.subscribeToConversation(conversation.id, (data) => {
      setMessages(data.messages || []);
      
      // Check for unread messages
      const lastMessage = data.messages?.[data.messages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant' && !open) {
        setHasUnread(true);
      }
    });

    return () => unsubscribe();
  }, [conversation?.id, open]);

  const handleSend = async () => {
    if (busy.current || loading || !newMessage.trim() || !conversation) return;
    busy.current=true;

    try {
      setLoading(true);
      await base44.agents.addMessage(conversation, {
        role: "user",
        content: newMessage
      });
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      setChatError(t("Your message was not confirmed as sent. Your draft remains here.","لم يتم تأكيد إرسال رسالتك. مسودتك ما زالت هنا."));
    } finally {
      busy.current=false;
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: Calendar, label: t("Appointment help","المساعدة في المواعيد"), prompt: t("How can I request an appointment?","كيف أطلب موعداً؟") },
    { icon: Heart, label: t("App guidance","دليل التطبيق"), prompt: t("How can I explore the care journeys in this app?","كيف أستكشف رحلات العناية في التطبيق؟") },
    { icon: TrendingUp, label: t("Find my care records","العثور على سجلات رعايتي"), prompt: t("Where can I see my recorded care progress?","أين أرى تقدم الرعاية المسجل؟") }
  ];

  return (
    <>
      {/* Floating Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="bato-concierge-launcher fixed end-4 z-40"
      >
        {trigger || (
          <Button
            onClick={() => {
              setOpen(true);
              setHasUnread(false);
            }}
            aria-label={t("Open AI assistant","فتح مساعد الذكاء الاصطناعي")}
            size="icon"
            className="rounded-full w-12 h-12 shadow-sm border border-[#c4aa8b] bg-[#f6f3ee] text-[#3a2e1e] hover:bg-[#eeebe6] relative"
          >
            <Sparkles className="w-4 h-4" />
            {hasUnread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
            )}
          </Button>
        )}
      </motion.div>

      {/* Chat Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent dir={isRTL?"rtl":"ltr"} className="max-w-2xl h-[min(600px,85dvh)] flex flex-col p-0">
          <DialogHeader className="p-5 pb-4 pe-10 bg-gradient-to-r from-[#f6f3ee] to-[#f9f8f6] border-b">
            <div className="flex flex-wrap items-start gap-3 justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-[#3a2e1e] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg">{t('Your Personal Concierge','مساعد باتو')}</DialogTitle>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-xs text-gray-600">{t('Always here to help','إرشادات للتطبيق')}</p>
                  </div>
                </div>
              </div>
              <Badge className="bg-[#c4aa8b]/15 text-[#3a2e1e]">{t('AI-Powered','ذكاء اصطناعي')}</Badge>
            </div>
          </DialogHeader>

          <DialogDescription className="px-6 text-xs">{t("AI guidance. The clinic confirms medical advice, appointments and payments.","إرشادات بالذكاء الاصطناعي. تؤكد العيادة النصائح الطبية والمواعيد والمدفوعات.")}</DialogDescription>
          {chatError && <div role="alert" className="px-6 text-sm"><p>{chatError}</p><Button disabled={loading} variant="outline" onClick={loadOrCreateConversation}>{t("Try again","حاول مرة أخرى")}</Button><Link to="/Messages?channel=client_care" onClick={()=>setOpen(false)} className="underline ms-3">{t("Customer service","خدمة العملاء")}</Link></div>}
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-[#8f7252]" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-[#c4aa8b]" />
                <h3 className="font-semibold text-gray-900 mb-2">{t('Welcome to Your Personal Concierge','مرحباً بك في مساعد باتو')}</h3>
                <p className="text-sm text-gray-600 mb-6">{t("I'm here to anticipate your needs and make your journey seamless",'يمكنني مساعدتك في التنقل داخل التطبيق.')}</p>
                
                <div className="grid gap-3 max-w-md mx-auto">
                  {quickActions.map((action, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="justify-start text-start whitespace-normal h-auto min-h-11 py-3"
                      disabled={loading || !conversation}
                      onClick={() => setNewMessage(action.prompt)}
                    >
                      <action.icon className="w-4 h-4 mr-2 text-[#8f7252]" />
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === 'user'
                        ? 'bg-[#3a2e1e] text-white'
                        : 'bg-white border-2 border-gray-200'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      {message.created_at && (
                        <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-[#eeebe6]' : 'text-gray-500'}`}>
                          {formatDistanceToNow(message.created_at, { addSuffix: true,...(isRTL?{locale:ar}:{}) })}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Input */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Textarea
                placeholder={t("Type your message…","اكتب رسالتك…")}
                aria-label={t("Message the AI assistant","راسل مساعد الذكاء الاصطناعي")}
                disabled={loading || !conversation}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="resize-none"
                rows={2}
              />
              <Button
                onClick={handleSend}
                aria-label={t("Send message","إرسال الرسالة")}
                disabled={loading || !conversation || !newMessage.trim()}
                className="bg-[#3a2e1e] hover:bg-[#51412c]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">{t('Press Enter to send, Shift+Enter for new line','اضغط Enter للإرسال وShift+Enter لسطر جديد')}</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}