import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  Calendar, 
  TrendingUp, 
  MessageSquare, 
  FileText,
  Image,
  Bell,
  Brain
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Digital Case File",
    description: "Access your complete treatment history, diagnosis, and plan anytime, anywhere.",
    color: "bg-cyan-100 text-cyan-600"
  },
  {
    icon: Calendar,
    title: "Easy Appointment Booking",
    description: "Schedule and manage appointments with just a few clicks. Get automated reminders.",
    color: "bg-purple-100 text-purple-600"
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description: "Visual timeline of your journey with photos and detailed analytics of your results.",
    color: "bg-teal-100 text-teal-600"
  },
  {
    icon: Brain,
    title: "AI Treatment Advisor",
    description: "Get AI-powered insights on your progress and personalized recommendations.",
    color: "bg-pink-100 text-pink-600"
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "Message your medical team directly with questions or concerns.",
    color: "bg-indigo-100 text-indigo-600"
  },
  {
    icon: Image,
    title: "Photo Timeline",
    description: "Track your transformation with before/after photos and progress updates.",
    color: "bg-orange-100 text-orange-600"
  }
];

export default function FeaturesStep({ onNext, onBack }) {
  return (
    <Card className="max-w-4xl mx-auto border-none shadow-xl">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <div className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl mb-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            Welcome to HairRevive Portal!
          </CardTitle>
          <p className="text-gray-600">
            Your personal assistant for a successful hair restoration journey
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-8">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center flex-shrink-0`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 rounded-xl p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-600" />
            What to Expect
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="text-cyan-600">✓</span>
              <span><strong>Regular Updates:</strong> Track every step of your progress with photos and metrics</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-600">✓</span>
              <span><strong>Expert Support:</strong> Your medical team is always just a message away</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-600">✓</span>
              <span><strong>Personalized Care:</strong> Treatment plans tailored to your specific needs</span>
            </li>
            <li className="flex gap-2">
              <span className="text-cyan-600">✓</span>
              <span><strong>Transparent Process:</strong> Full visibility into your treatment journey</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 py-6 text-lg"
          >
            Back
          </Button>
          <Button
            onClick={onNext}
            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 py-6 text-lg"
          >
            Continue to Appointment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}