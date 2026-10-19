import React, { useState } from "react";
import ExplorerOnboarding from "../components/onboarding2/ExplorerOnboarding.jsx";
import OnboardingShell from "../components/onboarding2/OnboardingShell";

// Temporary test page — renders Explorer onboarding with a mock profile
// Access at /TestExplorerOnboarding
export default function TestExplorerOnboarding() {
  const [done, setDone] = useState(false);
  const [savedData, setSavedData] = useState({});

  const mockUser = { full_name: "Test Explorer", email: "test@explorer.com" };
  const mockProfile = { current_step: 1, explorer_interests: [], explorer_assessment: null };

  const handleSave = (updates) => {
    setSavedData(prev => ({ ...prev, ...updates }));
    return Promise.resolve();
  };

  const handleComplete = (data) => {
    setSavedData(prev => ({ ...prev, ...data }));
    setDone(true);
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#eeebe6" }}>
        <div className="max-w-md w-full mx-auto px-4 py-8">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#eeebe6]">
            <p className="text-lg font-bold text-[#333435] mb-2">✅ Explorer Onboarding Complete</p>
            <p className="text-sm text-[#7c8689] mb-4">Here's what was captured:</p>
            <pre className="text-xs text-[#333435] bg-[#f9f8f6] rounded-xl p-4 overflow-auto max-h-96 whitespace-pre-wrap">
              {JSON.stringify(savedData, null, 2)}
            </pre>
            <button
              onClick={() => { setDone(false); setSavedData({}); }}
              className="mt-4 w-full py-3 rounded-2xl text-sm font-semibold text-white"
              style={{ background: "#3a2e1e" }}
            >
              Restart Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ExplorerOnboarding
      user={mockUser}
      profile={mockProfile}
      onSave={handleSave}
      onComplete={handleComplete}
    />
  );
}