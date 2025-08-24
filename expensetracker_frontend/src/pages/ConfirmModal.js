import React from "react";

const ConfirmModal = ({ open, onClose, onConfirm, message }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-center">
        <p className="text-lg mb-4">{message}</p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Yes
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
