import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dalsu.plumbing',
  appName: '달수배관케어',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
