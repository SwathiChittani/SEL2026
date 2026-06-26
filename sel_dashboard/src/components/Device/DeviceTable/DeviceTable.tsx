import { DEVICE_STATUSES, DEVICE_TYPES } from "../../../constants/deviceConstants";
import type { Device, DeviceStatus } from "../../../types/device";
import "./DeviceTable.css";
import { ClipLoader } from "react-spinners";

type Props = {
  devices: Device[];
  selectedDeviceId: number | null;
  loading: boolean;
  error: string;
  nameFilter: string;
  ipFilter: string;
  typeFilter: string;
  statusFilter: string;
  onNameFilterChange: (value: string) => void;
  onIpFilterChange: (value: string) => void;
  onTypeFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSelectDevice: (device: Device) => void;
  onEditDevice: (device: Device) => void;
  onRemoveDevice: (deviceId: number) => void;
};

function DeviceTable({
  devices,
  selectedDeviceId,
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
}: Props) {
  function getStatusClass(status: DeviceStatus) {
    if (status === "Online") return "status-dot online";
    if (status === "Offline") return "status-dot offline";
    return "status-dot maintenance";
  }

  return (
    <section className="table-card">
        {loading && (
          <div className="state-message">
            <ClipLoader
              color="#2f6fff"
              size={45}
            />
            <span>Loading devices...</span>
          </div>
        )}

      {error && (
  <div className="state-message error">

    <div className="error-message-row">
      <span className="error-icon">⚠️</span>

      <span className="error-text">
        {error}
      </span>
    </div>

    <button
      className="retry-button"
      onClick={() => window.location.reload()}
    >
      Please Try Again
    </button>

  </div>
)}
      {!loading && !error && (
        <>
          <table className="device-table table-header">
            <thead>
              <tr>
                <th>
                  <span>Name</span>
                  <input
                    className="column-filter"
                    placeholder="Search name"
                    value={nameFilter}
                    onChange={(event) => onNameFilterChange(event.target.value)}
                  />
                </th>

                <th>
                  <span>IP Address</span>
                  <input
                    className="column-filter"
                    placeholder="Search IP"
                    value={ipFilter}
                    onChange={(event) => onIpFilterChange(event.target.value)}
                  />
                </th>

                <th>
                  <span>Type</span>
                  <select
                    className="column-filter"
                    value={typeFilter}
                    onChange={(event) => onTypeFilterChange(event.target.value)}
                  >
                    <option value="">All Types</option>
                    {DEVICE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </th>

                <th>
                  <span>Status</span>
                  <select
                    className="column-filter"
                    value={statusFilter}
                    onChange={(event) =>
                      onStatusFilterChange(event.target.value)
                    }
                  >
                    <option value="">All Statuses</option>
                    {DEVICE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </th>

                <th>
                  <span>Actions</span>
                </th>
              </tr>
            </thead>
          </table>

          <div className="table-body-scroll">
            <table className="device-table table-body">
              <tbody>
                {devices.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-row">
                      No devices found.
                    </td>
                  </tr>
                )}

                {devices.map((device) => (
                  <tr
                    key={device.id}
                    className={selectedDeviceId === device.id ? "selected" : ""}
                    onClick={() => onSelectDevice(device)}
                  >
                    <td className="device-name">{device.name}</td>
                    <td>{device.ipAddress}</td>
                    <td>{device.type}</td>

                    <td>
                      <div className="status-cell">
                        <span className={getStatusClass(device.status)} />
                        <span>{device.status}</span>
                      </div>
                    </td>

                    <td>
                      <button
                        className="icon-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditDevice(device);
                        }}
                        title="Edit"
                      >
                        ✏️
                      </button>

                      <button
                        className="icon-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onRemoveDevice(device.id);
                        }}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

export default DeviceTable;
