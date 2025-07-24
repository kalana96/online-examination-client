import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../partials/Header";
import Sidebar from "../partials/TeacherSidebar";
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
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import ExamService from "../service/ExamService";
import QuestionService from "../service/QuestionService";
import QuestionBankService from "../service/QuestionBankService";

function ExamQuestions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const examId = id;

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
    questionType: "multiple_choice",
    options: ["", "", "", ""],
    correctAnswer: "",
    marks: 1,
    explanation: "",
  });

  const token = localStorage.getItem("token");

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

    if (questionForm.questionType === "multiple_choice") {
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

    setLoading(true);
    try {
      const questionData = {
        examId: examId,
        questionText: questionForm.questionText,
        questionType: questionForm.questionType,
        options:
          questionForm.questionType === "multiple_choice"
            ? questionForm.options.filter((opt) => opt.trim())
            : [],
        correctAnswer: questionForm.correctAnswer,
        marks: questionForm.marks,
        explanation: questionForm.explanation,
      };

      let response;
      if (editingQuestion) {
        response = await QuestionService.updateQuestion(
          editingQuestion.id,
          questionData,
          token
        );
      } else {
        response = await QuestionService.createQuestion(questionData, token);
      }

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
      toast.error("Error saving question");
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
      const promises = selectedBankQuestions.map(async (question) => {
        const questionData = {
          examId: examId,
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options || [],
          correctAnswer: question.correctAnswer,
          marks: question.marks,
          explanation: question.explanation,
        };
        return QuestionService.createQuestion(questionData, token);
      });

      const responses = await Promise.all(promises);
      const successCount = responses.filter((r) => r.code === "00").length;

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
      questionType: "multiple_choice",
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
      options:
        question.questionType === "multiple_choice"
          ? [...question.options, "", "", "", ""].slice(0, 4)
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
        if (response.code === "00") {
          toast.success("Question deleted successfully");
          fetchQuestions();
        } else {
          toast.error(response.message || "Failed to delete question");
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

            {(showQuestionForm || showQuestionBank) && (
              <button
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-200"
                onClick={() => {
                  setShowQuestionForm(false);
                  setShowQuestionBank(false);
                  resetQuestionForm();
                  setSelectedBankQuestions([]);
                }}
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Cancel
              </button>
            )}
          </div>

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
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="true_false">True/False</option>
                    <option value="short_answer">Short Answer</option>
                    <option value="essay">Essay</option>
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
                                {question.questionType
                                  .replace("_", " ")
                                  .toUpperCase()}
                              </span>
                              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded mr-2">
                                {question.marks} Mark
                                {question.marks > 1 ? "s" : ""}
                              </span>
                              {question.subject && (
                                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded">
                                  {question.subject}
                                </span>
                              )}
                            </div>
                            <p className="text-gray-800 font-medium mb-2">
                              {question.questionText}
                            </p>
                            {question.questionType === "multiple_choice" &&
                              question.options && (
                                <div className="ml-4 text-sm text-gray-600">
                                  {question.options
                                    .slice(0, 2)
                                    .map((option, index) => (
                                      <div key={index}>
                                        {String.fromCharCode(65 + index)}.{" "}
                                        {option}
                                      </div>
                                    ))}
                                  {question.options.length > 2 && (
                                    <div className="text-gray-400">
                                      ... and {question.options.length - 2} more
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
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True/False</option>
                      <option value="short_answer">Short Answer</option>
                      <option value="essay">Essay</option>
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
                  {questionForm.questionType === "multiple_choice" && (
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
                    {questionForm.questionType === "multiple_choice" ? (
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
                    ) : questionForm.questionType === "true_false" ? (
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
                        </div>
                        <h4 className="text-lg font-medium text-gray-800 mb-2">
                          {question.questionText}
                        </h4>

                        {question.questionType === "multiple_choice" &&
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

                        {question.questionType !== "multiple_choice" && (
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
