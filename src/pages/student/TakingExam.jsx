import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Bell,
  LogOut,
  User,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
} from "lucide-react";

const TakingExam = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(29 * 60 + 9); // 29:09 in seconds
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const editorRef = useRef(null);
  const [examData] = useState({
    examName: "Exam Title",
    subjectName: "Subject Name",
    isOnline: true,
    isProctoringEnabled: true,
    studentName: "Student Name",
    questions: [
      {
        id: 1,
        questionText: "What is the capital of France?",
        questionType: "MULTIPLE_CHOICE",
        options: ["Answer 1", "Answer 2", "Answer 3", "Answer 4"],
        marks: 2,
      },
      {
        id: 2,
        questionText:
          "Explain the concept of object-oriented programming in your own words.",
        questionType: "ESSAY",
        options: [],
        marks: 5,
      },
      {
        id: 3,
        questionText: "The Earth is flat.",
        questionType: "TRUE_FALSE",
        options: ["True", "False"],
        marks: 1,
      },
      {
        id: 4,
        questionText: "What is 2 + 2?",
        questionType: "SHORT_ANSWER",
        options: [],
        marks: 1,
      },
    ],
  });

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const currentQuestion = examData.questions[currentQuestionIndex];

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentQuestionIndex < examData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const clearSelection = () => {
    handleAnswerChange(currentQuestion.id, "");
  };

  const getQuestionStatus = (questionIndex) => {
    const question = examData.questions[questionIndex];
    const answer = answers[question.id];
    if (answer && answer.trim() !== "") {
      return "answered";
    }
    return "unanswered";
  };

  const applyFormatting = (command, value = null) => {
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);

      // Update the answer state with the formatted content
      const content = editorRef.current.innerHTML;
      handleAnswerChange(currentQuestion.id, content);
    }
  };

  const handleEditorInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      handleAnswerChange(currentQuestion.id, content);
    }
  };

  const handleSubmit = () => {
    setShowSubmissionModal(true);
  };

  const confirmSubmission = () => {
    // Handle actual submission logic here
    console.log("Exam submitted with answers:", answers);
    setShowSubmissionModal(false);
    // You can redirect to results page or show success message
  };

  const getAnswerSummary = () => {
    return examData.questions.map((question) => {
      const answer = answers[question.id] || "";
      let displayAnswer = "";

      if (
        question.questionType === "MULTIPLE_CHOICE" ||
        question.questionType === "TRUE_FALSE"
      ) {
        displayAnswer = answer || "Not answered";
      } else if (
        question.questionType === "ESSAY" ||
        question.questionType === "SHORT_ANSWER"
      ) {
        // Strip HTML tags for summary display
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = answer;
        displayAnswer =
          tempDiv.textContent || tempDiv.innerText || "Not answered";
      }

      return {
        ...question,
        answer: displayAnswer,
        isAnswered: answer && answer.trim() !== "",
      };
    });
  };

  const getSubmissionStats = () => {
    const totalQuestions = examData.questions.length;
    const answeredQuestions = examData.questions.filter((q) => {
      const answer = answers[q.id];
      return answer && answer.trim() !== "";
    }).length;

    return {
      total: totalQuestions,
      answered: answeredQuestions,
      unanswered: totalQuestions - answeredQuestions,
    };
  };

  const renderQuestion = () => {
    const answer = answers[currentQuestion.id] || "";

    switch (currentQuestion.questionType) {
      case "MULTIPLE_CHOICE":
        return (
          <div className="space-y-4">
            <div className="bg-gray-200 p-4 rounded">
              <h3 className="font-medium text-gray-700">
                Question {currentQuestionIndex + 1}
              </h3>
              <p className="mt-2 text-gray-800">
                {currentQuestion.questionText}
              </p>
            </div>

            <div className="space-y-3">
              <p className="font-medium text-gray-700">Choose answer</p>
              <div className="grid grid-cols-2 gap-4">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={answer === option}
                      onChange={(e) =>
                        handleAnswerChange(currentQuestion.id, e.target.value)
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={clearSelection}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        );

      case "TRUE_FALSE":
        return (
          <div className="space-y-4">
            <div className="bg-gray-200 p-4 rounded">
              <h3 className="font-medium text-gray-700">
                Question {currentQuestionIndex + 1}
              </h3>
              <p className="mt-2 text-gray-800">
                {currentQuestion.questionText}
              </p>
            </div>

            <div className="space-y-3">
              <p className="font-medium text-gray-700">Choose answer</p>
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option}
                      checked={answer === option}
                      onChange={(e) =>
                        handleAnswerChange(currentQuestion.id, e.target.value)
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-gray-700">{option}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={clearSelection}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Clear Selection
              </button>
            </div>
          </div>
        );

      case "ESSAY":
      case "SHORT_ANSWER":
        return (
          <div className="space-y-4">
            <div className="bg-gray-200 p-4 rounded">
              <h3 className="font-medium text-gray-700">
                Question {currentQuestionIndex + 1}
              </h3>
              <p className="mt-2 text-gray-800">
                {currentQuestion.questionText}
              </p>
            </div>

            <div className="space-y-3">
              <p className="font-medium text-gray-700">Answer</p>

              {/* Formatting Toolbar */}
              <div className="border border-gray-300 rounded-t bg-gray-50 p-2 flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => applyFormatting("bold")}
                  className="p-2 rounded hover:bg-gray-200 transition-colors"
                  title="Bold"
                >
                  <Bold size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("italic")}
                  className="p-2 rounded hover:bg-gray-200 transition-colors"
                  title="Italic"
                >
                  <Italic size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("underline")}
                  className="p-2 rounded hover:bg-gray-200 transition-colors"
                  title="Underline"
                >
                  <Underline size={16} />
                </button>
                <div className="w-px h-6 bg-gray-300"></div>
                <button
                  type="button"
                  onClick={() => applyFormatting("insertUnorderedList")}
                  className="p-2 rounded hover:bg-gray-200 transition-colors"
                  title="Bullet List"
                >
                  <List size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => applyFormatting("insertOrderedList")}
                  className="p-2 rounded hover:bg-gray-200 transition-colors"
                  title="Numbered List"
                >
                  <ListOrdered size={16} />
                </button>
              </div>

              {/* Rich Text Editor */}
              <div
                ref={editorRef}
                contentEditable
                onInput={handleEditorInput}
                className="w-full h-32 p-3 border border-gray-300 border-t-0 rounded-b resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white overflow-y-auto"
                style={{ minHeight: "128px" }}
                dangerouslySetInnerHTML={{ __html: answer }}
                suppressContentEditableWarning={true}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800 mb-6">
            {examData.examName}
          </h1>

          <nav className="space-y-2">
            <div className="flex items-center space-x-3 px-4 py-3 bg-gray-600 text-white rounded-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Dashboard</span>
            </div>

            <div className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
              <MessageCircle size={20} />
              <span>In Exam Chat</span>
            </div>

            <div className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
              <Bell size={20} />
              <span>Notification</span>
            </div>

            <div className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer">
              <LogOut size={20} />
              <span>Log Out</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Question Area */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-4">
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
                <span className="text-gray-600">{examData.subjectName}</span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Online indicator</span>
                <div
                  className={`w-3 h-3 rounded-full ${
                    examData.isOnline ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Proctoring indicator</span>
                <div
                  className={`w-3 h-3 rounded-full ${
                    examData.isProctoringEnabled ? "bg-red-500" : "bg-green-500"
                  }`}
                ></div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-gray-600">{examData.studentName}</span>
            </div>
          </div>

          {/* Question Content */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            {renderQuestion()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <button
              onClick={goToPrevious}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>

            <button
              onClick={goToNext}
              disabled={currentQuestionIndex === examData.questions.length - 1}
              className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white shadow-lg p-6">
          {/* Timer */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Timer: {formatTime(timeRemaining)}
            </h3>
          </div>

          {/* Exam Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Exam Summary
            </h3>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {examData.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`w-12 h-12 rounded border-2 flex items-center justify-center text-sm font-medium transition-colors ${
                    index === currentQuestionIndex
                      ? "border-blue-500 bg-blue-100 text-blue-600"
                      : getQuestionStatus(index) === "answered"
                      ? "border-green-500 bg-green-100 text-green-600"
                      : "border-gray-300 bg-white text-gray-500 hover:border-gray-400"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-2 mb-6">
              {Array.from({ length: 4 }, (_, index) => (
                <div
                  key={index}
                  className="w-12 h-12 border-2 border-gray-300 rounded"
                ></div>
              ))}
            </div>

            {/* Question Navigation Area */}
            <div className="w-full h-32 border-2 border-gray-300 rounded bg-gray-50 flex items-center justify-center">
              <div className="text-4xl text-gray-300">×</div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Submission Confirmation Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[95vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-blue-600 text-white p-6 flex-shrink-0">
              <h2 className="text-2xl font-bold">Confirm Submission</h2>
              <p className="text-blue-100 mt-2">
                Review your answers before final submission
              </p>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Submission Statistics */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Submission Summary
                </h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-100 p-3 rounded">
                    <div className="text-2xl font-bold text-blue-600">
                      {getSubmissionStats().total}
                    </div>
                    <div className="text-sm text-blue-600">Total Questions</div>
                  </div>
                  <div className="bg-green-100 p-3 rounded">
                    <div className="text-2xl font-bold text-green-600">
                      {getSubmissionStats().answered}
                    </div>
                    <div className="text-sm text-green-600">Answered</div>
                  </div>
                  <div className="bg-red-100 p-3 rounded">
                    <div className="text-2xl font-bold text-red-600">
                      {getSubmissionStats().unanswered}
                    </div>
                    <div className="text-sm text-red-600">Unanswered</div>
                  </div>
                </div>
              </div>

              {/* Answer Summary */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Answer Summary
                </h3>

                {getAnswerSummary().map((question, index) => (
                  <div
                    key={question.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-medium">
                            Question {index + 1}
                          </span>
                          <span className="text-sm text-gray-500">
                            {question.questionType.replace("_", " ")} |{" "}
                            {question.marks} marks
                          </span>
                        </div>
                        <p className="text-gray-800 font-medium">
                          {question.questionText}
                        </p>
                      </div>
                      <div
                        className={`ml-4 px-3 py-1 rounded-full text-sm font-medium ${
                          question.isAnswered
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {question.isAnswered ? "Answered" : "Not Answered"}
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-600 mb-1">Your Answer:</p>
                      <div className="text-gray-800">
                        {question.answer === "Not answered" ? (
                          <span className="text-red-500 italic">
                            No answer provided
                          </span>
                        ) : question.questionType === "ESSAY" ||
                          question.questionType === "SHORT_ANSWER" ? (
                          <div className="max-h-20 overflow-y-auto">
                            {question.answer.length > 200
                              ? `${question.answer.substring(0, 200)}...`
                              : question.answer}
                          </div>
                        ) : (
                          <span className="font-medium">{question.answer}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning for unanswered questions */}
              {getSubmissionStats().unanswered > 0 && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <span className="text-yellow-800 text-sm font-bold">
                        !
                      </span>
                    </div>
                    <p className="text-yellow-800">
                      You have {getSubmissionStats().unanswered} unanswered
                      question(s). You can still submit, but consider reviewing
                      them first.
                    </p>
                  </div>
                </div>
              )}

              {/* Time remaining notice */}
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 text-center">
                  Time remaining:{" "}
                  <span className="font-bold">{formatTime(timeRemaining)}</span>
                </p>
              </div>
            </div>

            {/* Modal Footer - Fixed at bottom */}
            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center flex-shrink-0 border-t">
              <button
                onClick={() => setShowSubmissionModal(false)}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors"
              >
                Review Answers
              </button>
              <button
                onClick={confirmSubmission}
                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors font-medium"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakingExam;
