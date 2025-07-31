import React, { useEffect, useState } from "react";
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
  faFilter,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

// Mock data - replace with actual API calls
const mockExamAttempts = [
  {
    id: 1,
    student: {
      id: 1,
      firstName: "Lahiru",
      lastName: "Dilhan",
      registrationNumber: "REG001",
    },
    exam: { id: 1, examName: "Mid Term Test", maxMark: 100 },
    startTime: "2024-01-15T10:00:00",
    endTime: "2024-01-15T12:00:00",
    status: "COMPLETED",
    isSubmitted: true,
    studentAnswers: [
      {
        id: 1,
        question: {
          id: 1,
          questionText: "What is 2 + 2?",
          questionType: "MULTIPLE_CHOICE",
          marks: 5,
          correctAnswer: "4",
          options: ["2", "3", "4", "5"],
          difficulty: "EASY",
        },
        answerText: "4",
        isCorrect: null,
        marksAwarded: null,
        isMarked: false,
        timeSpentSeconds: 30,
      },
      {
        id: 2,
        question: {
          id: 2,
          questionText: "The Earth is flat. True or False?",
          questionType: "TRUE_FALSE",
          marks: 3,
          correctAnswer: "False",
          difficulty: "EASY",
        },
        answerText: "False",
        isCorrect: null,
        marksAwarded: null,
        isMarked: false,
        timeSpentSeconds: 15,
      },
      {
        id: 3,
        question: {
          id: 3,
          questionText: "Explain the process of photosynthesis in plants.",
          questionType: "ESSAY",
          marks: 20,
          correctAnswer:
            "Photosynthesis is the process by which plants convert light energy into chemical energy...",
          difficulty: "MEDIUM",
        },
        answerText:
          "Photosynthesis is when plants use sunlight to make food. They take in carbon dioxide and water and produce glucose and oxygen.",
        isCorrect: null,
        marksAwarded: null,
        isMarked: false,
        timeSpentSeconds: 300,
      },
      {
        id: 4,
        question: {
          id: 4,
          questionText: "What is the capital of France?",
          questionType: "SHORT_ANSWER",
          marks: 2,
          correctAnswer: "Paris",
          difficulty: "EASY",
        },
        answerText: "Paris",
        isCorrect: null,
        marksAwarded: null,
        isMarked: false,
        timeSpentSeconds: 10,
      },
    ],
  },
];

function ExamMarking() {
  const [examAttempts, setExamAttempts] = useState(mockExamAttempts);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [filter, setFilter] = useState("all"); // all, unmarked, marked, flagged
  const [searchTerm, setSearchTerm] = useState("");
  const [markingMode, setMarkingMode] = useState("individual"); // individual, bulk

  useEffect(() => {
    // Load exam attempts from API
    loadExamAttempts();
  }, []);

  const loadExamAttempts = async () => {
    try {
      // Replace with actual API call
      // const response = await fetch('/api/exam-attempts/pending-marking');
      // const data = await response.json();
      // setExamAttempts(data);
    } catch (error) {
      console.error("Error loading exam attempts:", error);
    }
  };

  const handleAnswerMarking = async (
    answerId,
    marksAwarded,
    isCorrect,
    feedback = ""
  ) => {
    try {
      // Update local state
      setExamAttempts((prev) =>
        prev.map((attempt) => ({
          ...attempt,
          studentAnswers: attempt.studentAnswers.map((answer) =>
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
        }))
      );

      // API call to save marking
      // await fetch(`/api/student-answers/${answerId}/mark`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ marksAwarded, isCorrect, teacherFeedback: feedback })
      // });

      console.log("Answer marked successfully");
    } catch (error) {
      console.error("Error marking answer:", error);
    }
  };

  const handleAutoMark = (answer) => {
    const { question, answerText } = answer;

    if (
      question.questionType === "MULTIPLE_CHOICE" ||
      question.questionType === "TRUE_FALSE"
    ) {
      const isCorrect =
        answerText?.toLowerCase() === question.correctAnswer?.toLowerCase();
      const marksAwarded = isCorrect ? question.marks : 0;
      handleAnswerMarking(answer.id, marksAwarded, isCorrect);
    } else if (question.questionType === "SHORT_ANSWER") {
      // Simple text matching for short answers
      const isCorrect =
        answerText?.toLowerCase().trim() ===
        question.correctAnswer?.toLowerCase().trim();
      const marksAwarded = isCorrect ? question.marks : 0;
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
            answer.question.questionType
          )
        ) {
          handleAutoMark(answer);
        }
      });
  };

  const handleFlagAnswer = async (answerId, flagReason = "") => {
    try {
      setExamAttempts((prev) =>
        prev.map((attempt) => ({
          ...attempt,
          studentAnswers: attempt.studentAnswers.map((answer) =>
            answer.id === answerId
              ? { ...answer, isFlagged: !answer.isFlagged, flagReason }
              : answer
          ),
        }))
      );
    } catch (error) {
      console.error("Error flagging answer:", error);
    }
  };

  const filteredAttempts = examAttempts.filter((attempt) => {
    const matchesSearch =
      attempt.student.firstName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      attempt.student.lastName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      attempt.student.registrationNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesFilter =
      filter === "all" ||
      (filter === "unmarked" &&
        attempt.studentAnswers.some((a) => !a.isMarked)) ||
      (filter === "marked" &&
        attempt.studentAnswers.every((a) => a.isMarked)) ||
      (filter === "flagged" && attempt.studentAnswers.some((a) => a.isFlagged));

    return matchesSearch && matchesFilter;
  });

  const currentAnswer = selectedAttempt?.studentAnswers[currentQuestionIndex];
  const totalQuestions = selectedAttempt?.studentAnswers.length || 0;
  const markedCount =
    selectedAttempt?.studentAnswers.filter((a) => a.isMarked).length || 0;

  const QuestionCard = ({ answer, onMark, onFlag, onAutoMark }) => {
    const [marks, setMarks] = useState(answer.marksAwarded || 0);
    const [feedback, setFeedback] = useState(answer.teacherFeedback || "");
    const [isCorrect, setIsCorrect] = useState(answer.isCorrect);

    const question = answer.question;
    const maxMarks = question.marks;

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

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {getQuestionTypeIcon(question.questionType)}
            </span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(
                question.difficulty
              )}`}
            >
              {question.difficulty}
            </span>
            <span className="text-sm text-gray-600">
              {question.marks} marks
            </span>
          </div>
          <div className="flex gap-2">
            {["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER"].includes(
              question.questionType
            ) && (
              <button
                onClick={() => onAutoMark(answer)}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
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
          <p className="text-gray-700">{question.questionText}</p>

          {question.questionType === "MULTIPLE_CHOICE" && question.options && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 mb-1">Options:</p>
              <div className="grid grid-cols-2 gap-2">
                {question.options.map((option, idx) => (
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
              {answer.answerText || "No answer provided"}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="font-semibold text-gray-800 mb-2">Correct Answer:</h3>
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <p className="text-green-800">{question.correctAnswer}</p>
          </div>
        </div>

        {(question.questionType === "ESSAY" ||
          question.questionType === "SHORT_ANSWER") && (
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
            Time spent: {Math.floor(answer.timeSpentSeconds / 60)}m{" "}
            {answer.timeSpentSeconds % 60}s
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

  if (!selectedAttempt) {
    return (
      <div className="flex h-screen overflow-hidden">
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-gray-50 to-blue-50">
          <main className="grow p-6">
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Exam Marking
                </h1>
                <p className="text-gray-600">
                  Select an exam attempt to start marking
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="flex gap-4 mb-4">
                  <div className="flex-1 relative">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Attempts</option>
                    <option value="unmarked">Unmarked</option>
                    <option value="marked">Marked</option>
                    <option value="flagged">Flagged</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAttempts.map((attempt) => {
                    const markedCount = attempt.studentAnswers.filter(
                      (a) => a.isMarked
                    ).length;
                    const totalCount = attempt.studentAnswers.length;
                    const progress = (markedCount / totalCount) * 100;

                    return (
                      <div
                        key={attempt.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedAttempt(attempt)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon
                              icon={faUser}
                              className="text-gray-500"
                            />
                            <span className="font-medium text-gray-800">
                              {attempt.student.firstName}{" "}
                              {attempt.student.lastName}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {attempt.student.registrationNumber}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {attempt.exam.examName}
                        </p>

                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600">
                            Progress: {markedCount}/{totalCount}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              progress === 100
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {progress.toFixed(0)}%
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                          Submitted:{" "}
                          {new Date(
                            attempt.submittedAt || attempt.endTime
                          ).toLocaleString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-gray-50 to-blue-50">
        <main className="grow p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <button
                  onClick={() => setSelectedAttempt(null)}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-2"
                >
                  <FontAwesomeIcon icon={faChevronLeft} />
                  Back to Attempts
                </button>
                <h1 className="text-3xl font-bold text-gray-800">
                  Marking: {selectedAttempt.student.firstName}{" "}
                  {selectedAttempt.student.lastName}
                </h1>
                <p className="text-gray-600">
                  {selectedAttempt.exam.examName} • Progress: {markedCount}/
                  {totalQuestions}
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
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default ExamMarking;
