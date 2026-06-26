import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import DeviceModal from "./DeviceModal";
import { mockDevice } from "../../../test/mocks/deviceMock";

afterEach(() => {
  cleanup();
});

test("renders device details in view mode", () => {
  const { getByText } = render(
    <DeviceModal
      mode="view"
      device={mockDevice}
      nextId={2}
      devices={[mockDevice]}
      onAdd={() => {}}
      onSave={() => {}}
      onClose={() => {}}
      onSwitchToEdit={() => {}}
    />
  );

  expect(getByText("Device Details")).toBeInTheDocument();
  expect(getByText(mockDevice.name)).toBeInTheDocument();
  expect(getByText(mockDevice.ipAddress)).toBeInTheDocument();
  expect(getByText(mockDevice.type)).toBeInTheDocument();
});

test("calls onSwitchToEdit when Edit Device is clicked in view mode", async () => {
  const user = userEvent.setup();
  const onSwitchToEdit = vi.fn();

  const { getByRole } = render(
    <DeviceModal
      mode="view"
      device={mockDevice}
      nextId={2}
      devices={[mockDevice]}
      onAdd={() => {}}
      onSave={() => {}}
      onClose={() => {}}
      onSwitchToEdit={onSwitchToEdit}
    />
  );

  await user.click(getByRole("button", { name: /edit device/i }));

  expect(onSwitchToEdit).toHaveBeenCalledTimes(1);
});

test("renders add form in add mode", () => {
  const { getByText, getByRole } = render(
    <DeviceModal
      mode="add"
      device={null}
      nextId={2}
      devices={[mockDevice]}
      onAdd={() => {}}
      onSave={() => {}}
      onClose={() => {}}
      onSwitchToEdit={() => {}}
    />
  );

  expect(getByText("Add New Device")).toBeInTheDocument();
  expect(getByRole("button", { name: /save device/i })).toBeInTheDocument();
});

test("shows required name error in add mode", async () => {
  const user = userEvent.setup();

  const { getByRole, getByText } = render(
    <DeviceModal
      mode="add"
      device={null}
      nextId={2}
      devices={[]}
      onAdd={() => {}}
      onSave={() => {}}
      onClose={() => {}}
      onSwitchToEdit={() => {}}
    />
  );

  await user.click(getByRole("button", { name: /save device/i }));

  expect(getByText("Device name is required.")).toBeInTheDocument();
});

test("shows duplicate name error in add mode", async () => {
  const user = userEvent.setup();

  const { getByRole, getByLabelText, getByText } = render(
    <DeviceModal
      mode="add"
      device={null}
      nextId={2}
      devices={[mockDevice]}
      onAdd={() => {}}
      onSave={() => {}}
      onClose={() => {}}
      onSwitchToEdit={() => {}}
    />
  );

  await user.type(getByLabelText(/name/i), mockDevice.name);
  await user.type(getByLabelText(/ip address/i), "192.168.1.20");

  await user.click(getByRole("button", { name: /save device/i }));

  expect(getByText("A device with the same name.")).toBeInTheDocument();
});

test("shows invalid IP error in add mode", async () => {
  const user = userEvent.setup();

  const { getByRole, getByLabelText, getByText } = render(
    <DeviceModal
      mode="add"
      device={null}
      nextId={2}
      devices={[]}
      onAdd={() => {}}
      onSave={() => {}}
      onClose={() => {}}
      onSwitchToEdit={() => {}}
    />
  );

  await user.type(getByLabelText(/name/i), "New Camera");
  await user.type(getByLabelText(/ip address/i), "bad-ip");

  await user.click(getByRole("button", { name: /save device/i }));

  expect(getByText("Please enter a valid IP address.")).toBeInTheDocument();
});

test("calls onAdd with cleaned device in add mode", async () => {
  const user = userEvent.setup();
  const onAdd = vi.fn();

  const { getByRole, getByLabelText } = render(
    <DeviceModal
      mode="add"
      device={null}
      nextId={2}
      devices={[]}
      onAdd={onAdd}
      onSave={() => {}}
      onClose={() => {}}
      onSwitchToEdit={() => {}}
    />
  );

  await user.type(getByLabelText(/name/i), "New Camera");
  await user.type(getByLabelText(/ip address/i), "192.168.1.20");

  await user.click(getByRole("button", { name: /save device/i }));

  expect(onAdd).toHaveBeenCalledTimes(1);
  expect(onAdd).toHaveBeenCalledWith(
    expect.objectContaining({
      id: 2,
      name: "New Camera",
      ipAddress: "192.168.1.20",
      location: "Unassigned",
      criticality: "Medium",
      purpose: "Grid device monitoring",
    })
  );
});

test("renders edit form in edit mode", () => {
  const { getByText, getByDisplayValue, getByRole } = render(
    <DeviceModal
      mode="edit"
      device={mockDevice}
      nextId={2}
      devices={[mockDevice]}
      onAdd={() => {}}
      onSave={() => {}}
      onClose={() => {}}
      onSwitchToEdit={() => {}}
    />
  );

  expect(getByText("Edit Device")).toBeInTheDocument();
  expect(getByDisplayValue(mockDevice.name)).toBeInTheDocument();
  expect(getByRole("button", { name: /save changes/i })).toBeInTheDocument();
});

test("calls onSave with updated device in edit mode", async () => {
  const user = userEvent.setup();
  const onSave = vi.fn();

  const { getByRole, getByLabelText } = render(
    <DeviceModal
      mode="edit"
      device={mockDevice}
      nextId={2}
      devices={[mockDevice]}
      onAdd={() => {}}
      onSave={onSave}
      onClose={() => {}}
      onSwitchToEdit={() => {}}
    />
  );

  const nameInput = getByLabelText(/name/i);

  await user.clear(nameInput);
  await user.type(nameInput, "Updated Camera");

  await user.click(getByRole("button", { name: /save changes/i }));

  expect(onSave).toHaveBeenCalledTimes(1);
  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      id: mockDevice.id,
      name: "Updated Camera",
      ipAddress: mockDevice.ipAddress,
    })
  );
});

test("calls onClose when cancel is clicked", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();

  const { getByRole } = render(
    <DeviceModal
      mode="add"
      device={null}
      nextId={2}
      devices={[]}
      onAdd={() => {}}
      onSave={() => {}}
      onClose={onClose}
      onSwitchToEdit={() => {}}
    />
  );

  await user.click(getByRole("button", { name: /cancel/i }));

  expect(onClose).toHaveBeenCalledTimes(1);
});

test("returns null when mode is view and device is null", () => {
  const { container } = render(
    <DeviceModal
      mode="view"
      device={null}
      nextId={2}
      devices={[]}
      onAdd={() => {}}
      onSave={() => {}}
      onClose={() => {}}
      onSwitchToEdit={() => {}}
    />
  );

  expect(container.firstChild).toBeNull();
});

test("shows N/A for missing optional values in view mode", () => {
  const deviceWithoutOptionalValues = {
    ...mockDevice,
    location: "",
    criticality: "",
    purpose: "",
  };

  const { getAllByText } = render(
    <DeviceModal
      mode="view"
      device={deviceWithoutOptionalValues}
      nextId={2}
      devices={[deviceWithoutOptionalValues]}
      onAdd={() => {}}
      onSave={() => {}}
      onClose={() => {}}
      onSwitchToEdit={() => {}}
    />
  );

  expect(getAllByText("N/A")).toHaveLength(3);
});

test("shows server error message", () => {
  const { getByText } = render(
    <DeviceModal
      mode="add"
      device={null}
      nextId={2}
      devices={[]}
      serverErrorMessage="Server failed."
      onAdd={() => {}}
      onSave={() => {}}
      onClose={() => {}}
      onSwitchToEdit={() => {}}
    />
  );

  expect(getByText("Server failed.")).toBeInTheDocument();
});

test("calls onClose when overlay is clicked", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();

  const { container } = render(
    <DeviceModal
      mode="add"
      device={null}
      nextId={2}
      devices={[]}
      onAdd={() => {}}
      onSave={() => {}}
      onClose={onClose}
      onSwitchToEdit={() => {}}
    />
  );

  const overlay = container.querySelector(
    ".device-modal-overlay"
  ) as HTMLElement;

  await user.click(overlay);

  expect(onClose).toHaveBeenCalledTimes(1);
});

test("does not close when modal body is clicked", async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();

  const { container } = render(
    <DeviceModal
      mode="add"
      device={null}
      nextId={2}
      devices={[]}
      onAdd={() => {}}
      onSave={() => {}}
      onClose={onClose}
      onSwitchToEdit={() => {}}
    />
  );

  const modal = container.querySelector(
    ".device-modal"
  ) as HTMLElement;

  await user.click(modal);

  expect(onClose).not.toHaveBeenCalled();
});

test("updates type status criticality location and purpose fields", async () => {
  const user = userEvent.setup();
  const onAdd = vi.fn();

  const { getByLabelText, getByRole } = render(
    <DeviceModal
      mode="add"
      device={null}
      nextId={5}
      devices={[]}
      onAdd={onAdd}
      onSave={() => {}}
      onClose={() => {}}
      onSwitchToEdit={() => {}}
    />
  );

  await user.type(getByLabelText(/name/i), "Device Full");
  await user.type(getByLabelText(/ip address/i), "192.168.1.55");
  await user.selectOptions(getByLabelText(/type/i), "Controller");
  await user.selectOptions(getByLabelText(/status/i), "Maintenance");
  await user.type(getByLabelText(/location/i), "Room 1");
  await user.selectOptions(getByLabelText(/criticality/i), "High");
  await user.clear(getByLabelText(/purpose/i));
  await user.type(getByLabelText(/purpose/i), "Testing purpose");

  await user.click(getByRole("button", { name: /save device/i }));

  expect(onAdd).toHaveBeenCalledWith(
    expect.objectContaining({
      id: 5,
      name: "Device Full",
      ipAddress: "192.168.1.55",
      type: "Controller",
      status: "Maintenance",
      location: "Room 1",
      criticality: "High",
      purpose: "Testing purpose",
    })
  );
});