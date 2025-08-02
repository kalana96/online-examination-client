import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faTimes,
  faFlag,
  faEye,
  faEdit,
  faChevronLeft,
  faChevronRight,
  faClock,
  faUser,
  faQuestionCircle,
  faSave,
  faCheckCircle,
  faTimesCircle,
  faExclamationTriangle,
  faSpinner,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";

// Components
import Header from "../../partials/Header";
import Sidebar from "../../partials/TeacherSidebar";
import ExamAttemptService from "../../service/ExamAttemptService";

// Add these components at the top after imports
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
      Error Loading Attempt
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

function StudentMarking() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State management
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("token");

  // Load specific attempt data
  const loadExamAttempt = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ExamAttemptService.getExamAttemptsById(id);

      // The API returns the data directly, no need to check response.code
      setSelectedAttempt(response);
    } catch (error) {
      console.error("Error loading exam attempt:", error);
      setError(error.message);
      toast.error("Failed to load exam attempt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    if (!id) {
      navigate("/teacher/marking");
      return;
    }

    loadExamAttempt();
  }, [id, token, navigate]);

  const handleAnswerMarking = async (
    answerId,
    marksAwarded,
    isCorrect,
    feedback = ""
  ) => {
    try {
      // Update local state immediately
      setSelectedAttempt((prev) => ({
        ...prev,
        studentAnswers: prev.studentAnswers.map((answer) =>
          answer.id === answerId
            ? {
                ...answer,
                marksAwarded,
                isCorrect,
                isMarked: true,
                teacherFeedback: feedback,
              }
            : answer
        ),
      }));

      // API call to save marking
      const response = await ExamAttemptService.markStudentAnswer(
        answerId,
        {
          marksAwarded,
          isCorrect,
          teacherFeedback: feedback,
        },
        token
      );

      if (response.code !== "00") {
        throw new Error(response.message || "Failed to mark answer");
      }

      toast.success("Answer marked successfully");
    } catch (error) {
      console.error("Error marking answer:", error);
      toast.error("Failed to mark answer");
      // Revert local state on error
      loadExamAttempt();
    }
  };

  const handleAutoMark = (answer) => {
    const { questionDetails, answerText } = answer;

    if (
      questionDetails.questionType === "MULTIPLE_CHOICE" ||
      questionDetails.questionType === "TRUE_FALSE"
    ) {
      const isCorrect =
        answerText?.toLowerCase() ===
        questionDetails.correctAnswer?.toLowerCase();
      const marksAwarded = isCorrect ? questionDetails.marks : 0;
      handleAnswerMarking(answer.id, marksAwarded, isCorrect);
    } else if (questionDetails.questionType === "SHORT_ANSWER") {
      // Simple text matching for short answers
      const isCorrect =
        answerText?.toLowerCase().trim() ===
        questionDetails.correctAnswer?.toLowerCase().trim();
      const marksAwarded = isCorrect ? questionDetails.marks : 0;
      handleAnswerMarking(answer.id, marksAwarded, isCorrect);
    }
  };

  const handleBulkAutoMark = () => {
    if (!selectedAttempt) return;

    selectedAttempt.studentAnswers
      .filter((answer) => !answer.isMarked)
      .forEach((answer) => {
        if (
          ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"].includes(
            answer.questionDetails.questionType
          )
        ) {
          handleAutoMark(answer);
        }
      });
  };

  const handleFlagAnswer = async (answerId, flagReason = "") => {
    try {
      setSelectedAttempt((prev) => ({
        ...prev,
        studentAnswers: prev.studentAnswers.map((answer) =>
          answer.id === answerId
            ? { ...answer, isFlagged: !answer.isFlagged, flagReason }
            : answer
        ),
      }));

      // API call to flag/unflag answer
      // await ExamAttemptService.flagAnswer(answerId, flagReason, token);
    } catch (error) {
      console.error("Error flagging answer:", error);
      toast.error("Failed to flag answer");
    }
  };

  const handleRetry = () => {
    loadExamAttempt();
  };

  const handleBackToMarking = () => {
    navigate("/teacher/marking");
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <LoadingSpinner />
          </main>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <ErrorMessage message={error} onRetry={handleRetry} />
          </main>
        </div>
      </div>
    );
  }

  // Show message if no attempt found
  if (!selectedAttempt) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
            <div className="container mx-auto px-6 py-8">
              <div className="text-center py-12">
                <FontAwesomeIcon
                  icon={faExclamationTriangle}
                  className="text-yellow-500 text-4xl mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Attempt Not Found
                </h3>
                <p className="text-gray-600 mb-4">
                  The requested exam attempt could not be found.
                </p>
                <button
                  onClick={handleBackToMarking}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
                  Back to Exam Marking
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const currentAnswer = selectedAttempt?.studentAnswers[currentQuestionIndex];
  const totalQuestions = selectedAttempt?.studentAnswers.length || 0;
  const markedCount =
    selectedAttempt?.studentAnswers.filter((a) => a.isMarked).length || 0;

  // QuestionCard component updated for new data structure
  const QuestionCard = ({ answer, onMark, onFlag, onAutoMark }) => {
    const [marks, setMarks] = useState(answer.marksAwarded || 0);
    const [feedback, setFeedback] = useState(answer.teacherFeedback || "");
    const [isCorrect, setIsCorrect] = useState(answer.isCorrect);

    const questionDetails = answer.questionDetails;
    const maxMarks = questionDetails.marks;

    const getDifficultyColor = (difficulty) => {
      switch (difficulty) {
        case "EASY":
          return "text-green-600 bg-green-100";
        case "MEDIUM":
          return "text-yellow-600 bg-yellow-100";
        case "HARD":
          return "text-red-600 bg-red-100";
        default:
          return "text-gray-600 bg-gray-100";
      }
    };

    const getQuestionTypeIcon = (type) => {
      switch (type) {
        case "MULTIPLE_CHOICE":
          return "🔘";
        case "TRUE_FALSE":
          return "✓/✗";
        case "ESSAY":
          return "📝";
        case "SHORT_ANSWER":
          return "💭";
        default:
          return "❓";
      }
    };

    // Strip HTML tags for display (for essay answers with HTML content)
    const stripHtml = (html) => {
      const tmp = document.createElement("DIV");
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || "";
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {getQuestionTypeIcon(questionDetails.questionType)}
            </span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(
                questionDetails.difficulty
              )}`}
            >
              {questionDetails.difficulty}
            </span>
            <span className="text-sm text-gray-600">
              {questionDetails.marks} marks
            </span>
          </div>
          <div className="flex gap-2">
            {["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"].includes(
              questionDetails.questionType
            ) && (
              <button
                onClick={() => onAutoMark(answer)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={answer.isMarked}
              >
                Auto Mark
              </button>
            )}
            <button
              onClick={() => onFlag(answer.id)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                answer.isFlagged
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <FontAwesomeIcon icon={faFlag} />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">Question:</h3>
          <p className="text-gray-700">{questionDetails.questionText}</p>

          {questionDetails.questionType === "MULTIPLE_CHOICE" &&
            questionDetails.options &&
            questionDetails.options.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-1">Options:</p>
                <div className="grid grid-cols-2 gap-2">
                  {questionDetails.options.map((option, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                    >
                      {String.fromCharCode(65 + idx)}. {option}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">Student Answer:</h3>
          <div className="bg-gray-50 p-3 rounded border">
            <p className="text-gray-700">
              {answer.answerText
                ? stripHtml(answer.answerText)
                : "No answer provided"}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">Correct Answer:</h3>
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <p className="text-green-800">{questionDetails.correctAnswer}</p>
          </div>
        </div>

        {(questionDetails.questionType === "ESSAY" ||
          questionDetails.questionType === "SHORT_ANSWER") && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teacher Feedback:
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Enter feedback for the student..."
            />
          </div>
        )}

        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Marks:</label>
            <input
              type="number"
              value={marks}
              onChange={(e) => setMarks(Number(e.target.value))}
              min="0"
              max={maxMarks}
              className="w-20 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <span className="text-sm text-gray-600">/ {maxMarks}</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={
                isCorrect === null ? "" : isCorrect ? "correct" : "incorrect"
              }
              onChange={(e) =>
                setIsCorrect(
                  e.target.value === "correct"
                    ? true
                    : e.target.value === "incorrect"
                    ? false
                    : null
                )
              }
              className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select</option>
              <option value="correct">Correct</option>
              <option value="incorrect">Incorrect</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Time spent: {Math.floor((answer.timeSpentSeconds || 0) / 60)}m{" "}
            {(answer.timeSpentSeconds || 0) % 60}s
          </div>
          <button
            onClick={() => onMark(answer.id, marks, isCorrect, feedback)}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              answer.isMarked
                ? "bg-green-500 text-white"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {answer.isMarked ? "Update" : "Mark"}
          </button>
        </div>

        {answer.isMarked && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-800">
              ✓ Marked: {answer.marksAwarded}/{maxMarks} marks
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <button
                  onClick={handleBackToMarking}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-2 transition-colors"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                  Back to Exam Marking
                </button>
                <h1 className="text-3xl font-bold text-gray-800">
                  Marking: {selectedAttempt.studentFullName}
                </h1>
                <p className="text-gray-600">
                  Exam ID: {selectedAttempt.examId} • Progress: {markedCount}/
                  {totalQuestions} • Score: {selectedAttempt.score}/
                  {selectedAttempt.totalMarks} (
                  {selectedAttempt.percentage.toFixed(1)}%)
                </p>
                <p className="text-sm text-gray-500">
                  Status: {selectedAttempt.status} • Duration:{" "}
                  {selectedAttempt.durationMinutes} minutes
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBulkAutoMark}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Auto Mark All
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setCurrentQuestionIndex(
                          Math.max(0, currentQuestionIndex - 1)
                        )
                      }
                      disabled={currentQuestionIndex === 0}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                    <button
                      onClick={() =>
                        setCurrentQuestionIndex(
                          Math.min(totalQuestions - 1, currentQuestionIndex + 1)
                        )
                      }
                      disabled={currentQuestionIndex === totalQuestions - 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Quick Jump:</span>
                  <select
                    value={currentQuestionIndex}
                    onChange={(e) =>
                      setCurrentQuestionIndex(Number(e.target.value))
                    }
                    className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {selectedAttempt.studentAnswers.map((_, idx) => (
                      <option key={idx} value={idx}>
                        Q{idx + 1}{" "}
                        {selectedAttempt.studentAnswers[idx].isMarked
                          ? "✓"
                          : "○"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {currentAnswer && (
              <QuestionCard
                answer={currentAnswer}
                onMark={handleAnswerMarking}
                onFlag={handleFlagAnswer}
                onAutoMark={handleAutoMark}
              />
            )}

            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                Question Overview
              </h3>
              <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
                {selectedAttempt.studentAnswers.map((answer, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`aspect-square rounded-lg border-2 text-sm font-medium transition-colors ${
                      idx === currentQuestionIndex
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : answer.isMarked
                        ? "border-green-500 bg-green-50 text-green-700"
                        : answer.isFlagged
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {idx + 1}
                    {answer.isMarked && <div className="text-xs">✓</div>}
                    {answer.isFlagged && <div className="text-xs">🚩</div>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentMarking;
