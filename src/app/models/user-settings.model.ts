// src/app/models/user-settings.model.ts

export interface UserSettings {
  id?: number;
  user_id?: string;
  language: string;
  sounds_enabled: boolean;
  sound_choice: string;
  notifications_enabled: boolean;
  vibration_enabled: boolean;
  theme: string;
  methods_behavior: string;
}

export interface UpdateUserSettingsRequest extends Partial<UserSettings> {}