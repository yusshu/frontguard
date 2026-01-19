export enum DeviceType {
  FAN = 'fan',
}

export interface Device<S> {
  id: string;
  type: DeviceType;
  state: S;
}