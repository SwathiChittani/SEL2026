import "./DeviceFooter.css";

type Props = {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function DeviceFooter({
  page,
  pageSize,
  totalRecords,
  totalPages,
  onPageChange,
}: Props) {
  const start = totalRecords === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalRecords);

  return (
    <footer className="footer-row">
      <span>
        Showing {start}-{end} of {totalRecords} devices
      </span>

      <div className="pagination">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(1)}
        >
          First
        </button>

        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </button>

        <span className="page-number">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </button>

        <button
          disabled={page === totalPages || totalPages === 0}
          onClick={() => onPageChange(totalPages)}
        >
          Last
        </button>
      </div>
      
    </footer>
  );
}

export default DeviceFooter;