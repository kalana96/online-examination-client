import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
  faTh,
  faListUl,
  faSpinner,
  faExclamationTriangle,
  faRefresh,
  faDownload,
  faShareAlt,
  faPlay,
  faPause,
  faStop,
} from "@fortawesome/free-solid-svg-icons";

// live exame with state cardes

// Components
import Header from "../partials/Header";
import Sidebar from "../partials/TeacherSidebar";
import ExamService from "../service/ExamService";
import ClassService from "../service/ClassService";

// Custom hooks
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
};

// Constants
const EXAM_STATUSES = {
  UPCOMING: "Upcoming",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  EXPIRED: "Expired",
};

const EXAM_TYPES = {
  QUIZ: "Quiz",
  TEST: "Test",
  FINAL: "Final",
  MIDTERM: "Midterm",
};

const SORT_OPTIONS = [
  { value: "date-desc", label: "Latest First" },
  { value: "date-asc", label: "Oldest First" },
  { value: "name-asc", label: "Name A-Z" },
  { value: "name-desc", label: "Name Z-A" },
  { value: "status-asc", label: "Status" },
];

const VIEW_MODES = {
  GRID: "grid",
  LIST: "list",
};

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid Date";
  }
};

const formatTime = (timeString) => {
  if (!timeString) return "N/A";
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
    return "Invalid Time";
  }
};

const getExamStatus = (exam) => {
  if (!exam.examDate || !exam.startTime) return EXAM_STATUSES.EXPIRED;

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
      return EXAM_STATUSES.UPCOMING;
    } else if (now >= examStartDateTime && now < examEndDateTime) {
      return EXAM_STATUSES.ONGOING;
    } else if (now >= examEndDateTime) {
      return EXAM_STATUSES.COMPLETED;
    } else {
      return EXAM_STATUSES.EXPIRED;
    }
  } catch (error) {
    console.error("Error calculating exam status:", error);
    return EXAM_STATUSES.EXPIRED;
  }
};

const getStatusConfig = (status) => {
  const configs = {
    [EXAM_STATUSES.UPCOMING]: {
      color: "bg-blue-100 text-blue-800 border-blue-200",
      icon: faHourglassHalf,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    [EXAM_STATUSES.ONGOING]: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: faBolt,
      iconColor: "text-green-600",
      bgColor: "bg-green-50",
      pulse: true,
    },
    [EXAM_STATUSES.COMPLETED]: {
      color: "bg-gray-100 text-gray-800 border-gray-200",
      icon: faCheckCircle,
      iconColor: "text-gray-600",
      bgColor: "bg-gray-50",
    },
    [EXAM_STATUSES.EXPIRED]: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: faTimesCircle,
      iconColor: "text-red-600",
      bgColor: "bg-red-50",
    },
  };
  return configs[status] || configs[EXAM_STATUSES.EXPIRED];
};

const getExamTypeColor = (type) => {
  const colors = {
    [EXAM_TYPES.QUIZ]: "bg-purple-100 text-purple-800 border-purple-200",
    [EXAM_TYPES.TEST]: "bg-orange-100 text-orange-800 border-orange-200",
    [EXAM_TYPES.FINAL]: "bg-red-100 text-red-800 border-red-200",
    [EXAM_TYPES.MIDTERM]: "bg-indigo-100 text-indigo-800 border-indigo-200",
  };
  return colors[type] || "bg-gray-100 text-gray-800 border-gray-200";
};

// Sub-components
const LoadingSpinner = ({ size = "md" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex justify-center items-center py-8">
      <FontAwesomeIcon
        icon={faSpinner}
        className={`${sizeClasses[size]} text-blue-500 animate-spin`}
      />
    </div>
  );
};

const ErrorMessage = ({ message, onRetry }) => (
  <div className="text-center py-12">
    <div className="mx-auto h-24 w-24 text-red-400 mb-4">
      <FontAwesomeIcon icon={faExclamationTriangle} className="text-6xl" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">
      Something went wrong
    </h3>
    <p className="text-gray-600 mb-6">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto"
      >
        <FontAwesomeIcon icon={faRefresh} />
        <span>Try Again</span>
      </button>
    )}
  </div>
);

const EmptyState = ({ hasFilters, onAddExam, onClearFilters }) => (
  <div className="text-center py-12">
    <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
      <FontAwesomeIcon icon={faGraduationCap} className="text-6xl" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">
      {hasFilters ? "No exams match your filters" : "No exams found"}
    </h3>
    <p className="text-gray-600 mb-6">
      {hasFilters
        ? "Try adjusting your search criteria or filters."
        : "Get started by scheduling your first exam."}
    </p>
    <div className="flex justify-center space-x-4">
      {hasFilters && (
        <button
          onClick={onClearFilters}
          className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Clear Filters
        </button>
      )}
      <button
        onClick={onAddExam}
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
      >
        <FontAwesomeIcon icon={faPlus} />
        <span>
          {hasFilters ? "Schedule New Exam" : "Schedule Your First Exam"}
        </span>
      </button>
    </div>
  </div>
);

const StatsCard = ({ title, value, icon, color, pulse = false }) => (
  <div
    className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500 hover:shadow-lg transition-shadow duration-200`}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div
        className={`p-3 rounded-full bg-${color}-100 ${
          pulse ? "animate-pulse" : ""
        }`}
      >
        <FontAwesomeIcon icon={icon} className={`text-${color}-500 text-xl`} />
      </div>
    </div>
  </div>
);

const ExamCard = ({ exam, index, onView, onEdit, onDelete, onViewResults }) => {
  const status = getExamStatus(exam);
  const statusConfig = getStatusConfig(status);
  const isOngoing = status === EXAM_STATUSES.ONGOING;

  return (
    <div
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 overflow-hidden ${
        isOngoing ? "ring-2 ring-green-400 ring-opacity-50" : ""
      }`}
    >
      {/* Live indicator for ongoing exams */}
      {isOngoing && (
        <div className="bg-green-500 text-white text-xs font-bold px-3 py-1 text-center">
          <FontAwesomeIcon icon={faPlay} className="mr-1 animate-pulse" />
          LIVE EXAM
        </div>
      )}

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
            className={`px-3 py-1 rounded-full border ${statusConfig.color} ${
              statusConfig.pulse ? "animate-pulse" : ""
            }`}
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
            <span className="text-gray-600 text-sm font-medium">Type</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getExamTypeColor(
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
            <div className="p-2 bg-blue-50 rounded-lg">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="text-blue-500 text-sm"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Date</p>
              <p className="text-sm font-semibold text-gray-800">
                {formatDate(exam.examDate)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <FontAwesomeIcon
                icon={faClock}
                className="text-green-500 text-sm"
              />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">Time</p>
              <p className="text-sm font-semibold text-gray-800">
                {formatTime(exam.startTime)}
              </p>
            </div>
          </div>
        </div>

        {/* Duration and Students */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm font-medium">Duration</span>
            <span className="text-sm font-semibold text-gray-800">
              {exam.duration ? `${exam.duration} min` : "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm font-medium">Students</span>
            <span className="text-sm font-semibold text-gray-800">
              {exam.studentCount || 0}
            </span>
          </div>
        </div>

        {/* Progress bar for ongoing exams */}
        {isOngoing && exam.duration && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium text-green-600">In Progress</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full animate-pulse"
                style={{ width: "45%" }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <FontAwesomeIcon icon={faUsers} className="text-gray-400 text-sm" />
            <span className="text-xs text-gray-500">#{index + 1}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
              onClick={() => onView(exam.id)}
              title="View Details"
              aria-label={`View details for ${exam.examName}`}
            >
              <FontAwesomeIcon icon={faEye} />
            </button>
            <button
              className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors duration-200"
              onClick={() => onViewResults(exam.id)}
              title="View Results"
              aria-label={`View results for ${exam.examName}`}
            >
              <FontAwesomeIcon icon={faChartBar} />
            </button>
            <button
              className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200"
              onClick={() => onEdit(exam.id)}
              title="Edit Exam"
              aria-label={`Edit ${exam.examName}`}
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
              onClick={() => onDelete(exam.id)}
              title="Delete Exam"
              aria-label={`Delete ${exam.examName}`}
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExamListItem = ({
  exam,
  index,
  onView,
  onEdit,
  onDelete,
  onViewResults,
}) => {
  const status = getExamStatus(exam);
  const statusConfig = getStatusConfig(status);
  const isOngoing = status === EXAM_STATUSES.ONGOING;

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100 p-6 ${
        isOngoing ? "ring-2 ring-green-400 ring-opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 flex-1">
          <div className="flex-shrink-0">
            <div
              className={`w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center ${
                isOngoing ? "animate-pulse" : ""
              }`}
            >
              <span className="text-white font-bold text-sm">#{index + 1}</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-3">
              <h3 className="text-lg font-semibold text-gray-800 truncate">
                {exam.examName}
              </h3>
              {isOngoing && (
                <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-full animate-pulse">
                  LIVE
                </span>
              )}
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${getExamTypeColor(
                  exam.examType
                )}`}
              >
                {exam.examType}
              </span>
              <div
                className={`px-3 py-1 rounded-full border ${
                  statusConfig.color
                } ${statusConfig.pulse ? "animate-pulse" : ""}`}
              >
                <FontAwesomeIcon
                  icon={statusConfig.icon}
                  className={`mr-1 ${statusConfig.iconColor}`}
                />
                <span className="text-xs font-medium">{status}</span>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon
                  icon={faGraduationCap}
                  className="text-gray-400"
                />
                <span>{exam.clazz?.className || "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-gray-400"
                />
                <span>{formatDate(exam.examDate)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                <span>{formatTime(exam.startTime)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon
                  icon={faHourglassHalf}
                  className="text-gray-400"
                />
                <span>{exam.duration ? `${exam.duration} min` : "N/A"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faUsers} className="text-gray-400" />
                <span>{exam.studentCount || 0} students</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            onClick={() => onView(exam.id)}
            title="View Details"
            aria-label={`View details for ${exam.examName}`}
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
          <button
            className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors duration-200"
            onClick={() => onViewResults(exam.id)}
            title="View Results"
            aria-label={`View results for ${exam.examName}`}
          >
            <FontAwesomeIcon icon={faChartBar} />
          </button>
          <button
            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200"
            onClick={() => onEdit(exam.id)}
            title="Edit Exam"
            aria-label={`Edit ${exam.examName}`}
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
            onClick={() => onDelete(exam.id)}
            title="Delete Exam"
            aria-label={`Delete ${exam.examName}`}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        </div>
      </div>

      {/* Progress bar for ongoing exams */}
      {isOngoing && exam.duration && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600 font-medium">Exam Progress</span>
            <span className="font-medium text-green-600">Live</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full animate-pulse"
              style={{ width: "45%" }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
function TeacherLiveExam() {
  // State
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useLocalStorage("examSortBy", "date");
  const [sortOrder, setSortOrder] = useLocalStorage("examSortOrder", "desc");
  const [viewMode, setViewMode] = useLocalStorage(
    "examViewMode",
    VIEW_MODES.GRID
  );

  // Hooks
  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Auth
  const token = localStorage.getItem("token");
  const teacherId = localStorage.getItem("id");

  // Fetch functions
  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ExamService.getPublishedExamsByTeacher(
        teacherId,
        token
      );

      if (response.code === "00") {
        setExams(response.content || []);
      } else {
        throw new Error(response.message || "Failed to fetch exams");
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      setError(error.message);
      toast.error("Failed to load exams");
    } finally {
      setLoading(false);
    }
  }, [teacherId, token]);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await ClassService.getClassesByTeacher(teacherId, token);
      if (response.code === "00") {
        setClasses(response.content || []);
      } else {
        console.error("Failed to fetch classes:", response.message);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  }, [teacherId, token]);

  // Effects
  useEffect(() => {
    if (teacherId && token) {
      fetchExams();
      fetchClasses();
    }
  }, [teacherId, token, fetchExams, fetchClasses]);

  // Auto-refresh for live exams
  useEffect(() => {
    const interval = setInterval(() => {
      const hasOngoingExams = exams.some(
        (exam) => getExamStatus(exam) === EXAM_STATUSES.ONGOING
      );
      if (hasOngoingExams) {
        fetchExams();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [exams, fetchExams]);

  // Filtered and sorted exams
  const filteredExams = useMemo(() => {
    let filtered = [...exams];

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (exam) =>
          exam.examName.toLowerCase().includes(searchLower) ||
          exam.examType?.toLowerCase().includes(searchLower) ||
          exam.clazz?.className.toLowerCase().includes(searchLower)
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

    return filtered;
  }, [
    exams,
    debouncedSearchTerm,
    selectedClass,
    selectedStatus,
    sortBy,
    sortOrder,
  ]);

  // Stats completion
  const stats = useMemo(() => {
    const statusCounts = exams.reduce((acc, exam) => {
      const status = getExamStatus(exam);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      total: exams.length,
      upcoming: statusCounts[EXAM_STATUSES.UPCOMING] || 0,
      ongoing: statusCounts[EXAM_STATUSES.ONGOING] || 0,
      completed: statusCounts[EXAM_STATUSES.COMPLETED] || 0,
      expired: statusCounts[EXAM_STATUSES.EXPIRED] || 0,
    };
  }, [exams]);

  // Event handlers
  const handleViewExam = (examId) => {
    navigate(`/teacher/exam/${examId}`);
  };

  const handleEditExam = (examId) => {
    navigate(`/teacher/exam/edit/${examId}`);
  };

  const handleViewResults = (examId) => {
    navigate(`/teacher/exam/results/${examId}`);
  };

  const handleDeleteExam = async (examId) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        const response = await ExamService.deleteExam(examId, token);
        if (response.code === "00") {
          toast.success("Exam deleted successfully");
          fetchExams();
        } else {
          throw new Error(response.message || "Failed to delete exam");
        }
      } catch (error) {
        console.error("Error deleting exam:", error);
        toast.error("Failed to delete exam");
      }
    }
  };

  const handleAddExam = () => {
    navigate("/teacher/exam/create");
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSortBy);
      setSortOrder("asc");
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedClass("");
    setSelectedStatus("");
    setShowFilters(false);
  };

  const hasActiveFilters = searchTerm || selectedClass || selectedStatus;

  // Render
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Live Exams
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Monitor and manage your ongoing and scheduled exams
                  </p>
                </div>
                <button
                  onClick={handleAddExam}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
                >
                  <FontAwesomeIcon icon={faPlus} />
                  <span>Schedule New Exam</span>
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatsCard
                  title="Total Exams"
                  value={stats.total}
                  icon={faGraduationCap}
                  color="blue"
                />
                <StatsCard
                  title="Upcoming"
                  value={stats.upcoming}
                  icon={faHourglassHalf}
                  color="yellow"
                />
                <StatsCard
                  title="Ongoing"
                  value={stats.ongoing}
                  icon={faBolt}
                  color="green"
                  pulse={stats.ongoing > 0}
                />
                <StatsCard
                  title="Completed"
                  value={stats.completed}
                  icon={faCheckCircle}
                  color="gray"
                />
                <StatsCard
                  title="Expired"
                  value={stats.expired}
                  icon={faTimesCircle}
                  color="red"
                />
              </div>

              {/* Search and Filter Bar */}
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex items-center space-x-4">
                    {/* Search */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FontAwesomeIcon
                          icon={faSearch}
                          className="text-gray-400"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Search exams..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                      />
                    </div>

                    {/* Filter Toggle */}
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors duration-200 ${
                        hasActiveFilters
                          ? "bg-blue-50 border-blue-300 text-blue-700"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <FontAwesomeIcon icon={faFilter} />
                      <span>Filters</span>
                      {hasActiveFilters && (
                        <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {
                            [searchTerm, selectedClass, selectedStatus].filter(
                              Boolean
                            ).length
                          }
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center space-x-4">
                    {/* Sort */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">
                        Sort by:
                      </span>
                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [newSortBy, newSortOrder] =
                            e.target.value.split("-");
                          setSortBy(newSortBy);
                          setSortOrder(newSortOrder);
                        }}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* View Mode */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode(VIEW_MODES.GRID)}
                        className={`p-2 rounded-md transition-colors duration-200 ${
                          viewMode === VIEW_MODES.GRID
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                        title="Grid View"
                      >
                        <FontAwesomeIcon icon={faTh} />
                      </button>
                      <button
                        onClick={() => setViewMode(VIEW_MODES.LIST)}
                        className={`p-2 rounded-md transition-colors duration-200 ${
                          viewMode === VIEW_MODES.LIST
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                        title="List View"
                      >
                        <FontAwesomeIcon icon={faListUl} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Advanced Filters */}
                {showFilters && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Class
                        </label>
                        <select
                          value={selectedClass}
                          onChange={(e) => setSelectedClass(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Classes</option>
                          {classes.map((cls) => (
                            <option key={cls.id} value={cls.className}>
                              {cls.className}
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
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">All Statuses</option>
                          {Object.values(EXAM_STATUSES).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={handleClearFilters}
                          className="w-full bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <LoadingSpinner size="lg" />
            ) : error ? (
              <ErrorMessage message={error} onRetry={fetchExams} />
            ) : filteredExams.length === 0 ? (
              <EmptyState
                hasFilters={hasActiveFilters}
                onAddExam={handleAddExam}
                onClearFilters={handleClearFilters}
              />
            ) : (
              <div className="space-y-6">
                {/* Results Count */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Showing {filteredExams.length} of {exams.length} exams
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>

                {/* Exams Grid/List */}
                {viewMode === VIEW_MODES.GRID ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredExams.map((exam, index) => (
                      <ExamCard
                        key={exam.id}
                        exam={exam}
                        index={index}
                        onView={handleViewExam}
                        onEdit={handleEditExam}
                        onDelete={handleDeleteExam}
                        onViewResults={handleViewResults}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredExams.map((exam, index) => (
                      <ExamListItem
                        key={exam.id}
                        exam={exam}
                        index={index}
                        onView={handleViewExam}
                        onEdit={handleEditExam}
                        onDelete={handleDeleteExam}
                        onViewResults={handleViewResults}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default TeacherLiveExam;
