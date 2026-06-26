import { apiFetch, apiFetchBlob } from "./apiClient";
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import type { Device } from "../types/device";

export function getDevices() {
  return apiFetch<Device[]>(API_ENDPOINTS.DEVICES);
}

export function addDevice(device: Device) {
  return apiFetch<Device>(API_ENDPOINTS.DEVICES, {
    method: "POST",
    body: JSON.stringify(device),
  });
}

export function updateDevice(device: Device) {
  return apiFetch<Device>(`${API_ENDPOINTS.DEVICES}/${device.id}`, {
    method: "PUT",
    body: JSON.stringify(device),
  });
}

export function deleteDevice(id: number) {
  return apiFetch<void>(`${API_ENDPOINTS.DEVICES}/${id}`, {
    method: "DELETE",
  });
}

export function importDevices(devices: Device[]) {
  return apiFetch<Device[]>(API_ENDPOINTS.IMPORT_DEVICES, {
    method: "POST",
    body: JSON.stringify(devices),
  });
}

export function exportDevices() {
  return apiFetchBlob(API_ENDPOINTS.EXPORT_DEVICES, {
    method: "GET",
  });
}
