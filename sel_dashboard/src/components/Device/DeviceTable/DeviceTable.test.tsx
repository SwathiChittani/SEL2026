import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import DeviceTable from "./DeviceTable";
import { mockDevice } from "../../../test/mocks/deviceMock";

afterEach(() => {
  cleanup();
});

function renderTable(overrides = {}) {
  const props = {
    devices: [mockDevice],
    selectedDeviceId: null,
    loading: false,
    error: "",
    nameFilter: "",
    ipFilter: "",
    typeFilter: "",
    statusFilter: "",
    onNameFilterChange: vi.fn(),
    onIpFilterChange: vi.fn(),
    onTypeFilterChange: vi.fn(),
    onStatusFilterChange: vi.fn(),
    onSelectDevice: vi.fn(),
    onEditDevice: vi.fn(),
    onRemoveDevice: vi.fn(),
    ...overrides,
  };

  return {
    ...render(<DeviceTable {...props} />),
    props,
  };
}

test("shows loading message", () => {
  const { getByText } = renderTable({
    loading: true,
  });

  expect(getByText("Loading devices...")).toBeInTheDocument();
});

test("shows error message", () => {
  const { getByText } = renderTable({
    error: "Unable to load devices.",
  });

  expect(getByText("Unable to load devices.")).toBeInTheDocument();
  expect(getByText("Please Try Again")).toBeInTheDocument();
});

test("renders device row", () => {
  const { getByText, getAllByText } = renderTable();

  expect(getByText(mockDevice.name)).toBeInTheDocument();
  expect(getByText(mockDevice.ipAddress)).toBeInTheDocument();

  expect(getAllByText(mockDevice.type).length).toBeGreaterThan(0);
  expect(getAllByText(mockDevice.status).length).toBeGreaterThan(0);
});

test("shows empty message when no devices exist", () => {
  const { getByText } = renderTable({
    devices: [],
  });

  expect(getByText("No devices found.")).toBeInTheDocument();
});

test("calls onSelectDevice when row is clicked", async () => {
  const user = userEvent.setup();

  const { getByText, props } = renderTable();

  await user.click(getByText(mockDevice.name));

  expect(props.onSelectDevice).toHaveBeenCalledWith(mockDevice);
});

test("calls onEditDevice when edit button is clicked", async () => {
  const user = userEvent.setup();

  const { getByTitle, props } = renderTable();

  await user.click(getByTitle("Edit"));

  expect(props.onEditDevice).toHaveBeenCalledWith(mockDevice);
  expect(props.onSelectDevice).not.toHaveBeenCalled();
});

test("calls onRemoveDevice when delete button is clicked", async () => {
  const user = userEvent.setup();

  const { getByTitle, props } = renderTable();

  await user.click(getByTitle("Delete"));

  expect(props.onRemoveDevice).toHaveBeenCalledWith(mockDevice.id);
  expect(props.onSelectDevice).not.toHaveBeenCalled();
});

test("calls name filter change", async () => {
  const user = userEvent.setup();

  const { getByPlaceholderText, props } = renderTable();

  await user.type(getByPlaceholderText("Search name"), "Camera");

  expect(props.onNameFilterChange).toHaveBeenCalled();
});

test("calls IP filter change", async () => {
  const user = userEvent.setup();

  const { getByPlaceholderText, props } = renderTable();

  await user.type(getByPlaceholderText("Search IP"), "192");

  expect(props.onIpFilterChange).toHaveBeenCalled();
});

test("calls type filter change", async () => {
  const user = userEvent.setup();

  const { container, props } = renderTable();

  const typeSelect = container.querySelectorAll("select")[0];

  await user.selectOptions(typeSelect, mockDevice.type);

  expect(props.onTypeFilterChange).toHaveBeenCalled();
});

test("calls status filter change", async () => {
  const user = userEvent.setup();

  const { container, props } = renderTable();

  const statusSelect = container.querySelectorAll("select")[1];

  await user.selectOptions(statusSelect, mockDevice.status);

  expect(props.onStatusFilterChange).toHaveBeenCalled();
});

test("renders offline status class", () => {
  const offlineDevice = {
    ...mockDevice,
    id: 2,
    status: "Offline" as const,
  };

  const { container } = renderTable({
    devices: [offlineDevice],
  });

  expect(
    container.querySelector(".status-dot.offline")
  ).toBeInTheDocument();
});

test("renders maintenance status class", () => {
  const maintenanceDevice = {
    ...mockDevice,
    id: 3,
    status: "Maintenance" as const,
  };

  const { container } = renderTable({
    devices: [maintenanceDevice],
  });

  expect(
    container.querySelector(".status-dot.maintenance")
  ).toBeInTheDocument();
});