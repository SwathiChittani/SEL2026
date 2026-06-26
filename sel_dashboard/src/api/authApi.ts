import { API_ENDPOINTS } from "../constants/apiEndpoints";

export async function login(
  username: string,
  password: string
) {
  const response = await fetch(
    API_ENDPOINTS.LOGIN,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Invalid login");
  }

  return response.json();
}