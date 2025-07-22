// src/app/constants/sound-options.ts

export interface SoundOption {
  label: string;
  value: string;
  file: string | null;
}

export const SOUND_OPTIONS: SoundOption[] = [
  { label: 'Campanilla', value: 'campanilla', file: 'bell.mp3' },
  { label: 'Eco digital', value: 'eco', file: 'echo.mp3' },
  { label: 'Timbre suave', value: 'chime', file: 'chime.mp3' },
  { label: 'Silencio', value: 'silencio', file: null }
];
