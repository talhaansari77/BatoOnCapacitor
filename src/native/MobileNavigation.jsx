import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

/** Android hardware back key for Capacitor's embedded React Router app. */
export default function MobileNavigation() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined;
    let active = true;
    let listener;

    CapacitorApp.addListener('backButton', () => {
      // BrowserRouter maintains history.state.idx. Never exit to an external URL.
      const index = window.history.state?.idx;
      if (typeof index === 'number' && index > 0) {
        navigate(-1);
      } else {
        CapacitorApp.minimizeApp().catch((error) =>
          console.warn('Unable to minimize the app:', error)
        );
      }
    }).then((handle) => {
      if (active) listener = handle;
      else handle.remove();
    }).catch((error) => console.warn('Unable to register back button:', error));

    return () => {
      active = false;
      listener?.remove();
    };
  }, [navigate]);

  return null;
}
