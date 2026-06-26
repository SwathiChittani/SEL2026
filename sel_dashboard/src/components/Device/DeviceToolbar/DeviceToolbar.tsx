import "./DeviceToolbar.css";

type Props = {
  searchText: string;
  onSearchChange: (value: string) => void;
  onImport: (file: File) => void;
  onExport: () => void;
  onClearFilters: () => void;
};

function DeviceToolbar({
  onImport,
  onExport,
  onClearFilters,
}: Props) {
  return (
    <section className="toolbar">
      {/* <label>
        Search:{" "}
        <input
          className="search-input"
          value={searchText}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </label> */}

      <label className="text-button">
        Import
        <input
          type="file"
          accept=".json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0];

            if (file) {
              onImport(file);
              event.target.value = "";
            }
          }}
        />
      </label>

      <button className="text-button" onClick={onExport}>
        Export
      </button>

      <button className="text-button" onClick={onClearFilters}>
        Clear Filters
      </button>
    </section>
  );
}

export default DeviceToolbar;