import { API_ENDPOINTS } from "../constants/apiEndpoints";

export async function getDevices() {

  const token =
    localStorage.getItem("token");

  const response = await fetch(
    API_ENDPOINTS.DEVICES,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      "Failed to load devices"
    );
  }

  return response.json();
}