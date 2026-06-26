import { afterEach, expect, test, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeviceFooter from "./DeviceFooter";

afterEach(() => {
  cleanup();
});

test("displays pagination information", () => {
  const { getByText } = render(
    <DeviceFooter
      page={1}
      pageSize={10}
      totalRecords={25}
      totalPages={3}
      onPageChange={() => {}}
    />
  );

  expect(getByText("Showing 1-10 of 25 devices")).toBeInTheDocument();
  expect(getByText("Page 1 of 3")).toBeInTheDocument();
});

test("calls page change when Next is clicked", async () => {
  const user = userEvent.setup();
  const onPageChange = vi.fn();

  const { getByRole } = render(
    <DeviceFooter
      page={1}
      pageSize={10}
      totalRecords={25}
      totalPages={3}
      onPageChange={onPageChange}
    />
  );

  await user.click(getByRole("button", { name: /next/i }));

  expect(onPageChange).toHaveBeenCalledWith(2);
});

test("calls page change when Previous is clicked", async () => {
  const user = userEvent.setup();
  const onPageChange = vi.fn();

  const { getByRole } = render(
    <DeviceFooter
      page={2}
      pageSize={10}
      totalRecords={25}
      totalPages={3}
      onPageChange={onPageChange}
    />
  );

  await user.click(getByRole("button", { name: /previous/i }));

  expect(onPageChange).toHaveBeenCalledWith(1);
});

test("calls page change when First is clicked", async () => {
  const user = userEvent.setup();
  const onPageChange = vi.fn();

  const { getByRole } = render(
    <DeviceFooter
      page={3}
      pageSize={10}
      totalRecords={25}
      totalPages={3}
      onPageChange={onPageChange}
    />
  );

  await user.click(getByRole("button", { name: /first/i }));

  expect(onPageChange).toHaveBeenCalledWith(1);
});

test("calls page change when Last is clicked", async () => {
  const user = userEvent.setup();
  const onPageChange = vi.fn();

  const { getByRole } = render(
    <DeviceFooter
      page={1}
      pageSize={10}
      totalRecords={25}
      totalPages={3}
      onPageChange={onPageChange}
    />
  );

  await user.click(getByRole("button", { name: /last/i }));

  expect(onPageChange).toHaveBeenCalledWith(3);
});

test("disables First and Previous on first page", () => {
  const { getByRole } = render(
    <DeviceFooter
      page={1}
      pageSize={10}
      totalRecords={25}
      totalPages={3}
      onPageChange={() => {}}
    />
  );

  expect(getByRole("button", { name: /first/i })).toBeDisabled();
  expect(getByRole("button", { name: /previous/i })).toBeDisabled();
});

test("disables Next and Last on last page", () => {
  const { getByRole } = render(
    <DeviceFooter
      page={3}
      pageSize={10}
      totalRecords={25}
      totalPages={3}
      onPageChange={() => {}}
    />
  );

  expect(getByRole("button", { name: /next/i })).toBeDisabled();
  expect(getByRole("button", { name: /last/i })).toBeDisabled();
});