import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Heart, AlertTriangle, FileText } from "lucide-react";

export default function MedicalInfoStep({ userData, onNext, onBack }) {
  const [formData, setFormData] = useState({
    medical_history: userData?.medical_history || "",
    allergies: userData?.allergies || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-xl">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Heart className="w-6 h-6 text-purple-600" />
          Medical Information
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Your medical history helps us ensure your safety and optimize your treatment plan.
        </p>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="medical_history" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              Medical History
            </Label>
            <Textarea
              id="medical_history"
              value={formData.medical_history}
              onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
              placeholder="Please list any relevant medical conditions, past surgeries, current medications, or health concerns..."
              rows={5}
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Include any conditions like diabetes, blood pressure issues, scalp conditions, etc.
            </p>
          </div>

          <div>
            <Label htmlFor="allergies" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              Allergies *
            </Label>
            <Textarea
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              placeholder="List any known allergies to medications, anesthetics, or other substances..."
              rows={4}
              className="mt-2"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              If you have no known allergies, please type "None"
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-2">
              <Heart className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Privacy & Confidentiality</p>
                <p className="text-blue-700">
                  Your medical information is kept strictly confidential and is only used by our medical team 
                  to provide you with the best possible care.
                </p>
              </div>
            </div>
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
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 py-6 text-lg"
            >
              Continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}