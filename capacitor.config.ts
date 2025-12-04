import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'life-stories',
  webDir: 'build/client',
  server: {
    androidScheme: 'https' // 'https' is preferred over 'http' for security features
  }
};

export default config;
