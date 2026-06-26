import type { DeviceStatus } from "../types/device";

export const DEVICE_STATUSES: DeviceStatus[] = [
  "Online",
  "Offline",
  "Maintenance",
];

export const DEVICE_TYPES = [
  "Protection Relay",
  "Controller",
  "Monitor",
  "Meter",
  "Time Sync",
  "Network Device",
  "Security Device",
  "Camera",
  "Access Device",
  "Other",
];

export const PAGE_SIZE = 10;