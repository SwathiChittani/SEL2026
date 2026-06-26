import { useEffect, useMemo, useState } from "react";
import {
  getDevices,
  addDevice,
  updateDevice,
  deleteDevice,
  importDevices,
  exportDevices,
} from "../../../api/deviceApi";
import { PAGE_SIZE } from "../../../constants/deviceConstants";
import type { Device } from "../../../types/device";
import DeviceFooter from "../DeviceFooter/DeviceFooter";
import DeviceHeader from "../DeviceHeader/DeviceHeader";
import DeviceTable from "../DeviceTable/DeviceTable";
import DeviceToolbar from "../DeviceToolbar/DeviceToolbar";
import "./DeviceDashboard.css";
import DeviceModal from "../DeviceModal/DeviceModal";
import DeleteConfirmationModal from "../DeviceDelete/DeleteConfirmationModal";

type Props = {
  onLogout: () => void;
};

function DeviceDashboard({ onLogout }: Props) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [ipFilter, setIpFilter] = useState("");

  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalMode, setModalMode] = useState<"view" | "add" | "edit" | null>(null);
  const [modalError, setModalError] = useState("");
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  function wait(milliseconds: number) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  async function loadDevices() {
    try {
      setLoading(true);
      setError("");
      await wait(1000);

      const data = await getDevices();
      setDevices(data);
    } catch {
        setError("Unable to load devices. Authentication or API failed.");
    } finally {
        setLoading(false);
    }
  }

  function closePanels() {
    setSelectedDevice(null);
    setModalMode(null);
    setModalError("");
  }

  async function handleAddDevice(device: Device) {
    try {
      closePanels();
      await addDevice(device);
      await loadDevices();
    } 
    catch (error) {
      setModalMode("add");
        setModalError(
        error instanceof Error ? error.message : "Unable to add device."
      );
    }
  }
  async function handleUpdateDevice(updatedDevice: Device) {
    try {
      closePanels();

      await updateDevice(updatedDevice);

      await loadDevices();
    } 
    catch (error) {
      setSelectedDevice(updatedDevice);
      setModalMode("edit");
      setModalError(
        error instanceof Error ? error.message : "Unable to update device."
      );
    }
  }

  async function handleRemoveDevice(deviceId: number) {
    try {
      await deleteDevice(deviceId);

      await loadDevices();

      closePanels();
    } catch (error) {
      console.error(error);
      alert("Unable to delete device.");
    }
  }

  function clearFilters() {
    setSearchText("");
    setTypeFilter("");
    setStatusFilter("");
    setIpFilter("");
    setPage(1);
    closePanels();
  }

  function handleImportDevices(file: File) {
  const reader = new FileReader();

  reader.onload = async () => {
    try {
      const importedDevices = JSON.parse(reader.result as string);

      if (!Array.isArray(importedDevices)) {
        alert("Invalid file. Expected a JSON array.");
        return;
      }
      await importDevices(importedDevices);
      await loadDevices();
      setPage(1);
      closePanels();
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Invalid JSON file."
      );
    }
  };

  reader.readAsText(file);
}

  async function handleExportDevices() {
    try {
      const blob = await exportDevices();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "devices-export.json";
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Export failed.");
    }
  }

  const filteredDevices = useMemo(() => {
    const searchValue = searchText.trim().toLowerCase();
    const ipValue = ipFilter.trim();

    return devices.filter((device) => {
      const matchesSearch =
        !searchValue ||
        device.name.toLowerCase().includes(searchValue) ||
        device.type.toLowerCase().includes(searchValue) ||
        device.status.toLowerCase().includes(searchValue) ||
        device.location?.toLowerCase().includes(searchValue) ||
        device.purpose?.toLowerCase().includes(searchValue) ||
        device.otherDescription?.toLowerCase().includes(searchValue);

      const matchesType = !typeFilter || device.type === typeFilter;
      const matchesStatus = !statusFilter || device.status === statusFilter;
      const matchesIp = !ipValue || device.ipAddress.includes(ipValue);

      return matchesSearch && matchesType && matchesStatus && matchesIp;
    });
  }, [devices, searchText, typeFilter, statusFilter, ipFilter]);

  const totalPages = Math.ceil(filteredDevices.length / PAGE_SIZE);

  const pagedDevices = filteredDevices.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  const nextDeviceId =
    devices.length === 0
      ? 1
      : Math.max(...devices.map((device) => device.id)) + 1;

  return (
    <section className="dashboard">
      <DeviceHeader
        onAddDevice={() => {
          setSelectedDevice(null);
          setModalMode("add");
          setModalError("");
        }}
        onLogout={onLogout}
      />

      <DeviceToolbar
        searchText={searchText}
        onSearchChange={(value) => {
          setSearchText(value);
          setPage(1);
        }}
        onImport={handleImportDevices}
        onExport={handleExportDevices}
        onClearFilters={clearFilters}
      />

      <DeviceTable
        devices={pagedDevices}
        selectedDeviceId={selectedDevice?.id ?? null}
        loading={loading}
        error={error}
        nameFilter={searchText}
        ipFilter={ipFilter}
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        onNameFilterChange={(value) => {
          setSearchText(value);
          setPage(1);
        }}
        onIpFilterChange={(value) => {
          setIpFilter(value);
          setPage(1);
        }}
        onTypeFilterChange={(value) => {
          setTypeFilter(value);
          setPage(1);
        }}
        onStatusFilterChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        onSelectDevice={(device) => {
          setSelectedDevice(device);
          setModalMode("view");
          setModalError("");
        }}

        onEditDevice={(device) => {
          setSelectedDevice(device);
          setModalMode("edit");
          setModalError("");
        }}
        onRemoveDevice={(deviceId) => {
          const device = devices.find((item) => item.id === deviceId);
          if (device) {
            setDeviceToDelete(device);
          }
        }}
      />

      <DeviceFooter
        page={page}
        pageSize={PAGE_SIZE}
        totalRecords={filteredDevices.length}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {modalMode && (
        <DeviceModal
          mode={modalMode}
          device={selectedDevice}
          nextId={nextDeviceId}
          devices={devices}
          serverErrorMessage={modalError}
          onAdd={handleAddDevice}
          onSave={handleUpdateDevice}
          onClose={closePanels}
          onSwitchToEdit={() => setModalMode("edit")}
        />
      )}

      {deviceToDelete && (
        <DeleteConfirmationModal
          deviceName={deviceToDelete.name}
          onCancel={() => setDeviceToDelete(null)}
          onConfirm={() => {
            handleRemoveDevice(deviceToDelete.id);
            setDeviceToDelete(null);
          }}
        />
      )}
    </section>
  );
}

export default DeviceDashboard;
