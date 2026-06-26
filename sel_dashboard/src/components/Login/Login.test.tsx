import { cleanup, render, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import Login from "./Login";

const loginMock = vi.fn();

vi.mock("../../api/authApi", () => ({
  login: (...args: unknown[]) => loginMock(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
});

test("renders login page", () => {
  const { getByText, getByLabelText } = render(
    <Login onLoginSuccess={() => {}} />
  );

  expect(
    getByText("IOT Device Management")
  ).toBeInTheDocument();

  expect(
    getByLabelText(/username/i)
  ).toBeInTheDocument();

  expect(
    getByLabelText(/password/i)
  ).toBeInTheDocument();
});

test("shows default username", () => {
  const { getByDisplayValue } = render(
    <Login onLoginSuccess={() => {}} />
  );

  expect(
    getByDisplayValue("admin")
  ).toBeInTheDocument();
});

test("updates username and password", async () => {
  const user = userEvent.setup();

  const { getByLabelText } = render(
    <Login onLoginSuccess={() => {}} />
  );

  const username =
    getByLabelText(/username/i);

  const password =
    getByLabelText(/password/i);

  await user.clear(username);
  await user.type(username, "operator");

  await user.clear(password);
  await user.type(password, "operator123");

  expect(username).toHaveValue("operator");
  expect(password).toHaveValue("operator123");
});

test("calls login api and login success callback", async () => {
  const user = userEvent.setup();

  const onLoginSuccess = vi.fn();

  loginMock.mockResolvedValue({
    token: "fake-token",
    user: {
      username: "admin",
      role: "ADMIN",
    },
  });

  const { getByRole } = render(
    <Login onLoginSuccess={onLoginSuccess} />
  );

  await user.click(
    getByRole("button", {
      name: /login/i,
    })
  );

  await waitFor(() => {
    expect(loginMock).toHaveBeenCalledTimes(1);
  });

  expect(
    localStorage.getItem("token")
  ).toBe("fake-token");

  expect(
    localStorage.getItem("role")
  ).toBe("ADMIN");

  expect(
    localStorage.getItem("username")
  ).toBe("admin");

  expect(onLoginSuccess).toHaveBeenCalledTimes(1);
});

test("shows error when login fails", async () => {
  const user = userEvent.setup();

  loginMock.mockRejectedValue(
    new Error("Invalid login")
  );

  const { getByRole, getByText } = render(
    <Login onLoginSuccess={() => {}} />
  );

  await user.click(
    getByRole("button", {
      name: /login/i,
    })
  );

  await waitFor(() => {
    expect(
      getByText(
        "Invalid username or password."
      )
    ).toBeInTheDocument();
  });
});

test("calls login api with entered credentials", async () => {
  const user = userEvent.setup();

  loginMock.mockResolvedValue({
    token: "fake-token",
    user: {
      username: "operator",
      role: "USER",
    },
  });

  const { getByLabelText, getByRole } = render(
    <Login onLoginSuccess={() => {}} />
  );

  const username =
    getByLabelText(/username/i);

  const password =
    getByLabelText(/password/i);

  await user.clear(username);
  await user.type(username, "operator");

  await user.clear(password);
  await user.type(password, "operator123");

  await user.click(
    getByRole("button", {
      name: /login/i,
    })
  );

  await waitFor(() => {
    expect(loginMock).toHaveBeenCalledWith(
      "operator",
      "operator123"
    );
  });
});