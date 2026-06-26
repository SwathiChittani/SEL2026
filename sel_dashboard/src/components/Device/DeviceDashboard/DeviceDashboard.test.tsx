import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeviceDashboard from "./DeviceDashboard";
import { mockDevice } from "../../../test/mocks/deviceMock";
import {
  getDevices,
  addDevice,
  updateDevice,
  deleteDevice,
  importDevices,
  exportDevices,
} from "../../../api/deviceApi";
import type { Device, DeviceStatus } from "../../../types/device";

vi.mock("../../../api/deviceApi", () => ({
  getDevices: vi.fn(),
  addDevice: vi.fn(),
  updateDevice: vi.fn(),
  deleteDevice: vi.fn(),
  importDevices: vi.fn(),
  exportDevices: vi.fn(),
}));

const mockGetDevices = vi.mocked(getDevices);
const mockAddDevice = vi.mocked(addDevice);
const mockUpdateDevice = vi.mocked(updateDevice);
const mockDeleteDevice = vi.mocked(deleteDevice);
const mockImportDevices = vi.mocked(importDevices);
const mockExportDevices = vi.mocked(exportDevices);

const secondDevice: Device = {
  ...mockDevice,
  id: 2,
  name: "Doorbell 01",
  ipAddress: "192.168.1.20",
  type: "Doorbell",
  status: "Offline" as DeviceStatus,
  location: "Building B",
  purpose: "Visitor monitoring",
};

vi.mock("../DeviceHeader/DeviceHeader", () => ({
  default: ({ onAddDevice, onLogout }: any) => (
    <div>
      <button onClick={onAddDevice}>Add Device</button>
      <button onClick={onLogout}>Logout</button>
    </div>
  ),
}));

vi.mock("../DeviceToolbar/DeviceToolbar", () => ({
  default: ({ onImport, onExport, onClearFilters }: any) => (
    <div>
      <button onClick={onClearFilters}>Clear Filters</button>
      <button onClick={onExport}>Export</button>

      <button
        onClick={() =>
          onImport(
            new File(
              [JSON.stringify([{ id: 3, name: "Imported Device" }])],
              "importdevices.json",
              { type: "application/json" }
            )
          )
        }
      >
        Import Valid
      </button>

      <button
        onClick={() =>
          onImport(
            new File([JSON.stringify({ invalid: true })], "bad.json", {
              type: "application/json",
            })
          )
        }
      >
        Import Invalid Array
      </button>

      <button
        onClick={() =>
          onImport(
            new File(["bad json"], "bad.json", {
              type: "application/json",
            })
          )
        }
      >
        Import Bad JSON
      </button>
    </div>
  ),
}));

vi.mock("../DeviceTable/DeviceTable", () => ({
  default: ({
    devices,
    loading,
    error,
    nameFilter,
    ipFilter,
    typeFilter,
    statusFilter,
    onNameFilterChange,
    onIpFilterChange,
    onTypeFilterChange,
    onStatusFilterChange,
    onSelectDevice,
    onEditDevice,
    onRemoveDevice,
  }: any) => {
    if (loading) return <div>Loading devices...</div>;
    if (error) return <div>{error}</div>;

    return (
      <div>
        <input
          aria-label="name-filter"
          value={nameFilter}
          onChange={(e) => onNameFilterChange(e.target.value)}
        />

        <input
          aria-label="ip-filter"
          value={ipFilter}
          onChange={(e) => onIpFilterChange(e.target.value)}
        />

        <input
          aria-label="type-filter"
          value={typeFilter}
          onChange={(e) => onTypeFilterChange(e.target.value)}
        />

        <input
          aria-label="status-filter"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        />

        {devices.map((device: any) => (
          <div key={device.id}>
            <span>{device.name}</span>

            <button onClick={() => onSelectDevice(device)}>
              View {device.name}
            </button>

            <button onClick={() => onEditDevice(device)}>
              Edit {device.name}
            </button>

            <button onClick={() => onRemoveDevice(device.id)}>
              Delete {device.name}
            </button>
          </div>
        ))}

        <button onClick={() => onRemoveDevice(999999)}>
          Delete Unknown
        </button>
      </div>
    );
  },
}));

vi.mock("../DeviceFooter/DeviceFooter", () => ({
  default: ({ page, totalRecords, totalPages, onPageChange }: any) => (
    <div>
      <span>
        Footer Page {page} Records {totalRecords} Pages {totalPages}
      </span>
      <button onClick={() => onPageChange(2)}>Go Page 2</button>
    </div>
  ),
}));

vi.mock("../DeviceModal/DeviceModal", () => ({
  default: ({
    mode,
    device,
    nextId,
    serverErrorMessage,
    onAdd,
    onSave,
    onClose,
    onSwitchToEdit,
  }: any) => (
    <div>
      <span>Modal Mode: {mode}</span>
      <span>Next Id: {nextId}</span>
      {device && <span>{device.name}</span>}
      {serverErrorMessage && <span>{serverErrorMessage}</span>}

      <button onClick={onClose}>Close Modal</button>
      <button onClick={onSwitchToEdit}>Switch To Edit</button>

      <button
        onClick={() =>
          onAdd({
            ...mockDevice,
            id: nextId,
            name: "New Camera",
            ipAddress: "192.168.1.30",
          })
        }
      >
        Mock Add Save
      </button>

      <button
        onClick={() =>
          onSave({
            ...mockDevice,
            name: "Updated Camera",
          })
        }
      >
        Mock Edit Save
      </button>
    </div>
  ),
}));

vi.mock("../DeviceDelete/DeleteConfirmationModal", () => ({
  default: ({ deviceName, onCancel, onConfirm }: any) => (
    <div>
      <span>Delete {deviceName}?</span>
      <button onClick={onConfirm}>Yes</button>
      <button onClick={onCancel}>No</button>
    </div>
  ),
}));

beforeEach(() => {
  localStorage.setItem("token", "fake-token");

  mockGetDevices.mockResolvedValue([mockDevice, secondDevice]);
  mockAddDevice.mockResolvedValue(mockDevice);
  mockUpdateDevice.mockResolvedValue(mockDevice);
  mockDeleteDevice.mockResolvedValue(undefined);
  mockImportDevices.mockResolvedValue([mockDevice, secondDevice]);
  mockExportDevices.mockResolvedValue(
    new Blob(["[]"], { type: "application/json" })
  );

  vi.stubGlobal("alert", vi.fn());

  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:test-url");
  vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});

async function renderAndLoad() {
  render(<DeviceDashboard onLogout={() => {}} />);

  expect(screen.getByText(/loading devices/i)).toBeInTheDocument();

  await waitFor(
    () => {
      expect(screen.getByText(mockDevice.name)).toBeInTheDocument();
    },
    { timeout: 3000 }
  );
}

test("loads and displays devices", async () => {
  await renderAndLoad();

  expect(screen.getByText(secondDevice.name)).toBeInTheDocument();
});

test("shows error when load devices fails", async () => {
  mockGetDevices.mockRejectedValueOnce(new Error("API failed"));

  render(<DeviceDashboard onLogout={() => {}} />);

  await waitFor(
    () => {
      expect(
        screen.getByText("Unable to load devices. Authentication or API failed.")
      ).toBeInTheDocument();
    },
    { timeout: 3000 }
  );
});

test("opens add modal when Add Device is clicked", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.click(screen.getByRole("button", { name: /add device/i }));

  expect(screen.getByText("Modal Mode: add")).toBeInTheDocument();
  expect(screen.getByText("Next Id: 3")).toBeInTheDocument();
});

test("opens view modal when device is selected", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.click(
    screen.getByRole("button", {
      name: new RegExp(`view ${mockDevice.name}`, "i"),
    })
  );

  expect(screen.getByText("Modal Mode: view")).toBeInTheDocument();
});

test("opens edit modal when edit is clicked", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.click(
    screen.getByRole("button", {
      name: new RegExp(`edit ${mockDevice.name}`, "i"),
    })
  );

  expect(screen.getByText("Modal Mode: edit")).toBeInTheDocument();
});

test("switches from view modal to edit modal", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.click(
    screen.getByRole("button", {
      name: new RegExp(`view ${mockDevice.name}`, "i"),
    })
  );

  await user.click(screen.getByRole("button", { name: /switch to edit/i }));

  expect(screen.getByText("Modal Mode: edit")).toBeInTheDocument();
});

test("closes modal", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.click(screen.getByRole("button", { name: /add device/i }));

  expect(screen.getByText("Modal Mode: add")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: /close modal/i }));

  expect(screen.queryByText("Modal Mode: add")).not.toBeInTheDocument();
});

test("adds device successfully", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.click(screen.getByRole("button", { name: /add device/i }));
  await user.click(screen.getByRole("button", { name: /mock add save/i }));

  await waitFor(() => {
    expect(mockAddDevice).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "New Camera",
        ipAddress: "192.168.1.30",
      })
    );
  });
});

test("shows add modal error when add fails", async () => {
  const user = userEvent.setup();

  mockAddDevice.mockRejectedValueOnce(new Error("Add failed"));

  await renderAndLoad();

  await user.click(screen.getByRole("button", { name: /add device/i }));
  await user.click(screen.getByRole("button", { name: /mock add save/i }));

  await waitFor(() => {
    expect(screen.getByText("Add failed")).toBeInTheDocument();
  });
});

test("updates device successfully", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.click(
    screen.getByRole("button", {
      name: new RegExp(`edit ${mockDevice.name}`, "i"),
    })
  );

  await user.click(screen.getByRole("button", { name: /mock edit save/i }));

  await waitFor(() => {
    expect(mockUpdateDevice).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Updated Camera",
      })
    );
  });
});

test("shows edit modal error when update fails", async () => {
  const user = userEvent.setup();

  mockUpdateDevice.mockRejectedValueOnce(new Error("Update failed"));

  await renderAndLoad();

  await user.click(
    screen.getByRole("button", {
      name: new RegExp(`edit ${mockDevice.name}`, "i"),
    })
  );

  await user.click(screen.getByRole("button", { name: /mock edit save/i }));

  await waitFor(() => {
    expect(screen.getByText("Update failed")).toBeInTheDocument();
  });
});

test("opens delete confirmation modal", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.click(
    screen.getByRole("button", {
      name: new RegExp(`delete ${mockDevice.name}`, "i"),
    })
  );

  expect(screen.getByText(`Delete ${mockDevice.name}?`)).toBeInTheDocument();
});

test("cancels delete confirmation modal", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.click(
    screen.getByRole("button", {
      name: new RegExp(`delete ${mockDevice.name}`, "i"),
    })
  );

  await user.click(screen.getByRole("button", { name: /^no$/i }));

  expect(screen.queryByText(`Delete ${mockDevice.name}?`)).not.toBeInTheDocument();
});

test("deletes device successfully", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.click(
    screen.getByRole("button", {
      name: new RegExp(`delete ${mockDevice.name}`, "i"),
    })
  );

  await user.click(screen.getByRole("button", { name: /yes/i }));

  await waitFor(() => {
    expect(mockDeleteDevice).toHaveBeenCalledWith(mockDevice.id);
  });
});

test("alerts when delete fails", async () => {
  const user = userEvent.setup();

  mockDeleteDevice.mockRejectedValueOnce(new Error("Delete failed"));

  await renderAndLoad();

  await user.click(
    screen.getByRole("button", {
      name: new RegExp(`delete ${mockDevice.name}`, "i"),
    })
  );

  await user.click(screen.getByRole("button", { name: /yes/i }));

  await waitFor(() => {
    expect(alert).toHaveBeenCalledWith("Unable to delete device.");
  });
});

test("clear filters resets filters", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.type(screen.getByLabelText("name-filter"), "Camera");
  await user.type(screen.getByLabelText("ip-filter"), "192");
  await user.type(screen.getByLabelText("type-filter"), "Camera");
  await user.type(screen.getByLabelText("status-filter"), "Online");

  await user.click(screen.getByRole("button", { name: /clear filters/i }));

  expect(screen.getByLabelText("name-filter")).toHaveValue("");
  expect(screen.getByLabelText("ip-filter")).toHaveValue("");
  expect(screen.getByLabelText("type-filter")).toHaveValue("");
  expect(screen.getByLabelText("status-filter")).toHaveValue("");
});

test("filters devices by name", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.type(screen.getByLabelText("name-filter"), "Doorbell");

  expect(screen.queryByText(mockDevice.name)).not.toBeInTheDocument();
  expect(screen.getByText(secondDevice.name)).toBeInTheDocument();
});

test("filters devices by IP", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.type(screen.getByLabelText("ip-filter"), "1.20");

  expect(screen.queryByText(mockDevice.name)).not.toBeInTheDocument();
  expect(screen.getByText(secondDevice.name)).toBeInTheDocument();
});

test("filters devices by type", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.type(screen.getByLabelText("type-filter"), "Doorbell");

  expect(screen.queryByText(mockDevice.name)).not.toBeInTheDocument();
  expect(screen.getByText(secondDevice.name)).toBeInTheDocument();
});

test("filters devices by status", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.type(screen.getByLabelText("status-filter"), "Offline");

  expect(screen.queryByText(mockDevice.name)).not.toBeInTheDocument();
  expect(screen.getByText(secondDevice.name)).toBeInTheDocument();
});

test("imports valid devices", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.click(screen.getByRole("button", { name: /import valid/i }));

  await waitFor(() => {
    expect(mockImportDevices).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: 3,
          name: "Imported Device",
        }),
      ])
    );
  });
});

test("exports devices", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.click(screen.getByRole("button", { name: /export/i }));

  await waitFor(() => {
    expect(mockExportDevices).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:test-url");
  });
});

test("calls logout when Logout is clicked", async () => {
  const user = userEvent.setup();
  const onLogout = vi.fn();

  render(<DeviceDashboard onLogout={onLogout} />);

  await user.click(screen.getByRole("button", { name: /logout/i }));

  expect(onLogout).toHaveBeenCalledTimes(1);
});

test("does nothing when delete id does not exist", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.click(
    screen.getByRole("button", {
      name: /delete unknown/i,
    })
  );

  expect(screen.queryByText(`Delete ${mockDevice.name}?`)).not.toBeInTheDocument();
});

test("alerts when import file is not an array", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.click(
    screen.getByRole("button", {
      name: /import invalid array/i,
    })
  );

  await waitFor(() => {
    expect(alert).toHaveBeenCalledWith("Invalid file. Expected a JSON array.");
  });
});

test("alerts when import JSON is invalid", async () => {
  const user = userEvent.setup();

  await renderAndLoad();

  await user.click(
    screen.getByRole("button", {
      name: /import bad json/i,
    })
  );

  await waitFor(() => {
    expect(alert).toHaveBeenCalled();
  });
});