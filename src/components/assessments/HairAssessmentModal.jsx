import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X, AlertCircle } from "lucide-react";
import HairAssessmentFlow from "./HairAssessmentFlow";
import { useLocation } from "../LocationContext";

export default function HairAssessmentModal({ open, onClose, userEmail, userStatus = "explorer" }) {
  const { isRTL, t } = useLocation();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir={isRTL ? "rtl" : "ltr"}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{t("Hair Assessment", "تقييم الشعر")}</DialogTitle>
            <button
              onClick={onClose}
              className="rounded-lg hover:bg-gray-100 p-1 flex-shrink-0"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </DialogHeader>
        <div className="mt-6">
          <HairAssessmentFlow
            onComplete={onClose}
            onCancel={onClose}
            userEmail={userEmail}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}