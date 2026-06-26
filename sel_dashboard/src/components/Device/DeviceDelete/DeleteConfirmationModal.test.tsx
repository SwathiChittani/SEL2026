import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import { mockDevice } from "../../../test/mocks/deviceMock";

afterEach(() => {
  cleanup();
});

test("shows delete confirmation message", () => {
  render(
    <DeleteConfirmationModal
      deviceName={mockDevice.name}
      onConfirm={() => {}}
      onCancel={() => {}}
    />
  );

  expect(screen.getByText("Delete Device")).toBeInTheDocument();
  expect(screen.getByText(mockDevice.name)).toBeInTheDocument();
});

test("calls onConfirm when Yes button is clicked", async () => {
  const user = userEvent.setup();
  const onConfirm = vi.fn();

  render(
    <DeleteConfirmationModal
      deviceName={mockDevice.name}
      onConfirm={onConfirm}
      onCancel={() => {}}
    />
  );

  await user.click(screen.getByRole("button", { name: /yes/i }));

  expect(onConfirm).toHaveBeenCalledTimes(1);
});

test("calls onCancel when No button is clicked", async () => {
  const user = userEvent.setup();
  const onCancel = vi.fn();

  render(
    <DeleteConfirmationModal
      deviceName={mockDevice.name}
      onConfirm={() => {}}
      onCancel={onCancel}
    />
  );

  await user.click(screen.getByRole("button", { name: /no/i }));

  expect(onCancel).toHaveBeenCalledTimes(1);
});