export enum DeviceType {
  FAN = 'fan',
}

export interface Device<S> {
  id: string;
  name: string;
  type: DeviceType;
  state: S | null; // null indicates the device is offline
}