import type { Device } from "../../types/device";

export const mockDevice: Device = {
  id: 1,
  name: "Camera 01",
  ipAddress: "192.168.1.10",
  type: "Camera",
  status: "Online",
  location: "Building A",
  criticality: "Medium",
  purpose: "Security monitoring",
};