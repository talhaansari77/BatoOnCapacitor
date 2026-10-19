import React from 'react';
import { useLocation } from 'react-router-dom';
export default function StandaloneDemoNotice() {
  const { pathname } = useLocation();
  // Onboarding already describes its own steps; notice persists on every other screen.
  if (pathname.toLowerCase() === '/onboarding') return <div role="note" className="px-4 py-2 text-xs text-center bg-[#f9f0d9] text-[#564324]">Offline demo · Fictional profile · Nothing is sent to BATO</div>;
  return <div role="note" className="px-4 py-2 text-xs text-center bg-[#f9f0d9] text-[#564324]">Offline iOS preview · Sample data only · API and authentication not connected</div>;
}
