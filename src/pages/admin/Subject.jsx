import React, { useEffect, useState } from "react";
import axios from "axios";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import { useNavigate } from "react-router-dom";
import SubjectService from "../../service/SubjectService";
import { toast } from "react-toastify";

function Subject() {
  const [subjects, setSubjects] = useState([]); // State to hold the list of subjects
  const [formErrors, setFormErrors] = useState({}); // State for validation errorsS
  const [selectedSubject, setSelectedSubject] = useState(null); // State to hold the selected subject (for editing or deleting)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State to manage the visibility of the Edit modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // State to manage the visibility of the Delete modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State to manage the visibility of the Add modal
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Retrieve token from local storage for authentication

  // State for holding the form data (used when adding a subject)
  const [formData, setFormData] = useState({
    subjectName: "",
    description: "",
  });

  // Handle input change for subject edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch all subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, []);

  // Function to fetch all subjects using SubjectService
  const fetchSubjects = async () => {
    try {
      const response = await SubjectService.getAllSubject(token);
      if (response.code === "00") {
        setSubjects(response.content); // Populate the subjects state with the fetched data
      } else {
        toast.error("Failed to fetch subjects", response.message);
        console.error("Failed to fetch subjects", response.message);
      }
    } catch (error) {
      toast.error("Error fetching subjects");
      console.error("Error fetching subjects:", error);
    }
  };

  // Function to open the Edit modal and set the selected subject
  const handleEdit = (id) => {
    const subjectToEdit = subjects.find((item) => item.id === id);
    setSelectedSubject(subjectToEdit);
    setFormData({
      subjectName: subjectToEdit.subjectName || "",
      description: subjectToEdit.description || "",
    });
    setIsEditModalOpen(true);
  };

  // Function to close any modal (Edit, Delete, Add)
  const closeModal = () => {
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsAddModalOpen(false);
    setSelectedSubject(null);
    setFormData({ subjectName: "", description: "" });
    setFormErrors({}); // Reset errors on modal close
  };

  // Function to validate the form inputs
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    if (!formData.subjectName) {
      errors.subjectName = "Subject name is required.";
      isValid = false;
    }
    setFormErrors(errors);
    return isValid;
  };

  // Function to delete a subject with confirmation
  const deleteSubject = async (subjectId) => {
    try {
      const response = await SubjectService.deleteSubject(subjectId, token);
      if (response.code === "00") {
        toast.success("Subject deleted successfully!");
        fetchSubjects(); // Refresh the list after deletion
        closeModal();
      } else {
        toast.error("Failed to delete subject");
        console.error("Failed to delete subject", response.message);
      }
    } catch (error) {
      toast.error("Error deleting subject");
      console.error("Error deleting subject:", error);
    }
  };

  // Function to handle subject update after confirmation
  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validate before sending the request
    if (!validateForm()) return;

    try {
      const editSubject = {
        id: selectedSubject?.id,
        subjectName: formData.subjectName,
        description: formData.description,
      };

      // Validate before sending the request
      // if (!validateForm()) return;

      const response = await SubjectService.updateSubject(editSubject, token);
      if (response.code === "00") {
        toast.success("Subject updated successfully!");
        fetchSubjects(); // Refresh the list after updating
        closeModal(); // Close the modal after successful update
      } else {
        toast.error("Failed to update subject");
        console.error("Failed to update subject: ", response.message);
      }
    } catch (error) {
      console.error("Error updating subject:", error);
      toast.error(
        "An error occurred while updating the subject. Please try again."
      );
    }
  };

  // Function to handle saving a new subject
  const handleSave = async (e) => {
    e.preventDefault();

    // Validate before sending the request
    if (!validateForm()) return;

    try {
      const newSubject = {
        subjectName: formData.subjectName,
        description: formData.description,
      };
      const response = await SubjectService.addSubject(newSubject, token);
      if (response.code === "00") {
        toast.success("Subject added successfully!");
        fetchSubjects(); // Refresh the list after adding the new subject
        closeModal(); // Close the modal after successful addition
      } else {
        console.error("Failed to add subject: ", response.message);
        toast.error("Failed to add subject");
      }
    } catch (error) {
      console.error("Error adding subject:", error);
      toast.error(
        "An error occurred while adding the subject. Please try again."
      );
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
        <Header />
        <main className="grow p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Subject Management
          </h1>

          {/* Add Subject Button */}
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 mb-6"
            onClick={() => setIsAddModalOpen(true)}
          >
            Add Subject
          </button>

          {/* Table of subjects */}
          <table className="min-w-full bg-white rounded-lg shadow-lg">
            <thead>
              <tr className="bg-gray-200 text-gray-600">
                <th className="w-1/12 px-4 py-3 text-left font-semibold">#</th>
                <th className="w-4/12 px-4 py-3 text-left font-semibold">
                  Subject Name
                </th>
                <th className="w-6/12 px-4 py-3 text-left font-semibold">
                  Description
                </th>
                <th className="w-1/12 px-4 py-3 text-left font-semibold">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((item, index) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-100 transition duration-200"
                >
                  <td className="border px-4 py-3 text-gray-700">
                    {index + 1}
                  </td>
                  <td className="border px-4 py-3 text-gray-800">
                    {item.subjectName}
                  </td>
                  <td className="border px-4 py-3 text-gray-600">
                    {item.description}
                  </td>
                  <td className="border px-4 py-3 flex space-x-2">
                    {/* Edit Button */}
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition duration-150"
                      onClick={() => handleEdit(item.id)}
                    >
                      Edit
                    </button>
                    {/* Delete Button */}
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-150"
                      onClick={() => {
                        setSelectedSubject(item);
                        setIsDeleteModalOpen(true);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Edit Subject Modal */}
          {isEditModalOpen && (
            <div className="fixed z-10 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
                  <h2 className="text-xl font-bold mb-4">Edit Subject</h2>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      name="subjectName"
                      value={formData.subjectName}
                      onChange={handleInputChange}
                      required
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        formErrors.subjectName ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.subjectName && (
                      <p className="text-red-500 text-xs italic">
                        {formErrors.subjectName}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    ></textarea>
                    {formErrors.description && (
                      <p className="text-red-500 text-xs italic">
                        {formErrors.description}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700  mr-2"
                      onClick={handleUpdate}
                    >
                      Update
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Subject Modal */}
          {isAddModalOpen && (
            <div className="fixed z-10 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-lg w-full">
                  <h2 className="text-xl font-bold mb-4">Add Subject</h2>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Subject Name
                    </label>
                    <input
                      type="text"
                      name="subjectName"
                      value={formData.subjectName}
                      onChange={handleInputChange}
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                        formErrors.subjectName ? "border-red-500" : ""
                      }`}
                    />
                    {formErrors.subjectName && (
                      <p className="text-red-500 text-xs italic">
                        {formErrors.subjectName}
                      </p>
                    )}
                  </div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline`}
                    ></textarea>
                    {formErrors.description && (
                      <p className="text-red-500 text-xs italic">
                        {formErrors.description}
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mr-2"
                      onClick={handleSave}
                    >
                      Add
                    </button>
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && (
            <div className="fixed z-10 inset-0 overflow-y-auto">
              <div className="flex items-center justify-center min-h-screen">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                  <h2 className="text-lg font-bold mb-4">Confirm Delete</h2>
                  <p className="mb-4">
                    Are you sure you want to delete the subject "
                    {selectedSubject?.subjectName}"?
                  </p>
                  <div className="flex justify-end">
                    <button
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-2"
                      onClick={() => deleteSubject(selectedSubject.id)}
                    >
                      Yes
                    </button>
                    <button
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 "
                      onClick={closeModal}
                    >
                      No
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Subject;
