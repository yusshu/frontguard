export const FAN_DEVICE_TYPE = 'fan';

export type FanMode = 'manual' | 'scheduled' | 'threshold';

export type FanSpeed = 'off' | 'slow' | 'medium' | 'fast';

export interface FanState {
  status: FanSpeed;
  rotates: boolean;
  temperature: number | null;
  humidity: number | null;

  mode: FanMode;
  scheduled_start: string | null;
  scheduled_end: string | null;
  threshold_temp: number | null;
  scheduled_or_thresholded_status: FanSpeed | null;
};