import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Clock,
  User,
  Download,
  Printer,
  Home,
  BookOpen,
  AlertCircle,
  Calendar,
  Award,
  Eye,
  FileText,
  Mail,
  Phone,
} from "lucide-react";

const ExamSubmissionPage = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock exam data - in real app this would come from props or API
  const examData = {
    examName: "Advanced Programming Concepts",
    subjectName: "Computer Science",
    studentName: "Alex Johnson",
    studentId: "CS2024001",
    submissionTime: new Date(),
    duration: "45 minutes",
    totalMarks: 25,
    timeSpent: "38 minutes 42 seconds",
    submissionId: "SUB-2024-001-789",

    questions: {
      total: 10,
      answered: 8,
      unanswered: 2,
    },
    answers: [
      {
        id: 1,
        questionText:
          "What is the capital of France and what makes it significant in European history?",
        questionType: "MULTIPLE_CHOICE",
        answer: "Paris - Political and cultural center",
        isAnswered: true,
        marks: 3,
      },
      {
        id: 2,
        questionText: "Explain the concept of object-oriented programming.",
        questionType: "ESSAY",
        answer:
          "Object-oriented programming is a programming paradigm based on the concept of objects...",
        isAnswered: true,
        marks: 10,
      },
      {
        id: 3,
        questionText:
          "The Earth's circumference at the equator is approximately 40,075 kilometers.",
        questionType: "TRUE_FALSE",
        answer: "True",
        isAnswered: true,
        marks: 2,
      },
      {
        id: 4,
        questionText:
          "Calculate the result of 15 × 8 + 32 ÷ 4 and show your working.",
        questionType: "SHORT_ANSWER",
        answer: "",
        isAnswered: false,
        marks: 5,
      },
      {
        id: 5,
        questionText: "Which of the following best describes machine learning?",
        questionType: "MULTIPLE_CHOICE",
        answer: "A type of artificial intelligence",
        isAnswered: true,
        marks: 3,
      },
      {
        id: 6,
        questionText:
          "Describe the differences between supervised and unsupervised learning.",
        questionType: "SHORT_ANSWER",
        answer: "",
        isAnswered: false,
        marks: 5,
      },
      {
        id: 7,
        questionText: "Which programming paradigm focuses on functions?",
        questionType: "MULTIPLE_CHOICE",
        answer: "Functional programming",
        isAnswered: true,
        marks: 3,
      },
      {
        id: 8,
        questionText: "What is recursion in programming?",
        questionType: "MULTIPLE_CHOICE",
        answer: "A function calling itself",
        isAnswered: true,
        marks: 3,
      },
      {
        id: 9,
        questionText: "Define polymorphism in OOP.",
        questionType: "SHORT_ANSWER",
        answer:
          "Polymorphism allows objects of different types to be treated as objects of a common base type...",
        isAnswered: true,
        marks: 4,
      },
      {
        id: 10,
        questionText: "What is the time complexity of binary search?",
        questionType: "MULTIPLE_CHOICE",
        answer: "O(log n)",
        isAnswered: true,
        marks: 2,
      },
    ],
  };

  const formatDateTime = (date) => {
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getCompletionPercentage = () => {
    return Math.round(
      (examData.questions.answered / examData.questions.total) * 100
    );
  };

  const getTotalMarksAttempted = () => {
    return examData.answers
      .filter((answer) => answer.isAnswered)
      .reduce((total, answer) => total + answer.marks, 0);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate and download a PDF
    alert("Submission receipt will be downloaded as PDF");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Exam Submitted Successfully
                </h1>
                <p className="text-gray-600">
                  Your answers have been recorded and saved
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Submission Time</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDateTime(currentTime)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Success Message */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 text-white">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Congratulations!</h2>
                  <p className="text-green-100 text-lg">
                    Your exam has been submitted successfully
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white bg-opacity-10 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="w-5 h-5" />
                    <span className="font-semibold">Student Details</span>
                  </div>
                  <p className="text-green-100">{examData.studentName}</p>
                  <p className="text-green-100 text-sm">{examData.studentId}</p>
                </div>

                <div className="bg-white bg-opacity-10 rounded-xl p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="font-semibold">Exam Details</span>
                  </div>
                  <p className="text-green-100">{examData.examName}</p>
                  <p className="text-green-100 text-sm">
                    {examData.subjectName}
                  </p>
                </div>
              </div>
            </div>

            {/* Submission Statistics */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Award className="w-6 h-6 mr-3 text-blue-500" />
                Submission Summary
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {examData.questions.total}
                  </div>
                  <div className="text-blue-700 font-medium">
                    Total Questions
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {examData.questions.answered}
                  </div>
                  <div className="text-green-700 font-medium">Answered</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {examData.questions.unanswered}
                  </div>
                  <div className="text-orange-700 font-medium">Unanswered</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {getCompletionPercentage()}%
                  </div>
                  <div className="text-purple-700 font-medium">Completed</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Completion Progress</span>
                  <span>{getCompletionPercentage()}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${getCompletionPercentage()}%` }}
                  ></div>
                </div>
              </div>

              {/* Time and Marks Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-700">
                      Time Spent
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {examData.timeSpent}
                  </p>
                  <p className="text-sm text-gray-500">
                    out of {examData.duration}
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <Award className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-700">
                      Marks Attempted
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {getTotalMarksAttempted()}
                  </p>
                  <p className="text-sm text-gray-500">
                    out of {examData.totalMarks} marks
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <span className="font-semibold text-gray-700">
                      Submission ID
                    </span>
                  </div>
                  <p className="text-lg font-mono font-bold text-gray-900">
                    {examData.submissionId}
                  </p>
                  <p className="text-sm text-gray-500">
                    Keep this for reference
                  </p>
                </div>
              </div>
            </div>

            {/* Answer Review Section */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Eye className="w-6 h-6 mr-3 text-blue-500" />
                  Answer Review
                </h3>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium"
                >
                  {showDetails ? "Hide Details" : "Show Details"}
                </button>
              </div>

              {showDetails && (
                <div className="space-y-4">
                  {examData.answers.map((answer, index) => (
                    <div
                      key={answer.id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold">
                              Question {index + 1}
                            </span>
                            <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {answer.questionType.replace("_", " ")}
                            </span>
                            <span className="text-sm text-purple-600 font-medium">
                              {answer.marks} marks
                            </span>
                          </div>
                          <p className="text-gray-800 font-medium">
                            {answer.questionText}
                          </p>
                        </div>
                        <div
                          className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${
                            answer.isAnswered
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {answer.isAnswered ? "✓ Answered" : "⚠ Not Answered"}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Your Answer:
                        </p>
                        {answer.isAnswered ? (
                          <div className="text-gray-800">
                            {answer.questionType === "ESSAY" ||
                            answer.questionType === "SHORT_ANSWER" ? (
                              <div className="max-h-32 overflow-y-auto bg-white p-3 rounded border">
                                {answer.answer.length > 200
                                  ? `${answer.answer.substring(0, 200)}...`
                                  : answer.answer}
                              </div>
                            ) : (
                              <div className="bg-white p-3 rounded border">
                                <span className="font-semibold text-blue-600">
                                  {answer.answer}
                                </span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="italic">No answer provided</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handlePrint}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                >
                  <Printer className="w-5 h-5" />
                  <span>Print Receipt</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
                >
                  <Download className="w-5 h-5" />
                  <span>Download PDF</span>
                </button>

                <button className="w-full flex items-center space-x-3 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors font-medium">
                  <Home className="w-5 h-5" />
                  <span>Back to Dashboard</span>
                </button>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-6 h-6 text-amber-600" />
                <h3 className="text-lg font-bold text-amber-800">
                  Important Information
                </h3>
              </div>
              <div className="space-y-3 text-amber-700">
                <p className="text-sm">
                  • Your submission has been recorded at{" "}
                  {formatDateTime(examData.submissionTime)}
                </p>
                <p className="text-sm">
                  • Results will be available within 2-3 business days
                </p>
                <p className="text-sm">
                  • You will receive an email notification once results are
                  published
                </p>
                <p className="text-sm">
                  • Keep your submission ID for future reference
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Need Help?
              </h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-gray-600">
                  <Mail className="w-5 h-5" />
                  <div>
                    <p className="font-medium text-gray-900">Email Support</p>
                    <p className="text-sm">support@examplatform.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-gray-600">
                  <Phone className="w-5 h-5" />
                  <div>
                    <p className="font-medium text-gray-900">Phone Support</p>
                    <p className="text-sm">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <div>
                    <p className="font-medium text-gray-900">Support Hours</p>
                    <p className="text-sm">Mon-Fri: 9 AM - 6 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-bold text-blue-800">
                  What's Next?
                </h3>
              </div>
              <div className="space-y-3 text-blue-700">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm">
                    Results will be processed and reviewed by instructors
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm">
                    You'll receive an email notification when results are ready
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <p className="text-sm">
                    Check your student portal for detailed feedback
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamSubmissionPage;
