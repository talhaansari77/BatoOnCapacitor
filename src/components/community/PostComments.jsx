import {useLocation} from "@/components/LocationContext";
import {toast} from "sonner";
import {ar} from "date-fns/locale";
import { formatDistanceToNow } from "@/lib/customerFormatting";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Shield } from "lucide-react";


export default function PostComments({ postId, user }) {
  const {t,isRTL}=useLocation();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [open] = useState(true);

  const { data: comments = [], isLoading,isError,refetch } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => base44.entities.CommunityComment.filter({ post_id: postId, status: "approved" }, "created_date"),
    enabled: open,
  });

  const addCommentMutation = useMutation({
    mutationFn: async () => {
      const comment = await base44.entities.CommunityComment.create({
        post_id: postId,
        author_email: user.email,
        author_name: isAnonymous ? "Anonymous" : (user.full_name || user.email),
        content: content.trim(),
        is_anonymous: isAnonymous,
        status: "pending",
      });
      return comment;
    },
    onError:()=>toast.error(t("Your comment was not confirmed. Check before retrying.","لم يتم تأكيد إرسال تعليقك. تحقق قبل المحاولة مجدداً.")),
    onSuccess: () => {
      toast.success(t("Comment submitted for review.","تم إرسال التعليق للمراجعة."));
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["communityPosts"] });
    },
  });

  return (
    <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(196,170,139,0.12)" }}>
      {open && (
        <div className="mt-3 space-y-3">
          {/* Existing comments */}
          {isError?<div role="alert"><p>{t("Could not load comments.","تعذر تحميل التعليقات.")}</p><button className="underline p-2" onClick={()=>refetch()}>{t("Try again","حاول مرة أخرى")}</button></div>:isLoading ? (
            <div className="flex justify-center py-3">
              <Loader2 className="w-4 h-4 animate-spin text-[#7c8689]" />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-xs text-[#7c8689]">{t("No comments yet. Be the first.","لا توجد تعليقات بعد. كن أول المشاركين.")}</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="flex gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(196,170,139,0.12)" }}>
                  {c.is_by_staff
                    ? <Shield className="w-3.5 h-3.5" style={{ color: "#c4aa8b" }} />
                    : <span className="text-[10px] font-bold" style={{ color: "#c4aa8b" }}>
                        {c.author_name?.charAt(0) || "?"}
                      </span>
                  }
                </div>
                <div className="flex-1 bg-[#f9f8f6] rounded-xl px-3 py-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-xs font-semibold text-[#333435]">{c.author_name}</p>
                    {c.is_by_staff && (
                      <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(196,170,139,0.2)", color: "#3a2e1e" }}>
                        {t("BATO Team","فريق باتو")}
                      </span>
                    )}
                    <p className="text-[10px] text-[#7c8689] ml-auto">
                      {formatDistanceToNow(c.created_date, { addSuffix: true,locale:isRTL?ar:undefined })}
                    </p>
                  </div>
                  <p className="text-xs text-[#333435] leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))
          )}

          {/* New comment input */}
          {user && (
            <div className="space-y-2 pt-1">
              <Textarea
                disabled={addCommentMutation.isPending} placeholder={t("Write a comment...","اكتب تعليقاً…")}
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={2}
                className="text-sm border-[#eeebe6] bg-[#f9f8f6] resize-none"
              />
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <Checkbox
                    id={`anon-${postId}`}
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                  <Label htmlFor={`anon-${postId}`} className="text-xs text-[#7c8689] cursor-pointer">
                    {t("Post anonymously","النشر دون إظهار الاسم")}
                  </Label>
                </div>
                <Button
                  size="sm"
                  disabled={!content.trim() || addCommentMutation.isPending}
                  onClick={() => addCommentMutation.mutate()}
                  className="text-xs h-8 px-4 border-0"
                  style={{ background: "#c4aa8b", color: "#3a2e1e" }}
                >
                  {addCommentMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : t("Submit for review","إرسال للمراجعة")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}