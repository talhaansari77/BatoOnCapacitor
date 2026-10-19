import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function CompletionStep({ onFinish }) {
  return (
    <Card className="max-w-2xl mx-auto border-none shadow-2xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 border-b relative overflow-hidden">
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{ 
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          style={{
            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        />
        
        <div className="text-center py-6 relative z-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <CheckCircle2 className="w-14 h-14 text-green-500" />
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CardTitle className="text-4xl mb-2 text-white drop-shadow-lg">Welcome Aboard! 🎉</CardTitle>
            <p className="text-green-50 text-lg">
              You're all set to begin your hair restoration journey
            </p>
          </motion.div>
        </div>
      </CardHeader>
      <CardContent className="p-8 bg-gradient-to-br from-white to-gray-50">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-br from-cyan-50 via-teal-50 to-cyan-50 border-2 border-cyan-200 rounded-2xl p-6 shadow-lg">
            <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-xl">
              <Sparkles className="w-6 h-6 text-cyan-600" />
              What's Next?
            </h3>
            <div className="space-y-5">
              {[
                { 
                  num: 1, 
                  title: "Check Your Email", 
                  desc: "We'll send confirmation and next steps within 24 hours",
                  icon: "📧"
                },
                { 
                  num: 2, 
                  title: "Explore Your Dashboard", 
                  desc: "Familiarize yourself with all the features available to you",
                  icon: "🎯"
                },
                { 
                  num: 3, 
                  title: "Attend Your Consultation", 
                  desc: "Your medical team will create a personalized treatment plan",
                  icon: "👨‍⚕️"
                },
                { 
                  num: 4, 
                  title: "Track Your Progress", 
                  desc: "Use the app to monitor every step of your transformation",
                  icon: "📈"
                }
              ].map((item, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  className="flex gap-4 bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300"
                  whileHover={{ x: 5 }}
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 text-white rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg shadow-lg">
                    {item.num}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 mb-1 flex items-center gap-2">
                      <span>{item.title}</span>
                      <span>{item.icon}</span>
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-5 shadow-md"
          >
            <p className="text-sm text-purple-900">
              <strong className="text-base">💬 Need help?</strong> Our support team is here for you 24/7. 
              Use the Messages section to reach out with any questions or concerns.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onFinish}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 py-7 text-lg font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      </CardContent>
    </Card>
  );
}