import type { CapacitorConfig } from '@capacitor/cli';

/**
 * IMPORTANT: Replace appId with the organization's owned reverse-domain
 * bundle identifier BEFORE publishing to Google Play / the App Store.
 */
const config: CapacitorConfig = {
  appId: 'com.batoclinic.app',
  appName: 'BATO Clinic',
  webDir: 'dist',
  server: {
    hostname: 'localhost',
    androidScheme: 'https',
    iosScheme: 'capacitor',
  },
};

export default config;
