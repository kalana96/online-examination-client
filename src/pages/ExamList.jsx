import React, { useEffect, useState } from "react";
import Header from "../partials/Header";
import Sidebar from "../partials/TeacherSidebar";
import { useNavigate } from "react-router-dom";
import ExamService from "../service/ExamService";
import ClassService from "../service/ClassService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faPlus,
  faFilter,
  faTimes,
  faEye,
  faTrashAlt,
  faCalendarAlt,
  faClock,
  faChartBar,
  faUsers,
  faSearch,
  faGraduationCap,
  faBolt,
  faCheckCircle,
  faHourglassHalf,
  faTimesCircle,
  faSort,
  faTh,
  faListUl,
  faUserCheck,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function ExamList() {
  // State to hold the list of exams
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [viewMode, setViewMode] = useState("list"); // grid or list

  const navigate = useNavigate();

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");
  const teacherId = localStorage.getItem("id");

  // Fetch all exams and classes on component mount
  useEffect(() => {
    fetchExams();
    fetchClasses();
  }, [teacherId]);

  // Apply filters when exams or filter values change
  useEffect(() => {
    applyFilters();
  }, [exams, selectedClass, selectedStatus, searchTerm, sortBy, sortOrder]);

  // Function to fetch all exams using ExamService
  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await ExamService.getPublishedExamsByTeacher(
        teacherId,
        token
      );
      if (response.code === "00") {
        setExams(response.content || []);
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

  // Function to fetch teacher's classes
  const fetchClasses = async () => {
    try {
      const response = await ClassService.getClassesByTeacher(teacherId, token);
      if (response.code === "00") {
        setClasses(response.content || []);
      } else {
        console.error("Failed to fetch classes", response.message);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
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

    // Apply class filter
    if (selectedClass) {
      filtered = filtered.filter(
        (exam) => exam.clazz?.className === selectedClass
      );
    }

    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(
        (exam) => getExamStatus(exam) === selectedStatus
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
        case "status":
          aValue = getExamStatus(a);
          bValue = getExamStatus(b);
          break;
        default:
          aValue = a.examName.toLowerCase();
          bValue = b.examName.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredExams(filtered);
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSelectedClass("");
    setSelectedStatus("");
    setSearchTerm("");
  };

  // Function to handle creating a new exam
  const handleAddExam = () => {
    navigate("/teacher/examCreate");
  };

  // Function to open the Edit Form and set the selected exam
  const handleEdit = (examId) => {
    navigate(`/teacher/editExam/${examId}`);
  };

  // Function to handle the View exam details
  const handleView = (id) => {
    navigate(`/teacher/examDetails/${id}`);
  };

  // Function to handle viewing exam results
  const handleViewResults = (id) => {
    navigate(`/teacher/examResults/${id}`);
  };

  // Function to delete an exam with confirmation
  const deleteExam = async (examId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this exam? This action cannot be undone."
    );
    if (confirmDelete) {
      try {
        const response = await ExamService.deleteExam(examId, token);
        if (response.code === "00") {
          toast.success(response.message || "Exam deleted successfully");
          fetchExams();
        } else {
          console.error("Failed to delete exam", response.message);
          toast.error(response.message || "Failed to delete exam");
        }
      } catch (error) {
        console.error("Error deleting exam:", error);
        toast.error("Error deleting exam");
      }
    }
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

  // Function to get status color and icon
  const getStatusConfig = (status) => {
    const configs = {
      Upcoming: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: faHourglassHalf,
        iconColor: "text-blue-600",
      },
      Ongoing: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: faBolt,
        iconColor: "text-green-600",
      },
      Completed: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: faCheckCircle,
        iconColor: "text-gray-600",
      },
      Expired: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: faTimesCircle,
        iconColor: "text-red-600",
      },
    };
    return configs[status] || configs.Expired;
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

  // Render exam card
  const ExamCard = ({ exam, index }) => {
    const status = getExamStatus(exam);
    const statusConfig = getStatusConfig(status);
    const registeredCount = exam.registeredStudentCount || 0;

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
            <div
              className={`px-3 py-1 rounded-full border ${statusConfig.color}`}
            >
              <FontAwesomeIcon
                icon={statusConfig.icon}
                className={`mr-1 ${statusConfig.iconColor}`}
              />
              <span className="text-xs font-medium">{status}</span>
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

          {/* Duration and Registered Students */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Duration</span>
              <span className="text-sm font-medium text-gray-800">
                {exam.duration ? `${exam.duration} min` : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Reg Students</span>
              <div className="flex items-center space-x-1">
                <FontAwesomeIcon
                  icon={faUserCheck}
                  className="text-green-500 text-sm"
                />
                <span className="text-sm font-medium text-gray-800">
                  {registeredCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <FontAwesomeIcon
                icon={faUsers}
                className="text-gray-400 text-sm"
              />
              <span className="text-xs text-gray-500">#{index + 1}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                onClick={() => handleView(exam.id)}
                title="View Details"
              >
                <FontAwesomeIcon icon={faEye} />
              </button>
              <button
                className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                onClick={() => handleViewResults(exam.id)}
                title="View Results"
              >
                <FontAwesomeIcon icon={faChartBar} />
              </button>
              <button
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200"
                onClick={() => handleEdit(exam.id)}
                title="Edit Exam"
              >
                <FontAwesomeIcon icon={faEdit} />
              </button>
              <button
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                onClick={() => deleteExam(exam.id)}
                title="Delete Exam"
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render list view
  const ExamListItem = ({ exam, index }) => {
    const status = getExamStatus(exam);
    const statusConfig = getStatusConfig(status);
    const registeredCount = exam.registeredStudentCount || 0;

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
                <div
                  className={`px-2 py-1 rounded-full border ${statusConfig.color}`}
                >
                  <FontAwesomeIcon
                    icon={statusConfig.icon}
                    className={`mr-1 ${statusConfig.iconColor}`}
                  />
                  <span className="text-xs font-medium">{status}</span>
                </div>
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
                <div className="flex items-center space-x-1">
                  <FontAwesomeIcon
                    icon={faUserCheck}
                    className="text-green-500"
                  />
                  <span className="font-medium">
                    {registeredCount} Registered students
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              onClick={() => handleView(exam.id)}
              title="View Details"
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
            <button
              className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors duration-200"
              onClick={() => handleViewResults(exam.id)}
              title="View Results"
            >
              <FontAwesomeIcon icon={faChartBar} />
            </button>
            <button
              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200"
              onClick={() => handleEdit(exam.id)}
              title="Edit Exam"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
              onClick={() => deleteExam(exam.id)}
              title="Delete Exam"
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Calculate total registered students across all exams
  const getTotalRegisteredStudents = () => {
    return exams.reduce(
      (total, exam) => total + (exam.registeredStudentCount || 0),
      0
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
                  Exam Management
                </h1>
                <p className="text-gray-600">
                  Manage and monitor your exams efficiently
                </p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Exams</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {exams.length}
                    </p>
                  </div>
                  <FontAwesomeIcon
                    icon={faGraduationCap}
                    className="text-blue-500 text-2xl"
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Upcoming</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {
                        exams.filter(
                          (exam) => getExamStatus(exam) === "Upcoming"
                        ).length
                      }
                    </p>
                  </div>
                  <FontAwesomeIcon
                    icon={faHourglassHalf}
                    className="text-green-500 text-2xl"
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Ongoing</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {
                        exams.filter(
                          (exam) => getExamStatus(exam) === "Ongoing"
                        ).length
                      }
                    </p>
                  </div>
                  <FontAwesomeIcon
                    icon={faBolt}
                    className="text-orange-500 text-2xl"
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {
                        exams.filter(
                          (exam) => getExamStatus(exam) === "Completed"
                        ).length
                      }
                    </p>
                  </div>
                  <FontAwesomeIcon
                    icon={faCheckCircle}
                    className="text-purple-500 text-2xl"
                  />
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-cyan-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {getTotalRegisteredStudents()}
                    </p>
                  </div>
                  <FontAwesomeIcon
                    icon={faUserCheck}
                    className="text-cyan-500 text-2xl"
                  />
                </div>
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
                  <option value="date-desc">Latest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="name-asc">Name A-Z</option>
                  <option value="name-desc">Name Z-A</option>
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

                {/* Filter Toggle */}
                <button
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    showFilters
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FontAwesomeIcon icon={faFilter} className="mr-2" />
                  Filters
                </button>

                {/* Clear Filters */}
                {(selectedClass || selectedStatus || searchTerm) && (
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

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Advanced Filters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class
                    </label>
                    <select
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Classes</option>
                      {classes.map((classItem) => (
                        <option key={classItem.id} value={classItem.className}>
                          {classItem.className}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Status</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                      <option value="Expired">Expired</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-600">
              Showing {filteredExams.length} of {exams.length} exams
              {(selectedClass || selectedStatus || searchTerm) && (
                <span className="ml-2 text-blue-600 font-medium">
                  (Filtered)
                </span>
              )}
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredExams.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <FontAwesomeIcon icon={faGraduationCap} className="text-6xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {exams.length === 0
                  ? "No exams found"
                  : "No exams match your filters"}
              </h3>
              <p className="text-gray-600 mb-6">
                {exams.length === 0
                  ? "Get started by scheduling your first exam."
                  : "Try adjusting your search criteria or filters."}
              </p>
              {exams.length === 0 && (
                <button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2 mx-auto"
                  onClick={handleAddExam}
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Schedule Your First Exam</span>
                </button>
              )}
            </div>
          )}

          {/* Exams Display */}
          {!loading && filteredExams.length > 0 && (
            <div>
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

          {/* Pagination for large datasets */}
          {filteredExams.length > 12 && (
            <div className="mt-8 flex justify-center">
              <div className="bg-white rounded-lg shadow-md px-6 py-3">
                <p className="text-sm text-gray-600">
                  Showing all {filteredExams.length} results
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default ExamList;
