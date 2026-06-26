export type DeviceStatus = "Online" | "Offline" | "Maintenance";

export type Device = {
  id: number;
  name: string;
  ipAddress: string;
  type: string;
  status: DeviceStatus;
  location?: string;
  criticality?: string;
  purpose?: string;
  otherDescription?: string;
};
