import { cleanup, fireEvent, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import DeviceToolbar from "./DeviceToolbar";

afterEach(() => {
  cleanup();
});

function renderToolbar() {
  const props = {
    searchText: "",
    onSearchChange: vi.fn(),
    onImport: vi.fn(),
    onExport: vi.fn(),
    onClearFilters: vi.fn(),
  };

  return {
    ...render(<DeviceToolbar {...props} />),
    props,
  };
}

test("renders Import button", () => {
  const { getByText } = renderToolbar();

  expect(getByText("Import")).toBeInTheDocument();
});

test("renders Export button", () => {
  const { getByRole } = renderToolbar();

  expect(
    getByRole("button", { name: /export/i })
  ).toBeInTheDocument();
});

test("renders Clear Filters button", () => {
  const { getByRole } = renderToolbar();

  expect(
    getByRole("button", { name: /clear filters/i })
  ).toBeInTheDocument();
});

test("calls onExport when Export is clicked", async () => {
  const user = userEvent.setup();

  const { getByRole, props } = renderToolbar();

  await user.click(
    getByRole("button", { name: /export/i })
  );

  expect(props.onExport).toHaveBeenCalledTimes(1);
});

test("calls onClearFilters when Clear Filters is clicked", async () => {
  const user = userEvent.setup();

  const { getByRole, props } = renderToolbar();

  await user.click(
    getByRole("button", { name: /clear filters/i })
  );

  expect(props.onClearFilters).toHaveBeenCalledTimes(1);
});

test("calls onImport when a file is selected", async () => {
  const user = userEvent.setup();

  const { container, props } = renderToolbar();

  const file = new File(
    ['{"name":"Camera 01"}'],
    "devices.json",
    {
      type: "application/json",
    }
  );

  const fileInput =
    container.querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;

  await user.upload(fileInput, file);

  expect(props.onImport).toHaveBeenCalledTimes(1);
  expect(props.onImport).toHaveBeenCalledWith(file);
});

// test("does not call onImport when no file is selected", () => {
//   const { props } = renderToolbar();

//   expect(props.onImport).not.toHaveBeenCalled();
// });

test("does not call onImport when file input has no file", () => {
  const { container, props } = renderToolbar();

  const fileInput = container.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement;

  fireEvent.change(fileInput, {
    target: {
      files: [],
    },
  });

  expect(props.onImport).not.toHaveBeenCalled();
});
