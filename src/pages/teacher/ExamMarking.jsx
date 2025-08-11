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
  faEdit,
  faUser,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import DataTable from "react-data-table-component";

// Components
import Header from "../../partials/Header";
import Sidebar from "../../partials/TeacherSidebar";
import ExamService from "../../service/ExamService";
import ExamAttemptService from "../../service/ExamAttemptService";

// Constants
const MARKING_STATUSES = {
  ALL: "All",
  MARKED: "Fully Marked",
  UNMARKED: "Has Unmarked",
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

// Helper function to determine marking status
const getMarkingStatus = (attempt) => {
  if (!attempt.studentAnswers || attempt.studentAnswers.length === 0) {
    return "UNMARKED";
  }

  const unmarkedCount = attempt.studentAnswers.filter(
    (answer) => !answer.isMarked
  ).length;
  return unmarkedCount === 0 ? "MARKED" : "UNMARKED";
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
      Error Loading Data
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

const EmptyState = ({ hasFilters, onClearFilters, message }) => (
  <div className="text-center py-12">
    <FontAwesomeIcon
      icon={faCheckCircle}
      className="text-gray-400 text-4xl mb-4"
    />
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {hasFilters ? "No Attempts Found" : "No Exam Attempts"}
    </h3>
    <p className="text-gray-600 mb-4">
      {message ||
        (hasFilters
          ? "Try adjusting your filters to see more results."
          : "Select a completed exam to view student attempts.")}
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

// Main Component
function ExamMarking() {
  const [completedExams, setCompletedExams] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedMarkingStatus, setSelectedMarkingStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [pending, setPending] = useState(false);

  const navigate = useNavigate();
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const token = localStorage.getItem("token");
  const teacherId = localStorage.getItem("id");

  const hasActiveFilters = Boolean(
    debouncedSearchTerm || selectedExam || selectedMarkingStatus
  );

  // Filter attempts based on search and status
  const filteredAttempts = useMemo(() => {
    return attempts.filter((attempt) => {
      const matchesSearch =
        !debouncedSearchTerm ||
        attempt.studentFullName
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

      // Fixed marking status filter logic
      const matchesMarkingStatus = (() => {
        if (!selectedMarkingStatus || selectedMarkingStatus === "ALL") {
          return true;
        }

        const markingStatus = getMarkingStatus(attempt);
        return selectedMarkingStatus === markingStatus;
      })();

      return matchesSearch && matchesMarkingStatus;
    });
  }, [attempts, debouncedSearchTerm, selectedMarkingStatus]);

  // Handle functions (moved before columns definition)
  const handleMarkAttempt = (id) => {
    navigate(`/teacher/mark-attempt/${id}`);
  };

  const handleViewAttempt = (id) => {
    navigate(`/teacher/view-attempt/${id}`);
  };

  // DataTable columns configuration for attempts
  const columns = useMemo(
    () => [
      {
        name: "Student",
        selector: (row) => row.studentFullName,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center space-x-1 font-medium text-gray-900">
            <FontAwesomeIcon icon={faUser} className="text-gray-400 text-xs" />
            <span>{row.studentFullName}</span>
          </div>
        ),
        // width: "200px",
      },
      {
        name: "Score",
        selector: (row) => row.score || 0,
        sortable: true,
        cell: (row) => (
          <div className="text-center">
            <span className="font-semibold">
              {row.score ? row.score.toFixed(1) : "0.0"}/{row.totalMarks}
            </span>
            <span className="text-xs text-gray-500 ml-1">
              ({row.percentage ? row.percentage.toFixed(1) : "0"}%)
            </span>
          </div>
        ),
        width: "140px",
      },
      {
        name: "Duration",
        selector: (row) => row.durationMinutes,
        sortable: true,
        cell: (row) => (
          <div className="flex items-center space-x-1 text-sm">
            <FontAwesomeIcon icon={faClock} className="text-gray-400 text-xs" />
            <span>
              {Math.floor(row.durationMinutes / 60)}h {row.durationMinutes % 60}
              m
            </span>
          </div>
        ),
        width: "130px",
      },
      {
        name: "Start Time",
        selector: (row) => row.startTime,
        sortable: true,
        cell: (row) => (
          <div className="text-sm text-gray-700">
            {new Date(row.startTime).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        ),
        width: "160px",
      },
      {
        name: "Submit Time",
        selector: (row) => row.submittedAt,
        sortable: true,
        cell: (row) => (
          <div className="text-sm text-gray-700">
            {row.submittedAt ? (
              new Date(row.submittedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })
            ) : (
              <span className="text-gray-400 italic">Not submitted</span>
            )}
          </div>
        ),
        width: "160px",
      },
      // {
      //   name: "Status",
      //   selector: (row) => row.status,
      //   sortable: true,
      //   cell: (row) => (
      //     <span
      //       className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
      //         row.status === "SUBMITTED"
      //           ? "bg-green-100 text-green-800"
      //           : row.status === "IN_PROGRESS"
      //           ? "bg-yellow-100 text-yellow-800"
      //           : "bg-gray-100 text-gray-800"
      //       }`}
      //     >
      //       {row.status}
      //     </span>
      //   ),
      //   width: "150px",
      // },
      {
        name: "Unmarked",
        selector: (row) =>
          row.studentAnswers?.filter((answer) => !answer.isMarked).length || 0,
        sortable: true,
        cell: (row) => {
          const unmarkedCount =
            row.studentAnswers?.filter((answer) => !answer.isMarked).length ||
            0;
          const totalAnswers = row.studentAnswers?.length || 0;
          return (
            <div className="text-center">
              <span
                className={`font-semibold ${
                  unmarkedCount > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {unmarkedCount}
              </span>
              <span className="text-xs text-gray-500">/{totalAnswers}</span>
            </div>
          );
        },
        width: "150px",
      },
      {
        name: "Actions",
        cell: (row) => (
          <div className="flex items-center space-x-1">
            {/* <button
              onClick={() => handleViewAttempt(row.id)}
              className="flex items-center space-x-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
              title="View Attempt"
            >
              <FontAwesomeIcon icon={faEye} className="text-xs" />
              <span>View</span>
            </button> */}
            <button
              onClick={() => handleMarkAttempt(row.id)}
              className="flex items-center space-x-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
              title="Mark Attempt"
            >
              <FontAwesomeIcon icon={faEdit} className="text-xs" />
              <span>Mark</span>
            </button>
          </div>
        ),
        ignoreRowClick: true,
        allowOverflow: true,
        button: true,
        width: "140px",
      },
    ],
    [handleMarkAttempt, handleViewAttempt]
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
        paddingLeft: "8px",
        paddingRight: "8px",
      },
    },
    rows: {
      style: {
        minHeight: "45px",
        fontSize: "14px",
        "&:hover": {
          backgroundColor: "#f8f9fa",
        },
      },
    },
    cells: {
      style: {
        paddingLeft: "8px",
        paddingRight: "8px",
      },
    },
  };

  // Fetch completed exams
  const fetchCompletedExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ExamService.getCompletdeExamsByTeacher(
        teacherId,
        token
      );

      if (response.code === "00") {
        setCompletedExams(response.content || []);
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

  //Fetch exam attempts by exam ID
  const fetchExamAttempts = useCallback(async (examId) => {
    try {
      setAttemptsLoading(true);
      setPending(true);
      const response = await ExamAttemptService.getExamAttemptsByExamId(examId);

      setAttempts(response.content || []);
    } catch (error) {
      console.error("Error fetching exam attempts:", error);
      toast.error("Failed to load exam attempts");
      setAttempts([]);
    } finally {
      setAttemptsLoading(false);
      setPending(false);
    }
  }, []);

  useEffect(() => {
    if (!token || !teacherId) {
      navigate("/login");
      return;
    }
    fetchCompletedExams();
  }, [token, teacherId, navigate, fetchCompletedExams]);

  useEffect(() => {
    if (selectedExam) {
      fetchExamAttempts(selectedExam);
    } else {
      setAttempts([]);
    }
  }, [selectedExam, fetchExamAttempts]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedMarkingStatus("");
    setShowFilters(false);
  };

  const handleRetry = () => {
    fetchCompletedExams();
    if (selectedExam) {
      fetchExamAttempts(selectedExam);
    }
  };

  const selectedExamDetails = completedExams.find(
    (exam) => exam.id.toString() === selectedExam
  );

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Exam Marking
              </h1>
              <p className="text-gray-600">
                Mark and review student exam attempts
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
                        placeholder="Search by student name..."
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
                            [
                              debouncedSearchTerm,
                              selectedExam,
                              selectedMarkingStatus,
                            ].filter(Boolean).length
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
                            Completed Exam
                          </label>
                          <select
                            value={selectedExam}
                            onChange={(e) => setSelectedExam(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select an exam</option>
                            {completedExams.map((exam) => (
                              <option key={exam.id} value={exam.id}>
                                {exam.examName} - {exam.clazz?.className}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Marking Status
                          </label>
                          <select
                            value={selectedMarkingStatus}
                            onChange={(e) =>
                              setSelectedMarkingStatus(e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">All Attempts</option>
                            <option value="MARKED">Fully Marked</option>
                            <option value="UNMARKED">
                              Has Unmarked Questions
                            </option>
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

                {/* Selected Exam Info */}
                {selectedExamDetails && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Selected Exam: {selectedExamDetails.examName}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                      <div>
                        <span className="font-medium">Class:</span>{" "}
                        {selectedExamDetails.clazz?.className}
                      </div>
                      <div>
                        <span className="font-medium">Subject:</span>{" "}
                        {selectedExamDetails.clazz?.subjectName}
                      </div>
                      <div>
                        <span className="font-medium">Total Attempts:</span>{" "}
                        {selectedExamDetails.attemptCount || 0}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    {selectedExam
                      ? `Showing ${filteredAttempts.length} of ${attempts.length} attempts`
                      : `Select an exam to view attempts`}
                  </p>
                </div>

                {!selectedExam ? (
                  <EmptyState
                    hasFilters={false}
                    onClearFilters={handleClearFilters}
                    message="Please select a completed exam from the filter above to view student attempts."
                  />
                ) : attemptsLoading ? (
                  <LoadingSpinner />
                ) : filteredAttempts.length === 0 ? (
                  <EmptyState
                    hasFilters={hasActiveFilters}
                    onClearFilters={handleClearFilters}
                    message={
                      attempts.length === 0
                        ? "No attempts found for this exam."
                        : undefined
                    }
                  />
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <DataTable
                      columns={columns}
                      data={filteredAttempts}
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

export default ExamMarking;
