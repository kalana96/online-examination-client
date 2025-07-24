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
  faChartBar,
  faDownload,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";

// Components
import Header from "../partials/Header";
import Sidebar from "../partials/TeacherSidebar";
import ExamService from "../service/ExamService";
import ClassService from "../service/ClassService";

// Constants
const VIEW_MODES = {
  GRID: "grid",
  LIST: "list",
};

const EXAM_STATUSES = {
  COMPLETED: "Completed",
  GRADED: "Graded",
  PUBLISHED: "Published",
};

const SORT_OPTIONS = [
  { value: "date-desc", label: "Date (Newest First)" },
  { value: "date-asc", label: "Date (Oldest First)" },
  { value: "name-asc", label: "Name (A-Z)" },
  { value: "name-desc", label: "Name (Z-A)" },
  { value: "students-desc", label: "Students (Most First)" },
  { value: "students-asc", label: "Students (Least First)" },
];

// Custom hooks
const useLocalStorage = (key, defaultValue) => {
  const [value, setValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
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
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Components
const LoadingSpinner = ({ size = "md" }) => (
  <div className="flex items-center justify-center py-12">
    <FontAwesomeIcon
      icon={faSpinner}
      spin
      className={`text-blue-500 ${
        size === "lg" ? "text-4xl" : size === "sm" ? "text-lg" : "text-2xl"
      }`}
    />
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
      icon={faCheckCircle}
      className="text-gray-400 text-4xl mb-4"
    />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {hasFilters ? "No Exams Found" : "No Completed Exams"}
    </h3>
    <p className="text-gray-600 mb-4">
      {hasFilters
        ? "Try adjusting your filters to see more results."
        : "You haven't completed any exams yet. Once students finish taking your exams, they'll appear here."}
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

const ExamCard = ({ exam, index, onView, onViewResults, onDownloadReport }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case EXAM_STATUSES.COMPLETED:
        return "bg-green-100 text-green-800";
      case EXAM_STATUSES.GRADED:
        return "bg-blue-100 text-blue-800";
      case EXAM_STATUSES.PUBLISHED:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {exam.examName}
            </h3>
            <p className="text-sm text-gray-600">{exam.className}</p>
          </div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
              exam.status
            )}`}
          >
            {exam.status}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faUsers} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {exam.studentsCompleted || 0} students
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FontAwesomeIcon icon={faClock} className="text-gray-400" />
            <span className="text-sm text-gray-600">
              {exam.duration} minutes
            </span>
          </div>
        </div>

        {/* Completion Date */}
        <div className="flex items-center space-x-2 mb-4">
          <FontAwesomeIcon icon={faCalendarAlt} className="text-gray-400" />
          <span className="text-sm text-gray-600">
            Completed: {formatDate(exam.completedAt)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Completion Rate</span>
            <span className="text-sm font-medium text-gray-900">
              {Math.round((exam.studentsCompleted / exam.totalStudents) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.round(
                  (exam.studentsCompleted / exam.totalStudents) * 100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onView(exam.id)}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faEye} />
            <span>View Exam</span>
          </button>
          <button
            onClick={() => onViewResults(exam.id)}
            className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faChartBar} />
            <span>Results</span>
          </button>
          <button
            onClick={() => onDownloadReport(exam.id)}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            <FontAwesomeIcon icon={faDownload} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ExamListItem = ({
  exam,
  index,
  onView,
  onViewResults,
  onDownloadReport,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case EXAM_STATUSES.COMPLETED:
        return "bg-green-100 text-green-800";
      case EXAM_STATUSES.GRADED:
        return "bg-blue-100 text-blue-800";
      case EXAM_STATUSES.PUBLISHED:
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {exam.examName}
                </h3>
                <p className="text-sm text-gray-600">{exam.className}</p>
              </div>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-sm text-gray-500">Students</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {exam.studentsCompleted || 0}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Duration</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {exam.duration}m
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Completed</div>
                  <div className="text-sm font-medium text-gray-900">
                    {formatDate(exam.completedAt)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500">Completion Rate</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {Math.round(
                      (exam.studentsCompleted / exam.totalStudents) * 100
                    )}
                    %
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
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onView(exam.id)}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faEye} />
                <span>View</span>
              </button>
              <button
                onClick={() => onViewResults(exam.id)}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faChartBar} />
                <span>Results</span>
              </button>
              <button
                onClick={() => onDownloadReport(exam.id)}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faDownload} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
function CompletedExam() {
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
        case "students":
          aValue = a.studentsCompleted || 0;
          bValue = b.studentsCompleted || 0;
          break;
        case "date":
        default:
          aValue = new Date(a.completedAt || a.createdAt);
          bValue = new Date(b.completedAt || b.createdAt);
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

  // Fetch functions
  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Modified to fetch completed exams instead of published exams
      const response = await ExamService.getCompletdeExamsByTeacher(
        teacherId,
        token
      );

      if (response.code === "00") {
        setExams(response.content || []);
      } else {
        throw new Error(response.message || "Failed to fetch completed exams");
      }
    } catch (error) {
      console.error("Error fetching completed exams:", error);
      setError(error.message);
      toast.error("Failed to load completed exams");
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

  const handleViewResults = (examId) => {
    navigate(`/teacher/exam-results/${examId}`);
  };

  const handleDownloadReport = (examId) => {
    console.log("Downloading report for exam:", examId);
    // Implement download report logic here
    toast.info("Report download started");
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedClass("");
    setSelectedStatus("");
    setShowFilters(false);
  };

  const handleRetry = () => {
    fetchExams();
    fetchClasses();
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
                Completed Exams
              </h1>
              <p className="text-gray-600">
                View and analyze your completed exams and student results
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
                    placeholder="Search completed exams..."
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">All Statuses</option>
                        {Object.values(EXAM_STATUSES).map((status) => (
                          <option key={status} value={status}>
                            {status}
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
                Showing {sortedExams.length} of {exams.length} completed exams
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
                      onViewResults={handleViewResults}
                      onDownloadReport={handleDownloadReport}
                    />
                  ) : (
                    <ExamListItem
                      key={exam.id}
                      exam={exam}
                      index={index}
                      onView={handleView}
                      onViewResults={handleViewResults}
                      onDownloadReport={handleDownloadReport}
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

export default CompletedExam;
