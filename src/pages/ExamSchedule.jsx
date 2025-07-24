import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Header from "../partials/Header";
import Sidebar from "../partials/TeacherSidebar";
import { useNavigate } from "react-router-dom";
import ExamService from "../service/ExamService";
import QuestionService from "../service/QuestionService";
import ClassService from "../service/ClassService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faPlus,
  faFilter,
  faTimes,
  faTrashAlt,
  faCalendarAlt,
  faClock,
  faToggleOn,
  faToggleOff,
  faQuestionCircle,
  faListOl,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function ExamSchedule() {
  // State to hold the list of exams
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examQuestionCounts, setExamQuestionCounts] = useState({});

  // Filter states
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");
  const teacherId = localStorage.getItem("id");

  // Custom styles for the data table

  const customStyles = {
    header: {
      style: {
        minHeight: "56px",
        backgroundColor: "#f8fafc",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#e5e7eb",
        color: "#374151",
        fontSize: "14px",
        fontWeight: "600",
      },
    },
    headCells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
    cells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
        fontSize: "14px",
      },
    },
    rows: {
      style: {
        minHeight: "60px",
        "&:hover": {
          backgroundColor: "#f9fafb",
        },
      },
    },
    pagination: {
      style: {
        backgroundColor: "#f8fafc",
        borderTop: "1px solid #e5e7eb",
      },
    },
  };

  // Column definitions for the data table
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "60px",
      cell: (row, index) => (
        <div className="text-center w-full">{index + 1}</div>
      ),
    },
    {
      name: "Exam Name",
      selector: (row) => row.examName,
      sortable: true,
      width: "150px",
      cell: (row) => (
        <div className="font-medium text-gray-800">{row.examName}</div>
      ),
    },
    {
      name: "Class",
      selector: (row) => row.clazz?.className || "N/A",
      sortable: true,
      width: "130px",
      cell: (row) => (
        <div className="text-gray-600">{row.clazz?.className || "N/A"}</div>
      ),
    },
    {
      name: "Exam Type",
      selector: (row) => row.examType,
      sortable: true,
      width: "130px",
      cell: (row) => (
        <div className="text-gray-600">{row.examType || "N/A"}</div>
      ),
    },
    {
      name: "Date",
      selector: (row) => row.examDate,
      sortable: true,
      width: "150px",
      cell: (row) => (
        <div className="text-gray-600 flex items-center">
          <FontAwesomeIcon
            icon={faCalendarAlt}
            className="mr-2 text-blue-500"
          />
          {formatDate(row.examDate)}
        </div>
      ),
    },
    {
      name: "Start Time",
      selector: (row) => row.startTime,
      sortable: true,
      width: "140px",
      cell: (row) => (
        <div className="text-gray-600 flex items-center">
          <FontAwesomeIcon icon={faClock} className="mr-2 text-green-500" />
          {formatTime(row.startTime)}
        </div>
      ),
    },
    {
      name: "Questions",
      selector: (row) => examQuestionCounts[row.id] || 0,
      sortable: true,
      width: "120px",
      cell: (row) => {
        const questionCount = examQuestionCounts[row.id] || 0;
        return (
          <div className="text-center flex items-center justify-center">
            <FontAwesomeIcon icon={faListOl} className="mr-2 text-purple-500" />
            <span
              className={`font-medium ${
                questionCount === 0 ? "text-red-600" : "text-gray-800"
              }`}
            >
              {questionCount}
            </span>
          </div>
        );
      },
    },
    {
      name: "Published",
      selector: (row) => row.published,
      sortable: true,
      width: "140px",
      cell: (row) => (
        <div className="flex justify-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              row.published
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {row.published ? "Published" : "Draft"}
          </span>
        </div>
      ),
    },
    {
      name: "Actions",
      ignoreRowClick: true,
      width: "200px",
      cell: (row) => {
        const questionCount = examQuestionCounts[row.id] || 0;
        const canPublish = questionCount > 0;

        return (
          <div className="flex space-x-2">
            <button
              className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50 transition-colors duration-200"
              onClick={() => handleAddQuestions(row.id)}
              title="Add Questions"
            >
              <FontAwesomeIcon icon={faQuestionCircle} />
            </button>
            <button
              className={`p-1 rounded transition-colors duration-200 ${
                row.published
                  ? "text-orange-600 hover:text-orange-900 hover:bg-orange-50"
                  : canPublish
                  ? "text-green-600 hover:text-green-900 hover:bg-green-50"
                  : "text-gray-400 cursor-not-allowed"
              }`}
              onClick={() =>
                canPublish && togglePublishStatus(row.id, row.published)
              }
              title={
                row.published
                  ? "Unpublish Exam"
                  : canPublish
                  ? "Publish Exam"
                  : "Cannot publish exam without questions"
              }
              disabled={!canPublish && !row.published}
            >
              <FontAwesomeIcon
                icon={row.published ? faToggleOn : faToggleOff}
                size="lg"
              />
            </button>
            <button
              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-200"
              onClick={() => handleEdit(row.id)}
              title="Edit Exam"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-200"
              onClick={() => deleteExam(row.id)}
              title="Delete Exam"
            >
              <FontAwesomeIcon icon={faTrashAlt} />
            </button>
          </div>
        );
      },
    },
  ];

  // Fetch all exams and classes on component mount
  useEffect(() => {
    fetchExams();
    fetchClasses();
  }, [teacherId]);

  // Apply filters when exams or filter values change
  useEffect(() => {
    applyFilters();
  }, [exams, selectedClass, selectedStatus]);

  // Fetch question counts when exams change
  useEffect(() => {
    if (exams.length > 0) {
      fetchQuestionCounts();
    }
  }, [exams]);

  // Function to fetch question counts for all exams
  const fetchQuestionCounts = async () => {
    try {
      const questionCounts = {};

      // Fetch question count for each exam
      for (const exam of exams) {
        try {
          const response = await QuestionService.getQuestionsByExam(
            exam.id,
            token
          );
          if (response && response.data) {
            questionCounts[exam.id] = response.data.content?.length || 0;
          } else {
            questionCounts[exam.id] = 0;
          }
        } catch (error) {
          console.error(`Error fetching questions for exam ${exam.id}:`, error);
          questionCounts[exam.id] = 0;
        }
      }

      setExamQuestionCounts(questionCounts);
    } catch (error) {
      console.error("Error fetching question counts:", error);
    }
  };

  // Function to fetch all exams using ExamService
  const fetchExams = async () => {
    setLoading(true);
    try {
      const response = await ExamService.getExamsByTeacher(teacherId, token);
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

  // Function to toggle publish status
  const togglePublishStatus = async (examId, currentStatus) => {
    const questionCount = examQuestionCounts[examId] || 0;

    // Check if exam has questions when trying to publish
    if (!currentStatus && questionCount === 0) {
      toast.error(
        "Cannot publish exam without questions. Please add questions first."
      );
      return;
    }

    const action = currentStatus ? "unpublish" : "publish";
    const confirmMessage = `Are you sure you want to ${action} this exam?`;

    if (window.confirm(confirmMessage)) {
      try {
        setLoading(true);

        // Check if exam can be published (only when trying to publish)
        if (!currentStatus) {
          const canPublishResponse = await ExamService.canPublishExam(
            examId,
            token
          );
          if (canPublishResponse.code === "00" && !canPublishResponse.content) {
            toast.error(
              "This exam cannot be published. Please ensure all required fields are filled and the exam date is not in the past."
            );
            setLoading(false);
            return;
          }
        }

        const response = await ExamService.updateExamPublishStatus(
          examId,
          !currentStatus,
          token
        );

        if (response.code === "00") {
          toast.success(`Exam ${action}ed successfully`);
          fetchExams(); // Refresh the list after update
        } else {
          console.error(`Failed to ${action} exam`, response.message);
          toast.error(response.message || `Failed to ${action} exam`);
        }
      } catch (error) {
        console.error(`Error ${action}ing exam:`, error);
        toast.error(`Error ${action}ing exam`);
      } finally {
        setLoading(false);
      }
    }
  };

  // Function to apply filters
  const applyFilters = () => {
    let filtered = [...exams];

    // Filter by class
    if (selectedClass) {
      filtered = filtered.filter(
        (exam) => exam.clazz?.className === selectedClass
      );
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter((exam) => {
        if (selectedStatus === "published") {
          return exam.isPublished === true;
        } else if (selectedStatus === "draft") {
          return exam.isPublished === false;
        }
        return true;
      });
    }

    setFilteredExams(filtered);
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSelectedClass("");
    setSelectedStatus("");
  };

  // Function to handle creating a new exam
  const handleAddExam = () => {
    navigate("/teacher/examCreate");
  };

  // Function to open the Edit Form and set the selected exam
  const handleEdit = (examId) => {
    navigate(`/teacher/editExam/${examId}`);
  };

  // Function to handle adding questions to an exam
  const handleAddQuestions = (examId) => {
    navigate(`/teacher/examQuestion/${examId}`);
  };

  // Function to delete an exam with confirmation
  const deleteExam = async (examId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this exam? This action cannot be undone."
    );
    if (confirmDelete) {
      try {
        setLoading(true);
        const response = await ExamService.deleteExam(examId, token);
        if (response.code === "00") {
          toast.success(response.message || "Exam deleted successfully");
          fetchExams(); // Refresh the list after deletion
        } else {
          console.error("Failed to delete exam", response.message);
          toast.error(response.message || "Failed to delete exam");
        }
      } catch (error) {
        console.error("Error deleting exam:", error);
        toast.error("Error deleting exam");
      } finally {
        setLoading(false);
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
      // Handle both "HH:mm" and "HH:mm:ss" formats
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

  // Custom no data component
  const NoDataComponent = () => (
    <div className="text-center py-8 text-gray-500">
      {exams.length === 0
        ? "No exams found. Click 'Schedule New Exam' to create your first exam."
        : "No exams match the selected filters."}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
        <Header />
        <main className="grow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Exam Schedule</h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-200"
              onClick={handleAddExam}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Schedule New Exam
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-200"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            {(selectedClass || selectedStatus) && (
              <button
                className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-200"
                onClick={clearFilters}
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Filter Section */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Class Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Class
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Classes</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.className}>
                        {classItem.className}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="mb-4">
            <p className="text-gray-600">
              Showing {filteredExams.length} of {exams.length} exams
              {(selectedClass || selectedStatus) && (
                <span className="ml-2 text-blue-600">(Filtered)</span>
              )}
            </p>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredExams}
              progressPending={loading}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
              highlightOnHover
              pointerOnHover
              responsive
              customStyles={customStyles}
              noDataComponent={<NoDataComponent />}
              paginationComponentOptions={{
                rowsPerPageText: "Rows per page:",
                rangeSeparatorText: "of",
                selectAllRowsItem: true,
                selectAllRowsItemText: "All",
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default ExamSchedule;
