import "./DeviceHeader.css";

type Props = {
  onAddDevice: () => void;
  onLogout: () => void;
};

function DeviceHeader({ onAddDevice, onLogout }: Props) {
  return (
    <header className="top-row">
      <div className="header-left">
        <img src="/sel-logo.png" alt="SEL Logo" className="sel-logo" />
        <h1>IOT Device Management</h1>
      </div>

      <div className="header-actions">
        <button className="primary-button" onClick={onAddDevice}>
          Add Device
        </button>

        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default DeviceHeader;
