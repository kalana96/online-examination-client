import React, { useEffect, useState } from "react";
import Header from "../partials/Header";
import Sidebar from "../partials/TeacherSidebar";
import { useNavigate, useParams } from "react-router-dom";
import ExamService from "../service/ExamService";
import ClassService from "../service/ClassService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";

import {
  faArrowLeft,
  faEraser,
  faSave,
  faCalendarAlt,
  faClock,
  faEdit,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

function ExamEdit() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get exam ID from URL parameters

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");

  // Retrieve teacherId from local storage
  const teacherId = localStorage.getItem("id");
  const examId = id;

  // State to hold the form data
  const [formData, setFormData] = useState({
    examName: "",
    examType: "",
    examDate: "",
    duration: "",
    maxMark: "",
    passMark: "",
    instructions: "",
    startTime: "",
    endTime: "",
    classId: "",
    teacherId: "",
    studentCount: "",
    proctoringStatus: "disabled", // enabled/disabled
  });

  const [originalData, setOriginalData] = useState({}); // Store original data for comparison
  const [formErrors, setFormErrors] = useState({}); // State for holding validation errors
  const [classes, setClasses] = useState([]); // State to store available classes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch exam data, classes when component mounts
  useEffect(() => {
    if (examId) {
      fetchExamData();
      fetchClasses();
    }
  }, [examId]);

  // Function to fetch exam data by ID
  const fetchExamData = async () => {
    setIsLoading(true);
    try {
      const response = await ExamService.getExamById(examId, token);
      if (response.code === "00" && response.content) {
        const examData = response.content;

        // Format the data for the form
        const formattedData = {
          examName: examData.examName || "",
          examType: examData.examType || "",
          examDate: examData.examDate ? examData.examDate.split("T")[0] : "", // Format date for input
          duration: examData.duration ? examData.duration.toString() : "",
          maxMark: examData.maxMark ? examData.maxMark.toString() : "",
          passMark: examData.passMark ? examData.passMark.toString() : "",
          instructions: examData.instructions || "",
          startTime: examData.startTime || "",
          endTime: examData.endTime || "",
          classId: examData.clazz?.id ? examData.clazz.id.toString() : "",
          teacherId: examData.teacher?.id
            ? examData.teacher.id.toString()
            : teacherId,
          studentCount: examData.studentCount
            ? examData.studentCount.toString()
            : "",
          proctoringStatus: examData.proctoringStatus || "disabled",
        };

        setFormData(formattedData);
        setOriginalData(formattedData); // Store original data
      } else {
        toast.error(response.message || "Failed to fetch exam data");
        navigate("/teacher/examList");
      }
    } catch (error) {
      console.error("Error fetching exam data:", error);
      toast.error("Error fetching exam data");
      navigate("/teacher/examList");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch teacher's classes
  const fetchClasses = async () => {
    try {
      const response = await ClassService.getClasses(teacherId, token);
      if (response.code === "00") {
        setClasses(response.content || []);
      } else {
        console.error("Failed to fetch classes", response.message);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
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
    navigate("/teacher/examSchedule");
  };

  // Function to reset form to original state
  const handleReset = () => {
    setFormData({ ...originalData });
    setFormErrors({}); // Clear validation errors
  };

  // Function to validate form inputs
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.examName.trim()) {
      errors.examName = "Exam name is required.";
      isValid = false;
    }

    if (!formData.examType.trim()) {
      errors.examType = "Exam type is required.";
      isValid = false;
    }

    if (!formData.examDate) {
      errors.examDate = "Exam date is required.";
      isValid = false;
    }

    if (!formData.duration) {
      errors.duration = "Duration is required.";
      isValid = false;
    } else if (isNaN(formData.duration) || formData.duration <= 0) {
      errors.duration = "Duration must be a positive number.";
      isValid = false;
    }

    if (!formData.maxMark) {
      errors.maxMark = "Maximum marks is required.";
      isValid = false;
    } else if (isNaN(formData.maxMark) || formData.maxMark <= 0) {
      errors.maxMark = "Maximum marks must be a positive number.";
      isValid = false;
    }

    if (!formData.passMark) {
      errors.passMark = "Pass marks is required.";
      isValid = false;
    } else if (isNaN(formData.passMark) || formData.passMark <= 0) {
      errors.passMark = "Pass marks must be a positive number.";
      isValid = false;
    } else if (parseFloat(formData.passMark) > parseFloat(formData.maxMark)) {
      errors.passMark = "Pass marks cannot exceed maximum marks.";
      isValid = false;
    }

    if (!formData.startTime) {
      errors.startTime = "Start time is required.";
      isValid = false;
    }

    if (!formData.endTime) {
      errors.endTime = "End time is required.";
      isValid = false;
    }

    if (!formData.classId) {
      errors.classId = "Class is required.";
      isValid = false;
    }

    // Validate that start time is before end time
    if (formData.startTime && formData.endTime) {
      const startTime = new Date(`2000-01-01T${formData.startTime}`);
      const endTime = new Date(`2000-01-01T${formData.endTime}`);
      if (startTime >= endTime) {
        errors.endTime = "End time must be after start time.";
        isValid = false;
      }
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
        id: parseInt(examId),
        examName: formData.examName.trim(),
        examType: formData.examType.trim(),
        examDate: formData.examDate,
        duration: parseInt(formData.duration),
        maxMark: parseFloat(formData.maxMark),
        passMark: parseFloat(formData.passMark),
        instructions: formData.instructions?.trim() || null,
        startTime: formData.startTime,
        endTime: formData.endTime,
        classId: parseInt(formData.classId),
        teacherId: parseInt(teacherId),
        studentCount: formData.studentCount
          ? parseInt(formData.studentCount)
          : null,
        proctoringStatus: formData.proctoringStatus,
      };

      // console.log("Payload being sent:", payload);

      const response = await ExamService.updateExam(payload, token);
      handleSubmissionResponse(response);
    } catch (error) {
      console.error("Error updating exam:", error);
      handleSubmissionError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle successful/failed responses from backend
  const handleSubmissionResponse = (response) => {
    console.log("Success response:", response);

    // Check if response has the expected structure
    // if (!response || !response.code) {
    //   toast.error("Invalid response from server. Please try again.");
    //   return;
    // }

    if (response.data) {
      const { code, message, content } = response.data;

      switch (code) {
        case "SUCCESS":
          toast.success(message || "Exam updated successfully!");

          // Reset form after successful updated
          handleReset();

          // Redirect to exams list or dashboard
          if (navigate) {
            setTimeout(() => {
              navigate("/teacher/examSchedule");
            }, 2000);
          }
          break;

        case "INVALID_INPUT":
          toast.error(message || "Invalid input data provided");
          break;

        case "CONFLICT":
          toast.error(message || "Exam is already started");
          break;

        case "PUBLISHED_EXAM_MODIFICATION":
          toast.error(message || "Cannot update exam that has been published");
          break;

        case "DUPLICATE":
          toast.error(
            message ||
              "An exam with this name already exists for the selected class"
          );
          break;

        case "CLASS_NOT_FOUND":
          toast.error(message || "Selected class not found");
          break;

        case "TEACHER_NOT_FOUND":
          toast.error(message || "Teacher not found");
          break;

        case "INVALID_TEACHER_CLASS_ASSOCIATION":
          toast.error(
            message || "You are not authorized to schedule exams for this class"
          );
          break;

        default:
          toast.error(message || "Failed to schedule exam");
          break;
      }
    } else {
      toast.error("Invalid response from server");
    }
  };

  // Handle network/unexpected errors
  const handleSubmissionError = (error) => {
    console.error("Submission error:", error);
    // Handle different types of errors
    if (error.response) {
      // Backend returned an error response
      const { status, data } = error.response;

      switch (status) {
        case 400:
          // Bad Request - Validation errors
          if (data && data.message) {
            toast.error(data.message);
          } else {
            toast.error("Invalid data provided. Please check your inputs.");
          }
          break;

        case 401:
          // Unauthorized
          toast.error("You are not authorized to perform this action");
          if (navigate) {
            navigate("/login");
          }
          break;

        case 403:
          // Forbidden
          toast.error(
            "You don't have permission to schedule exams for this class"
          );
          break;

        case 404:
          // Not Found
          toast.error("Class or teacher not found");
          break;

        case 409:
          // Conflict - Duplicate exam
          toast.error(
            "An exam with this name already exists for the selected class"
          );
          break;

        case 500:
          // Internal Server Error
          toast.error("Server error occurred. Please try again later.");
          break;

        default:
          toast.error(data?.message || "An unexpected error occurred");
          break;
      }
    } else if (error.request) {
      // Network error
      toast.error("Network error. Please check your connection and try again.");
    } else {
      // Other error
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  // Check if form has changes
  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
          <Header />
          <main className="grow p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="text-4xl text-blue-500 animate-spin mb-4"
                />
                <p className="text-gray-600">Loading exam data...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
        <Header />
        <main className="grow p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            <FontAwesomeIcon icon={faEdit} className="mr-3" />
            Edit Exam
          </h1>

          {/* Change indicator */}
          {hasChanges() && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
              <p className="text-sm">
                <strong>Note:</strong> You have unsaved changes. Don't forget to
                save your updates!
              </p>
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-lg shadow-lg space-y-6"
          >
            {/* Main Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Exam Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Name *
                </label>
                <input
                  type="text"
                  name="examName"
                  id="examName"
                  value={formData.examName}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.examName ? "border-red-500" : ""
                  }`}
                  placeholder="Enter exam name"
                />
                {formErrors.examName && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.examName}
                  </p>
                )}
              </div>

              {/* Exam Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Exam Type *
                </label>
                <select
                  name="examType"
                  id="examType"
                  value={formData.examType}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.examType ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Exam Type</option>
                  <option value="Midterm">Midterm</option>
                  <option value="Final">Final</option>
                  <option value="Quiz">Quiz</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Practice">Practice</option>
                </select>
                {formErrors.examType && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.examType}
                  </p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  name="examDate"
                  id="examDate"
                  value={formData.examDate}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.examDate ? "border-red-500" : ""
                  }`}
                />
                {formErrors.examDate && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.examDate}
                  </p>
                )}
              </div>

              {/* Start Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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

              {/* End Time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  id="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.endTime ? "border-red-500" : ""
                  }`}
                />
                {formErrors.endTime && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.endTime}
                  </p>
                )}
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FontAwesomeIcon icon={faClock} className="mr-1" />
                  Duration (minutes) *
                </label>
                <input
                  type="number"
                  name="duration"
                  id="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.duration ? "border-red-500" : ""
                  }`}
                  placeholder="Enter duration in minutes"
                  min="1"
                />
                {formErrors.duration && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.duration}
                  </p>
                )}
              </div>

              {/* Maximum Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Marks *
                </label>
                <input
                  type="number"
                  name="maxMark"
                  id="maxMark"
                  value={formData.maxMark}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.maxMark ? "border-red-500" : ""
                  }`}
                  placeholder="Enter maximum marks"
                  min="1"
                  step="0.5"
                />
                {formErrors.maxMark && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.maxMark}
                  </p>
                )}
              </div>

              {/* Pass Marks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pass Marks *
                </label>
                <input
                  type="number"
                  name="passMark"
                  id="passMark"
                  value={formData.passMark}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.passMark ? "border-red-500" : ""
                  }`}
                  placeholder="Enter pass marks"
                  min="1"
                  step="0.5"
                />
                {formErrors.passMark && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.passMark}
                  </p>
                )}
              </div>

              {/* Class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class *
                </label>
                <select
                  name="classId"
                  id="classId"
                  value={formData.classId}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.classId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.className}
                    </option>
                  ))}
                </select>
                {formErrors.classId && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.classId}
                  </p>
                )}
              </div>

              {/* Student Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expected Student Count
                </label>
                <input
                  type="number"
                  name="studentCount"
                  id="studentCount"
                  value={formData.studentCount}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter expected student count"
                  min="1"
                />
              </div>

              {/* Proctoring Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proctoring Status
                </label>
                <select
                  name="proctoringStatus"
                  id="proctoringStatus"
                  value={formData.proctoringStatus}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="disabled">Disabled</option>
                  <option value="enabled">Enabled</option>
                </select>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Instructions
              </label>
              <textarea
                name="instructions"
                id="instructions"
                value={formData.instructions}
                onChange={handleInputChange}
                rows="4"
                className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter exam instructions (optional)"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center mt-6 space-x-4">
              <button
                type="submit"
                disabled={isSubmitting || !hasChanges()}
                className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline flex items-center"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {isSubmitting ? "UPDATING..." : "UPDATE EXAM"}
              </button>

              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline flex items-center"
                onClick={handleReset}
                disabled={!hasChanges()}
              >
                <FontAwesomeIcon icon={faEraser} className="mr-2" />
                RESET CHANGES
              </button>

              <button
                type="button"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline flex items-center"
                onClick={handleBack}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                BACK TO LIST
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default ExamEdit;
