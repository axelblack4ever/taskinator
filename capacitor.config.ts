// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ionic.taskinator',
  appName: 'taskinator',
  webDir: 'www',
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: false,
      iosKeychainPrefix: 'taskinator',
      androidIsEncryption: false,
      androidDatabaseVersion: 1,
    }
  }
};

export default config;