import {ar} from "date-fns/locale";
import CustomerLoadState from "@/components/CustomerLoadState";
import { formatDistanceToNow } from "@/lib/customerFormatting";
import {useNavigate} from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import {
  MessageSquare, Heart, Bookmark, Flag, MoreHorizontal,
  Plus, X, Image, Video, ChevronDown, CheckCircle2,
  Loader2, User, Shield, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { useLocation } from "../components/LocationContext";
import PostComments from "../components/community/PostComments";
import { IlluMessages, IlluShield } from "../components/illustrations/BatoIllustrations";

const CATEGORY_LABELS = {
  hair: "Hair",
  skin: "Skin",
  health: "Health",
  laser: "Laser",
  aftercare: "Aftercare",
  progress: "Progress",
  question: "Question",
  story: "Story",
  general_discussion: "General",
  success_stories: "Story",
  questions: "Question",
  tips_advice: "Tips",
  support: "Support",
};

const FILTERS = ["All", "General", "Story", "Question", "Support", "Tips", "Hair", "Skin", "Health", "Laser", "Aftercare", "Progress"];

// ─── Post Composer ────────────────────────────────────────────────────────────

function PostComposer({ user, onPostCreated }) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef();
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", category: "general_discussion", is_anonymous: false });
  const [mediaType, setMediaType] = useState("none");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => () => { if (mediaPreview) URL.revokeObjectURL(mediaPreview); }, [mediaPreview]);

  const reset = () => {
    setForm({ title: "", content: "", category: "general_discussion", is_anonymous: false });
    setMediaType("none");
    setMediaFile(null);
    setMediaPreview(null);
    setSubmitted(false);
    setExpanded(false);
  };

  const submitMutation = useMutation({
    mutationFn: async () => {
      let media_url = null;
      if (mediaFile) {
        setUploading(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file: mediaFile });
        if (!file_url) throw new Error("Upload was not confirmed");
        media_url = file_url;
        setUploading(false);
      }
      return base44.entities.CommunityPost.create({
        author_email: user.email,
        author_name: form.is_anonymous ? "Anonymous" : user.full_name,
        title: form.title || form.content.slice(0, 60),
        content: form.content.trim(),
        category: form.category,
        is_anonymous: form.is_anonymous,
        media_url,
        media_type: mediaFile ? mediaType : "none",
        status: "pending",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
      setSubmitted(true);
    },
    onError: () => {
      setUploading(false);
      toast.error(t("Failed to submit. Please try again.","تعذر إرسال المشاركة. حاول مرة أخرى."));
    },
  });

  const { t } = useLocation();

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-[#eeebe6] text-center">
        <CheckCircle2 className="w-8 h-8 mx-auto mb-2" style={{ color: "#c4aa8b" }} />
        <p className="font-semibold text-[#333435] text-sm mb-1">{t("Post submitted for review", "تم إرسال المشاركة للمراجعة")}</p>
        <p className="text-xs text-[#7c8689] mb-3">{t("The BATO team will review your post before it appears in the feed.", "سيراجع فريق باتو مشاركتك قبل نشرها في المجتمع.")}</p>
        <button onClick={reset} className="text-xs font-medium underline" style={{ color: "#c4aa8b" }}>{t("Post again", "انشر مجدداً")}</button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[#eeebe6] overflow-hidden">
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
        >
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(196,170,139,0.15)" }}>
            <User className="w-4 h-4" style={{ color: "#c4aa8b" }} />
          </div>
          <p className="text-sm text-[#7c8689]">{t("What would you like to share or ask?", "ماذا تريد أن تشارك أو تسأل؟")}</p>
        </button>
      ) : (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-semibold text-[#333435]">{t("Create a post", "أنشئ مشاركة")}</p>
            <button disabled={submitMutation.isPending} aria-label={t("Close composer","إغلاق محرر المشاركة")} onClick={reset}><X className="w-4 h-4 text-[#7c8689]" /></button>
          </div>

          <Select disabled={submitMutation.isPending} value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger className="border-[#eeebe6] h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="general_discussion">{t("General discussion","نقاش عام")}</SelectItem><SelectItem value="success_stories">{t("Story","قصة")}</SelectItem><SelectItem value="questions">{t("Question","سؤال")}</SelectItem><SelectItem value="support">{t("Support","دعم")}</SelectItem><SelectItem value="tips_advice">{t("Tips","نصائح")}</SelectItem>
            </SelectContent>
          </Select>

          <Textarea
            placeholder={t("What would you like to share or ask?", "ماذا تريد أن تشارك أو تسأل؟")}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            disabled={submitMutation.isPending}
            aria-label={t("Post content","محتوى المشاركة")}
            rows={3}
            className="border-[#eeebe6] text-sm resize-none"
          />

          {/* Media */}
          <div className="flex gap-2">
            {[{ key: "photo", icon: Image, label: "Photo" }, { key: "video", icon: Video, label: "Video" }].map(opt => (
              <button
                key={opt.key}
                disabled={submitMutation.isPending}
                onClick={() => { setMediaType(mediaType === opt.key ? "none" : opt.key); setMediaFile(null); setMediaPreview(null); }}
                className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full transition-all"
                style={mediaType === opt.key
                  ? { background: "#3a2e1e", color: "#c4aa8b" }
                  : { background: "#f9f8f6", color: "#7c8689", border: "1px solid rgba(196,170,139,0.2)" }}
              >
                <opt.icon className="w-3 h-3" />{t(opt.label,opt.key === "photo" ? "صورة" : "فيديو")}
              </button>
            ))}
          </div>

          {mediaType !== "none" && (
            <div>
              <input ref={fileInputRef} type="file"
                accept={mediaType === "photo" ? "image/*" : "video/*"}
                className="hidden" onChange={(e) => {
                  const f = e.target.files[0];
                  e.target.value = "";
                  if (!f || submitMutation.isPending) return;
                  const allowed = mediaType === "photo" ? ["image/jpeg","image/png","image/webp","image/gif"] : ["video/mp4","video/webm","video/quicktime"];
                  const limit = mediaType === "photo" ? 10*1024*1024 : 50*1024*1024;
                  if (!allowed.includes(f.type) || f.size > limit || f.size === 0) {
                    toast.error(t("Use JPG, PNG, WebP or GIF up to 10 MB, or MP4, WebM or MOV up to 50 MB.","اختر صورة JPG أو PNG أو WebP أو GIF حتى ١٠ ميغابايت، أو فيديو MP4 أو WebM أو MOV حتى ٥٠ ميغابايت."));
                    return;
                  }
                  setMediaFile(f);
                  setMediaPreview(URL.createObjectURL(f));
                }} />
              {!mediaPreview ? (
                <button onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed rounded-xl p-4 text-center"
                  style={{ borderColor: "rgba(196,170,139,0.3)" }}>
                  <p className="text-xs text-[#7c8689]">{mediaType === "photo" ? t("Attach a photo (up to 10 MB)","أرفق صورة (حتى ١٠ ميغابايت)") : t("Attach a video (up to 50 MB)","أرفق فيديو (حتى ٥٠ ميغابايت)")}</p>
                </button>
              ) : (
                <div className="relative rounded-xl overflow-hidden">
                  {mediaType === "photo"
                    ? <img src={mediaPreview} className="w-full max-h-40 object-cover" alt="preview" />
                    : <video src={mediaPreview} className="w-full max-h-40" controls />}
                  <button disabled={submitMutation.isPending} aria-label={t("Remove attachment","إزالة المرفق")} onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox id="anon" disabled={submitMutation.isPending} checked={form.is_anonymous}
              onCheckedChange={(c) => setForm({ ...form, is_anonymous: c })} />
            <Label htmlFor="anon" className="text-xs text-[#7c8689] cursor-pointer">{t("Post anonymously", "النشر دون إظهار الاسم")}</Label>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" disabled={submitMutation.isPending} onClick={reset} size="sm" className="flex-1 border-[#eeebe6] text-[#7c8689] text-xs">{t("Cancel", "إلغاء")}</Button>
            <Button
              onClick={() => {if(!submitMutation.isPending)submitMutation.mutate();}}
              disabled={!form.content.trim() || submitMutation.isPending || uploading}
              size="sm"
              className="flex-1 border-0 text-xs"
              style={{ background: "#c4aa8b", color: "#3a2e1e" }}
            >
              {(submitMutation.isPending || uploading)
                ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />{t("Submitting...", "جارٍ الإرسال...")}</>
                : <><Send className="w-3 h-3 mr-1" />{t("Submit for Review", "إرسال للمراجعة")}</>}
            </Button>
          </div>

          <p className="text-[10px] text-[#7c8689] leading-relaxed">
            {t("All posts are reviewed by the BATO team. No personal medical data, unapproved photos, or medical advice from clients.", "يراجع فريق باتو جميع المشاركات. تجنب نشر معلومات طبية شخصية أو صور غير معتمدة أو تقديم نصائح طبية للآخرين.")}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post, user }) {
  const navigate=useNavigate();
  const [likeError,setLikeError]=useState(false);
  const queryClient = useQueryClient();
  const { t,isRTL } = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const likesQuery=useQuery({queryKey:["communityLikes",post.id,user?.email],enabled:!!user,queryFn:()=>base44.entities.CommunityLike.filter({target_type:"post",target_id:post.id})});
  const liked=(likesQuery.data||[]).some(l=>l.user_email===user?.email);
  const localLikes=Math.max(post.likes_count||0,likesQuery.data?.length||0);
  const likeBusy=useRef(false);
  const [savingLike,setSavingLike]=useState(false);

  const isOfficial = false; // No verified staff-author field exists in this entity.

  const handleLike = async () => {
    if(liked||likeBusy.current||!user)return;
    likeBusy.current=true;setSavingLike(true);
    try{
      const existing=await base44.entities.CommunityLike.filter({target_type:"post",target_id:post.id,user_email:user.email});
      if(!existing.length){
        await base44.entities.CommunityLike.create({target_type:"post",target_id:post.id,user_email:user.email});
        try{const record=await base44.entities.CommunityPost.get(post.id);await base44.entities.CommunityPost.update(post.id,{likes_count:(record.likes_count||0)+1});}catch{/* Saved reaction remains authoritative if the aggregate cannot refresh. */}
      }
      setLikeError(false);
      queryClient.invalidateQueries({queryKey:["communityLikes",post.id]});
      queryClient.invalidateQueries({queryKey:["communityPosts"]});
    }catch{setLikeError(true);toast.error(t("Could not confirm your reaction. Refresh before trying again.","تعذر تأكيد تفاعلك. حدّث الصفحة قبل المحاولة مجدداً."));}
    finally{likeBusy.current=false;setSavingLike(false);}
  };

  const handleReport = () => {
    setShowMenu(false);
    navigate("/Messages?channel=client_care&context=community_report&post="+encodeURIComponent(post.id));
  };

  const categoryName = CATEGORY_LABELS[post.category] || "General";
  const categoryArabic = { Hair: "الشعر", Skin: "البشرة", Health: "الصحة", Laser: "الليزر", Aftercare: "الرعاية اللاحقة", Progress: "التقدم", Question: "سؤال", Story: "قصة", General: "عام", Tips: "نصائح", Support: "دعم" };
  const categoryLabel = t(categoryName, categoryArabic[categoryName]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-[#eeebe6] overflow-hidden"
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: isOfficial ? "#3a2e1e" : "rgba(196,170,139,0.15)" }}>
              {isOfficial
                ? <Shield className="w-4 h-4" style={{ color: "#c4aa8b" }} />
                : <User className="w-4 h-4" style={{ color: "#c4aa8b" }} />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-[#333435]">{post.is_anonymous?t("Anonymous","مجهول"):post.author_name||t("Anonymous","مجهول")}</p>
                {isOfficial && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(196,170,139,0.15)", color: "#c4aa8b", border: "1px solid rgba(196,170,139,0.3)" }}>
                    OFFICIAL
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#7c8689]">
                {formatDistanceToNow(post.created_date, { addSuffix: true,locale:isRTL?ar:undefined })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "rgba(196,170,139,0.1)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.2)" }}>
              {categoryLabel}
            </span>
            <div className="relative">
              <button aria-label={t("Post options","خيارات المشاركة")} aria-expanded={showMenu} onClick={() => setShowMenu(!showMenu)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#f9f8f6] transition-colors">
                <MoreHorizontal className="w-4 h-4 text-[#7c8689]" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border border-[#eeebe6] rounded-xl shadow-lg z-10 min-w-[120px] py-1">
                  <button onClick={handleReport}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-[#7c8689] hover:bg-[#f9f8f6]">
                    <Flag className="w-3.5 h-3.5" />{t("Report", "إبلاغ")}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {post.title && post.title !== post.content?.slice(0, 60) && (
          <p className="font-semibold text-[#333435] text-sm mb-1.5">{post.title}</p>
        )}

        {post.media_type === "photo" && post.media_url && (
          <div className="rounded-xl overflow-hidden mb-2.5">
            <img src={post.media_url} alt="post" className="w-full max-h-56 object-cover" />
          </div>
        )}
        {post.media_type === "video" && post.media_url && (
          <div className="rounded-xl overflow-hidden mb-2.5">
            <video src={post.media_url} className="w-full max-h-56" controls />
          </div>
        )}

        <p className={`text-sm text-[#333435] leading-relaxed ${!expanded && post.content?.length > 180 ? "line-clamp-3" : ""}`}>
          {post.content}
        </p>
        {post.content?.length > 180 && (
          <button onClick={() => setExpanded(e => !e)}
            className="text-xs font-medium mt-1" style={{ color: "#c4aa8b" }}>
            {expanded ? t("Show less", "عرض أقل") : t("Read more", "اقرأ المزيد")}
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: "1px solid rgba(196,170,139,0.1)" }}>
          <button
            aria-label={t("Like post","أعجبني المنشور")} aria-pressed={liked} disabled={savingLike||liked||likesQuery.isPending||likesQuery.isError} onClick={handleLike}
            className="flex items-center gap-1.5 text-xs transition-colors"
            style={{ color: liked ? "#c4aa8b" : "#7c8689" }}
          >
            <Heart className="w-4 h-4" fill={liked ? "#c4aa8b" : "none"} />
            <span>{localLikes}</span>
          </button>
          <button
            aria-label={t("Show comments","عرض التعليقات")} aria-expanded={showComments} onClick={() => setShowComments(s => !s)}
            className="flex items-center gap-1.5 text-xs text-[#7c8689] hover:text-[#333435] transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{post.comments_count || 0}</span>
          </button>
          
        </div>

        {likesQuery.isError&&<button className="underline text-xs p-2" onClick={()=>likesQuery.refetch()}>{t("Retry loading reactions","أعد تحميل التفاعلات")}</button>}
        {/* Comments */}
        {showComments && user && (
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(196,170,139,0.08)" }}>
            <PostComments postId={post.id} user={user} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Community() {
  const [user, setUser] = useState(null);
  const [accountError,setAccountError]=useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const { isRTL, t } = useLocation();
  const FILTER_LABELS = { General:t("General","عام"),Support:t("Support","دعم"),Tips:t("Tips","نصائح"), All: t("All", "الكل"), Hair: t("Hair", "الشعر"), Skin: t("Skin", "البشرة"), Health: t("Health", "الصحة"), Laser: t("Laser", "الليزر"), Aftercare: t("Aftercare", "الرعاية اللاحقة"), Progress: t("Progress", "التقدم"), Question: t("Question", "سؤال"), Story: t("Story", "قصة") };

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setAccountError(true));
  }, []);

  const { data: communityPosts = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["communityPosts"],
    queryFn: () => base44.entities.CommunityPost.filter({ status: "approved" }, "-created_date"),
    enabled: !!user,
  });

  const filterCategory = (post) => {
    if (activeFilter === "All") return true;
    const label = CATEGORY_LABELS[post.category] || post.category;
    return label.toLowerCase() === activeFilter.toLowerCase() || (["Hair","Skin","Health","Laser","Aftercare","Progress"].includes(activeFilter) && [post.title,post.content].join(" ").toLowerCase().includes(activeFilter.toLowerCase()));
  };

  const filteredPosts = communityPosts.filter(filterCategory);
  if(accountError||isError)return <CustomerLoadState error onRetry={accountError?undefined:refetch}/>;
  if(!user)return <CustomerLoadState/>;

  return (
    <div className={`min-h-screen pb-10 ${isRTL ? "text-right" : "text-left"}`}
      style={{ background: "#eeebe6" }} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-[#333435]">{t("Community", "المجتمع")}</h1>
          <p className="text-xs text-[#7c8689] mt-0.5">
            {t("See what's happening inside the BATO world", "تابع ما يحدث في عالم باتو")}
          </p>
        </div>

        {/* Composer */}
        {user && <PostComposer user={user} />}

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              aria-pressed={activeFilter === f}
              className="bato-filter-option flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-all"
              style={activeFilter === f
                ? { background: "#3a2e1e", color: "#c4aa8b" }
                : { background: "#ffffff", color: "#7c8689", border: "1px solid rgba(196,170,139,0.2)" }}
            >
              {FILTER_LABELS[f] || f}
            </button>
          ))}
        </div>

        {/* Feed */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#c4aa8b]" />
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="space-y-3">
            {filteredPosts.map(post => (
              <PostCard key={post.id} post={post} user={user} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#eeebe6]">
            <div className="flex justify-center mb-3">
              <IlluMessages size={64} color="#c4aa8b" />
            </div>
            <p className="font-semibold text-[#333435] text-sm mb-1">{t("Community posts will appear here soon.", "ستظهر مشاركات المجتمع هنا قريبًا.")}</p>
            <p className="text-xs text-[#7c8689] leading-relaxed">
              {t("BATO guidance and approved client discussions will show here.", "ستظهر هنا إرشادات باتو ومشاركات العملاء بعد مراجعتها.")}
            </p>
          </div>
        )}

        {/* Safety note */}
        <div className="bato-style-hero relative overflow-hidden rounded-2xl p-4"
          style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 100%)" }}>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 opacity-80">
              <IlluShield size={36} color="#c4aa8b" />
            </div>
            <div>
              <p className="font-semibold text-white text-xs mb-0.5">{t("Moderated by BATO", "تحت إشراف باتو")}</p>
              <p className="text-[11px] leading-relaxed" style={{ color: "rgba(238,235,230,0.6)" }}>
                {t("All posts are reviewed before appearing. No personal medical data, unapproved photos, or advice from non-BATO sources.", "نراجع المشاركات قبل نشرها. تجنب مشاركة المعلومات الطبية الشخصية أو الصور غير المعتمدة أو النصائح الطبية من خارج فريق باتو.")}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}