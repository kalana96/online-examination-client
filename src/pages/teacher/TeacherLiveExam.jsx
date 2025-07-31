import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
  faBolt,
  faCheckCircle,
  faHourglassHalf,
  faTimesCircle,
  faTh,
  faListUl,
  faSpinner,
  faExclamationTriangle,
  faRefresh,
  faPlay,
  faShieldAlt,
  faCamera,
  faDesktop,
  faMicrophone,
  faEyeSlash,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";

// Components
import Header from "../../partials/Header";
import Sidebar from "../../partials/TeacherSidebar";
import ExamService from "../../service/ExamService";
import ClassService from "../../service/ClassService";

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

const EmptyState = ({ hasFilters, onClearFilters }) => (
  <div className="text-center py-12">
    <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
      <FontAwesomeIcon icon={faGraduationCap} className="text-6xl" />
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">
      {hasFilters
        ? "No ongoing exams match your filters"
        : "No ongoing exams found"}
    </h3>
    <p className="text-gray-600 mb-6">
      {hasFilters
        ? "Try adjusting your search criteria or filters."
        : "No exams are currently ongoing."}
    </p>
    {hasFilters && (
      <div className="flex justify-center space-x-4">
        <button
          onClick={onClearFilters}
          className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Clear Filters
        </button>
      </div>
    )}
  </div>
);

const ProctoringPanel = ({ exam, onStartProctoring, onStopProctoring }) => {
  const [proctoringActive, setProctoringActive] = useState(false);
  const [proctoringFeatures, setProctoringFeatures] = useState({
    cameraMonitoring: true,
    screenRecording: true,
    microphoneMonitoring: false,
    tabSwitchDetection: true,
    facialRecognition: false,
  });

  const handleToggleProctoring = () => {
    if (proctoringActive) {
      onStopProctoring(exam.id);
      setProctoringActive(false);
      toast.info("Proctoring stopped");
    } else {
      onStartProctoring(exam.id, proctoringFeatures);
      setProctoringActive(true);
      toast.success("Proctoring started");

      navigate("/teacher/proctoring");
    }
  };

  const handleFeatureToggle = (feature) => {
    setProctoringFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <FontAwesomeIcon icon={faShieldAlt} className="mr-2 text-blue-600" />
          Proctoring Control
        </h3>
        <button
          onClick={handleToggleProctoring}
          className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2 ${
            proctoringActive
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-green-500 hover:bg-green-600 text-white"
          }`}
        >
          <FontAwesomeIcon
            icon={proctoringActive ? faEyeSlash : faUserShield}
          />
          <span>
            {proctoringActive ? "Stop Proctoring" : "Start Proctoring"}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Monitoring Features</h4>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={proctoringFeatures.cameraMonitoring}
              onChange={() => handleFeatureToggle("cameraMonitoring")}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faCamera} className="text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                Camera Monitoring
              </span>
            </div>
          </label>

          {/* <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={proctoringFeatures.screenRecording}
              onChange={() => handleFeatureToggle("screenRecording")}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faDesktop} className="text-green-500" />
              <span className="text-sm font-medium text-gray-700">
                Screen Recording
              </span>
            </div>
          </label> */}

          {/* <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={proctoringFeatures.microphoneMonitoring}
              onChange={() => handleFeatureToggle("microphoneMonitoring")}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon
                icon={faMicrophone}
                className="text-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Microphone Monitoring
              </span>
            </div>
          </label> */}
        </div>

        {/* <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Security Features</h4>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={proctoringFeatures.tabSwitchDetection}
              onChange={() => handleFeatureToggle("tabSwitchDetection")}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faEye} className="text-orange-500" />
              <span className="text-sm font-medium text-gray-700">
                Tab Switch Detection
              </span>
            </div>
          </label>

          <label className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={proctoringFeatures.facialRecognition}
              onChange={() => handleFeatureToggle("facialRecognition")}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon icon={faUserShield} className="text-red-500" />
              <span className="text-sm font-medium text-gray-700">
                Facial Recognition
              </span>
            </div>
          </label>
        </div> */}
      </div>

      {proctoringActive && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">
              Proctoring is active for {exam.examName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const ExamCard = ({
  exam,
  index,
  onView,
  onStartProctoring,
  onStopProctoring,
}) => {
  const status = getExamStatus(exam);
  const statusConfig = getStatusConfig(status);
  const isOngoing = status === EXAM_STATUSES.ONGOING;
  const canProctor =
    status === EXAM_STATUSES.ONGOING || status === EXAM_STATUSES.UPCOMING;

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

        {/* Proctoring section for ongoing/upcoming exams */}
        {canProctor && (
          <ProctoringPanel
            exam={exam}
            onStartProctoring={onStartProctoring}
            onStopProctoring={onStopProctoring}
          />
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
  onStartProctoring,
  onStopProctoring,
}) => {
  const status = getExamStatus(exam);
  const statusConfig = getStatusConfig(status);
  const isOngoing = status === EXAM_STATUSES.ONGOING;
  const canProctor =
    status === EXAM_STATUSES.ONGOING || status === EXAM_STATUSES.UPCOMING;

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

      {/* Proctoring section for ongoing/upcoming exams */}
      {canProctor && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <ProctoringPanel
            exam={exam}
            onStartProctoring={onStartProctoring}
            onStopProctoring={onStopProctoring}
          />
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
    VIEW_MODES.LIST
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
    if (!token || !teacherId) {
      navigate("/login");
      return;
    }

    fetchExams();
    fetchClasses();
  }, [token, teacherId, navigate, fetchExams, fetchClasses]);

  // Handlers
  const handleView = (examId) => {
    navigate(`/teacher/exam/${examId}`);
  };

  const handleStartProctoring = (examId, features) => {
    console.log(
      "Starting proctoring for exam:",
      examId,
      "with features:",
      features
    );
    navigate(`/teacher/proctoring`);
  };

  const handleStopProctoring = (examId) => {
    console.log("Stopping proctoring for exam:", examId);
    // Implement proctoring stop logic here
    toast.info("Proctoring stopped");
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedClass("");
    setShowFilters(false);
  };

  const handleRetry = () => {
    fetchExams();
    fetchClasses();
  };

  // Computed values
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      // Only show ongoing exams
      const status = getExamStatus(exam);
      const isOngoing = status === EXAM_STATUSES.ONGOING;

      if (!isOngoing) return false;

      const matchesSearch = exam.examName
        .toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase());
      const matchesClass = selectedClass
        ? exam.clazz?.className === selectedClass
        : true;
      // Remove status filter since we're only showing ongoing exams

      return matchesSearch && matchesClass;
    });
  }, [exams, debouncedSearchTerm, selectedClass]);

  const sortedExams = useMemo(() => {
    const sorted = [...filteredExams].sort((a, b) => {
      switch (sortBy) {
        case "date":
          const dateA = new Date(a.examDate);
          const dateB = new Date(b.examDate);
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        case "name":
          return sortOrder === "asc"
            ? a.examName.localeCompare(b.examName)
            : b.examName.localeCompare(a.examName);
        case "status":
          const statusA = getExamStatus(a);
          const statusB = getExamStatus(b);
          return sortOrder === "asc"
            ? statusA.localeCompare(statusB)
            : statusB.localeCompare(statusA);
        default:
          return 0;
      }
    });
    return sorted;
  }, [filteredExams, sortBy, sortOrder]);

  const hasActiveFilters = searchTerm || selectedClass;

  // Render
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Live Exam Monitor
              </h1>
              <p className="text-gray-600">
                Monitor and manage your ongoing exams in real-time
              </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                {/* Search */}
                <div className="flex-1 relative">
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors duration-200 ${
                    showFilters
                      ? "bg-blue-50 border-blue-200 text-blue-700"
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

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode(VIEW_MODES.GRID)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      viewMode === VIEW_MODES.GRID
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <FontAwesomeIcon icon={faTh} />
                  </button>
                  <button
                    onClick={() => setViewMode(VIEW_MODES.LIST)}
                    className={`p-2 rounded-lg transition-colors duration-200 ${
                      viewMode === VIEW_MODES.LIST
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <FontAwesomeIcon icon={faListUl} />
                  </button>
                </div>
              </div>

              {/* Filter Options */}
              {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class
                      </label>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        Sort By
                      </label>
                      <select
                        value={`${sortBy}-${sortOrder}`}
                        onChange={(e) => {
                          const [newSortBy, newSortOrder] =
                            e.target.value.split("-");
                          setSortBy(newSortBy);
                          setSortOrder(newSortOrder);
                        }}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {hasActiveFilters && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleClearFilters}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        <span>Clear Filters</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing {sortedExams.length} ongoing exam
                {sortedExams.length !== 1 ? "s" : ""}
                {exams.length > 0 && (
                  <span className="ml-1">
                    out of{" "}
                    {
                      exams.filter(
                        (exam) => getExamStatus(exam) === EXAM_STATUSES.ONGOING
                      ).length
                    }{" "}
                    total ongoing
                  </span>
                )}
              </p>
            </div>

            {/* Content */}
            {loading ? (
              <LoadingSpinner size="lg" />
            ) : error ? (
              <ErrorMessage message={error} onRetry={handleRetry} />
            ) : sortedExams.length === 0 ? (
              <EmptyState
                hasFilters={hasActiveFilters}
                onClearFilters={handleClearFilters}
              />
            ) : (
              <div
                className={
                  viewMode === VIEW_MODES.GRID
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {sortedExams.map((exam, index) =>
                  viewMode === VIEW_MODES.GRID ? (
                    <ExamCard
                      key={exam.id}
                      exam={exam}
                      index={index}
                      onView={handleView}
                      onStartProctoring={handleStartProctoring}
                      onStopProctoring={handleStopProctoring}
                    />
                  ) : (
                    <ExamListItem
                      key={exam.id}
                      exam={exam}
                      index={index}
                      onView={handleView}
                      onStartProctoring={handleStartProctoring}
                      onStopProctoring={handleStopProctoring}
                    />
                  )
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
