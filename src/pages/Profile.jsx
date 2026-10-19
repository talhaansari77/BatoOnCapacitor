import {validBirthDate} from "@/lib/customerDate";
import {ar} from "date-fns/locale";
import { format } from "@/lib/customerFormatting";
import {Link,useSearchParams} from "react-router-dom";
import CareText from "@/components/CareText";
import AppearanceSettings from "@/components/AppearanceSettings";
import CustomerLoadState from "@/components/CustomerLoadState";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  User, Mail, Phone, Calendar, Heart, AlertTriangle, Edit2, Save,
  Star, Crown, Gift, Copy, Check, Users, DollarSign, TrendingUp, Clock
} from "lucide-react";
import { toast } from "sonner";

import { motion } from "@/components/motion/BatoMotion";
import LoyaltyBadges from "../components/lifecycle/LoyaltyBadges";
import LoyaltyLeaderboard from "../components/lifecycle/LoyaltyLeaderboard";
import ReferralLeaderboard from "../components/referral/ReferralLeaderboard";
import RewardTypeSelector from "../components/referral/RewardTypeSelector";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLocation } from "../components/LocationContext";

const TIER_ACCENT = { bronze: "#c4aa8b", silver: "#7c8689", gold: "#e7cb50", platinum: "#c4aa8b", diamond: "#e7cb50" };

export default function Profile() {
  const [user, setUser] = useState(null);
  const [accountError,setAccountError]=useState(false);
  const [params,setParams]=useSearchParams();
  const currentTab=["personal","medical","referrals","account"].includes(params.get("tab"))?params.get("tab"):"personal";
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '', date_of_birth: '', emergency_contact: '', medical_history: '', allergies: '' });
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [selectedRewardReferral, setSelectedRewardReferral] = useState(null);
  const queryClient = useQueryClient();
  const { isRTL, t } = useLocation();

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        date_of_birth: userData.date_of_birth || '',
        emergency_contact: userData.emergency_contact || '',
        medical_history: userData.medical_history || '',
        allergies: userData.allergies || ''
      });
    } catch (e) { setAccountError(true); }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {if(!data.full_name.trim() || !validBirthDate(data.date_of_birth))throw new Error('Check name and birth date');return base44.auth.updateMe({...data,full_name:data.full_name.trim(),phone:data.phone.trim()});},
    onError: () => toast.error(t('Could not save your profile. Check your name and birth date, then try again.', 'تعذر حفظ ملفك. تحقق من اسمك وتاريخ ميلادك وحاول مرة أخرى.')),
    onSuccess: () => { loadUser(); setIsEditing(false); toast.success(t('Profile updated', 'تم تحديث الملف الشخصي')); },
  });

  const { data: clientLifecycle } = useQuery({
    queryKey: ['clientLifecycle', user?.email],
    queryFn: async () => { const lc = await base44.entities.ClientLifecycle.filter({ client_email: user.email }); return lc[0] || null; },
    enabled: !!user, initialData: null,
  });

  const { data: referrals = [], isPending: referralsPending,isError: referralsError,refetch:refetchReferrals } = useQuery({
    queryKey: ['referrals', user?.email],
    queryFn: async () => base44.entities.Referral.filter({ referrer_email: user.email }, '-created_date'),
    enabled: !!user,
  });

  const referralStats = {
    total: referrals?.length || 0,
    pending: referrals?.filter(r => r.status === 'pending').length || 0,
    booked: referrals?.filter(r => r.status === 'consultation_booked').length || 0,
    completed: referrals?.filter(r => ['first_session_completed', 'rewarded'].includes(r.status)).length || 0,
    availableRewards: referrals?.filter(r => r.status === 'first_session_completed' && !r.reward_claimed).length || 0,
    claimedRewards: referrals?.filter(r => r.reward_claimed).length || 0,
    totalEarned: referrals?.filter(r => r.reward_claimed).reduce((s, r) => s + (r.reward_amount || 0), 0) || 0,
    availableAmount: referrals?.filter(r => r.status === 'first_session_completed' && !r.reward_claimed).reduce((s, r) => s + (r.reward_amount || 0), 0) || 0
  };

  const getStatusConfig = (status) => ({
    pending:                  { label: t('Signed Up', 'مسجّل'),             style: { background: "#eeebe6", color: "#7c8689" } },
    consultation_booked:      { label: t('Consultation Booked', 'تم حجز الاستشارة'),   style: { background: "rgba(196,170,139,0.12)", color: "#3a2e1e" } },
    first_session_completed:  { label: t('Session Completed', 'الجلسة مكتملة'),     style: { background: "rgba(231,203,80,0.12)", color: "#3a2e1e" } },
    rewarded:                 { label: t('Reward Claimed', "تم طلب المكافأة"),        style: { background: "rgba(196,170,139,0.2)", color: "#3a2e1e" } }
  }[status] || { label: t('Unknown', 'غير معروف'), style: { background: "#eeebe6", color: "#7c8689" } });

  if(accountError)return <CustomerLoadState error/>;
  if (!user) return <CustomerLoadState/>;

  const tier = clientLifecycle?.loyalty_level || 'bronze';
  const tierAccent = TIER_ACCENT[tier] || "#c4aa8b";

  return (
    <div className={`min-h-screen pb-8 ${isRTL ? 'text-right' : 'text-left'}`}
      style={{ background: "#eeebe6" }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Header */}
        <div className={`flex items-center justify-between `}>
          <div>
            <h1 className="text-2xl font-bold text-[#333435]">{t("Account", "الحساب")}</h1>
            <p className="text-xs text-[#7c8689]">{t("Your profile and preferences", "ملفك الشخصي وتفضيلاتك")}</p>
          </div>
          {!isEditing
            ? <Button onClick={() => setIsEditing(true)} size="sm" className="rounded-xl h-9 border-0 text-sm" style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
                <Edit2 className="w-4 h-4 mr-1.5" />{t("Edit", "تعديل")}
              </Button>
            : <div className="flex gap-2">
                <Button disabled={updateProfileMutation.isPending} variant="outline" size="sm" onClick={() => { setIsEditing(false); loadUser(); }} className="border-[#eeebe6] text-[#7c8689] rounded-xl h-9">{t("Cancel", "إلغاء")}</Button>
                <Button onClick={() => updateProfileMutation.mutate(formData)} size="sm" className="rounded-xl h-9 border-0" style={{ background: "#c4aa8b", color: "#3a2e1e" }} disabled={updateProfileMutation.isPending}>
                  <Save className="w-4 h-4 mr-1.5" />{updateProfileMutation.isPending ? t("Saving...", "جارٍ الحفظ...") : t("Save", "حفظ")}
                </Button>
              </div>
          }
        </div>

        {/* Profile Hero */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#eeebe6]">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 ring-2" style={{ "--tw-ring-color": "var(--style-line)" }}>
              <AvatarImage src={user.profile_photo} />
              <AvatarFallback style={{ background: "#3a2e1e", color: "#c4aa8b" }} className="bato-style-emblem text-2xl font-bold">
                {user.full_name?.charAt(0) || user.email?.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-bold text-[#333435]">{user.full_name}</h2>
              <p className="text-sm text-[#7c8689] break-all">{user.email}</p>
              <p className="text-xs text-[#7c8689] mt-0.5">{t("Member since", "عضو منذ")} {format(user.created_date, "MMMM yyyy",isRTL?{locale:ar}:{})}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs dir={isRTL ? "rtl" : "ltr"} value={currentTab} onValueChange={value=>{const next=new URLSearchParams(params);next.set("tab",value);setParams(next);}} className="w-full">
          <TabsList className="w-full bg-white border border-[#eeebe6] rounded-2xl p-1 grid grid-cols-2 min-[390px]:grid-cols-4 h-auto gap-1">
            <TabsTrigger value="personal" className="rounded-xl text-xs">{t("Personal", "شخصي")}</TabsTrigger>
            <TabsTrigger value="medical" className="rounded-xl text-xs">{t("Medical", "طبي")}</TabsTrigger>
            <TabsTrigger value="referrals" className="rounded-xl text-xs">{t("Referrals", "إحالات")}</TabsTrigger>
            <TabsTrigger value="account" className="rounded-xl text-xs">{t("Account", "الحساب")}</TabsTrigger>
          </TabsList>

          {/* Personal */}
          <TabsContent value="personal" className="mt-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#eeebe6] space-y-4">
              <h3 className="font-semibold text-[#333435]">{t("Personal Information", "المعلومات الشخصية")}</h3>
              <div className="grid grid-cols-1 min-[390px]:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-[#7c8689]">{t("Full Name", "الاسم الكامل")}</Label>
                  {isEditing ? <Input aria-label={t("Full name","الاسم الكامل")} disabled={updateProfileMutation.isPending} value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="mt-1 border-[#eeebe6]" /> : <p className="text-sm font-medium text-[#333435] mt-1">{user.full_name || '—'}</p>}
                </div>
                <div>
                  <Label className="text-xs text-[#7c8689]">{t("Email", "البريد الإلكتروني")}</Label>
                  <p className="text-sm font-medium text-[#333435] mt-1 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 shrink-0 text-[#7c8689]" /><bdi className="min-w-0 break-all">{user.email}</bdi></p>
                </div>
                <div>
                  <Label className="text-xs text-[#7c8689]">{t("Phone", "الهاتف")}</Label>
                  {isEditing ? <Input type="tel" aria-label={t("Phone","الهاتف")} disabled={updateProfileMutation.isPending} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="mt-1 border-[#eeebe6]" /> : <p className="text-sm font-medium text-[#333435] mt-1 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-[#7c8689]" />{user.phone || '—'}</p>}
                </div>
                <div>
                  <Label className="text-xs text-[#7c8689]">{t("Date of Birth", "تاريخ الميلاد")}</Label>
                  {isEditing ? <Input type="date" aria-label={t("Birth date","تاريخ الميلاد")} disabled={updateProfileMutation.isPending} value={formData.date_of_birth} onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} className="mt-1 border-[#eeebe6]" /> : <p className="text-sm font-medium text-[#333435] mt-1">{user.date_of_birth ? format(user.date_of_birth, "MMM d, yyyy",isRTL?{locale:ar}:{}) : '—'}</p>}
                </div>
              </div>
              <div>
                <Label className="text-xs text-[#7c8689]">{t("Emergency Contact", "جهة اتصال الطوارئ")}</Label>
                {isEditing ? <Input aria-label={t("Emergency contact","جهة اتصال للطوارئ")} disabled={updateProfileMutation.isPending} value={formData.emergency_contact} onChange={e => setFormData({ ...formData, emergency_contact: e.target.value })} className="mt-1 border-[#eeebe6]" /> : <p className="text-sm font-medium text-[#333435] mt-1">{user.emergency_contact || '—'}</p>}
              </div>
            </div>
          </TabsContent>

          {/* Medical */}
          <TabsContent value="medical" className="mt-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#eeebe6] space-y-4">
              <h3 className="font-semibold text-[#333435] flex items-center gap-2"><Heart className="w-4 h-4" style={{ color: "#c4aa8b" }} />{t("Medical Information", "المعلومات الطبية")}</h3>
              <div>
                <Label className="text-xs text-[#7c8689]">{t("Medical History", "التاريخ الطبي")}</Label>
                {isEditing
                  ? <Textarea aria-label={t("Medical history","التاريخ الطبي")} disabled={updateProfileMutation.isPending} value={formData.medical_history} onChange={e => setFormData({ ...formData, medical_history: e.target.value })} rows={4} className="mt-1 border-[#eeebe6]" />
                  : <div className="bato-style-surface mt-2 p-3 rounded-xl text-sm text-[#333435] whitespace-pre-line break-words leading-6" style={{ background: "#f9f8f6" }}>{user.medical_history ? <CareText prose value={user.medical_history}/> : t("No medical history recorded", "لا يوجد تاريخ طبي مسجل")}</div>
                }
              </div>
              <div>
                <Label className="text-xs text-[#7c8689] flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" style={{ color: "#c4aa8b" }} />{t("Allergies", "الحساسية")}</Label>
                {isEditing
                  ? <Textarea aria-label={t("Allergies","الحساسية")} disabled={updateProfileMutation.isPending} value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} rows={3} className="mt-1 border-[#eeebe6]" />
                  : <div className="mt-2 p-3 rounded-xl text-sm text-[#333435] whitespace-pre-line break-words leading-6 border" style={{ background: "rgba(196,170,139,0.05)", borderColor: "rgba(196,170,139,0.2)" }}>{user.allergies ? <CareText prose value={user.allergies}/> : t("No allergies recorded", "لا توجد حساسية مسجلة")}</div>
                }
              </div>
            </div>
          </TabsContent>

          {/* Referrals */}
          <TabsContent value="referrals" className="mt-4 space-y-4">
            {referralsError?<CustomerLoadState error onRetry={refetchReferrals}/>:referralsPending?<CustomerLoadState/>:<>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t("Total Referrals", "عدد الأصدقاء الذين دعوتهم"), value: referralStats.total, icon: Users },
                { label: t("Consultations", "الاستشارات"), value: referralStats.booked, icon: Calendar },
                { label: t("Completed", "مكتملة"), value: referralStats.completed, icon: Star },
                { label: t("Rewards", "المكافآت"), value: referralStats.availableRewards, icon: Gift },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-[#eeebe6]">
                  <s.icon className="w-4 h-4 mb-2" style={{ color: "#c4aa8b" }} />
                  <p className="text-xl font-bold text-[#333435]">{s.value}</p>
                  <p className="text-xs text-[#7c8689]">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-5 space-y-3"><h3 className="font-semibold">{t("Invite a friend to BATO","ادعُ صديقاً إلى باتو")}</h3><p className="text-sm text-[#7c8689]">{t("Ask Customer service how to arrange a referral and confirm the current terms and any available benefits.","اسأل خدمة العملاء عن طريقة دعوة صديق وشروطها الحالية وأي مزايا متاحة.")}</p><Link className="block rounded-xl bg-[#3a2e1e] text-white p-3 text-center" to="/Messages?channel=client_care&context=referral">{t("Ask about referrals","استفسر عن دعوات الأصدقاء")}</Link></div>
            {/* Available Rewards */}
            {referralStats.availableAmount > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#eeebe6]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#333435]">{t("Available Reward", "المكافأة المتاحة")}</h3>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(231,203,80,0.12)" }}>
                    <Gift className="w-5 h-5" style={{ color: "#e7cb50" }} />
                  </div>
                </div>
                <p className="text-3xl font-bold text-[#333435]">${referralStats.availableAmount}</p>
                <p className="text-xs text-[#7c8689] mt-1">{referralStats.availableRewards} {t("reward(s) ready to claim", "مكافأة جاهزة للاختيار")}</p>
              </div>
            )}

            {/* Referred Friends */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#eeebe6]">
              <h3 className="font-semibold text-[#333435] mb-3">{t("Referred Friends", "الأصدقاء الذين دعوتهم")}</h3>
              {referrals.length > 0 ? (
                <div className="space-y-3">
                  {referrals.map((referral) => {
                    const sc = getStatusConfig(referral.status);
                    const canSelect = referral.status === 'first_session_completed' && !referral.reward_claimed;
                    return (
                      <div key={referral.id} className="bato-style-surface p-3 rounded-xl border"
                        style={{ background: "#f9f8f6", borderColor: "rgba(196,170,139,0.2)" }}>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="bato-style-emblem w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                              style={{ background: "#3a2e1e" }}>
                              {referral.referred_name?.charAt(0) || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-[#333435] text-sm">{referral.referred_name || t("New Friend", "صديق جديد")}</p>
                              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                style={{ color: sc.style.color, background: sc.style.background }}>
                                {sc.label}
                              </span>
                            </div>
                          </div>
                          <p className="text-base font-bold flex-shrink-0 ml-2" style={{ color: "#c4aa8b" }}>${referral.reward_amount ?? 0}</p>
                        </div>
                        {canSelect && (
                          <Button onClick={() => setSelectedRewardReferral(referral)} size="sm"
                            className="w-full mt-3 rounded-xl h-8 text-xs border-0" style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
                            {t("Choose Reward", "اختر المكافأة")}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(196,170,139,0.4)" }} />
                  <p className="text-sm text-[#7c8689]">{t("No referrals are recorded yet. Ask Customer service to get started.", "لا توجد إحالات مسجلة بعد. اسأل خدمة العملاء للبدء.")}</p>
                </div>
              )}
            </div>

            <ReferralLeaderboard currentUserEmail={user?.email} />
          </>}</TabsContent>

          {/* Account */}
          <TabsContent value="account" className="mt-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#eeebe6] space-y-4">
              <h3 className="font-semibold text-[#333435]">{t("Account Settings", "إعدادات الحساب")}</h3>
              <AppearanceSettings />
              <div className="bato-style-surface grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-4 p-3 rounded-xl" style={{ background: "#f9f8f6" }}>
                <div>
                  <p className="font-medium text-[#333435] text-sm">{t("Password", "كلمة المرور")}</p>
                  <p className="text-xs text-[#7c8689]">••••••••</p>
                </div>
                <p className="text-xs text-[#7c8689]">{t("Password changes are managed through your sign-in provider.","تُدار تغييرات كلمة المرور من خلال مزود تسجيل الدخول.")}</p>
              </div>
              <div className="bato-style-surface flex items-center justify-between p-3 rounded-xl" style={{ background: "#f9f8f6" }}>
                <div>
                  <p className="font-medium text-[#333435] text-sm">{t("Sign Out", "تسجيل الخروج")}</p>
                  <p className="text-xs text-[#7c8689]">{t("End your current session", "إنهاء جلستك الحالية")}</p>
                </div>
                <Button
                  variant="outline" size="sm"
                  onClick={() => base44.auth.logout()}
                  className="border-[#eeebe6] rounded-xl text-xs"
                  style={{ color: "#3a2e1e" }}
                >
                  {t("Sign Out", "تسجيل الخروج")}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Membership Status */}
        {clientLifecycle && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl p-5 shadow-sm border border-[#c4aa8b]/25"
            style={{ background: "#f6f3ee" }}
          >
            <div className="absolute inset-0 pointer-events-none opacity-10"
              style={{ backgroundImage: "radial-gradient(circle at 80% 15%, rgba(231,203,80,0.5) 0%, transparent 50%)" }} />
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#7c8689" }}>{t("Membership", "العضوية")}</p>
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5" style={{ color: tierAccent }} />
                  <h3 className="text-[#3a2e1e] font-bold text-lg capitalize">{t(`${tier} Member`, `عضو ${({bronze:"برونزي",silver:"فضي",gold:"ذهبي",platinum:"بلاتيني",diamond:"ماسي"}[tier]||"")}`)}</h3>
                </div>
                {clientLifecycle.vip_status && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block"
                    style={{ background: "rgba(231,203,80,0.2)", color: "#80651c", border: "1px solid rgba(231,203,80,0.4)" }}>
                    {t("VIP Active", "العضوية المميزة سارية")}
                  </span>
                )}
              </div>
              <div className="text-end">
                <p className="text-2xl font-bold text-[#3a2e1e]">{(clientLifecycle.loyalty_points || 0).toLocaleString()}</p>
                <p className="text-xs" style={{ color: "#7c8689" }}>{t("Benefit Points", "نقاط المكافآت")}</p>
              </div>
            </div>
            <div className="relative z-10 grid grid-cols-3 gap-3 mt-4">
              {[
                { label: t("Badges", "الأوسمة"), value: clientLifecycle.loyalty_badges?.length || 0 },
                { label: t("Referrals", "الإحالات"), value: clientLifecycle.referrals_made || 0 },
                { label: t("Sessions", "الجلسات"), value: clientLifecycle.total_sessions_completed || 0 },
              ].map((s, i) => (
                <div key={i} className="bato-style-surface rounded-xl p-2.5 text-center"
                  style={{ background: "#fff", border: "1px solid rgba(196,170,139,0.15)" }}>
                  <p className="text-base font-bold text-[#3a2e1e]">{s.value}</p>
                  <p className="text-[10px]" style={{ color: "#7c8689" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}


        {/* Badges — celebratory collection sits below practical profile tasks, expandable */}
        {clientLifecycle && (
          <details className="bg-white rounded-2xl border border-[#eeebe6]">
            <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-[#333435]">
              {t("Your badges", "أوسمتك")}
              <span className="text-xs text-[#7c8689] font-normal"> · {clientLifecycle.loyalty_badges?.length || 0} {t("earned", "مكتسبة")}</span>
            </summary>
            <div className="px-2 pb-2">
              <LoyaltyBadges clientLifecycle={clientLifecycle} />
            </div>
          </details>
        )}

        {/* Leaderboard */}
        {clientLifecycle && <LoyaltyLeaderboard userEmail={user?.email} currentLifecycle={clientLifecycle} />}
      </div>

      <Dialog open={!!selectedRewardReferral} onOpenChange={(o) => !o && setSelectedRewardReferral(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#333435]">{t("Choose Your Reward", "اختر مكافأتك")}</DialogTitle>
            <DialogDescription className="text-[#7c8689]">
              {t("Select how you'd like to receive your", "اختر الطريقة التي تناسبك لاستلام المكافأة")} ${selectedRewardReferral?.reward_amount ?? 0}
            </DialogDescription>
          </DialogHeader>
          {selectedRewardReferral && (
            <RewardTypeSelector
              referral={selectedRewardReferral}
              onUpdate={() => { setSelectedRewardReferral(null); queryClient.invalidateQueries(['referrals', user?.email]); }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}