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
  faBookOpen,
  faCheckCircle,
  faHourglassHalf,
  faTh,
  faListUl,
  faSpinner,
  faExclamationTriangle,
  faRefresh,
  faPlay,
  faInfoCircle,
  faUserPlus,
  faUserCheck,
} from "@fortawesome/free-solid-svg-icons";

// Components
import Header from "../partials/Header";
import Sidebar from "../partials/StudentSidebar";
import ExamService from "../service/ExamService";
import ExamRegisterService from "../service/ExamRegistrationService";
import ClassService from "../service/ClassService";

// Constants
const VIEW_MODES = {
  GRID: "grid",
  LIST: "list",
};

const EXAM_STATUSES = {
  UPCOMING: "Upcoming",
  OPEN: "Open",
  REGISTERED: "Registered",
  CLOSED: "Closed",
};

const SORT_OPTIONS = [
  { value: "date-asc", label: "Date (Soonest First)" },
  { value: "date-desc", label: "Date (Latest First)" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "duration-asc", label: "Duration (Shortest First)" },
  { value: "duration-desc", label: "Duration (Longest First)" },
];

// Custom hooks
const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setStoredValue = (newValue) => {
    try {
      setValue(newValue);
      window.localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error(`Error saving to localStorage:`, error);
    }
  };

  return [value, setStoredValue];
};

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Utility functions
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getTimeUntilExam = (examDate) => {
  const now = new Date();
  const exam = new Date(examDate);
  const diff = exam - now;

  if (diff <= 0) return "Exam time has passed";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""} remaining`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} remaining`;
  } else {
    return "Starting soon";
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case EXAM_STATUSES.UPCOMING:
      return "bg-yellow-100 text-yellow-800";
    case EXAM_STATUSES.OPEN:
      return "bg-green-100 text-green-800";
    case EXAM_STATUSES.REGISTERED:
      return "bg-blue-100 text-blue-800";
    case EXAM_STATUSES.CLOSED:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <FontAwesomeIcon icon={faSpinner} spin className="text-blue-500 text-2xl" />
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="text-center py-12">
    <FontAwesomeIcon
      icon={faExclamationTriangle}
      className="text-red-500 text-4xl mb-4"
    />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      Error Loading Exams
    </h3>
    <p className="text-gray-600 mb-4">{message}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
    >
      <FontAwesomeIcon icon={faRefresh} className="mr-2" />
      Try Again
    </button>
  </div>
);

const EmptyState = ({ hasFilters, onClearFilters }) => (
  <div className="text-center py-12">
    <FontAwesomeIcon
      icon={faCalendarAlt}
      className="text-gray-400 text-4xl mb-4"
    />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {hasFilters ? "No Exams Found" : "No Upcoming Exams"}
    </h3>
    <p className="text-gray-600 mb-4">
      {hasFilters
        ? "Try adjusting your filters to see more results."
        : "There are no upcoming exams at the moment. Check back later or contact your teacher."}
    </p>
    {hasFilters && (
      <button
        onClick={onClearFilters}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
      >
        <FontAwesomeIcon icon={faTimes} className="mr-2" />
        Clear Filters
      </button>
    )}
  </div>
);

// Registration Modal Component
const RegistrationModal = ({
  exam,
  isOpen,
  onClose,
  onRegister,
  isLoading,
}) => {
  const [notes, setNotes] = useState("");
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNotes("");
      setShowNotes(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatModalDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRegister = () => {
    onRegister(exam.id, notes.trim() || null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Register for Exam
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">{exam.examName}</h4>
            <p className="text-sm text-gray-600 mb-4">{exam.className}</p>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="text-gray-400"
                />
                <span className="text-sm text-gray-600">
                  Exam Date: {formatModalDate(exam.examDate)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faClock} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  Duration: {exam.duration} minutes
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon icon={faUsers} className="text-gray-400" />
                <span className="text-sm text-gray-600">
                  Total Questions: {exam.totalQuestions || "N/A"}
                </span>
              </div>
            </div>

            {exam.description && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">{exam.description}</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <FontAwesomeIcon
                icon={faInfoCircle}
                className="text-blue-500 mt-0.5"
              />
              <div>
                <h5 className="text-sm font-medium text-blue-900 mb-1">
                  Registration Information
                </h5>
                <p className="text-sm text-blue-700">
                  By registering for this exam, you confirm that you will be
                  available on the scheduled date and time. Make sure you have a
                  stable internet connection and a quiet environment.
                </p>
              </div>
            </div>
          </div>

          {/* Optional Notes Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                type="button"
              >
                {showNotes ? "Hide" : "Add"} Notes
              </button>
            </div>

            {showNotes && (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about your registration..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows="3"
                maxLength={500}
                disabled={isLoading}
              />
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  Registering...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
                  Register
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced card component with cancel registration option
const ExamCard = ({
  exam,
  onView,
  onRegister,
  onViewDetails,
  onCancelRegistration,
  registrationLoading,
}) => {
  const canRegister =
    (exam.status === EXAM_STATUSES.UPCOMING ||
      exam.status === EXAM_STATUSES.OPEN) &&
    !exam.isRegistered;
  const isRegistered =
    exam.isRegistered || exam.status === EXAM_STATUSES.REGISTERED;
  const canCancel = isRegistered && new Date(exam.examDate) > new Date();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {exam.examName}
            </h3>
            <p className="text-sm text-gray-600 mb-2">{exam.className}</p>
            <div className="flex items-center space-x-2">
              <FontAwesomeIcon
                icon={faBookOpen}
                className="text-gray-400 text-xs"
              />
              <span className="text-xs text-gray-500">
                {exam.subject || "General"}
              </span>
            </div>
          </div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              exam.status
            )}`}
          >
            {exam.status}
          </span>
        </div>

        {/* Exam Details */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {formatDate(exam.examDate)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faClock} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {exam.duration} minutes
            </span>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon
              icon={faHourglassHalf}
              className="text-orange-500"
            />
            <span className="text-sm font-medium text-orange-700">
              {getTimeUntilExam(exam.examDate)}
            </span>
          </div>
        </div>

        {/* Registration Status */}
        {isRegistered && (
          <div className="mb-4 p-3 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FontAwesomeIcon
                  icon={faUserCheck}
                  className="text-green-600"
                />
                <span className="text-sm font-medium text-green-800">
                  You are registered for this exam
                </span>
              </div>
              {canCancel && (
                <button
                  onClick={() => onCancelRegistration(exam.id)}
                  disabled={registrationLoading}
                  className="text-xs text-red-600 hover:text-red-800 underline disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
            {exam.registrationData?.notes && (
              <p className="text-xs text-green-700 mt-1">
                Notes: {exam.registrationData.notes}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onViewDetails(exam)}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faEye} />
            <span>Details</span>
          </button>

          {canRegister && (
            <button
              onClick={() => onRegister(exam)}
              disabled={registrationLoading}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {registrationLoading ? (
                <FontAwesomeIcon icon={faSpinner} spin />
              ) : (
                <FontAwesomeIcon icon={faUserPlus} />
              )}
              <span>Register</span>
            </button>
          )}

          {isRegistered && (
            <button
              onClick={() => onView(exam.id)}
              className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faPlay} />
              <span>Take Exam</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ExamListItem = ({
  exam,
  onView,
  onRegister,
  onViewDetails,
  onCancelRegistration,
  registrationLoading,
}) => {
  const canRegister =
    (exam.status === EXAM_STATUSES.UPCOMING ||
      exam.status === EXAM_STATUSES.OPEN) &&
    !exam.isRegistered;
  const isRegistered =
    exam.isRegistered || exam.status === EXAM_STATUSES.REGISTERED;
  const canCancel = isRegistered && new Date(exam.examDate) > new Date();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-6">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {exam.examName}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{exam.className}</p>
                <div className="flex items-center space-x-2">
                  <FontAwesomeIcon
                    icon={faBookOpen}
                    className="text-gray-400 text-xs"
                  />
                  <span className="text-xs text-gray-500">
                    {exam.subject || "General"}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Date</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {formatDate(exam.examDate)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {exam.duration}m
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Time Left</div>
                  <div className="text-sm font-semibold text-orange-700">
                    {getTimeUntilExam(exam.examDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                exam.status
              )}`}
            >
              {exam.status}
            </span>

            {isRegistered && (
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 text-green-600">
                  <FontAwesomeIcon icon={faUserCheck} />
                  <span className="text-sm font-medium">Registered</span>
                </div>
                {canCancel && (
                  <button
                    onClick={() => onCancelRegistration(exam.id)}
                    disabled={registrationLoading}
                    className="text-xs text-red-600 hover:text-red-800 underline disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onViewDetails(exam)}
                className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faEye} />
                <span>Details</span>
              </button>

              {canRegister && (
                <button
                  onClick={() => onRegister(exam)}
                  disabled={registrationLoading}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  {registrationLoading ? (
                    <FontAwesomeIcon icon={faSpinner} spin />
                  ) : (
                    <FontAwesomeIcon icon={faUserPlus} />
                  )}
                  <span>Register</span>
                </button>
              )}

              {isRegistered && (
                <button
                  onClick={() => onView(exam.id)}
                  className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faPlay} />
                  <span>Take Exam</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
function StudentUpcomingExam() {
  // State
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useLocalStorage("upcomingExamSortBy", "date");
  const [sortOrder, setSortOrder] = useLocalStorage(
    "upcomingExamSortOrder",
    "asc"
  );
  const [viewMode, setViewMode] = useLocalStorage(
    "upcomingExamViewMode",
    VIEW_MODES.GRID
  );
  const [selectedExam, setSelectedExam] = useState(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // Hooks
  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Auth
  const token = localStorage.getItem("token");
  const studentId = localStorage.getItem("id");

  // Computed values
  const hasActiveFilters = useMemo(() => {
    return Boolean(debouncedSearchTerm || selectedClass || selectedStatus);
  }, [debouncedSearchTerm, selectedClass, selectedStatus]);

  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSearch =
        !debouncedSearchTerm ||
        exam.examName
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        exam.className
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

      const matchesClass = !selectedClass || exam.className === selectedClass;
      const matchesStatus = !selectedStatus || exam.status === selectedStatus;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [exams, debouncedSearchTerm, selectedClass, selectedStatus]);

  const sortedExams = useMemo(() => {
    const sorted = [...filteredExams].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.examName.toLowerCase();
          bValue = b.examName.toLowerCase();
          break;
        case "duration":
          aValue = a.duration || 0;
          bValue = b.duration || 0;
          break;
        case "date":
        default:
          aValue = new Date(a.examDate || a.createdAt);
          bValue = new Date(b.examDate || b.createdAt);
          break;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [filteredExams, sortBy, sortOrder]);

  // Enhanced fetch function to include registration status
  const fetchUpcomingExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ExamService.getUpcomingExamsByStudent(
        studentId,
        token
      );

      if (response.code === "00") {
        let exams = response.content || [];

        // Enhance exams with registration status
        const enhancedExams = await Promise.all(
          exams.map(async (exam) => {
            try {
              const registrationStatus =
                await ExamRegisterService.getExamRegistrationStatus(
                  studentId,
                  exam.id,
                  token
                );

              return {
                ...exam,
                isRegistered: registrationStatus.code === "00",
                registrationData: registrationStatus.content,
                status:
                  registrationStatus.code === "00"
                    ? EXAM_STATUSES.REGISTERED
                    : exam.status,
              };
            } catch (error) {
              // If registration check fails, assume not registered
              return {
                ...exam,
                isRegistered: false,
                registrationData: null,
              };
            }
          })
        );

        setExams(enhancedExams);
      } else {
        throw new Error(response.message || "Failed to fetch upcoming exams");
      }
    } catch (error) {
      console.error("Error fetching upcoming exams:", error);
      setError(error.message);
      toast.error("Failed to load upcoming exams");
    } finally {
      setLoading(false);
    }
  }, [studentId, token]);

  // Add a cancel registration handler
  const handleCancelRegistration = async (examId) => {
    try {
      setRegistrationLoading(true);

      const response = await ExamRegisterService.cancelExamRegistration(
        studentId,
        examId,
        token
      );

      if (response.code === "00") {
        toast.success("Registration cancelled successfully");
        await fetchUpcomingExams();
      } else {
        throw new Error(response.message || "Failed to cancel registration");
      }
    } catch (error) {
      console.error("Error cancelling registration:", error);

      let errorMessage = "Failed to cancel registration";

      if (error.message) {
        errorMessage = error.message;
      }

      // Handle backend error messages
      if (errorMessage.includes("not found")) {
        errorMessage = "Registration not found";
      } else if (errorMessage.includes("already started")) {
        errorMessage =
          "Cannot cancel registration for exams that have already started";
      }

      toast.error(errorMessage);
    } finally {
      setRegistrationLoading(false);
    }
  };

  const fetchClasses = useCallback(async () => {
    try {
      const response = await ClassService.getClassesByStudent(studentId, token);
      if (response.code === "00") {
        setClasses(response.content || []);
      } else {
        console.error("Failed to fetch classes:", response.message);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  }, [studentId, token]);

  // Effects
  useEffect(() => {
    if (!token || !studentId) {
      navigate("/login");
      return;
    }

    fetchUpcomingExams();
    fetchClasses();
  }, [token, studentId, navigate, fetchUpcomingExams, fetchClasses]);

  // Handlers
  const handleView = (examId) => {
    navigate(`/student/exam/${examId}`);
  };

  const handleViewDetails = (exam) => {
    setSelectedExam(exam);
    setShowRegistrationModal(true);
  };

  const handleRegister = async (examId, notes = null) => {
    try {
      setRegistrationLoading(true);

      // Call the registration service
      const response = await ExamRegisterService.registerForExam(
        studentId,
        examId,
        token,
        notes
      );

      // Handle response based on backend format
      if (response.code === "00") {
        toast.success("Successfully registered for exam!");
        setShowRegistrationModal(false);
        setSelectedExam(null);

        // Refresh the exams list to update registration status
        await fetchUpcomingExams();
      } else {
        throw new Error(response.message || "Failed to register for exam");
      }
    } catch (error) {
      console.error("Error registering for exam:", error);

      // Get error message from the caught error
      let errorMessage = "Failed to register for exam";

      // Extract message from error object
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      // Check for specific error patterns that might come through
      if (errorMessage.includes("Student not found")) {
        errorMessage = "Student account not found. Please contact support.";
      } else if (errorMessage.includes("Exam not found")) {
        errorMessage = "Exam not found. It may have been cancelled or removed.";
      } else if (errorMessage.includes("already registered")) {
        errorMessage = "You are already registered for this exam.";
      } else if (errorMessage.includes("past exams")) {
        errorMessage = "Cannot register for past exams.";
      } else if (errorMessage.includes("not enrolled")) {
        errorMessage = "You are not enrolled in the class for this exam.";
      } else if (errorMessage.includes("unexpected error occurred")) {
        errorMessage =
          "Registration failed. Please try again or contact support.";
      }

      toast.error(errorMessage);
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedClass("");
    setSelectedStatus("");
    setShowFilters(false);
  };

  const handleRetry = () => {
    fetchUpcomingExams();
    fetchClasses();
  };

  const handleCloseModal = () => {
    setShowRegistrationModal(false);
    setSelectedExam(null);
  };

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
                Upcoming Exams
              </h1>
              <p className="text-gray-600">
                View and register for upcoming exams in your classes
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
                    placeholder="Search upcoming exams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <FontAwesomeIcon
                        icon={faTimes}
                        className="text-gray-400 hover:text-gray-600"
                      />
                    </button>
                  )}
                </div>

                {/* Filter Toggle */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors duration-200 ${
                      showFilters
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    <FontAwesomeIcon icon={faFilter} />
                    <span>Filters</span>
                    {hasActiveFilters && (
                      <span className="bg-red-500 text-white text-xs rounded-full w-2 h-2"></span>
                    )}
                  </button>

                  {/* View Mode Toggle */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode(VIEW_MODES.GRID)}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        viewMode === VIEW_MODES.GRID
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <FontAwesomeIcon icon={faTh} />
                    </button>
                    <button
                      onClick={() => setViewMode(VIEW_MODES.LIST)}
                      className={`p-2 rounded-lg transition-colors duration-200 ${
                        viewMode === VIEW_MODES.LIST
                          ? "bg-blue-600 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <FontAwesomeIcon icon={faListUl} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Filters Panel */}
              {showFilters && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Class Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Class
                      </label>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Classes</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.className}>
                            {cls.className}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Statuses</option>
                        {Object.values(EXAM_STATUSES).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Sort Filter */}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {SORT_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Clear Filters Button */}
                  {hasActiveFilters && (
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={handleClearFilters}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                      >
                        <FontAwesomeIcon icon={faTimes} />
                        <span>Clear All Filters</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Showing {sortedExams.length} of {exams.length} exams
                {hasActiveFilters && " (filtered)"}
              </p>
            </div>

            {/* Content */}
            <div className="min-h-96">
              {loading ? (
                <LoadingSpinner />
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
                  {sortedExams.map((exam) =>
                    viewMode === VIEW_MODES.GRID ? (
                      <ExamCard
                        key={exam.id}
                        exam={exam}
                        onView={handleView}
                        onRegister={handleViewDetails}
                        onViewDetails={handleViewDetails}
                        onCancelRegistration={handleCancelRegistration}
                        registrationLoading={registrationLoading}
                      />
                    ) : (
                      <ExamListItem
                        key={exam.id}
                        exam={exam}
                        onView={handleView}
                        onRegister={handleViewDetails}
                        onViewDetails={handleViewDetails}
                        onCancelRegistration={handleCancelRegistration}
                        registrationLoading={registrationLoading}
                      />
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        exam={selectedExam}
        isOpen={showRegistrationModal}
        onClose={handleCloseModal}
        onRegister={handleRegister}
        isLoading={registrationLoading}
      />
    </div>
  );
}

export default StudentUpcomingExam;
