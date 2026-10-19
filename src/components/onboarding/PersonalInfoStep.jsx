import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Calendar } from "lucide-react";

export default function PersonalInfoStep({ userData, onNext }) {
  const [formData, setFormData] = useState({
    full_name: userData?.full_name || "",
    phone: userData?.phone || "",
    date_of_birth: userData?.date_of_birth || "",
    emergency_contact: userData?.emergency_contact || ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-xl">
      <CardHeader className="bg-gradient-to-r from-cyan-50 to-teal-50 border-b">
        <CardTitle className="flex items-center gap-2 text-2xl">
          <User className="w-6 h-6 text-cyan-600" />
          Personal Information
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">
          Let's start by getting to know you better. This information helps us provide personalized care.
        </p>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="full_name" className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              Full Name *
            </Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="John Doe"
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              Phone Number *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="date_of_birth" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              Date of Birth *
            </Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              required
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="emergency_contact" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              Emergency Contact
            </Label>
            <Input
              id="emergency_contact"
              value={formData.emergency_contact}
              onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
              placeholder="Name and phone number"
              className="mt-2"
            />
            <p className="text-xs text-gray-500 mt-1">Optional but recommended</p>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 py-6 text-lg"
          >
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}