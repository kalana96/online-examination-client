import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faTimes,
  faEye,
  faSearch,
  faSpinner,
  faExclamationTriangle,
  faRefresh,
  faChartBar,
  faDownload,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "react-data-table-component";

// Components
import Header from "../../partials/Header";
import Sidebar from "../../partials/TeacherSidebar";
import ExamService from "../../service/ExamService";
import ClassService from "../../service/ClassService";

// Constants
const EXAM_STATUSES = {
  COMPLETED: "Completed",
  GRADED: "Graded",
  PUBLISHED: "Published",
};

// Custom hooks
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
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

// Action Buttons Component
const ActionButtons = ({ exam, onView, onViewResults, onDownloadReport }) => (
  <div className="flex items-center space-x-2">
    <button
      onClick={() => onView(exam.id)}
      className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
      title="View Exam"
    >
      <FontAwesomeIcon icon={faEye} />
      <span>View</span>
    </button>
    {/* <button
      onClick={() => onViewResults(exam.id)}
      className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
      title="View Results"
    >
      <FontAwesomeIcon icon={faChartBar} />
      <span>Results</span>
    </button> */}
    {/* <button
      onClick={() => onDownloadReport(exam.id)}
      className="px-2 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700 transition-colors"
      title="Download Report"
    >
      <FontAwesomeIcon icon={faDownload} />
    </button> */}
  </div>
);

// Main Component
function CompletedExam() {
  const [exams, setExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pending, setPending] = useState(false);

  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const token = localStorage.getItem("token");
  const teacherId = localStorage.getItem("id");

  const hasActiveFilters = Boolean(
    debouncedSearchTerm || selectedClass || selectedStatus
  );

  //filteredExams logic to handle the nested class data:
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      const matchesSearch =
        !debouncedSearchTerm ||
        exam.examName
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        (exam.clazz?.className || "")
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        (exam.clazz?.subjectName || "")
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

      const matchesClass =
        !selectedClass || exam.clazz?.className === selectedClass;
      const matchesStatus = !selectedStatus || exam.status === selectedStatus;

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [exams, debouncedSearchTerm, selectedClass, selectedStatus]);

  // DataTable columns configuration
  const columns = useMemo(
    () => [
      {
        name: "Exam Name",
        selector: (row) => row.examName,
        sortable: true,
        grow: 2,
        cell: (row) => (
          <div>
            <div className="font-semibold text-gray-900">{row.examName}</div>
            <div className="text-sm text-gray-600">{row.examType}</div>
          </div>
        ),
        // width: "200px",
      },
      {
        name: "Class Name",
        selector: (row) => row.clazz?.className || "N/A",
        sortable: true,
        cell: (row) => (
          <div>
            <div className="font-medium text-gray-900">
              {row.clazz?.className || "N/A"}
            </div>
            <div className="text-xs text-gray-500">
              {row.clazz?.gradeName || ""}
            </div>
          </div>
        ),
        width: "180px",
      },
      {
        name: "Subject",
        selector: (row) => row.clazz?.subjectName || "N/A",
        sortable: true,
        cell: (row) => (
          <div className="text-sm text-gray-700">
            {row.clazz?.subjectName || "N/A"}
          </div>
        ),
        width: "120px",
      },
      {
        name: "Attempts",
        selector: (row) => row.attemptCount || 0,
        sortable: true,
        cell: (row) => (
          <div className="text-center">
            <div className="font-semibold text-blue-600">
              {row.attemptCount || 0}
            </div>
            <div className="text-xs text-gray-500">attempts</div>
          </div>
        ),
        width: "120px",
      },
      {
        name: "Students",
        selector: (row) => row.registeredStudentCount || 0,
        sortable: true,
        cell: (row) => (
          <div className="text-center">
            <div className="font-semibold">
              {row.registeredStudentCount || 0}
            </div>
            <div className="text-xs text-gray-500">registered</div>
          </div>
        ),
        width: "120px",
      },
      // {
      //   name: "Duration",
      //   selector: (row) => row.duration,
      //   sortable: true,
      //   cell: (row) =>
      //     `${Math.floor(row.duration / 60)}h ${row.duration % 60}m`,
      //   width: "100px",
      // },
      {
        name: "Exam Date",
        selector: (row) => row.examDate,
        sortable: true,
        cell: (row) => (
          <div className="text-sm">
            {new Date(row.examDate).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        ),
        width: "150px",
      },
      {
        name: "Actions",
        cell: (row) => (
          <ActionButtons
            exam={row}
            onView={handleView}
            onViewResults={handleViewResults}
            onDownloadReport={handleDownloadReport}
          />
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        width: "200px",
      },
    ],
    []
  );

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#f8f9fa",
      },
    },
    headCells: {
      style: {
        fontWeight: "600",
        fontSize: "14px",
        color: "#374151",
      },
    },
    rows: {
      style: {
        minHeight: "60px",
        "&:hover": {
          backgroundColor: "#f8f9fa",
        },
      },
    },
  };

  const fetchExams = useCallback(async () => {
    try {
      setPending(true);
      setError(null);
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
      setPending(false);
    }
  }, [teacherId, token]);

  const fetchClasses = useCallback(async () => {
    try {
      const response = await ClassService.getClassesByTeacher(teacherId, token);
      if (response.code === "00") {
        setClasses(response.content || []);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  }, [teacherId, token]);

  useEffect(() => {
    if (!token || !teacherId) {
      navigate("/login");
      return;
    }
    fetchExams();
    fetchClasses();
  }, [token, teacherId, navigate, fetchExams, fetchClasses]);

  const handleView = (examId) => navigate(`/teacher/exam/${examId}`);
  const handleViewResults = (examId) =>
    navigate(`/teacher/exam-results/${examId}`);
  const handleDownloadReport = (examId) => {
    console.log("Downloading report for exam:", examId);
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

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Completed Exams
              </h1>
              <p className="text-gray-600">
                View and analyze your completed exams and student results
              </p>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <ErrorMessage message={error} onRetry={handleRetry} />
            ) : (
              <>
                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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

                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
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
                  </div>

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
                                {cls.className} - {cls.subjectName}
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
                      </div>
                      {hasActiveFilters && (
                        <div className="mt-4 flex justify-end">
                          <button
                            onClick={handleClearFilters}
                            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            <FontAwesomeIcon icon={faTimes} />
                            <span>Clear Filters</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    Showing {filteredExams.length} of {exams.length} completed
                    exams
                  </p>
                </div>

                {filteredExams.length === 0 ? (
                  <EmptyState
                    hasFilters={hasActiveFilters}
                    onClearFilters={handleClearFilters}
                  />
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <DataTable
                      columns={columns}
                      data={filteredExams}
                      progressPending={pending}
                      progressComponent={<LoadingSpinner />}
                      pagination
                      paginationPerPage={10}
                      paginationRowsPerPageOptions={[5, 10, 15, 20]}
                      highlightOnHover
                      pointerOnHover
                      responsive
                      customStyles={customStyles}
                      noDataComponent={
                        <EmptyState
                          hasFilters={hasActiveFilters}
                          onClearFilters={handleClearFilters}
                        />
                      }
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default CompletedExam;
