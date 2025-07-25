import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../partials/Header";
import Sidebar from "../../partials/TeacherSidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrashAlt,
  faArrowLeft,
  faSave,
  faTimes,
  faCheck,
  faQuestionCircle,
  faDatabase,
  faSearch,
  faFilter,
  faBookOpen,
  faEye,
  faPrint,
  faDownload,
  faFileAlt,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import ExamService from "../../service/ExamService";
import QuestionService from "../../service/QuestionService";
import QuestionBankService from "../../service/QuestionBankService";

function ExamQuestions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const examId = id;
  const token = localStorage.getItem("token");

  // Question Bank states
  const [questionBank, setQuestionBank] = useState([]);
  const [selectedBankQuestions, setSelectedBankQuestions] = useState([]);
  const [bankSearchTerm, setBankSearchTerm] = useState("");
  const [bankFilterType, setBankFilterType] = useState("all");
  const [bankFilterSubject, setBankFilterSubject] = useState("all");
  const [bankLoading, setBankLoading] = useState(false);

  // Question form states
  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    questionType: "MULTIPLE_CHOICE",
    difficulty: "MEDIUM",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
    explanation: "",
  });

  // Get user data from localStorage or context
  const getCurrentUser = () => {
    try {
      const userData = localStorage.getItem("id");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      return null;
    }
  };

  useEffect(() => {
    if (examId) {
      fetchExamDetails();
      fetchQuestions();
    }
  }, [examId]);

  const fetchExamDetails = async () => {
    try {
      const response = await ExamService.getExamById(examId, token);
      if (response.code === "00") {
        setExam(response.content);
      } else {
        toast.error("Failed to fetch exam details");
      }
    } catch (error) {
      console.error("Error fetching exam:", error);
      toast.error("Error fetching exam details");
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await QuestionService.getQuestionsByExam(examId, token);

      if (response && response.data) {
        const { code, message, content } = response.data;

        switch (code) {
          case "SUCCESS":
            console.log("Questions fetched successfully:", content);
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
      console.error("Error fetching questions:", error);
      toast.error("Error fetching questions");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestionBank = async () => {
    setBankLoading(true);
    try {
      // Replace with your actual question bank service call
      const response = await QuestionBankService.getQuestionsByClass(
        exam.classId,
        token
      );
      if (response && response.data) {
        const { code, message, content } = response.data;

        switch (code) {
          case "SUCCESS":
            // console.log("Questions loaded successfully:", content);
            // Make sure content is an array
            const questionsArray = Array.isArray(content) ? content : [];
            setQuestionBank(questionsArray);
            // setQuestionBank(response.content || []);
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
        setQuestionBank([]);
      }
    } catch (error) {
      console.error("Error loading questions:", error);
      toast.error("Failed to load questions");
      // Fallback to empty array if API fails
      setQuestionBank([]);
    } finally {
      setBankLoading(false);
    }
  };

  const handleQuestionFormSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!questionForm.questionText.trim()) {
      toast.error("Question text is required");
      return;
    }

    if (questionForm.questionType === "MULTIPLE_CHOICE") {
      const filledOptions = questionForm.options.filter((opt) => opt.trim());
      if (filledOptions.length < 2) {
        toast.error("At least 2 options are required for multiple choice");
        return;
      }
      if (!questionForm.correctAnswer.trim()) {
        toast.error("Correct answer is required");
        return;
      }
    }

    if (questionForm.questionType === "TRUE_FALSE") {
      if (!questionForm.correctAnswer.trim()) {
        toast.error("Correct answer is required");
        return;
      }
    }

    if (questionForm.marks < 1 || questionForm.marks > 100) {
      toast.error("Marks must be between 1 and 100");
      return;
    }

    setLoading(true);
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        toast.error("User session expired. Please login again.");
        return;
      }

      const questionData = {
        examId: parseInt(examId),
        questionText: questionForm.questionText.trim(),
        questionType: questionForm.questionType,
        difficulty: questionForm.difficulty,
        options:
          questionForm.questionType === "MULTIPLE_CHOICE"
            ? questionForm.options.filter((opt) => opt.trim())
            : questionForm.questionType === "TRUE_FALSE"
            ? ["True", "False"]
            : [],
        correctAnswer: questionForm.correctAnswer.trim(),
        marks: questionForm.marks,
        explanation: questionForm.explanation.trim() || null,
        classId: exam.classId || exam.clazz?.id,
        teacherId: currentUser,
      };

      console.log("Sending question data:", questionData);

      let response;

      if (editingQuestion) {
        questionData.id = editingQuestion.id;
        response = await QuestionService.updateQuestion(questionData, token);
      } else {
        response = await QuestionService.createQuestion(questionData, token);
      }

      console.log("Question service response:", response);

      if (response && response.data) {
        const { code, message } = response.data;

        if (code === "SUCCESS") {
          toast.success(
            message ||
              `Question ${
                editingQuestion ? "updated" : "created"
              } successfully!`
          );

          resetQuestionForm();
          setShowQuestionForm(false);
          await fetchQuestions(); // Reload questions list
        } else {
          toast.error(
            message ||
              `Failed to ${editingQuestion ? "update" : "create"} question`
          );
        }
      } else {
        console.error("Invalid response structure:", response);
        toast.error("Invalid response from server");
      }
    } catch (error) {
      console.error("Error saving question:", error);

      // Handle different types of errors
      if (error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          toast.error(data.message || "Invalid question data");
        } else if (status === 401) {
          toast.error("Unauthorized. Please login again.");
        } else if (status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error(data.message || "Error saving question");
        }
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Error saving question");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddFromQuestionBank = async () => {
    if (selectedBankQuestions.length === 0) {
      toast.error("Please select at least one question");
      return;
    }

    setLoading(true);
    try {
      const currentUser = getCurrentUser();
      if (!currentUser) {
        toast.error("User session expired. Please login again.");
        return;
      }

      const promises = selectedBankQuestions.map(async (question) => {
        const questionData = {
          examId: parseInt(examId),
          questionText: question.questionText,
          questionType: question.questionType,
          difficulty: question.difficulty || "MEDIUM",
          options: question.options || [],
          correctAnswer: question.correctAnswer,
          marks: question.marks,
          explanation: question.explanation,
          classId: exam.classId || exam.clazz?.id,
          // subjectId: 1,
          teacherId: currentUser || currentUser.teacherId,
        };
        console.log("Sending question data:", questionData);

        return QuestionService.createQuestion(questionData, token);
      });

      const responses = await Promise.all(promises);
      const successCount = responses.filter(
        (r) => r && r.data && r.data.code === "SUCCESS"
      ).length;

      if (successCount === selectedBankQuestions.length) {
        toast.success(
          `Successfully added ${successCount} questions from question bank`
        );
      } else {
        toast.warning(
          `Added ${successCount} out of ${selectedBankQuestions.length} questions`
        );
      }

      fetchQuestions();
      setSelectedBankQuestions([]);
      setShowQuestionBank(false);
    } catch (error) {
      console.error("Error adding questions from bank:", error);
      toast.error("Error adding questions from bank");
    } finally {
      setLoading(false);
    }
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      questionText: "",
      questionType: "MULTIPLE_CHOICE",
      difficulty: "MEDIUM",
      options: ["", "", "", ""],
      correctAnswer: "",
      marks: 1,
      explanation: "",
    });
    setEditingQuestion(null);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionForm({
      questionText: question.questionText,
      questionType: question.questionType,
      difficulty: question.difficulty || "MEDIUM",
      options:
        question.questionType === "MULTIPLE_CHOICE"
          ? [...question.options, "", "", "", ""].slice(0, 4)
          : question.questionType === "TRUE_FALSE"
          ? ["True", "False"]
          : ["", "", "", ""],
      correctAnswer: question.correctAnswer,
      marks: question.marks,
      explanation: question.explanation || "",
    });
    setShowQuestionForm(true);
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setLoading(true);
      try {
        const response = await QuestionService.deleteQuestion(
          questionId,
          token
        );

        if (response && response.data) {
          const { code, message } = response.data;
          if (code === "SUCCESS") {
            toast.success(message || "Question deleted successfully");
            fetchQuestions();
          } else {
            toast.error(message || "Failed to delete question");
          }
        } else {
          toast.error("Invalid response from server");
        }
      } catch (error) {
        console.error("Error deleting question:", error);
        toast.error("Error deleting question");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };

  const addOption = () => {
    if (questionForm.options.length < 6) {
      setQuestionForm({
        ...questionForm,
        options: [...questionForm.options, ""],
      });
    }
  };

  const removeOption = (index) => {
    if (questionForm.options.length > 2) {
      const newOptions = questionForm.options.filter((_, i) => i !== index);
      setQuestionForm({ ...questionForm, options: newOptions });
    }
  };

  const calculateTotalMarks = () => {
    return questions.reduce(
      (total, question) => total + (question.marks || 0),
      0
    );
  };

  const handleBankQuestionSelect = (question) => {
    setSelectedBankQuestions((prev) => {
      const isSelected = prev.find((q) => q.id === question.id);
      if (isSelected) {
        return prev.filter((q) => q.id !== question.id);
      } else {
        return [...prev, question];
      }
    });
  };

  const getFilteredQuestionBank = () => {
    return questionBank.filter((question) => {
      const matchesSearch =
        question.questionText
          .toLowerCase()
          .includes(bankSearchTerm.toLowerCase()) ||
        question.subject?.toLowerCase().includes(bankSearchTerm.toLowerCase());
      const matchesType =
        bankFilterType === "all" || question.questionType === bankFilterType;
      const matchesSubject =
        bankFilterSubject === "all" || question.subject === bankFilterSubject;

      // Don't show questions that are already in the exam
      const notInExam = !questions.find(
        (q) => q.questionText === question.questionText
      );

      return matchesSearch && matchesType && matchesSubject && notInExam;
    });
  };

  const getUniqueSubjects = () => {
    const subjects = questionBank.map((q) => q.subject).filter(Boolean);
    return [...new Set(subjects)];
  };

  const formatQuestionType = (type) => {
    return type
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDifficulty = (difficulty) => {
    return difficulty.toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handlePrintPreview = () => {
    const printWindow = window.open("", "_blank");
    const previewContent = generatePreviewHTML();

    printWindow.document.write(`
      <html>
        <head>
          <title>${exam.examName} - Question Paper</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .exam-info { margin: 20px 0; }
            .question { margin: 20px 0; page-break-inside: avoid; }
            .question-number { font-weight: bold; margin-bottom: 10px; }
            .question-text { margin: 10px 0; }
            .options { margin: 10px 0 10px 20px; }
            .option { margin: 5px 0; }
            .answer-space { margin: 10px 0; border-bottom: 1px solid #ccc; min-height: 30px; }
            .marks { float: right; font-weight: bold; }
            .instructions { margin: 20px 0; padding: 15px; background: #f5f5f5; border-left: 4px solid #007bff; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${previewContent}
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const generatePreviewHTML = () => {
    const examDate = new Date(exam.examDate).toLocaleDateString();
    const examDuration = exam.duration || "N/A";

    return `
      <div class="header">
        <h1>${exam.examName}</h1>
        <div class="exam-info">
          <p><strong>Class:</strong> ${exam.clazz?.className || "N/A"}</p>
          <p><strong>Subject:</strong> ${exam.subject || "N/A"}</p>
          <p><strong>Date:</strong> ${examDate}</p>
          <p><strong>Duration:</strong> ${examDuration} minutes</p>
          <p><strong>Total Marks:</strong> ${calculateTotalMarks()}</p>
        </div>
      </div>
      
      <div class="instructions">
        <h3>Instructions:</h3>
        <ul>
          <li>Read all questions carefully before answering</li>
          <li>Answer all questions in the space provided</li>
          <li>For multiple choice questions, select only one answer</li>
          <li>Marks are indicated against each question</li>
          <li>Time allowed: ${examDuration} minutes</li>
        </ul>
      </div>
      
      <div class="questions">
        ${questions
          .map(
            (question, index) => `
          <div class="question">
            <div class="question-number">
              Q${index + 1}. 
              <span class="marks">[${question.marks} mark${
              question.marks > 1 ? "s" : ""
            }]</span>
            </div>
            <div class="question-text">${question.questionText}</div>
            
            ${
              question.questionType === "MULTIPLE_CHOICE" && question.options
                ? `
              <div class="options">
                ${question.options
                  .map(
                    (option, optIndex) => `
                  <div class="option">
                    ${String.fromCharCode(65 + optIndex)}. ${option}
                  </div>
                `
                  )
                  .join("")}
              </div>
            `
                : ""
            }
            
            ${
              question.questionType === "TRUE_FALSE"
                ? `
              <div class="options">
                <div class="option">A. True</div>
                <div class="option">B. False</div>
              </div>
            `
                : ""
            }
            
            ${
              question.questionType === "SHORT_ANSWER" ||
              question.questionType === "ESSAY"
                ? `
              <div class="answer-space" style="min-height: ${
                question.questionType === "ESSAY" ? "150px" : "50px"
              };">
                <!-- Answer space -->
              </div>
            `
                : ""
            }
          </div>
        `
          )
          .join("")}
      </div>
    `;
  };

  if (!exam) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
          <Header />
          <main className="grow p-6">
            <div className="text-center py-8">
              <div className="text-gray-500">Loading exam details...</div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
        <Header />
        <main className="grow p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <button
                onClick={() => navigate("/teacher/examSchedule")}
                className="text-blue-600 hover:text-blue-800 mb-2 flex items-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Back to Exam Schedule
              </button>
              <h1 className="text-3xl font-bold text-gray-800">
                Manage Questions - {exam.examName}
              </h1>
              <p className="text-gray-600 mt-2">
                Class: {exam.clazz?.className} | Date:{" "}
                {new Date(exam.examDate).toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-800">
                Total Questions: {questions.length}
              </div>
              <div className="text-lg font-semibold text-blue-600">
                Total Marks: {calculateTotalMarks()}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-200"
              onClick={() => {
                resetQuestionForm();
                setShowQuestionForm(true);
              }}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add New Question
            </button>

            <button
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-200"
              onClick={() => {
                setShowQuestionBank(true);
                fetchQuestionBank();
              }}
            >
              <FontAwesomeIcon icon={faDatabase} className="mr-2" />
              Add from Question Bank
            </button>

            {questions.length > 0 && (
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-200"
                onClick={() => setShowPreview(true)}
              >
                <FontAwesomeIcon icon={faEye} className="mr-2" />
                Preview Question Paper
              </button>
            )}

            {(showQuestionForm || showQuestionBank) && (
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-200"
                onClick={() => {
                  setShowQuestionForm(false);
                  setShowQuestionBank(false);
                  setShowPreview(false);
                  resetQuestionForm();
                  setSelectedBankQuestions([]);
                }}
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Cancel
              </button>
            )}
          </div>

          {/* Preview Modal */}
          {showPreview && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Question Paper Preview
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handlePrintPreview}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center transition-colors duration-200"
                    >
                      <FontAwesomeIcon icon={faPrint} className="mr-2" />
                      Print
                    </button>
                    <button
                      onClick={() => setShowPreview(false)}
                      className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center transition-colors duration-200"
                    >
                      <FontAwesomeIcon icon={faTimes} className="mr-2" />
                      Close
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="bg-white border rounded-lg p-8 shadow-sm">
                    {/* Exam Header */}
                    <div className="text-center mb-8 pb-6 border-b-2 border-gray-300">
                      <h1 className="text-3xl font-bold text-gray-800 mb-4">
                        {exam.examName}
                      </h1>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-left">
                          <p>
                            <strong>Class:</strong>{" "}
                            {exam.clazz?.className || "N/A"}
                          </p>
                          <p>
                            <strong>Subject:</strong> {exam.subject || "N/A"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p>
                            <strong>Date:</strong>{" "}
                            {new Date(exam.examDate).toLocaleDateString()}
                          </p>
                          <p>
                            <strong>Duration:</strong> {exam.duration || "N/A"}{" "}
                            minutes
                          </p>
                          <p>
                            <strong>Total Marks:</strong>{" "}
                            {calculateTotalMarks()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Instructions */}
                    <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        Instructions:
                      </h3>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• Read all questions carefully before answering</li>
                        <li>• Answer all questions in the space provided</li>
                        <li>
                          • For multiple choice questions, select only one
                          answer
                        </li>
                        <li>• Marks are indicated against each question</li>
                        <li>
                          • Time allowed: {exam.duration || "N/A"} minutes
                        </li>
                      </ul>
                    </div>

                    {/* Questions */}
                    <div className="space-y-8">
                      {questions.map((question, index) => (
                        <div key={question.id} className="border-b pb-6">
                          <div className="flex justify-between items-start mb-3">
                            <div className="font-semibold text-gray-800">
                              Q{index + 1}.
                            </div>
                            <div className="text-sm font-medium text-blue-600">
                              [{question.marks} mark
                              {question.marks > 1 ? "s" : ""}]
                            </div>
                          </div>

                          <div className="mb-4 text-gray-800">
                            {question.questionText}
                          </div>

                          {question.questionType === "MULTIPLE_CHOICE" &&
                            question.options && (
                              <div className="ml-6 space-y-2">
                                {question.options.map((option, optIndex) => (
                                  <div
                                    key={optIndex}
                                    className="flex items-center"
                                  >
                                    <span className="mr-3 font-medium">
                                      {String.fromCharCode(65 + optIndex)}.
                                    </span>
                                    <span>{option}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                          {question.questionType === "TRUE_FALSE" && (
                            <div className="ml-6 space-y-2">
                              <div className="flex items-center">
                                <span className="mr-3 font-medium">A.</span>
                                <span>True</span>
                              </div>
                              <div className="flex items-center">
                                <span className="mr-3 font-medium">B.</span>
                                <span>False</span>
                              </div>
                            </div>
                          )}

                          {(question.questionType === "SHORT_ANSWER" ||
                            question.questionType === "ESSAY") && (
                            <div className="ml-6 mt-4">
                              <div
                                className={`border-b-2 border-gray-300 ${
                                  question.questionType === "ESSAY"
                                    ? "h-32"
                                    : "h-16"
                                }`}
                              >
                                {/* Answer space */}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {questions.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No questions added yet. Add some questions to preview
                        the paper.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Question Bank Modal */}
          {showQuestionBank && (
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Question Bank
              </h3>

              {/* Search and Filter Controls */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Questions
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={bankSearchTerm}
                      onChange={(e) => setBankSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Search by question text or subject"
                    />
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Type
                  </label>
                  <select
                    value={bankFilterType}
                    onChange={(e) => setBankFilterType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Types</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="TRUE_FALSE">True/False</option>
                    <option value="SHORT_ANSWER">Short Answer</option>
                    <option value="ESSAY">Essay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Subject
                  </label>
                  <select
                    value={bankFilterSubject}
                    onChange={(e) => setBankFilterSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Subjects</option>
                    {getUniqueSubjects().map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Selected Questions Counter */}
              {selectedBankQuestions.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-md mb-4">
                  <span className="text-blue-800 font-medium">
                    {selectedBankQuestions.length} question(s) selected
                  </span>
                </div>
              )}

              {/* Question Bank List */}
              <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                {bankLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">
                      Loading question bank...
                    </div>
                  </div>
                ) : getFilteredQuestionBank().length === 0 ? (
                  <div className="text-center py-8">
                    <FontAwesomeIcon
                      icon={faBookOpen}
                      className="text-gray-400 text-4xl mb-4"
                    />
                    <div className="text-gray-500">No questions found</div>
                  </div>
                ) : (
                  <div className="divide-y">
                    {getFilteredQuestionBank().map((question) => (
                      <div
                        key={question.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                          selectedBankQuestions.find(
                            (q) => q.id === question.id
                          )
                            ? "bg-blue-50 border-l-4 border-blue-500"
                            : ""
                        }`}
                        onClick={() => handleBankQuestionSelect(question)}
                      >
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            checked={
                              selectedBankQuestions.find(
                                (q) => q.id === question.id
                              ) !== undefined
                            }
                            onChange={() => handleBankQuestionSelect(question)}
                            className="mr-3 mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded mr-2">
                                {formatQuestionType(question.questionType)}
                              </span>
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-2">
                                {question.marks} Mark
                                {question.marks > 1 ? "s" : ""}
                              </span>
                              {question.difficulty && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded mr-2">
                                  {formatDifficulty(question.difficulty)}
                                </span>
                              )}
                              {/* {question.subject && (
                                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                                  {question.subject}
                                </span>
                              )} */}
                            </div>
                            <p className="text-gray-800 font-medium mb-2">
                              {question.questionText}
                            </p>
                            {question.questionType === "MULTIPLE_CHOICE" &&
                              question.options && (
                                <div className="ml-4 text-sm text-gray-600">
                                  {question.options
                                    .slice(0, 4)
                                    .map((option, index) => (
                                      <div key={index}>
                                        {String.fromCharCode(65 + index)}.{" "}
                                        {option}
                                      </div>
                                    ))}
                                  {question.options.length > 4 && (
                                    <div className="text-gray-400">
                                      ... and {question.options.length - 4} more
                                      options
                                    </div>
                                  )}
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end mt-6 space-x-4">
                <button
                  onClick={() => setSelectedBankQuestions([])}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
                  disabled={selectedBankQuestions.length === 0}
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleAddFromQuestionBank}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-200"
                  disabled={selectedBankQuestions.length === 0 || loading}
                >
                  <FontAwesomeIcon icon={faPlus} className="mr-2" />
                  {loading
                    ? "Adding..."
                    : `Add ${selectedBankQuestions.length} Question(s)`}
                </button>
              </div>
            </div>
          )}

          {/* Question Form */}
          {showQuestionForm && (
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {editingQuestion ? "Edit Question" : "Add New Question"}
              </h3>
              <form onSubmit={handleQuestionFormSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Question Text */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Text *
                    </label>
                    <textarea
                      value={questionForm.questionText}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          questionText: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      required
                    />
                  </div>

                  {/* Question Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Type
                    </label>
                    <select
                      value={questionForm.questionType}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          questionType: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                      <option value="TRUE_FALSE">True/False</option>
                      <option value="SHORT_ANSWER">Short Answer</option>
                      <option value="ESSAY">Essay</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={questionForm.difficulty}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          difficulty: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>

                  {/* Marks */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marks
                    </label>
                    <input
                      type="number"
                      value={questionForm.marks}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          marks: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                      max="100"
                    />
                  </div>

                  {/* Options for Multiple Choice */}
                  {questionForm.questionType === "MULTIPLE_CHOICE" && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Options
                      </label>
                      {questionForm.options.map((option, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(index, e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder={`Option ${index + 1}`}
                          />
                          {questionForm.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeOption(index)}
                              className="ml-2 text-red-600 hover:text-red-800"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          )}
                        </div>
                      ))}
                      {questionForm.options.length < 6 && (
                        <button
                          type="button"
                          onClick={addOption}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          + Add Option
                        </button>
                      )}
                    </div>
                  )}

                  {/* Correct Answer */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Correct Answer *
                    </label>
                    {questionForm.questionType === "MULTIPLE_CHOICE" ? (
                      <select
                        value={questionForm.correctAnswer}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            correctAnswer: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select correct option</option>
                        {questionForm.options.map(
                          (option, index) =>
                            option.trim() && (
                              <option key={index} value={option}>
                                {option}
                              </option>
                            )
                        )}
                      </select>
                    ) : questionForm.questionType === "TRUE_FALSE" ? (
                      <select
                        value={questionForm.correctAnswer}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            correctAnswer: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Select answer</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                    ) : (
                      <textarea
                        value={questionForm.correctAnswer}
                        onChange={(e) =>
                          setQuestionForm({
                            ...questionForm,
                            correctAnswer: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="Enter the correct answer or answer guidelines"
                        required
                      />
                    )}
                  </div>

                  {/* Explanation */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Explanation (Optional)
                    </label>
                    <textarea
                      value={questionForm.explanation}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          explanation: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Provide explanation for the correct answer"
                    />
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-200"
                    disabled={loading}
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    {loading
                      ? "Saving..."
                      : editingQuestion
                      ? "Update Question"
                      : "Save Question"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Questions List */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Questions</h3>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading questions...</div>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-8">
                <FontAwesomeIcon
                  icon={faQuestionCircle}
                  className="text-gray-400 text-4xl mb-4"
                />
                <div className="text-gray-500 mb-4">No questions added yet</div>
                <div className="space-x-4">
                  <button
                    onClick={() => {
                      resetQuestionForm();
                      setShowQuestionForm(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Add Your First Question
                  </button>
                  <button
                    onClick={() => {
                      setShowQuestionBank(true);
                      fetchQuestionBank();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Add from Question Bank
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y">
                {questions.map((question, index) => (
                  <div key={question.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded mr-2">
                            Q{index + 1}
                          </span>
                          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded mr-2">
                            {question.questionType
                              .replace("_", " ")
                              .toUpperCase()}
                          </span>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                            {question.marks} Mark{question.marks > 1 ? "s" : ""}
                          </span>
                          {question.difficulty && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded mr-2">
                              {formatDifficulty(question.difficulty)}
                            </span>
                          )}
                        </div>
                        <h4 className="text-lg font-medium text-gray-800 mb-2">
                          {question.questionText}
                        </h4>

                        {question.questionType === "MULTIPLE_CHOICE" &&
                          question.options && (
                            <div className="ml-4 mb-2">
                              {question.options.map((option, optIndex) => (
                                <div
                                  key={optIndex}
                                  className="flex items-center mb-1"
                                >
                                  <span className="text-gray-600 mr-2">
                                    {String.fromCharCode(65 + optIndex)}.
                                  </span>
                                  <span
                                    className={`${
                                      option === question.correctAnswer
                                        ? "font-semibold text-green-600"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {option}
                                  </span>
                                  {option === question.correctAnswer && (
                                    <FontAwesomeIcon
                                      icon={faCheck}
                                      className="ml-2 text-green-600"
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                        {question.questionType !== "MULTIPLE_CHOICE" && (
                          <div className="ml-4 mb-2">
                            <span className="text-sm text-gray-600">
                              Correct Answer:{" "}
                            </span>
                            <span className="font-semibold text-green-600">
                              {question.correctAnswer}
                            </span>
                          </div>
                        )}

                        {question.explanation && (
                          <div className="ml-4 mb-2">
                            <span className="text-sm text-gray-600">
                              Explanation:{" "}
                            </span>
                            <span className="text-gray-700">
                              {question.explanation}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => handleEditQuestion(question)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-200"
                          title="Edit Question"
                        >
                          <FontAwesomeIcon icon={faEdit} />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-200"
                          title="Delete Question"
                        >
                          <FontAwesomeIcon icon={faTrashAlt} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ExamQuestions;
