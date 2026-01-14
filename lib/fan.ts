export const FAN_DEVICE_TYPE = 'fan';

export type FanSpeed = 'off' | 'slow' | 'medium' | 'fast';

export interface FanState {
  status: FanSpeed;
  rotates: boolean;
  temperature: number | null;
  humidity: number | null;
};