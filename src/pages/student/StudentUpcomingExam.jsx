import React, { useEffect, useState } from "react";
import Header from "../../partials/Header";
import Sidebar from "../../partials/StudentSidebar";
import { useNavigate } from "react-router-dom";
import ExamService from "../../service/ExamService";
import ExamRegistrationService from "../../service/ExamRegistrationService";
import ClassService from "../../service/ClassService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faTimes,
  faEye,
  faCalendarAlt,
  faClock,
  faUsers,
  faSearch,
  faGraduationCap,
  faHourglassHalf,
  faTh,
  faListUl,
  faBookOpen,
  faUserPlus,
  faUserMinus,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faInfoCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function StudentUpcomingExam() {
  // State to hold the list of upcoming exams
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [registrationStatuses, setRegistrationStatuses] = useState({});
  const [processingRegistrations, setProcessingRegistrations] = useState({});

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("list"); // grid or list

  // Registration modal states
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [registrationNotes, setRegistrationNotes] = useState("");

  const navigate = useNavigate();

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");
  const studentId = localStorage.getItem("id");

  // Fetch upcoming exams on component mount
  useEffect(() => {
    fetchUpcomingExams();
  }, [studentId]);

  // Apply filters when exams or filter values change
  useEffect(() => {
    applyFilters();
  }, [exams, searchTerm, sortBy, sortOrder]);

  // Function to fetch upcoming exams for student
  const fetchUpcomingExams = async () => {
    setLoading(true);
    try {
      const response = await ExamService.getUpcomingExamsByStudent(
        studentId,
        token
      );
      if (response.code === "00") {
        const upcomingExams =
          response.content?.filter(
            (exam) => getExamStatus(exam) === "Upcoming"
          ) || [];
        setExams(upcomingExams);

        // Check registration status for each exam
        await checkRegistrationStatuses(upcomingExams);
      } else {
        console.error("Failed to fetch exams", response.message);
        toast.error(response.message || "Failed to fetch exams");
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Error fetching exams");
    } finally {
      setLoading(false);
    }
  };

  // Function to check registration status for all exams
  const checkRegistrationStatuses = async (examList) => {
    const statuses = {};

    for (const exam of examList) {
      try {
        const response =
          await ExamRegistrationService.getExamRegistrationStatus(
            studentId,
            exam.id,
            token
          );

        // Check if response is successful and has data
        if (response && response.ok) {
          const data = await response.json();

          if (data.code === "SUCCESS" && data.content) {
            statuses[exam.id] = {
              isRegistered: true,
              status: data.content.status,
              registrationData: data.content,
            };
          } else {
            statuses[exam.id] = {
              isRegistered: false,
              status: null,
              registrationData: null,
            };
          }
        } else if (response && response.status === 404) {
          // 404 means not registered
          statuses[exam.id] = {
            isRegistered: false,
            status: null,
            registrationData: null,
          };
        } else {
          // Handle other error cases
          console.error(
            `Error checking registration for exam ${exam.id}:`,
            response?.status
          );
          statuses[exam.id] = {
            isRegistered: false,
            status: null,
            registrationData: null,
          };
        }
      } catch (error) {
        console.error(
          `Error checking registration for exam ${exam.id}:`,
          error
        );
        statuses[exam.id] = {
          isRegistered: false,
          status: null,
          registrationData: null,
        };
      }
    }

    setRegistrationStatuses(statuses);
  };

  // Function to handle exam registration
  const handleRegister = async (exam) => {
    setSelectedExam(exam);
    setShowRegistrationModal(true);
  };

  // Function to confirm registration
  const confirmRegistration = async () => {
    if (!selectedExam) return;

    setProcessingRegistrations((prev) => ({
      ...prev,
      [selectedExam.id]: true,
    }));

    try {
      const response = await ExamRegistrationService.registerForExam(
        studentId,
        selectedExam.id,
        token,
        registrationNotes.trim() || null
      );

      // Check if the response has the expected structure from ResponseBuilder
      if (response && response.success && response.code === "SUCCESS") {
        toast.success(response.message || "Successfully registered for exam!");

        // Update registration status with the returned data
        setRegistrationStatuses((prev) => ({
          ...prev,
          [selectedExam.id]: {
            isRegistered: true,
            status: response.content?.status || "APPROVED", // Default to APPROVED based on backend logic
            registrationData: response.content,
          },
        }));

        // Close modal and reset form
        setShowRegistrationModal(false);
        setSelectedExam(null);
        setRegistrationNotes("");
      } else {
        // Handle error response from backend
        const errorMessage = response?.message || "Failed to register for exam";
        console.error("Registration failed:", errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error("Error registering for exam:", error);

      // Extract error message from the error object
      let errorMessage = "Error registering for exam";

      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast.error(errorMessage);
    } finally {
      setProcessingRegistrations((prev) => ({
        ...prev,
        [selectedExam.id]: false,
      }));
    }
  };

  // Function to handle exam cancellation
  const handleCancelRegistration = async (exam) => {
    if (
      !window.confirm(
        "Are you sure you want to cancel your registration for this exam?"
      )
    ) {
      return;
    }

    setProcessingRegistrations((prev) => ({
      ...prev,
      [exam.id]: true,
    }));

    try {
      const response = await ExamRegistrationService.cancelExamRegistration(
        studentId,
        exam.id,
        token
      );

      if (response.code === "00") {
        toast.success("Registration cancelled successfully!");

        // Update registration status
        setRegistrationStatuses((prev) => ({
          ...prev,
          [exam.id]: {
            isRegistered: false,
            status: null,
            registrationData: null,
          },
        }));
      } else {
        toast.error(response.message || "Failed to cancel registration");
      }
    } catch (error) {
      console.error("Error cancelling registration:", error);
      toast.error(error.message || "Error cancelling registration");
    } finally {
      setProcessingRegistrations((prev) => ({
        ...prev,
        [exam.id]: false,
      }));
    }
  };

  // Function to determine exam status based on date and time
  const getExamStatus = (exam) => {
    if (!exam.examDate || !exam.startTime) return "Unknown";

    try {
      const now = new Date();
      const examDate = new Date(exam.examDate);
      const [startHours, startMinutes] = exam.startTime.split(":").map(Number);
      const examStartDateTime = new Date(examDate);
      examStartDateTime.setHours(startHours, startMinutes, 0, 0);
      const examEndDateTime = new Date(
        examStartDateTime.getTime() + (exam.duration || 0) * 60000
      );

      if (now < examStartDateTime) {
        return "Upcoming";
      } else if (now >= examStartDateTime && now < examEndDateTime) {
        return "Ongoing";
      } else if (now >= examEndDateTime) {
        return "Completed";
      } else {
        return "Expired";
      }
    } catch (error) {
      console.error("Error calculating exam status:", error);
      return "Unknown";
    }
  };

  // Function to get registration status display
  const getRegistrationStatusDisplay = (examId) => {
    const regStatus = registrationStatuses[examId];
    if (!regStatus) return null;

    if (!regStatus.isRegistered) {
      return {
        text: "Not Registered",
        color: "bg-gray-100 text-gray-800",
        icon: faTimesCircle,
      };
    }

    switch (regStatus.status) {
      case "APPROVED":
        return {
          text: "Registered",
          color: "bg-green-100 text-green-800",
          icon: faCheckCircle,
        };
      case "PENDING":
        return {
          text: "Pending Approval",
          color: "bg-yellow-100 text-yellow-800",
          icon: faInfoCircle,
        };
      case "REJECTED":
        return {
          text: "Rejected",
          color: "bg-red-100 text-red-800",
          icon: faTimesCircle,
        };
      case "CANCELLED":
        return {
          text: "Cancelled",
          color: "bg-gray-100 text-gray-800",
          icon: faTimesCircle,
        };
      default:
        return {
          text: "Unknown",
          color: "bg-gray-100 text-gray-800",
          icon: faInfoCircle,
        };
    }
  };

  // Function to apply filters and sorting
  const applyFilters = () => {
    let filtered = [...exams];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (exam) =>
          exam.examName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.examType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exam.clazz?.className.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.examName.toLowerCase();
          bValue = b.examName.toLowerCase();
          break;
        case "date":
          aValue = new Date(a.examDate);
          bValue = new Date(b.examDate);
          break;
        case "class":
          aValue = a.clazz?.className.toLowerCase() || "";
          bValue = b.clazz?.className.toLowerCase() || "";
          break;
        default:
          aValue = new Date(a.examDate);
          bValue = new Date(b.examDate);
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredExams(filtered);
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm("");
  };

  // Function to handle viewing exam details
  const handleView = (id) => {
    navigate(`/student/examDetails/${id}`);
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  // Function to format time
  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      const [hours, minutes] = timeString.split(":").map(Number);
      const time = new Date();
      time.setHours(hours, minutes, 0, 0);
      return time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  // Function to get exam type color
  const getExamTypeColor = (type) => {
    const colors = {
      Quiz: "bg-purple-100 text-purple-800",
      Test: "bg-orange-100 text-orange-800",
      Final: "bg-red-100 text-red-800",
      Midterm: "bg-indigo-100 text-indigo-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  // Function to calculate days until exam
  const getDaysUntilExam = (examDate, startTime) => {
    if (!examDate || !startTime) return null;

    try {
      const now = new Date();
      const examDateTime = new Date(examDate);
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      examDateTime.setHours(startHours, startMinutes, 0, 0);

      const diffTime = examDateTime - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    } catch (error) {
      console.error("Error calculating days until exam:", error);
      return null;
    }
  };

  // Render exam card
  const ExamCard = ({ exam, index }) => {
    const daysUntil = getDaysUntilExam(exam.examDate, exam.startTime);
    const regStatus = getRegistrationStatusDisplay(exam.id);
    const isProcessing = processingRegistrations[exam.id];

    return (
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white bg-opacity-20 rounded-full p-2">
                <FontAwesomeIcon
                  icon={faGraduationCap}
                  className="text-white text-lg"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white truncate">
                  {exam.examName}
                </h3>
                <p className="text-blue-100 text-sm">
                  {exam.clazz?.className || "N/A"}
                </p>
              </div>
            </div>
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full border border-yellow-200">
              <FontAwesomeIcon
                icon={faHourglassHalf}
                className="mr-1 text-yellow-600"
              />
              <span className="text-xs font-medium">
                {daysUntil !== null
                  ? daysUntil === 0
                    ? "Today"
                    : daysUntil === 1
                    ? "Tomorrow"
                    : `${daysUntil} days`
                  : "Upcoming"}
              </span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
          {/* Registration Status */}
          {regStatus && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Registration Status</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${regStatus.color} flex items-center space-x-1`}
              >
                <FontAwesomeIcon icon={regStatus.icon} />
                <span>{regStatus.text}</span>
              </span>
            </div>
          )}

          {/* Exam Type */}
          {exam.examType && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Exam Type</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${getExamTypeColor(
                  exam.examType
                )}`}
              >
                {exam.examType}
              </span>
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="text-blue-500 text-sm"
              />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(exam.examDate)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon
                icon={faClock}
                className="text-green-500 text-sm"
              />
              <div>
                <p className="text-xs text-gray-500">Time</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatTime(exam.startTime)}
                </p>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Duration</span>
            <span className="text-sm font-medium text-gray-800">
              {exam.duration ? `${exam.duration} min` : "N/A"}
            </span>
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <FontAwesomeIcon
                icon={faBookOpen}
                className="text-gray-400 text-sm"
              />
              <span className="text-xs text-gray-500">#{index + 1}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
                onClick={() => handleView(exam.id)}
              >
                <FontAwesomeIcon icon={faEye} />
                <span className="text-sm">View</span>
              </button>

              {/* Registration Button */}
              {regStatus && !regStatus.isRegistered && (
                <button
                  className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                  onClick={() => handleRegister(exam)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faUserPlus} />
                  )}
                  <span className="text-sm">Register</span>
                </button>
              )}

              {/* Cancel Registration Button */}
              {regStatus &&
                regStatus.isRegistered &&
                regStatus.status !== "CANCELLED" && (
                  <button
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                    onClick={() => handleCancelRegistration(exam)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="animate-spin"
                      />
                    ) : (
                      <FontAwesomeIcon icon={faUserMinus} />
                    )}
                    <span className="text-sm">Cancel</span>
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render list view
  const ExamListItem = ({ exam, index }) => {
    const daysUntil = getDaysUntilExam(exam.examDate, exam.startTime);
    const regStatus = getRegistrationStatusDisplay(exam.id);
    const isProcessing = processingRegistrations[exam.id];

    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">#{index + 1}</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-800 truncate">
                  {exam.examName}
                </h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getExamTypeColor(
                    exam.examType
                  )}`}
                >
                  {exam.examType}
                </span>
                <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full border border-yellow-200">
                  <FontAwesomeIcon
                    icon={faHourglassHalf}
                    className="mr-1 text-yellow-600"
                  />
                  <span className="text-xs font-medium">
                    {daysUntil !== null
                      ? daysUntil === 0
                        ? "Today"
                        : daysUntil === 1
                        ? "Tomorrow"
                        : `${daysUntil} days`
                      : "Upcoming"}
                  </span>
                </div>
                {regStatus && (
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${regStatus.color} flex items-center space-x-1`}
                  >
                    <FontAwesomeIcon icon={regStatus.icon} />
                    <span>{regStatus.text}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faGraduationCap} />
                  <span>{exam.clazz?.className || "N/A"}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  <span>{formatDate(exam.examDate)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faClock} />
                  <span>{formatTime(exam.startTime)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faHourglassHalf} />
                  <span>{exam.duration ? `${exam.duration} min` : "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
              onClick={() => handleView(exam.id)}
            >
              <FontAwesomeIcon icon={faEye} />
              <span className="text-sm">View Details</span>
            </button>

            {/* Registration Button */}
            {regStatus && !regStatus.isRegistered && (
              <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                onClick={() => handleRegister(exam)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                ) : (
                  <FontAwesomeIcon icon={faUserPlus} />
                )}
                <span className="text-sm">Register</span>
              </button>
            )}

            {/* Cancel Registration Button */}
            {regStatus &&
              regStatus.isRegistered &&
              regStatus.status !== "CANCELLED" && (
                <button
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                  onClick={() => handleCancelRegistration(exam)}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin"
                    />
                  ) : (
                    <FontAwesomeIcon icon={faUserMinus} />
                  )}
                  <span className="text-sm">Cancel Registration</span>
                </button>
              )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
        <Header />
        <main className="grow p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Upcoming Exams
                </h1>
                <p className="text-gray-600">
                  Prepare for your scheduled examinations and manage
                  registrations
                </p>
              </div>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search exams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center space-x-2">
                {/* Sort */}
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split("-");
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="date-asc">Earliest First</option>
                  <option value="date-desc">Latest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="class-asc">Class A-Z</option>
                </select>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    className={`px-3 py-1 rounded transition-colors duration-200 ${
                      viewMode === "grid"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => setViewMode("grid")}
                  >
                    <FontAwesomeIcon icon={faTh} />
                  </button>
                  <button
                    className={`px-3 py-1 rounded transition-colors duration-200 ${
                      viewMode === "list"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                    onClick={() => setViewMode("list")}
                  >
                    <FontAwesomeIcon icon={faListUl} />
                  </button>
                </div>

                {/* Clear Filters */}
                {searchTerm && (
                  <button
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors duration-200"
                    onClick={clearFilters}
                  >
                    <FontAwesomeIcon icon={faTimes} className="mr-2" />
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredExams.length} of {exams.length} upcoming exams
              {searchTerm && (
                <span className="font-medium"> for "{searchTerm}"</span>
              )}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="text-4xl text-blue-500 animate-spin"
                />
                <p className="text-gray-600">Loading upcoming exams...</p>
              </div>
            </div>
          )}

          {/* No Exams State */}
          {!loading && filteredExams.length === 0 && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-6xl text-yellow-500 mb-4"
              />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {searchTerm ? "No matching exams found" : "No upcoming exams"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms or clearing filters"
                  : "There are no upcoming exams scheduled at the moment"}
              </p>
              {searchTerm && (
                <button
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  onClick={clearFilters}
                >
                  Clear Search
                </button>
              )}
            </div>
          )}

          {/* Exams Display */}
          {!loading && filteredExams.length > 0 && (
            <div className="space-y-6">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredExams.map((exam, index) => (
                    <ExamCard key={exam.id} exam={exam} index={index} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredExams.map((exam, index) => (
                    <ExamListItem key={exam.id} exam={exam} index={index} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Registration Modal */}
          {showRegistrationModal && selectedExam && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 rounded-t-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">
                      Register for Exam
                    </h3>
                    <button
                      className="text-white hover:text-gray-200 transition-colors duration-200"
                      onClick={() => {
                        setShowRegistrationModal(false);
                        setSelectedExam(null);
                        setRegistrationNotes("");
                      }}
                    >
                      <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                  {/* Exam Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {selectedExam.examName}
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Class:</span>
                        <p className="font-medium">
                          {selectedExam.clazz?.className || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <p className="font-medium">
                          {selectedExam.examType || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <p className="font-medium">
                          {formatDate(selectedExam.examDate)}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Time:</span>
                        <p className="font-medium">
                          {formatTime(selectedExam.startTime)}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Duration:</span>
                        <p className="font-medium">
                          {selectedExam.duration
                            ? `${selectedExam.duration} minutes`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Registration Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={registrationNotes}
                      onChange={(e) => setRegistrationNotes(e.target.value)}
                      placeholder="Add any additional notes for your registration..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {registrationNotes.length}/500 characters
                    </p>
                  </div>

                  {/* Warning Message */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        className="text-yellow-600 mt-0.5"
                      />
                      <div>
                        <h5 className="font-medium text-yellow-800">
                          Registration Notice
                        </h5>
                        <p className="text-sm text-yellow-700">
                          Please ensure you are available on the exam date and
                          time. Registration may require approval from the
                          instructor.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-gray-50 rounded-b-lg flex items-center justify-end space-x-3">
                  <button
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => {
                      setShowRegistrationModal(false);
                      setSelectedExam(null);
                      setRegistrationNotes("");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                    onClick={confirmRegistration}
                    disabled={processingRegistrations[selectedExam.id]}
                  >
                    {processingRegistrations[selectedExam.id] ? (
                      <>
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="animate-spin"
                        />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon icon={faUserPlus} />
                        <span>Confirm Registration</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default StudentUpcomingExam;
