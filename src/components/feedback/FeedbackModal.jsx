import {useBatoText} from "@/lib/batoText";
import {useLocation} from "@/components/LocationContext";
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Star, Send, Smile, Meh, Frown } from "lucide-react";
import { toast } from "sonner";

export default function FeedbackModal({ 
  isOpen, 
  onClose, 
  feedbackRequest,
  session,
  appointment,
  onFeedbackSubmitted 
}) {
  const tr=useBatoText();
  const {t,isRTL}=useLocation();
  const [satisfaction, setSatisfaction] = useState(5);
  const [painLevel, setPainLevel] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(isSubmitting)return;
    setIsSubmitting(true);

    try {
      const user=await base44.auth.me();
      await base44.entities.Message.create({client_email:user.email,sender_email:user.email,sender_name:user.full_name||user.email,sender_role:"client",is_from_doctor:false,subject:"Visit feedback",content:[t("Visit feedback","تقييم الزيارة"),t("Satisfaction: ","الرضا: ")+satisfaction+"/10",...(session?[t("Pain level: ","مستوى الألم: ")+painLevel+"/10"]:[]),feedback.trim()].filter(Boolean).join("\n"),tags:["client_care"],related_id:feedbackRequest?.id});
      const updates=[];
      if(session)updates.push(base44.entities.TreatmentSession.update(session.id,{client_satisfaction:satisfaction,pain_level:painLevel}));
      if(feedbackRequest)updates.push(base44.entities.FeedbackRequest.update(feedbackRequest.id,{status:"completed",completed_date:new Date().toISOString()}));
      const results=await Promise.allSettled(updates);
      if(results.some(r=>r.status==="rejected"))toast.error(t("Your feedback was sent. Some linked records could not be updated; Customer service can help.","تم إرسال تقييمك. تعذر تحديث بعض السجلات المرتبطة؛ يمكن لخدمة العملاء مساعدتك."));
      toast.success(t("Thank you. Your feedback was sent.","شكراً لك. تم إرسال تقييمك."));
      onFeedbackSubmitted && onFeedbackSubmitted();
      onClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      toast.error(t("Sending was not confirmed. Your feedback is still here; check before retrying.","لم يتم تأكيد الإرسال. تقييمك ما زال هنا؛ تحقق قبل إعادة المحاولة."));
    }

    setIsSubmitting(false);
  };

  const getSatisfactionIcon = () => {
    if (satisfaction >= 8) return <Smile className="w-8 h-8 text-green-600" />;
    if (satisfaction >= 5) return <Meh className="w-8 h-8 text-yellow-600" />;
    return <Frown className="w-8 h-8 text-red-600" />;
  };

  const getSatisfactionColor = () => {
    if (satisfaction >= 8) return "text-green-600";
    if (satisfaction >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dir={isRTL?"rtl":"ltr"} className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Star className="w-6 h-6 text-yellow-500" />{tr("How was your experience?")}</DialogTitle>
          <DialogDescription>{tr("Your feedback helps us provide better care and improve our services.")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Satisfaction Score */}
          <div>
            <Label className="text-base font-semibold mb-3 block">{tr("Overall Satisfaction")}</Label>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-1">
                <Slider
                  value={[satisfaction]}
                  disabled={isSubmitting} aria-label={t("Satisfaction score","درجة الرضا")} onValueChange={(value) => setSatisfaction(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-2 min-w-[80px]">
                {getSatisfactionIcon()}
                <span className={`text-3xl font-bold ${getSatisfactionColor()}`}>
                  {satisfaction}
                </span>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{tr("Very Dissatisfied")}</span>
              <span>{tr("Very Satisfied")}</span>
            </div>
          </div>

          {/* Pain Level (for treatment sessions) */}
          {session && (
            <div>
              <Label className="text-base font-semibold mb-3 block">
                Pain/Discomfort Level
              </Label>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1">
                  <Slider
                    value={[painLevel]}
                    disabled={isSubmitting} aria-label={t("Pain level","مستوى الألم")} onValueChange={(value) => setPainLevel(value[0])}
                    min={0}
                    max={10}
                    step={1}
                    className="cursor-pointer"
                  />
                </div>
                <span className="text-3xl font-bold text-gray-900 min-w-[80px]">
                  {painLevel}/10
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{tr("No Pain")}</span>
                <span>{tr("Severe Pain")}</span>
              </div>
            </div>
          )}

          {/* Written Feedback */}
          <div>
            <Label htmlFor="feedback" className="text-base font-semibold mb-2 block">{tr("Additional Comments (Optional)")}</Label>
            <Textarea
              id="feedback"
              disabled={isSubmitting} value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={tr("Share your thoughts, suggestions, or any concerns...")}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Session/Appointment Info */}
          {(session || appointment) && (
            <div className="bg-gray-50 rounded-lg p-4 text-sm">
              <p className="font-medium text-gray-900 mb-1">
                {session ? "Treatment Session" : "Appointment"}
              </p>
              <p className="text-gray-600">
                {session && `Session #${session.session_number} - ${String(session.treatment_type||'').replace(/_/g, ' ').toUpperCase()}`}
                {appointment && `${String(appointment.type||'').replace(/_/g, ' ').toUpperCase()}`}
              </p>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Skip for Now
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />{tr("Submit Feedback")}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}