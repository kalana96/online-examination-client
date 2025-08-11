import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Header from "../../partials/Header";
import Sidebar from "../../partials/StudentSidebar";
import ExamService from "../../service/ExamService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarAlt,
  faClock,
  faUsers,
  faGraduationCap,
  faBookOpen,
  faFileText,
  faSpinner,
  faExclamationTriangle,
  faInfoCircle,
  faPlay,
  faCheckCircle,
  faHourglassHalf,
  faTimesCircle,
  faQuestionCircle,
  faStopwatch,
  faClipboardList,
  faTags,
  faMapMarkerAlt,
  faLock,
  faUnlock,
  faEye,
  faEdit,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function StudentExamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const token = localStorage.getItem("token");
  const studentId = localStorage.getItem("id");

  useEffect(() => {
    if (id) {
      fetchExamDetails();
      checkSubmissionStatus();
      checkAttemptCount();
    }
  }, [id]);

  useEffect(() => {
    // Set up timer for ongoing exams
    if (exam && getExamStatus(exam) === "Ongoing") {
      const timer = setInterval(() => {
        updateTimeRemaining();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [exam]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      const response = await ExamService.getExamByStudent(id, token);

      if (response.code === "00" && response.content) {
        setExam(response.content);
      } else {
        setError(response.message || "Failed to fetch exam details");
      }
    } catch (error) {
      console.error("Error fetching exam details:", error);
      setError("Error loading exam details");
    } finally {
      setLoading(false);
    }
  };

  const checkSubmissionStatus = async () => {
    try {
      const response = await ExamService.hasStudentSubmittedExam(
        studentId,
        id,
        token
      );
      if (response.code === "00") {
        setSubmissionStatus(response.content);
      }
    } catch (error) {
      console.error("Error checking submission status:", error);
    }
  };

  const checkAttemptCount = async () => {
    try {
      // Assuming you have this endpoint in your service
      // const response = await ExamService.getAttemptCount(studentId, id, token);
      // setAttemptCount(response.content || 0);
      setAttemptCount(0); // Placeholder
    } catch (error) {
      console.error("Error checking attempt count:", error);
    }
  };

  const getExamStatus = (examData) => {
    if (!examData?.examDate || !examData?.startTime) return "Unknown";

    if (submissionStatus) return "Submitted";

    try {
      const now = new Date();
      const examDate = new Date(examData.examDate);
      const [startHours, startMinutes] = examData.startTime
        .split(":")
        .map(Number);
      const examStartDateTime = new Date(examDate);
      examStartDateTime.setHours(startHours, startMinutes, 0, 0);
      const examEndDateTime = new Date(
        examStartDateTime.getTime() + (examData.duration || 0) * 60000
      );

      if (now < examStartDateTime) {
        return "Upcoming";
      } else if (now >= examStartDateTime && now < examEndDateTime) {
        return "Ongoing";
      } else if (now >= examEndDateTime) {
        return "Completed";
      } else {
        return "Expired";
      }
    } catch (error) {
      return "Unknown";
    }
  };

  const getStatusDisplay = (examData) => {
    const status = getExamStatus(examData);

    const statusConfig = {
      Upcoming: {
        text: "Upcoming",
        color: "bg-blue-500",
        textColor: "text-white",
        icon: faHourglassHalf,
        bgLight: "bg-blue-50",
        borderColor: "border-blue-200",
      },
      Ongoing: {
        text: "Live Now",
        color: "bg-green-500",
        textColor: "text-white",
        icon: faPlay,
        bgLight: "bg-green-50",
        borderColor: "border-green-200",
      },
      Completed: {
        text: "Completed",
        color: "bg-gray-500",
        textColor: "text-white",
        icon: faCheckCircle,
        bgLight: "bg-gray-50",
        borderColor: "border-gray-200",
      },
      Submitted: {
        text: "Submitted",
        color: "bg-purple-500",
        textColor: "text-white",
        icon: faCheckCircle,
        bgLight: "bg-purple-50",
        borderColor: "border-purple-200",
      },
      default: {
        text: "Unknown",
        color: "bg-gray-400",
        textColor: "text-white",
        icon: faInfoCircle,
        bgLight: "bg-gray-50",
        borderColor: "border-gray-200",
      },
    };

    return statusConfig[status] || statusConfig.default;
  };

  const updateTimeRemaining = () => {
    if (!exam) return;

    try {
      const now = new Date();
      const examDate = new Date(exam.examDate);
      const [startHours, startMinutes] = exam.startTime.split(":").map(Number);
      const examStartDateTime = new Date(examDate);
      examStartDateTime.setHours(startHours, startMinutes, 0, 0);
      const examEndDateTime = new Date(
        examStartDateTime.getTime() + (exam.duration || 0) * 60000
      );

      const diff = examEndDateTime - now;
      if (diff <= 0) {
        setTimeRemaining("Exam Ended");
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    } catch (error) {
      setTimeRemaining(null);
    }
  };

  const getTimeUntilStart = () => {
    if (!exam?.examDate || !exam?.startTime) return null;

    try {
      const now = new Date();
      const examDate = new Date(exam.examDate);
      const [startHours, startMinutes] = exam.startTime.split(":").map(Number);
      const examStartDateTime = new Date(examDate);
      examStartDateTime.setHours(startHours, startMinutes, 0, 0);

      const diff = examStartDateTime - now;
      if (diff <= 0) return null;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    } catch (error) {
      return null;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    try {
      const [hours, minutes] = timeString.split(":").map(Number);
      const time = new Date();
      time.setHours(hours, minutes, 0, 0);
      return time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return timeString;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleTakeExam = () => {
    const status = getExamStatus(exam);

    if (submissionStatus) {
      toast.info("You have already submitted this exam");
      return;
    }

    if (status === "Ongoing") {
      navigate(`/student/enrollExam/${id}`);
    } else if (status === "Upcoming") {
      toast.warning("Exam has not started yet");
    } else if (status === "Completed") {
      toast.info("This exam has already ended");
    }
  };

  const handleViewResults = () => {
    navigate(`/student/examResults/${id}`);
  };

  const handleGoBack = () => {
    if (location.state?.fromPage) {
      navigate(-1);
    } else {
      navigate("/student/todayExams");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
          <Header />
          <main className="grow flex items-center justify-center">
            <div className="text-center">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-4xl text-blue-500 animate-spin mb-4"
              />
              <p className="text-gray-600">Loading exam details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
          <Header />
          <main className="grow flex items-center justify-center">
            <div className="text-center">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-4xl text-red-500 mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Error Loading Exam
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={handleGoBack}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Go Back
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
          <Header />
          <main className="grow flex items-center justify-center">
            <div className="text-center">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-4xl text-yellow-500 mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Exam Not Found
              </h2>
              <p className="text-gray-600 mb-4">
                The requested exam could not be found.
              </p>
              <button
                onClick={handleGoBack}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Go Back
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusDisplay(exam);
  const examStatus = getExamStatus(exam);
  const timeUntilStart = getTimeUntilStart();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
        <Header />
        <main className="grow p-6">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleGoBack}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>Back</span>
              </button>

              <div
                className={`px-4 py-2 rounded-full ${statusInfo.color} ${statusInfo.textColor} flex items-center space-x-2`}
              >
                <FontAwesomeIcon icon={statusInfo.icon} />
                <span className="font-medium">{statusInfo.text}</span>
              </div>
            </div>
          </div>

          {/* Exam Header Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-8 py-8">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-white bg-opacity-20 rounded-full p-3">
                      <FontAwesomeIcon
                        icon={faGraduationCap}
                        className="text-2xl text-white"
                      />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-1">
                        {exam.examName}
                      </h1>
                      <p className="text-blue-100">
                        {exam.clazz?.className || "N/A"} •{" "}
                        {exam.examType || "Exam"}
                      </p>
                    </div>
                  </div>

                  {/* Live Timer for Ongoing Exams */}
                  {examStatus === "Ongoing" && timeRemaining && (
                    <div className="bg-white bg-opacity-10 rounded-lg px-4 py-3 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 text-white">
                        <FontAwesomeIcon
                          icon={faStopwatch}
                          className="text-red-300"
                        />
                        <span className="text-sm">Time Remaining:</span>
                        <span className="text-lg font-mono font-bold text-red-300">
                          {timeRemaining}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Countdown for Upcoming Exams */}
                  {examStatus === "Upcoming" && timeUntilStart && (
                    <div className="bg-white bg-opacity-10 rounded-lg px-4 py-3 backdrop-blur-sm">
                      <div className="flex items-center space-x-2 text-white">
                        <FontAwesomeIcon
                          icon={faHourglassHalf}
                          className="text-yellow-300"
                        />
                        <span className="text-sm">Starts in:</span>
                        <span className="text-lg font-mono font-bold text-yellow-300">
                          {timeUntilStart}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="text-blue-600"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">
                      Date
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {formatDate(exam.examDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="text-green-600"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">
                      Time
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {formatTime(exam.startTime)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <FontAwesomeIcon
                      icon={faStopwatch}
                      className="text-orange-600"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">
                      Duration
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {exam.duration ? `${exam.duration} min` : "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <FontAwesomeIcon
                      icon={faQuestionCircle}
                      className="text-purple-600"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-medium">
                      Questions
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {exam.totalQuestions || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-8 py-6">
              <div className="flex items-center space-x-4">
                {submissionStatus ? (
                  <button
                    onClick={handleViewResults}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2"
                  >
                    <FontAwesomeIcon icon={faEye} />
                    <span>View Results</span>
                  </button>
                ) : examStatus === "Ongoing" ? (
                  <button
                    onClick={handleTakeExam}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                  >
                    <FontAwesomeIcon icon={faPlay} />
                    <span>Take Exam Now</span>
                  </button>
                ) : examStatus === "Upcoming" ? (
                  <button
                    disabled
                    className="px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed font-medium flex items-center space-x-2"
                  >
                    <FontAwesomeIcon icon={faLock} />
                    <span>Exam Not Started</span>
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed font-medium flex items-center space-x-2"
                  >
                    <FontAwesomeIcon icon={faTimesCircle} />
                    <span>Exam Ended</span>
                  </button>
                )}

                {attemptCount > 0 && (
                  <div className="text-sm text-gray-600">
                    Attempts:{" "}
                    <span className="font-medium">{attemptCount}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Exam Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              {exam.description && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                    <FontAwesomeIcon
                      icon={faFileText}
                      className="text-blue-600"
                    />
                    <span>Description</span>
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {exam.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <FontAwesomeIcon
                    icon={faClipboardList}
                    className="text-green-600"
                  />
                  <span>Instructions</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-blue-600">
                        1
                      </span>
                    </div>
                    <p className="text-gray-700">
                      Read all questions carefully before answering.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-blue-600">
                        2
                      </span>
                    </div>
                    <p className="text-gray-700">
                      You can navigate between questions during the exam.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-blue-600">
                        3
                      </span>
                    </div>
                    <p className="text-gray-700">
                      Make sure to submit your exam before time runs out.
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-xs font-medium text-blue-600">
                        4
                      </span>
                    </div>
                    <p className="text-gray-700">
                      Once submitted, you cannot make changes to your answers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Exam Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="text-blue-600"
                  />
                  <span>Exam Information</span>
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subject:</span>
                    <span className="font-medium text-gray-800">
                      {exam.subject?.subjectName || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Class:</span>
                    <span className="font-medium text-gray-800">
                      {exam.clazz?.className || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Teacher:</span>
                    <span className="font-medium text-gray-800">
                      {exam.teacher?.fullName || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Marks:</span>
                    <span className="font-medium text-gray-800">
                      {exam.totalMarks || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Passing Marks:</span>
                    <span className="font-medium text-gray-800">
                      {exam.passingMarks || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timing Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <FontAwesomeIcon icon={faClock} className="text-orange-600" />
                  <span>Timing Details</span>
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 mb-1">Date & Time</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(exam.examDate)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatTime(exam.startTime)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Duration</p>
                    <p className="font-medium text-gray-800">
                      {exam.duration ? `${exam.duration} minutes` : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Status</p>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color} ${statusInfo.textColor}`}
                    >
                      {statusInfo.text}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/student/upcomingExams")}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="text-blue-500"
                    />
                    <span>View All Upcoming Exams</span>
                  </button>
                  <button
                    onClick={() => navigate("/student/todayExams")}
                    className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <FontAwesomeIcon
                      icon={faBookOpen}
                      className="text-green-500"
                    />
                    <span>Today's Exams</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentExamDetails;
