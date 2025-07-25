import React, { useEffect, useState } from "react";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import { useNavigate } from "react-router-dom";
import ClassService from "../../service/ClassService";
import SubjectService from "../../service/SubjectService";
import GradeService from "../../service/GradeService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";

import {
  faArrowLeft,
  faEraser,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

function AddClass() {
  const navigate = useNavigate();

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");

  // State to hold the form data
  const [formData, setFormData] = useState({
    className: "",
    description: "",
    classDate: "",
    startTime: "",
    gradeId: "",
    subjectId: "",
  });

  const [formErrors, setFormErrors] = useState({}); // State for holding validation errors
  const [subjects, setSubjects] = useState([]); // State to store available subjects
  const [grades, setGrades] = useState([]); // State to hold fetched Grades
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch subjects and grades when component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Function to fetch subjects and grades
  const fetchData = async () => {
    try {
      const subjectRes = await SubjectService.getAllSubject(token);
      if (subjectRes.code === "00") {
        setSubjects(subjectRes.content);
      } else {
        console.error("Failed to fetch subjects", subjectRes.message);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }

    try {
      const gradeRes = await GradeService.getAllGrades(token);
      if (gradeRes.code === "00") {
        setGrades(gradeRes.content);
      } else {
        console.error("Failed to fetch Grades", gradeRes.message);
      }
    } catch (error) {
      console.error("Error fetching Grades:", error);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Function to Handle back button
  const handleBack = () => {
    navigate("/admin/classList");
  };

  // Function to reset form to initial state
  const handleReset = () => {
    setFormData({
      className: "",
      description: "",
      classDate: "",
      startTime: "",
      gradeId: "",
      subjectId: "",
    });
    setFormErrors({}); // Clear validation errors
  };

  // Function to validate form inputs
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.className.trim()) {
      errors.className = "Class name is required.";
      isValid = false;
    }

    if (!formData.classDate) {
      errors.classDate = "Class date is required.";
      isValid = false;
    }

    if (!formData.startTime) {
      errors.startTime = "Start time is required.";
      isValid = false;
    }

    if (!formData.gradeId) {
      errors.gradeId = "Grade is required.";
      isValid = false;
    }

    if (!formData.subjectId) {
      errors.subjectId = "Subject is required.";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        className: formData.className.trim(),
        description: formData.description?.trim() || null,
        classDate: formData.classDate,
        startTime: formData.startTime,
        gradeId: parseInt(formData.gradeId),
        subjectId: formData.subjectId,
        // subjectId: formData.subjectId ? parseInt(formData.subjectId) : 0,
      };

      console.log("Payload being sent:", payload);

      const response = await ClassService.addClass(payload, token);
      handleSubmissionResponse(response);
    } catch (error) {
      console.error("Error adding Class:", error);
      handleSubmissionError(error);
      toast.error(
        "An error occurred while adding the Class. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle successful/failed responses from backend
  const handleSubmissionResponse = (response) => {
    if (!response || !response.code) {
      toast.error("Invalid response from server. Please try again.");
      return;
    }

    switch (response.code) {
      case "00": // Success
        toast.success("Class added successfully!");
        // navigate("/admin/class");
        handleReset();
        break;

      case "05": // Invalid class data
        toast.error("Please enter valid class data");
        break;

      case "06": // Duplicate class
        toast.error("A class with this name, date, and time already exists.");
        break;

      case "16": // Grade not found
        toast.error(
          "The selected grade was not found. Please choose a valid grade."
        );
        break;

      case "15": // Subject not found (if subject was selected)
        toast.error(
          "The selected subject was not found. Please choose a valid subject."
        );
        break;

      case "10": // General failure
        toast.error("Failed to save class. Please try again.");
        break;

      default:
        console.error(
          "Unexpected response code:",
          response.code,
          response.message
        );
        toast.error(
          response.message || "An unexpected error occurred. Please try again."
        );
        break;
    }
  };

  // Handle network/unexpected errors
  const handleSubmissionError = (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          toast.error(
            data?.message || "Invalid data provided. Please check your input."
          );
          break;
        case 409:
          toast.error(
            data?.message || "Duplicate data detected. Please check your input."
          );
          break;
        case 500:
          toast.error(
            "Server error occurred. Please try again later or contact support."
          );
          break;
        default:
          toast.error(
            data?.message || "An error occurred while adding the class."
          );
          break;
      }
    } else if (error.request) {
      toast.error("Network error. Please check your connection and try again.");
    } else {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
        <Header />
        <main className="grow p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Add New Class
          </h1>
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-lg shadow-lg space-y-6"
          >
            {/* Main Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Class Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class Name *
                </label>
                <input
                  type="text"
                  name="className"
                  id="className"
                  value={formData.className}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.className ? "border-red-500" : ""
                  }`}
                  placeholder="Enter class name"
                />
                {formErrors.className && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.className}
                  </p>
                )}
              </div>

              {/* Grade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade *
                </label>
                <select
                  name="gradeId"
                  id="gradeId"
                  value={formData.gradeId}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.gradeId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Grade</option>
                  {grades.map((grade) => (
                    <option key={grade.id} value={grade.id}>
                      {grade.gradeName}
                    </option>
                  ))}
                </select>
                {formErrors.gradeId && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.gradeId}
                  </p>
                )}
              </div>

              {/* Class Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-calendar-alt mr-1"></i>
                  Class Date *
                </label>
                <input
                  type="date"
                  name="classDate"
                  id="classDate"
                  value={formData.classDate}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.classDate ? "border-red-500" : ""
                  }`}
                />
                {formErrors.classDate && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.classDate}
                  </p>
                )}
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-clock mr-1"></i>
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  id="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.startTime ? "border-red-500" : ""
                  }`}
                />
                {formErrors.startTime && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.startTime}
                  </p>
                )}
              </div>

              {/* Subject */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <select
                  name="subjectId"
                  id="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.subjectId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Subject (Optional)</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.subjectName}
                    </option>
                  ))}
                </select>
                {formErrors.subjectId && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.subjectId}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter class description (optional)"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center mt-6 space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline flex items-center"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {isSubmitting ? "SAVING..." : "SAVE"}
              </button>

              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline flex items-center"
                onClick={handleReset}
              >
                <FontAwesomeIcon icon={faEraser} className="mr-2" />
                RESET
              </button>

              <button
                type="button"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline flex items-center"
                onClick={handleBack}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                BACK
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default AddClass;
