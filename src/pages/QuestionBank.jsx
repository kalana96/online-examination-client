import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Header from "../partials/Header";
import Sidebar from "../partials/TeacherSidebar";
import { useNavigate } from "react-router-dom";
import QuestionBankService from "../service/QuestionBankService";
import ClassService from "../service/ClassService";
import SubjectService from "../service/SubjectService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faEye,
  faSearch,
  faFilter,
  faTimes,
  faGraduationCap,
  faBookOpen,
  faQuestionCircle,
  faChevronDown,
  faUpload,
  faDownload,
  faCopy,
  faMinus,
  faEyeSlash,
  faFileExport,
  faSpinner,
  faCheck,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function QuestionBank() {
  const navigate = useNavigate();

  // State management
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClass, setSelectedClass] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    class: "",
    subject: "",
    difficulty: "",
    type: "",
  });
  const teacherId = localStorage.getItem("id");

  // Form states
  const [formData, setFormData] = useState({
    questionText: "",
    type: "multiple_choice",
    difficulty: "medium",
    classId: "",
    subjectId: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    marks: 1,
    // examId: null, // Will be set based on selected exam
  });

  // Auth token - get from localStorage or context
  const getAuthToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  // Get teacher ID from localStorage or context
  const getTeacherId = () => {
    const user = JSON.parse(
      localStorage.getItem("id") || sessionStorage.getItem("id") || "{}"
    );
    return user.id || user.id;
  };

  // Load data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Apply filters and search
  useEffect(() => {
    applyFilters();
  }, [questions, searchTerm, filters]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([loadQuestions(), loadClasses(), loadSubjects()]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // If question type changes, reset options and correct answer
    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        type: value,
        options: value === "multiple_choice" ? ["", "", "", ""] : [],
        correctAnswer: "",
      }));
    }

    // Clear specific field error when user starts typing
    // if (formErrors[name]) {
    //   setFormErrors((prev) => ({
    //     ...prev,
    //     [name]: "",
    //   }));
    // }
  };

  // Handle option change for multiple choice questions
  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;

    setFormData((prev) => ({
      ...prev,
      options: newOptions,
    }));

    // If the correct answer was this option and it's now empty, clear correct answer
    if (formData.correctAnswer === formData.options[index] && value === "") {
      setFormData((prev) => ({
        ...prev,
        correctAnswer: "",
      }));
    }
  };

  const loadQuestions = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error("Authentication required");
        navigate("/login");
        return;
      }

      // This endpoint might need to be created in your backend
      const response = await QuestionBankService.getQuestionsByTeacher(
        teacherId,
        token
      );

      if (response && response.data) {
        const { code, message, content } = response.data;

        switch (code) {
          case "SUCCESS":
            console.log("Questions loaded successfully:", content);
            // Make sure content is an array
            const questionsArray = Array.isArray(content) ? content : [];
            setQuestions(questionsArray);
            // toast.success(message || "Questions fetched successfully!");
            break;

          default:
            console.error("Unexpected response code:", code);
            toast.error(message || "Failed to load questions");
            setQuestions([]);
            break;
        }
      } else {
        console.error("Invalid response structure:", response);
        toast.error("Invalid response from server");
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Failed to load questions");
      // Fallback to empty array if API fails
      setQuestions([]);
    }
  };

  const loadClasses = async () => {
    try {
      const token = getAuthToken();
      const id = localStorage.getItem("id");

      const response = await ClassService.getClasses(id, token);

      if (response && response.content) {
        setClasses(response.content);
      } else {
        console.error("Failed to load classes:", response.message);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
      toast.error("Failed to load classes");
    }
  };

  const loadSubjects = async () => {
    try {
      const token = getAuthToken();
      const id = localStorage.getItem("id");

      const response = await SubjectService.getAllSubjectByTeacher(token);

      if (response && response.content) {
        setSubjects(response.content);
      } else {
        console.error("Failed to load subjects:", response.message);
      }
    } catch (error) {
      console.error("Error loading subjects:", error);
      toast.error("Failed to load subjects");
    }
  };

  const applyFilters = () => {
    let filtered = [...questions];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (q) =>
          q.questionText?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.question?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          q.className?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply other filters
    if (filters.class) {
      filtered = filtered.filter((q) => q.className === filters.class);
    }
    if (filters.subject) {
      filtered = filtered.filter((q) => q.subjectName === filters.subject);
    }
    if (filters.difficulty) {
      filtered = filtered.filter(
        (q) => q.difficulty?.toLowerCase() === filters.difficulty.toLowerCase()
      );
    }
    if (filters.type) {
      filtered = filtered.filter(
        (q) => q.questionType?.toLowerCase() === filters.type.toLowerCase()
      );
    }

    setFilteredQuestions(filtered);
  };

  const handleAddQuestion = () => {
    setFormData({
      questionText: "",
      type: "multiple_choice",
      difficulty: "medium",
      classId: "",
      subjectId: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      marks: 1,
    });
    setShowAddModal(true);
  };

  const handleEditQuestion = async (question) => {
    try {
      setSelectedQuestion(question);
      setLoading(true);

      // Fetch the complete question details if needed
      const token = getAuthToken();

      const response = await QuestionBankService.getQuestionById(
        question.id,
        token
      );

      let completeQuestion = question;

      // Check if API response is successful and has content
      if (response && response.code === "SUCCESS" && response.content) {
        completeQuestion = response.content;
        console.log("Fetched complete question:", completeQuestion);
      } else {
        console.warn(
          "API response not successful or no content, using original question data"
        );
      }

      // Find the corresponding class and subject IDs
      const selectedClass = classes.find(
        (cls) => cls.className === completeQuestion.className
      );
      const selectedSubject = subjects.find(
        (sub) => sub.subjectName === completeQuestion.subjectName
      );

      // Normalize question type - handle both API response formats
      const questionType = (
        completeQuestion.questionType ||
        completeQuestion.type ||
        "MULTIPLE_CHOICE"
      )
        .toString()
        .toLowerCase();

      // Normalize correct answer for true/false questions
      let normalizedCorrectAnswer = completeQuestion.correctAnswer || "";
      if (questionType === "true_false") {
        const lowerAnswer = normalizedCorrectAnswer.toLowerCase();
        if (lowerAnswer === "true" || lowerAnswer === "1") {
          normalizedCorrectAnswer = "True";
        } else if (lowerAnswer === "false" || lowerAnswer === "0") {
          normalizedCorrectAnswer = "False";
        }
      }

      // Set form data with proper field mapping
      setFormData({
        questionText:
          completeQuestion.questionText || completeQuestion.question || "",
        type: questionType,
        difficulty: (completeQuestion.difficulty || "MEDIUM").toLowerCase(),
        classId: selectedClass?.id || completeQuestion.classId || "",
        subjectId: selectedSubject?.id || completeQuestion.subjectId || "",
        options:
          completeQuestion.options ||
          (questionType === "multiple_choice" ? ["", "", "", ""] : []),
        correctAnswer: completeQuestion.correctAnswer || "",
        explanation: completeQuestion.explanation || "",
        marks: completeQuestion.marks || 1,
      });

      console.log("Form data set:", {
        questionText:
          completeQuestion.questionText || completeQuestion.question || "",
        type: questionType,
        difficulty: (completeQuestion.difficulty || "MEDIUM").toLowerCase(),
        classId: selectedClass?.id || completeQuestion.classId || "",
        subjectId: selectedSubject?.id || completeQuestion.subjectId || "",
        options:
          completeQuestion.options ||
          (questionType === "multiple_choice" ? ["", "", "", ""] : []),
        correctAnswer: completeQuestion.correctAnswer || "",
        explanation: completeQuestion.explanation || "",
        marks: completeQuestion.marks || 1,
      });

      setShowEditModal(true);
    } catch (error) {
      console.error("Error loading question for edit:", error);
      toast.error("Failed to load question details");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = (question) => {
    setSelectedQuestion(question);
    setShowDeleteModal(true);
  };

  const handleViewQuestion = (question) => {
    setSelectedQuestion(question);
    setShowViewModal(true);
  };

  const handleDuplicateQuestion = async (question) => {
    try {
      const token = getAuthToken();
      const response = await QuestionBankService.duplicateQuestion(
        question.id,
        token
      );

      if (response && response.data) {
        toast.success("Question duplicated successfully!");
        loadQuestions(); // Reload questions
      } else {
        throw new Error(response.message || "Failed to duplicate question");
      }
    } catch (error) {
      console.error("Error duplicating question:", error);
      toast.error("Failed to duplicate question");
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      questionText: "",
      type: "multiple_choice",
      difficulty: "medium",
      classId: "",
      subjectId: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      marks: 1,
    });
    setSelectedQuestion(null);
  };

  const submitForm = async (e) => {
    e.preventDefault();
    try {
      const token = getAuthToken();
      const teacherId = localStorage.getItem("id");

      // Validate required fields
      if (!formData.questionText || !formData.classId || !formData.subjectId) {
        toast.error("Please fill in all required fields");
        return;
      }

      // Validate options for multiple choice questions
      if (formData.type === "multiple_choice") {
        const validOptions = formData.options.filter(
          (option) => option.trim() !== ""
        );
        if (validOptions.length < 2) {
          toast.error("Multiple choice questions must have at least 2 options");
          return;
        }
        if (!formData.correctAnswer) {
          toast.error("Please select the correct answer");
          return;
        }
        // Validate that correct answer is one of the options
        if (!validOptions.includes(formData.correctAnswer)) {
          toast.error("Correct answer must be one of the provided options");
          return;
        }
      }

      // Validate true/false questions
      if (formData.type === "true_false") {
        if (!formData.correctAnswer) {
          toast.error(
            "Please select the correct answer for true/false question"
          );
          return;
        }
        // Validate true/false answer format
        const validTrueFalseAnswers = [
          "True",
          "False",
          "true",
          "false",
          "TRUE",
          "FALSE",
        ];
        if (!validTrueFalseAnswers.includes(formData.correctAnswer)) {
          toast.error("True/False answer must be either 'True' or 'False'");
          return;
        }
      }

      // Validate marks
      if (!formData.marks || formData.marks <= 0) {
        toast.error("Marks must be a positive number");
        return;
      }

      // Normalize the correct answer before sending to backend
      let normalizedCorrectAnswer = formData.correctAnswer;
      if (formData.type === "true_false") {
        // Send in the format expected by your backend
        const lowerAnswer = formData.correctAnswer.toLowerCase();
        if (lowerAnswer === "true") {
          normalizedCorrectAnswer = "True"; // or "true" - depending on your backend expectation
        } else if (lowerAnswer === "false") {
          normalizedCorrectAnswer = "False"; // or "false" - depending on your backend expectation
        }
      }

      // Prepare question data with correct field mapping
      const questionData = {
        questionText: formData.questionText,
        questionType: formData.type.toUpperCase(),
        difficulty: formData.difficulty.toUpperCase(),
        marks: parseInt(formData.marks),
        correctAnswer: formData.correctAnswer,
        explanation: formData.explanation || "",
        classId: parseInt(formData.classId),
        subjectId: parseInt(formData.subjectId),
        teacherId: parseInt(teacherId),
        options:
          formData.type === "multiple_choice"
            ? formData.options.filter((option) => option.trim() !== "")
            : formData.type === "true_false"
            ? ["True", "False"]
            : [],
      };

      // Add ID for updates
      if (showEditModal && selectedQuestion) {
        questionData.id = selectedQuestion.id;
      }

      console.log("Submitting question data:", questionData);

      let response;

      if (showEditModal) {
        // Update existing question - use PUT method
        response = await QuestionBankService.updateQuestion(
          questionData,
          token
        );
      } else {
        // Add new question - use POST method
        response = await QuestionBankService.createQuestion(
          questionData,
          token
        );
      }

      if (response && response.data) {
        const { code, message } = response.data;

        if (code === "SUCCESS") {
          toast.success(
            message ||
              `Question ${showEditModal ? "updated" : "created"} successfully!`
          );

          // Close modals and refresh data
          setShowEditModal(false);
          setShowAddModal(false);
          resetForm();
          await loadQuestions(); // Reload questions list
        } else {
          toast.error(
            message ||
              `Failed to ${showEditModal ? "update" : "create"} question`
          );
        }
      } else {
        console.error("Invalid response structure:", response);
        toast.error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error saving question:", error);
      // More detailed error handling
      if (error.response) {
        console.error("Error response:", error.response.data);
        toast.error(
          error.response.data?.message ||
            `Server error: ${error.response.status}`
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast.error("No response from server. Please check your connection.");
      } else {
        console.error("Error setting up request:", error.message);
        toast.error(error.message || "Failed to save question");
      }
    }
  };

  const confirmDelete = async () => {
    try {
      const token = getAuthToken();
      const response = await QuestionBankService.deleteQuestion(
        selectedQuestion.id,
        token
      );

      if (response && response.data) {
        const { code, message } = response.data;

        if (code === "SUCCESS") {
          toast.success(message || "Question deleted successfully!");
          setShowDeleteModal(false);
          setSelectedQuestion(null);
          await loadQuestions(); // Reload questions
        } else {
          toast.error(message || "Failed to delete question");
        }
      } else {
        toast.error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };

  const clearFilters = () => {
    setFilters({
      class: "",
      subject: "",
      difficulty: "",
      type: "",
    });
    setSearchTerm("");
  };

  const getDifficultyColor = (difficulty) => {
    const diff = difficulty?.toLowerCase();
    switch (diff) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type) => {
    const questionType = type?.toLowerCase();
    switch (questionType) {
      case "multiple_choice":
        return "bg-blue-100 text-blue-800";
      case "true_false":
        return "bg-purple-100 text-purple-800";
      case "essay":
        return "bg-orange-100 text-orange-800";
      case "short_answer":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // DataTable columns
  const columns = [
    {
      name: "Question",
      selector: (row) => row.questionText || row.question,
      sortable: true,
      width: "230px",
      cell: (row) => (
        <div className="py-2">
          <div className="text-sm font-medium text-gray-900 line-clamp-2">
            {(row.questionText || row.question) &&
            (row.questionText || row.question).length > 80
              ? `${(row.questionText || row.question).substring(0, 80)}...`
              : row.questionText || row.question}
          </div>
        </div>
      ),
    },
    {
      name: "Type",
      selector: (row) => row.questionType || row.type,
      sortable: true,
      width: "150px",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(
            row.questionType || row.type
          )}`}
        >
          {formatQuestionType(row.questionType || row.type)}
        </span>
      ),
    },
    {
      name: "Difficulty",
      selector: (row) => row.difficulty,
      sortable: true,
      width: "150px",
      cell: (row) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(
            row.difficulty
          )}`}
        >
          {row.difficulty || "N/A"}
        </span>
      ),
    },
    {
      name: "Class",
      selector: (row) => row.className || "N/A",
      sortable: true,
      width: "200px",
      cell: (row) => (
        <div className="text-gray-600">{row.className || "N/A"}</div>
      ),
    },
    {
      name: "Subject",
      selector: (row) => row.subjectName || "N/A",
      sortable: true,
      width: "150px",
      cell: (row) => (
        <div className="text-gray-600">{row.subjectName || "N/A"}</div>
      ),
    },
    {
      name: "Marks",
      selector: (row) => row.marks,
      sortable: true,
      width: "140px",
      // center: true,
    },
    // {
    //   name: "Used",
    //   selector: (row) => row.usedCount,
    //   sortable: true,
    //   width: "100px",
    //   // center: true,
    // },
    {
      name: "Actions",
      width: "180px",
      // center: true,
      cell: (row) => (
        <div className="flex space-x-1">
          <button
            onClick={() => handleViewQuestion(row)}
            className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
            title="View Question"
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
          <button
            onClick={() => handleEditQuestion(row)}
            className="p-1 text-green-600 hover:text-green-800 transition-colors"
            title="Edit Question"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            onClick={() => handleDuplicateQuestion(row)}
            className="p-1 text-purple-600 hover:text-purple-800 transition-colors"
            title="Duplicate Question"
          >
            <FontAwesomeIcon icon={faCopy} />
          </button>
          <button
            onClick={() => handleDeleteQuestion(row)}
            className="p-1 text-red-600 hover:text-red-800 transition-colors"
            title="Delete Question"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      ),
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#f8fafc",
        borderBottom: "2px solid #e2e8f0",
        fontWeight: "600",
        fontSize: "14px",
      },
    },
    rows: {
      style: {
        minHeight: "60px",
        "&:hover": {
          backgroundColor: "#f8fafc",
        },
      },
    },
  };

  const formatQuestionType = (type) => {
    if (!type) return "N/A";
    return type.toLowerCase().replace("_", " ");
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
        <Header />
        <main className="grow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Question Bank Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your question bank for online examinations
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors border"
              >
                <FontAwesomeIcon icon={faFilter} className="mr-2" />
                Filters
              </button>
              <button
                onClick={handleAddQuestion}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Add Question
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    className="text-blue-600 text-2xl"
                  />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {questions.length}
                  </div>
                  <div className="text-sm text-gray-500">Total Questions</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faBookOpen}
                    className="text-green-600 text-2xl"
                  />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {subjects.length}
                  </div>
                  <div className="text-sm text-gray-500">Subjects</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faGraduationCap}
                    className="text-purple-600 text-2xl"
                  />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {classes.length}
                  </div>
                  <div className="text-sm text-gray-500">Classes</div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FontAwesomeIcon
                    icon={faEye}
                    className="text-orange-600 text-2xl"
                  />
                </div>
                <div className="ml-4">
                  <div className="text-2xl font-bold text-gray-900">
                    {questions.reduce((sum, q) => sum + (q.usedCount || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-500">Total Usage</div>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex-1 md:mr-4 mb-4 md:mb-0">
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search questions, subjects, or classes..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Showing {filteredQuestions.length} of {questions.length}{" "}
                questions
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="border-t pt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.class}
                      onChange={(e) =>
                        setFilters({ ...filters, class: e.target.value })
                      }
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
                      Subject
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.subject}
                      onChange={(e) =>
                        setFilters({ ...filters, subject: e.target.value })
                      }
                    >
                      <option value="">All Subjects</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.subjectName}>
                          {subject.subjectName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.difficulty}
                      onChange={(e) =>
                        setFilters({ ...filters, difficulty: e.target.value })
                      }
                    >
                      <option value="">All Difficulties</option>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={filters.type}
                      onChange={(e) =>
                        setFilters({ ...filters, type: e.target.value })
                      }
                    >
                      <option value="">All Types</option>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True/False</option>
                      <option value="essay">Essay</option>
                      <option value="short_answer">Short Answer</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Questions Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredQuestions}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 25, 50, 100]}
              progressPending={loading}
              progressComponent={
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              }
              customStyles={customStyles}
              noDataComponent={
                <div className="text-center py-8">
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    className="text-gray-400 text-4xl mb-4"
                  />
                  <p className="text-gray-500">No questions found</p>
                </div>
              }
            />
          </div>
        </main>
      </div>

      {/* Add/Edit Question Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {showEditModal ? "Edit Question" : "Add New Question"}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <form onSubmit={submitForm} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Class *
                  </label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.className}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.subjectName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="essay">Essay</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty *
                  </label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marks *
                  </label>
                  <input
                    type="number"
                    name="marks"
                    min="1"
                    max="100"
                    value={formData.marks}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question Text *
                </label>
                <textarea
                  name="questionText"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter your question here..."
                  value={formData.questionText}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Options for multiple choice questions */}
              {formData.type === "multiple_choice" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Answer Options *
                  </label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="correctAnswer"
                          value={option}
                          checked={
                            formData.correctAnswer === option && option !== ""
                          }
                          onChange={handleInputChange}
                          className="text-blue-600"
                          disabled={option === ""}
                        />
                        <input
                          type="text"
                          placeholder={`Option ${index + 1}`}
                          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={option}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                          required={index < 2} // First two options are required
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Note: Select the radio button next to the correct answer
                    option.
                  </div>
                </div>
              )}

              {/* True/False options */}
              {formData.type === "true_false" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correct Answer *
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value="True"
                        checked={formData.correctAnswer === "True"}
                        onChange={handleInputChange}
                        className="text-blue-600"
                      />
                      <label>True</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        value="False"
                        checked={formData.correctAnswer === "False"}
                        onChange={handleInputChange}
                        className="text-blue-600"
                      />
                      <label>False</label>
                    </div>
                  </div>
                </div>
              )}

              {/* Answer for essay and short answer */}
              {(formData.type === "essay" ||
                formData.type === "short_answer") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model Answer *
                  </label>
                  <textarea
                    name="correctAnswer"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                    placeholder="Enter the model answer or key points..."
                    value={formData.correctAnswer}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explanation (Optional)
                </label>
                <textarea
                  name="explanation"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Enter explanation for the answer..."
                  value={formData.explanation}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {showEditModal ? "Update Question" : "Add Question"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-red-600">Confirm Delete</h2>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this question? This action cannot
              be undone.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Question:</strong>{" "}
                {(
                  selectedQuestion?.questionText ||
                  selectedQuestion?.question ||
                  ""
                ).substring(0, 100)}
                {(
                  selectedQuestion?.questionText ||
                  selectedQuestion?.question ||
                  ""
                ).length > 100
                  ? "..."
                  : ""}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                <strong>Subject:</strong>{" "}
                {selectedQuestion?.subjectName || "N/A"} |
                <strong> Class:</strong> {selectedQuestion?.className || "N/A"}{" "}
                |<strong> Type:</strong>{" "}
                {selectedQuestion?.questionType ||
                  selectedQuestion?.type ||
                  "N/A"}
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Question Modal */}
      {showViewModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Question Details
              </h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Question Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faGraduationCap}
                      className="text-blue-600 mr-2"
                    />
                    <div>
                      <div className="text-sm text-gray-600">Class</div>
                      <div className="font-medium text-gray-800">
                        {selectedQuestion.className || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faBookOpen}
                      className="text-green-600 mr-2"
                    />
                    <div>
                      <div className="text-sm text-gray-600">Subject</div>
                      <div className="font-medium text-gray-800">
                        {selectedQuestion.subjectName || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <FontAwesomeIcon
                      icon={faQuestionCircle}
                      className="text-purple-600 mr-2"
                    />
                    <div>
                      <div className="text-sm text-gray-600">Marks</div>
                      <div className="font-medium text-gray-800">
                        {selectedQuestion.marks || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Type and Difficulty */}
              <div className="flex flex-wrap gap-3">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getTypeColor(
                    selectedQuestion.questionType || selectedQuestion.type
                  )}`}
                >
                  {formatQuestionType(
                    selectedQuestion.questionType || selectedQuestion.type
                  )}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getDifficultyColor(
                    selectedQuestion.difficulty
                  )}`}
                >
                  {selectedQuestion.difficulty || "N/A"}
                </span>
              </div>

              {/* Question Text */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Question
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedQuestion.questionText ||
                    selectedQuestion.question ||
                    "No question text available"}
                </p>
              </div>

              {/* Answer Options - Multiple Choice */}
              {(selectedQuestion.questionType === "MULTIPLE_CHOICE" ||
                selectedQuestion.type === "multiple_choice") && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Answer Options
                  </h3>
                  <div className="space-y-2">
                    {selectedQuestion.options &&
                    selectedQuestion.options.length > 0 ? (
                      selectedQuestion.options.map((option, index) => (
                        <div
                          key={index}
                          className={`flex items-center space-x-3 p-3 rounded-lg border ${
                            option === selectedQuestion.correctAnswer
                              ? "bg-green-100 border-green-300"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                              option === selectedQuestion.correctAnswer
                                ? "bg-green-600 text-white"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="text-gray-700">{option}</span>
                          {option === selectedQuestion.correctAnswer && (
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-green-600 ml-auto"
                            />
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 italic">
                        No options available
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Answer - True/False */}
              {(selectedQuestion.questionType === "TRUE_FALSE" ||
                selectedQuestion.type === "true_false") && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Answer Options
                  </h3>
                  <div className="space-y-2">
                    {["True", "False"].map((option) => (
                      <div
                        key={option}
                        className={`flex items-center space-x-3 p-3 rounded-lg border ${
                          option === selectedQuestion.correctAnswer
                            ? "bg-green-100 border-green-300"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                            option === selectedQuestion.correctAnswer
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {option.charAt(0)}
                        </div>
                        <span className="text-gray-700">{option}</span>
                        {option === selectedQuestion.correctAnswer && (
                          <FontAwesomeIcon
                            icon={faCheck}
                            className="text-green-600 ml-auto"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Correct Answer - For Essay and Short Answer */}
              {(selectedQuestion.questionType === "ESSAY" ||
                selectedQuestion.type === "essay" ||
                selectedQuestion.questionType === "SHORT_ANSWER" ||
                selectedQuestion.type === "short_answer") && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Model Answer
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedQuestion.correctAnswer ||
                      "No model answer provided"}
                  </p>
                </div>
              )}

              {/* Explanation */}
              {selectedQuestion.explanation && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Explanation
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedQuestion.explanation}
                  </p>
                </div>
              )}

              {/* Additional Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-800 mb-3">
                  Additional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Question ID:</span>
                    <span className="ml-2 font-medium text-gray-800">
                      {selectedQuestion.id || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Usage Count:</span>
                    <span className="ml-2 font-medium text-gray-800">
                      {selectedQuestion.usedCount || 0} times
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Created Date:</span>
                    <span className="ml-2 font-medium text-gray-800">
                      {selectedQuestion.createdDate
                        ? new Date(
                            selectedQuestion.createdDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Modified:</span>
                    <span className="ml-2 font-medium text-gray-800">
                      {selectedQuestion.lastModified
                        ? new Date(
                            selectedQuestion.lastModified
                          ).toLocaleDateString()
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditQuestion(selectedQuestion);
                }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Edit Question
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleDuplicateQuestion(selectedQuestion);
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FontAwesomeIcon icon={faCopy} className="mr-2" />
                Duplicate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuestionBank;
