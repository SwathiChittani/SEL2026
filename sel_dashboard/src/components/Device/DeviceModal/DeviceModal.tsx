import { useEffect, useState } from "react";
import { DEVICE_STATUSES, DEVICE_TYPES } from "../../../constants/deviceConstants";
import type { Device, DeviceStatus } from "../../../types/device";
import { isRequired, isValidIpAddress } from "../../../utils/validation";
import "./DeviceModal.css";

type ModalMode = "view" | "add" | "edit";

type Props = {
  mode: ModalMode;
  device: Device | null;
  nextId: number;
  devices: Device[];
  serverErrorMessage?: string;
  onAdd: (device: Device) => void;
  onSave: (device: Device) => void;
  onClose: () => void;
  onSwitchToEdit: () => void;
};

const emptyDevice: Device = {
  id: 0,
  name: "",
  ipAddress: "",
  type: "Protection Relay",
  status: "Online",
  location: "",
  criticality: "Medium",
  purpose: "Grid device monitoring",
};

function DeviceModal({
  mode,
  device,
  nextId,
  devices,
  serverErrorMessage = "",
  onAdd,
  onSave,
  onClose,
  onSwitchToEdit,
}: Props) {
  const [formDevice, setFormDevice] = useState<Device>(emptyDevice);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    setFormError("");

    if (mode === "add") {
      setFormDevice({
        ...emptyDevice,
        id: nextId,
      });
      return;
    }

    if (device) {
      setFormDevice(device);
    }
  }, [mode, device, nextId]);

  if (mode !== "add" && !device) {
    return null;
  }

  function updateField<K extends keyof Device>(field: K, value: Device[K]) {
    setFormDevice((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function validateForm() {
    setFormError("");

    const nameValue = formDevice.name.trim();
    const ipValue = formDevice.ipAddress.trim();

    const duplicateDevice = devices.find((item) => {
      const sameName =
        item.name.trim().toLowerCase() === nameValue.toLowerCase();

      const isSameDevice = mode === "edit" && item.id === formDevice.id;
      return !isSameDevice && (sameName);
    });

    if (duplicateDevice) {
      setFormError("A device with the same name.");
      return false;
    }

    if (!isRequired(nameValue)) {
      setFormError("Device name is required.");
      return false;
    }

    if (!isValidIpAddress(ipValue)) {
      setFormError("Please enter a valid IP address.");
      return false;
    }

    return true;
  }

  function handleSubmit() {
    if (!validateForm()) {
      return;
    }

    const cleanedDevice: Device = {
      ...formDevice,
      name: formDevice.name.trim(),
      ipAddress: formDevice.ipAddress.trim(),
      location: formDevice.location?.trim() || "Unassigned",
      criticality: formDevice.criticality || "Medium",
      purpose: formDevice.purpose?.trim() || "Grid device monitoring",
    };

    if (mode === "add") {
      onAdd(cleanedDevice);
      return;
    }

    onSave(cleanedDevice);
  }

  const title =
    mode === "add"
      ? "Add New Device"
      : mode === "edit"
      ? "Edit Device"
      : "Device Details";

  const isReadOnly = mode === "view";

  return (
    <div className="device-modal-overlay" onClick={onClose}>
      <section
        className="device-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="device-modal-header">
          <h2>{title}</h2>

          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        </div>

        {isReadOnly ? (
          <>
            <div className="details-grid">
              <div>
                <label>Name</label>
                <span>{device?.name}</span>
              </div>

              <div>
                <label>IP Address</label>
                <span>{device?.ipAddress}</span>
              </div>

              <div>
                <label>Type</label>
                <span>{device?.type}</span>
              </div>

              <div>
                <label>Status</label>
                <span>{device?.status}</span>
              </div>

              <div>
                <label>Location</label>
                <span>{device?.location || "N/A"}</span>
              </div>

              <div>
                <label>Criticality</label>
                <span>{device?.criticality || "N/A"}</span>
              </div>

              <div className="wide">
                <label>Purpose</label>
                <span>{device?.purpose || "N/A"}</span>
              </div>
            </div>

            <div className="modal-actions">
              <button className="primary-action" onClick={onSwitchToEdit}>
                Edit Device
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="form-grid">
              <label>
                Name
                <input
                  value={formDevice.name}
                  onChange={(event) =>
                    updateField("name", event.target.value)
                  }
                />
              </label>

              <label>
                IP Address
                <input
                  value={formDevice.ipAddress}
                  onChange={(event) =>
                    updateField("ipAddress", event.target.value)
                  }
                />
              </label>

              <label>
                Type
                <select
                  value={formDevice.type}
                  onChange={(event) =>
                    updateField("type", event.target.value)
                  }
                >
                  {DEVICE_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Status
                <select
                  value={formDevice.status}
                  onChange={(event) =>
                    updateField("status", event.target.value as DeviceStatus)
                  }
                >
                  {DEVICE_STATUSES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Location
                <input
                  value={formDevice.location || ""}
                  onChange={(event) =>
                    updateField("location", event.target.value)
                  }
                />
              </label>

              <label>
                Criticality
                <select
                  value={formDevice.criticality || "Medium"}
                  onChange={(event) =>
                    updateField("criticality", event.target.value)
                  }
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </label>

              <label className="wide">
                Purpose
                <input
                  value={formDevice.purpose || ""}
                  onChange={(event) =>
                    updateField("purpose", event.target.value)
                  }
                />
              </label>
            </div>

            {(formError || serverErrorMessage) && (
                <div className="modal-error-message">
                    {formError || serverErrorMessage}
                </div>
            )}

            <div className="modal-actions">
              <button className="primary-action" onClick={handleSubmit}>
                {mode === "add" ? "Save Device" : "Save Changes"}
              </button>

              <button className="secondary-action" onClick={onClose}>
                Cancel
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default DeviceModal;