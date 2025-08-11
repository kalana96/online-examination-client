import React, { useEffect, useState } from "react";
import Header from "../../partials/Header";
import Sidebar from "../../partials/StudentSidebar";
import { useNavigate } from "react-router-dom";
import ExamService from "../../service/ExamService";
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
  faSpinner,
  faInfoCircle,
  faExclamationTriangle,
  faPlay,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function StudentTodayExam() {
  // State to hold the list of today's exams
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [navigating, setNavigating] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("startTime");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("list"); // grid or list
  const [statusFilter, setStatusFilter] = useState("all"); // all, upcoming, ongoing, completed

  const [submissionStatus, setSubmissionStatus] = useState({}); // Track submission status for each exam

  const navigate = useNavigate();

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");
  const studentId = localStorage.getItem("id");

  // Fetch today's exams on component mount
  useEffect(() => {
    fetchTodayExams();
  }, [studentId]);

  // Apply filters when exams or filter values change
  useEffect(() => {
    applyFilters();
  }, [exams, searchTerm, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    // Check submission status for all exams when exams are loaded
    if (exams.length > 0 && studentId) {
      checkSubmissionStatusForAllExams();
    }
  }, [exams, studentId]);

  // Check submission status for all exams
  const checkSubmissionStatusForAllExams = async () => {
    const statusChecks = exams.map(async (exam) => {
      try {
        const response = await ExamService.hasStudentSubmittedExam(
          studentId,
          exam.id,
          token
        );
        return {
          examId: exam.id,
          hasSubmitted: response.code === "00" ? response.content : false,
        };
      } catch (error) {
        console.error(
          `Error checking submission status for exam ${exam.id}:`,
          error
        );
        return {
          examId: exam.id,
          hasSubmitted: false,
        };
      }
    });

    try {
      const results = await Promise.all(statusChecks);
      const statusMap = {};
      results.forEach((result) => {
        statusMap[result.examId] = result.hasSubmitted;
      });
      setSubmissionStatus(statusMap);
    } catch (error) {
      console.error("Error checking submission status:", error);
    }
  };

  // Function to fetch today's exams for student
  const fetchTodayExams = async () => {
    setLoading(true);
    try {
      const response = await ExamService.getTodayExamsByStudent(
        studentId,
        token
      );
      if (response.code === "00") {
        // Filter for today's exams only
        const today = new Date();
        const todayExams =
          response.content?.filter((exam) => {
            if (!exam.examDate) return false;
            const examDate = new Date(exam.examDate);
            return examDate.toDateString() === today.toDateString();
          }) || [];

        setExams(todayExams);
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

  // Function to determine exam status based on date and time
  const getExamStatus = (exam) => {
    if (!exam.examDate || !exam.startTime) return "Unknown";

    // Check if already submitted
    if (submissionStatus[exam.id] === true) {
      return "Submitted";
    }

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

  // Function to get status display info
  const getStatusDisplay = (exam) => {
    const status = getExamStatus(exam);

    switch (status) {
      case "Upcoming":
        return {
          text: "Upcoming",
          color: "bg-blue-100 text-blue-800",
          icon: faHourglassHalf,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      case "Ongoing":
        return {
          text: "Ongoing",
          color: "bg-green-100 text-green-800",
          icon: faPlay,
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "Completed":
        return {
          text: "Completed",
          color: "bg-gray-100 text-gray-800",
          icon: faCheckCircle,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
      case "Submitted":
        return {
          text: "Submitted",
          color: "bg-purple-100 text-purple-800",
          icon: faCheckCircle,
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
        };
      default:
        return {
          text: "Unknown",
          color: "bg-gray-100 text-gray-800",
          icon: faInfoCircle,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
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

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((exam) => {
        const status = getExamStatus(exam).toLowerCase();
        return status === statusFilter;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.examName.toLowerCase();
          bValue = b.examName.toLowerCase();
          break;
        case "startTime":
          aValue = a.startTime || "";
          bValue = b.startTime || "";
          break;
        case "class":
          aValue = a.clazz?.className.toLowerCase() || "";
          bValue = b.clazz?.className.toLowerCase() || "";
          break;
        case "status":
          aValue = getExamStatus(a);
          bValue = getExamStatus(b);
          break;
        default:
          aValue = a.startTime || "";
          bValue = b.startTime || "";
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
    setStatusFilter("all");
  };

  const handleView = (id) => {
    try {
      // Add loading state if needed
      navigate(`/student/examDetails/${id}`);
    } catch (error) {
      console.error("Navigation error:", error);
      toast.error("Failed to navigate to exam details");
    }
  };

  // Function to handle viewing with confirmation for submitted exams
  const handleViewWithStatus = (exam) => {
    const status = getExamStatus(exam);
    const hasSubmitted = submissionStatus[exam.id];

    if (hasSubmitted) {
      // Show confirmation for submitted exams
      const confirmView = window.confirm(
        "You have already submitted this exam. Do you want to view your results?"
      );

      if (confirmView) {
        navigate(`/student/examResults/${exam.id}`);
      }
    } else {
      // Navigate to regular exam details
      navigate(`/student/examDetails/${exam.id}`);
    }
  };

  // Function to handle taking exam
  const handleTakeExam = (exam) => {
    const status = getExamStatus(exam);

    // Check if exam is already submitted
    if (submissionStatus[exam.id] === true) {
      toast.info("You have already submitted this exam");
      return;
    }

    if (status === "Ongoing") {
      // Navigate to exam taking page
      const id = exam.id;
      navigate(`/student/enrollExam/${id}`);
    } else if (status === "Upcoming") {
      toast.warning("Exam has not started yet");
    } else if (status === "Completed") {
      toast.info("This exam has already ended");
    } else if (status === "Submitted") {
      toast.info("You have already submitted this exam");
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

  // Function to get time until exam starts
  const getTimeUntilExam = (exam) => {
    if (!exam.examDate || !exam.startTime) return null;

    try {
      const now = new Date();
      const examDate = new Date(exam.examDate);
      const [startHours, startMinutes] = exam.startTime.split(":").map(Number);
      const examStartDateTime = new Date(examDate);
      examStartDateTime.setHours(startHours, startMinutes, 0, 0);

      const diffTime = examStartDateTime - now;

      if (diffTime <= 0) return null;

      const hours = Math.floor(diffTime / (1000 * 60 * 60));
      const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    } catch (error) {
      console.error("Error calculating time until exam:", error);
      return null;
    }
  };

  // Render exam card
  const ExamCard = ({ exam, index }) => {
    const statusInfo = getStatusDisplay(exam);
    const timeUntil = getTimeUntilExam(exam);
    const examStatus = getExamStatus(exam);

    return (
      <div
        className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border ${statusInfo.borderColor} overflow-hidden`}
      >
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
            <div
              className={`px-3 py-1 rounded-full border ${statusInfo.color}`}
            >
              <FontAwesomeIcon icon={statusInfo.icon} className="mr-1" />
              <span className="text-xs font-medium">{statusInfo.text}</span>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6 space-y-4">
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

          {/* Time and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon
                icon={faClock}
                className="text-blue-500 text-sm"
              />
              <div>
                <p className="text-xs text-gray-500">Start Time</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatTime(exam.startTime)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon
                icon={faHourglassHalf}
                className="text-green-500 text-sm"
              />
              <div>
                <p className="text-xs text-gray-500">Duration</p>
                <p className="text-sm font-medium text-gray-800">
                  {exam.duration ? `${exam.duration} min` : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Time Until Exam */}
          {timeUntil && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Starts in</span>
              <span className="text-sm font-medium text-orange-600">
                {timeUntil}
              </span>
            </div>
          )}
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
                className={`px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2 ${
                  navigating ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={() => handleView(exam.id)}
                disabled={navigating}
              >
                <FontAwesomeIcon
                  icon={navigating ? faSpinner : faEye}
                  className={navigating ? "animate-spin" : ""}
                />
                <span className="text-sm">
                  {navigating ? "Loading..." : "View"}
                </span>
              </button>

              {/* "View Results" button for submitted exams */}
              {submissionStatus[exam.id] === true && (
                <button
                  className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center space-x-2"
                  onClick={() => handleView(exam.id)}
                >
                  <FontAwesomeIcon icon={faCheckCircle} />
                  <span className="text-sm">View Results</span>
                </button>
              )}

              {/* Take Exam Button */}
              {examStatus === "Ongoing" &&
                submissionStatus[exam.id] !== true && (
                  <button
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
                    onClick={() => handleTakeExam(exam)}
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    <span className="text-sm">Take Exam</span>
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
    const statusInfo = getStatusDisplay(exam);
    const timeUntil = getTimeUntilExam(exam);
    const examStatus = getExamStatus(exam);

    return (
      <div
        className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border ${statusInfo.borderColor} p-4 mb-4`}
      >
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
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} flex items-center space-x-1`}
                >
                  <FontAwesomeIcon icon={statusInfo.icon} />
                  <span>{statusInfo.text}</span>
                </span>
                {timeUntil && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Starts in {timeUntil}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <FontAwesomeIcon icon={faGraduationCap} />
                  <span>{exam.clazz?.className || "N/A"}</span>
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
              className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2 ${
                navigating ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => handleView(exam.id)}
              disabled={navigating}
            >
              <FontAwesomeIcon
                icon={navigating ? faSpinner : faEye}
                className={navigating ? "animate-spin" : ""}
              />
              <span className="text-sm">
                {navigating ? "Loading..." : "View Details"}
              </span>
            </button>

            {/* behavior based on submission status */}
            {/* {submissionStatus[exam.id] === true ? (
              <button
                className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center space-x-2"
                onClick={() => navigate(`/student/examResults/${exam.id}`)}
              >
                <FontAwesomeIcon icon={faCheckCircle} />
                <span className="text-sm">View Results</span>
              </button>
            ) : (
              <button
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2"
                onClick={() => handleView(exam)}
              >
                <FontAwesomeIcon icon={faEye} />
                <span className="text-sm">View Details</span>
              </button>
            )} */}

            {/* "View Results" button for submitted exams */}
            {submissionStatus[exam.id] === true && (
              <button
                className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors duration-200 flex items-center space-x-2"
                onClick={() => handleView(exam.id)}
              >
                <FontAwesomeIcon icon={faCheckCircle} />
                <span className="text-sm">View Results</span>
              </button>
            )}
            {/* Take Exam Button */}
            {examStatus === "Ongoing" && submissionStatus[exam.id] !== true && (
              <button
                className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center space-x-2"
                onClick={() => handleTakeExam(exam)}
              >
                <FontAwesomeIcon icon={faPlay} />
                <span className="text-sm">Take Exam</span>
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
                  Today's Exams
                </h1>
                <p className="text-gray-600">
                  View and take your scheduled exams for today
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <FontAwesomeIcon icon={faCalendarAlt} />
                <span>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
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
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="submitted">Submitted</option>
                </select>

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
                  <option value="startTime-asc">Earliest First</option>
                  <option value="startTime-desc">Latest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
                  <option value="class-asc">Class A-Z</option>
                  <option value="status-asc">Status</option>
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
                {(searchTerm || statusFilter !== "all") && (
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
              Showing {filteredExams.length} of {exams.length} exams for today
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
                <p className="text-gray-600">Loading today's exams...</p>
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
                {searchTerm || statusFilter !== "all"
                  ? "No matching exams found"
                  : "No exams scheduled for today"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search terms or clearing filters"
                  : "You don't have any exams scheduled for today. Take some time to prepare for upcoming exams!"}
              </p>
              {(searchTerm || statusFilter !== "all") && (
                <button
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                  onClick={clearFilters}
                >
                  Clear Filters
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
        </main>
      </div>
    </div>
  );
}

export default StudentTodayExam;
