import "./DeleteConfirmationModal.css";

type Props = {
  deviceName: string;
  onConfirm: () => void;
  onCancel: () => void;
};

function DeleteConfirmationModal({
  deviceName,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div
      className="delete-modal-overlay"
      onClick={onCancel}
    >
      <div
        className="delete-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <h3>Delete Device</h3>

        <p>
          Are you sure you want to delete
          <strong> {deviceName}</strong>?
        </p>

        <div className="delete-actions">
          <button
            className="confirm-delete-button"
            onClick={onConfirm}
          >
            Yes
          </button>  
          <button
            className="cancel-delete-button"
            onClick={onCancel}
          >
            No
          </button>

        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmationModal;