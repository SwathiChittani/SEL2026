import { apiFetch } from "./apiClient";
import { API_ENDPOINTS } from "../constants/apiEndpoints";

export type AuthResponse = {
  token: string;
  user: {
    username: string;
    role: string;
  };
};

export type LoginRequest = {
  username: string;
  password: string;
};

export function login(credentials: LoginRequest) {
  return apiFetch<AuthResponse>(API_ENDPOINTS.LOGIN, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}