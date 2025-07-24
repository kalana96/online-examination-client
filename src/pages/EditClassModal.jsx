import React, { useState } from "react";

const EditClassModal = ({ isOpen, onClose, classData, onSave }) => {
  const [className, setClassName] = useState(classData.className);
  const [description, setDescription] = useState(classData.description);

  const handleSave = () => {
    // Call the onSave function passed as a prop, with the updated class details
    const updatedClass = {
      ...classData,
      className,
      description,
    };
    onSave(updatedClass); // Pass the updated class details to the parent component
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Modal Overlay */}
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="bg-white rounded-lg shadow-lg z-10 p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Edit Class</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Class Name</label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded"
          />
        </div>
        <div className="flex justify-end">
          <button
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleSave}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditClassModal;
