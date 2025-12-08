import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'life-stories',
  webDir: 'build/client',
  plugins: {
    "CapacitorNodeJS": {
      "nodeDir": "nodejs",
    },
  }
};

export default config;
