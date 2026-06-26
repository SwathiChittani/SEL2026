import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import DeviceHeader from "./DeviceHeader";

afterEach(() => {
  cleanup();
});

test("renders page title", () => {
  const { getByText } = render(
    <DeviceHeader onAddDevice={() => {}} onLogout={() => {}} />
  );

  expect(getByText("IOT Device Management")).toBeInTheDocument();
});

test("renders SEL logo", () => {
  const { getByAltText } = render(
    <DeviceHeader onAddDevice={() => {}} onLogout={() => {}} />
  );

  expect(getByAltText("SEL Logo")).toBeInTheDocument();
});

test("renders Add Device button", () => {
  const { getByRole } = render(
    <DeviceHeader onAddDevice={() => {}} onLogout={() => {}} />
  );

  expect(getByRole("button", { name: /add device/i })).toBeInTheDocument();
});

test("renders Logout button", () => {
  const { getByRole } = render(
    <DeviceHeader onAddDevice={() => {}} onLogout={() => {}} />
  );

  expect(getByRole("button", { name: /logout/i })).toBeInTheDocument();
});

test("calls onAddDevice when clicked", async () => {
  const user = userEvent.setup();
  const onAddDevice = vi.fn();

  const { getByRole } = render(
    <DeviceHeader onAddDevice={onAddDevice} onLogout={() => {}} />
  );

  await user.click(getByRole("button", { name: /add device/i }));

  expect(onAddDevice).toHaveBeenCalledTimes(1);
});

test("calls onLogout when clicked", async () => {
  const user = userEvent.setup();
  const onLogout = vi.fn();

  const { getByRole } = render(
    <DeviceHeader onAddDevice={() => {}} onLogout={onLogout} />
  );

  await user.click(getByRole("button", { name: /logout/i }));

  expect(onLogout).toHaveBeenCalledTimes(1);
});