import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import App from "./App";

vi.mock("./components/Login/Login", () => ({
  default: ({ onLoginSuccess }: any) => (
    <div>
      <span>Login Page</span>
      <button onClick={onLoginSuccess}>Mock Login</button>
    </div>
  ),
}));

vi.mock("./components/Device/DeviceDashboard/DeviceDashboard", () => ({
  default: ({ onLogout }: any) => (
    <div>
      <span>Device Dashboard</span>
      <button onClick={onLogout}>Mock Logout</button>
    </div>
  ),
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

test("shows login page when token does not exist", () => {
  const { getByText } = render(<App />);

  expect(getByText("Login Page")).toBeInTheDocument();
});

test("shows dashboard when token exists", () => {
  localStorage.setItem("token", "fake-token");

  const { getByText } = render(<App />);

  expect(getByText("Device Dashboard")).toBeInTheDocument();
});

test("shows dashboard after successful login", async () => {
  const user = userEvent.setup();

  const { getByRole, getByText } = render(<App />);

  expect(getByText("Login Page")).toBeInTheDocument();

  await user.click(
    getByRole("button", {
      name: /mock login/i,
    })
  );

  expect(getByText("Device Dashboard")).toBeInTheDocument();
});

test("logs out and clears localStorage", async () => {
  const user = userEvent.setup();

  localStorage.setItem("token", "fake-token");
  localStorage.setItem("role", "admin");
  localStorage.setItem("username", "admin");

  const { getByRole, getByText } = render(<App />);

  expect(getByText("Device Dashboard")).toBeInTheDocument();

  await user.click(
    getByRole("button", {
      name: /mock logout/i,
    })
  );

  expect(localStorage.getItem("token")).toBeNull();
  expect(localStorage.getItem("role")).toBeNull();
  expect(localStorage.getItem("username")).toBeNull();

  expect(getByText("Login Page")).toBeInTheDocument();
});