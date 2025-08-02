import React, { useEffect, useState } from "react";
import Header from "../../partials/Header";
import Sidebar from "../../partials/TeacherSidebar";
import { useNavigate } from "react-router-dom";
import ExamService from "../../service/ExamService";
import ClassService from "../../service/ClassService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";

import {
  faArrowLeft,
  faEraser,
  faSave,
  faCalendarAlt,
  faClock,
  faBell,
} from "@fortawesome/free-solid-svg-icons";

function ExamCreate() {
  const navigate = useNavigate();

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");

  // Retrieve teacherId from local storage
  const id = localStorage.getItem("id");

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
    emailNotification: {
      sendNotification: false,
      emailSubject: "",
      emailMessage: "",
    },
  });

  const [formErrors, setFormErrors] = useState({}); // State for holding validation errors
  const [classes, setClasses] = useState([]); // State to store available subjects
  const [teachers, setTeachers] = useState([]); // State to hold fetched teachers
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch subjects and teachers when component mounts
  useEffect(() => {
    fetchData();
  }, [id]);

  // Function to fetch subjects and teachers
  const fetchData = async () => {
    try {
      const classRes = await ClassService.getClasses(id, token);
      if (classRes.code === "00") {
        setClasses(classRes.content);
      } else {
        console.error("Failed to fetch Class", classRes.message);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }

    // try {
    //   const teacherRes = await TeacherService.getAllTeachers(token);
    //   if (teacherRes.code === "00") {
    //     setTeachers(teacherRes.content);
    //   } else {
    //     console.error("Failed to fetch teachers", teacherRes.message);
    //   }
    // } catch (error) {
    //   console.error("Error fetching teachers:", error);
    // }
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

  // Function to reset form to initial state
  const handleReset = () => {
    setFormData({
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
      proctoringStatus: "disabled",
      emailNotification: {
        sendNotification: false,
        emailSubject: "",
        emailMessage: "",
      },
    });
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

    // if (!formData.teacherId) {
    //   errors.teacherId = "Teacher is required.";
    //   isValid = false;
    // }

    setFormErrors(errors);
    return isValid;
  };

  // handleInputChange for nested email fields
  const handleEmailNotificationChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      emailNotification: {
        ...prev.emailNotification,
        [field]: value,
      },
    }));
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
        teacherId: parseInt(id),
        studentCount: formData.studentCount
          ? parseInt(formData.studentCount)
          : null,
        proctoringStatus: formData.proctoringStatus,

        // Update email notification payload structure
        emailNotification: formData.emailNotification.sendNotification
          ? {
              sendNotification: true,
              emailSubject:
                formData.emailNotification.emailSubject?.trim() || null,
              emailMessage:
                formData.emailNotification.emailMessage?.trim() || null,
            }
          : null,
      };

      const response = await ExamService.scheduleExam(payload, token);
      handleSubmissionResponse(response);
    } catch (error) {
      console.error("Error scheduling exam:", error);
      handleSubmissionError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle successful/failed responses from backend
  const handleSubmissionResponse = (response) => {
    console.log("Success response:", response);

    // Check if response has the expected structure
    if (!response || !response.code) {
      toast.error("Invalid response from server. Please try again.");
      return;
    }

    const { code, message, content } = response;

    switch (code) {
      case "SUCCESS":
        toast.success(message || "Exam scheduled successfully!");

        // Reset form after successful submission
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

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
        <Header />
        <main className="grow p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            <FontAwesomeIcon icon={faCalendarAlt} className="mr-3" />
            Schedule New Exam
          </h1>
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

              {/* Teacher */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher *
                </label>
                <select
                  name="teacherId"
                  id="teacherId"
                  value={formData.teacherId}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.teacherId ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select Teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
                {formErrors.teacherId && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.teacherId}
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

            {/* Email Notification Settings */}
            <div className="col-span-1 md:col-span-2">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
                  <FontAwesomeIcon
                    icon={faBell}
                    className="mr-2 text-blue-600"
                  />
                  Email Notification Settings
                </h3>

                {/* Send Email Notification Toggle */}
                <div className="mb-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="sendNotification"
                      checked={formData.emailNotification.sendNotification}
                      onChange={(e) =>
                        handleEmailNotificationChange(
                          "sendNotification",
                          e.target.checked
                        )
                      }
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Send email notification to all students in the selected
                      class
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    Students will receive an email notification about the new
                    exam
                  </p>
                </div>

                {/* Email Configuration - Only show if notification is enabled */}
                {formData.emailNotification.sendNotification && (
                  <div className="space-y-4">
                    {/* Custom Email Subject */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Subject (Optional)
                      </label>
                      <input
                        type="text"
                        name="emailSubject"
                        value={formData.emailNotification.emailSubject}
                        onChange={(e) =>
                          handleEmailNotificationChange(
                            "emailSubject",
                            e.target.value
                          )
                        }
                        className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="e.g., Important: Midterm Exam Scheduled"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Default: "New Exam Scheduled -{" "}
                        {formData.examName || "[Exam Name]"}"
                      </p>
                    </div>

                    {/* Custom Email Message */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Email Message (Optional)
                      </label>
                      <textarea
                        name="emailMessage"
                        value={formData.emailNotification.emailMessage}
                        onChange={(e) =>
                          handleEmailNotificationChange(
                            "emailMessage",
                            e.target.value
                          )
                        }
                        rows="4"
                        className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="e.g., Please ensure you are well-prepared for this exam. Review chapters 1-5 and practice problems. Good luck!"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This message will be included in addition to the exam
                        details
                      </p>
                    </div>

                    {/* Email Preview */}
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                        📧 Email Preview:
                      </h4>
                      <div className="text-sm text-blue-700">
                        <p>
                          <strong>To:</strong> All students in{" "}
                          {formData.classId
                            ? classes.find((c) => c.id == formData.classId)
                                ?.className || "[Selected Class]"
                            : "[Selected Class]"}
                        </p>
                        <p>
                          <strong>Subject:</strong>{" "}
                          {formData.emailNotification.emailSubject ||
                            `New Exam Scheduled - ${
                              formData.examName || "[Exam Name]"
                            }`}
                        </p>
                        <div className="bg-white p-3 rounded border mt-2 text-gray-700 text-sm">
                          <p>Dear Students,</p>
                          <br />
                          <p>
                            A new exam has been scheduled. Please find the
                            details below:
                          </p>
                          <br />
                          <div className="bg-gray-50 p-2 rounded">
                            <p>
                              <strong>📝 Exam Name:</strong>{" "}
                              {formData.examName || "[Exam Name]"}
                            </p>
                            <p>
                              <strong>📚 Exam Type:</strong>{" "}
                              {formData.examType || "[Exam Type]"}
                            </p>
                            <p>
                              <strong>📅 Date:</strong>{" "}
                              {formData.examDate || "[Date]"}
                            </p>
                            <p>
                              <strong>⏰ Time:</strong>{" "}
                              {formData.startTime || "[Start Time]"} -{" "}
                              {formData.endTime || "[End Time]"}
                            </p>
                            <p>
                              <strong>⏱️ Duration:</strong>{" "}
                              {formData.duration || "[Duration]"} minutes
                            </p>
                            <p>
                              <strong>💯 Maximum Marks:</strong>{" "}
                              {formData.maxMark || "[Max Marks]"}
                            </p>
                            <p>
                              <strong>✅ Pass Marks:</strong>{" "}
                              {formData.passMark || "[Pass Marks]"}
                            </p>
                            {formData.instructions && (
                              <p>
                                <strong>📋 Instructions:</strong>{" "}
                                {formData.instructions}
                              </p>
                            )}
                          </div>
                          <br />
                          {formData.emailNotification.emailMessage && (
                            <>
                              <div className="border-l-4 border-blue-400 pl-3 italic">
                                {formData.emailNotification.emailMessage}
                              </div>
                              <br />
                            </>
                          )}
                          <p>
                            Please log in to your student portal for more
                            details and ensure you are prepared for the exam.
                          </p>
                          <br />
                          <p>
                            Best regards,
                            <br />
                            Your Teacher
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline flex items-center"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {isSubmitting ? "SCHEDULING..." : "SCHEDULE EXAM"}
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

export default ExamCreate;
