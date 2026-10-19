
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Stethoscope, Info } from "lucide-react";

export default function FirstAppointmentStep({ userEmail, onNext, onBack, onSkip }) {
  const [formData, setFormData] = useState({
    appointment_date: "",
    type: "consultation",
    notes: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-xl">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Calendar className="w-6 h-6 text-green-600" />
          Book Your First Consultation
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Schedule your initial consultation to begin your hair restoration journey.
        </p>
      </CardHeader>
      <CardContent className="p-8">
        {/* Special Offer Banner */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 mb-6 text-center">
          <p className="text-gray-900 font-bold text-lg mb-1">
            🎁 NEW CLIENT SPECIAL: $50 OFF First Consultation!
          </p>
          <p className="text-sm text-gray-800">
            Plus FREE hair analysis ($150 value) • Limited time offer
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-2">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">What happens during consultation?</p>
                <ul className="text-blue-700 space-y-1 ml-4 list-disc">
                  <li>Comprehensive scalp and hair analysis</li>
                  <li>Discussion of your goals and expectations</li>
                  <li>Review of treatment options and recommendations</li>
                  <li>Personalized treatment plan creation</li>
                  <li>Before photos documentation</li>
                  <li>Transparent pricing with no hidden fees</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="appointment_date" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              Preferred Date & Time *
            </Label>
            <Input
              id="appointment_date"
              type="datetime-local"
              value={formData.appointment_date}
              onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
              required
              className="mt-2"
              min={new Date().toISOString().slice(0, 16)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Our team will confirm your appointment within 24 hours
            </p>
          </div>

          <div>
            <Label htmlFor="type" className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-gray-500" />
              Appointment Type
            </Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="consultation">Initial Consultation</SelectItem>
                <SelectItem value="follow_up">Follow-up Visit</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Additional Notes or Questions</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Let us know if you have any specific concerns or questions..."
              rows={3}
              className="mt-2"
            />
          </div>

          {/* Urgency Message */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-900 font-semibold text-center">
              ⏰ Only 3 consultation slots remaining this week!
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="flex-1 py-6 text-lg"
            >
              Back
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onSkip}
              className="flex-1 py-6 text-lg"
            >
              Skip for Now
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 py-6 text-lg"
            >
              Book Appointment
            </Button>
          </div>
        </form>

        {/* Trust Badges */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              ✓ 100% Free Consultation
            </span>
            <span className="flex items-center gap-1">
              ✓ No Obligation
            </span>
            <span className="flex items-center gap-1">
              ✓ Same-Day Response
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
