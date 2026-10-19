import React from "react";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={stepNumber}>
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all border-4 border-white ${
                  isCompleted
                    ? "bg-green-500 text-white shadow-md"
                    : isCurrent
                    ? "bg-cyan-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-500"
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </div>
                <p className={`mt-3 text-xs text-center font-medium ${
                  isCurrent ? "text-cyan-600" : isCompleted ? "text-green-600" : "text-gray-500"
                }`}>
                  {step.label}
                </p>
              </div>
              {!isLast && (
                <div
                  className={`flex-1 h-1 mx-2 rounded-full transition-all ${
                    isCompleted ? "bg-green-500" : "bg-gray-200"
                  }`}
                  style={{ maxWidth: "80px" }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}