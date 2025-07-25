import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../partials/Header";
import Sidebar from "../../partials/TeacherSidebar";
import ExamService from "../../service/ExamService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import {
  faArrowLeft,
  faEdit,
  faCalendarAlt,
  faClock,
  faGraduationCap,
  faUsers,
  faFileText,
  faEye,
  faEyeSlash,
  faTrophy,
  faChalkboardTeacher,
  faBookOpen,
  faInfoCircle,
  faCheckCircle,
  faTimesCircle,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

function ExamDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const currentUserId = localStorage.getItem("id");

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const examId = id;

  // Fetch exam details when component mounts
  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ExamService.getExamById(examId, token);

      if (response.code === "00") {
        setExam(response.content);
      } else {
        setError(response.message || "Failed to fetch exam details");
        toast.error("Failed to fetch exam details");
      }
    } catch (error) {
      console.error("Error fetching exam details:", error);
      setError("An error occurred while fetching exam details");
      toast.error("An error occurred while fetching exam details");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/teacher/examList");
  };

  const handleEdit = () => {
    navigate(`/teacher/editExam/${examId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const [hours, minutes] = timeString.split(":");
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes));
      return time.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (error) {
      return timeString;
    }
  };

  const getExamStatusBadge = () => {
    if (!exam) return null;

    const currentDate = new Date();
    const examDate = new Date(exam.examDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);

    if (examDate < today) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
          <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
          Completed
        </span>
      );
    } else if (examDate.getTime() === today.getTime()) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          <FontAwesomeIcon icon={faClock} className="mr-1" />
          Today
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
          <FontAwesomeIcon icon={faCalendarAlt} className="mr-1" />
          Upcoming
        </span>
      );
    }
  };

  const getProctoringStatusBadge = () => {
    if (!exam) return null;

    const isEnabled = exam.proctoringStatus === "enabled";
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          isEnabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}
      >
        <FontAwesomeIcon
          icon={isEnabled ? faEye : faEyeSlash}
          className="mr-1"
        />
        {isEnabled ? "Enabled" : "Disabled"}
      </span>
    );
  };

  const calculatePassPercentage = () => {
    if (!exam || !exam.maxMark || !exam.passMark) return 0;
    return Math.round((exam.passMark / exam.maxMark) * 100);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
          <Header />
          <main className="grow p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FontAwesomeIcon
                  icon={faSpinner}
                  className="text-4xl text-blue-500 animate-spin mb-4"
                />
                <p className="text-lg text-gray-600">Loading exam details...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
          <Header />
          <main className="grow p-6">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <FontAwesomeIcon
                  icon={faTimesCircle}
                  className="text-4xl text-red-500 mb-4"
                />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Error Loading Exam
                </h2>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={handleBack}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                  Back to Exam List
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
        <Header />
        <main className="grow p-6">
          {/* Header Section */}
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon={faFileText}
                  className="text-3xl text-blue-600 mr-4"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    {exam?.examName}
                  </h1>
                  <p className="text-gray-600">Exam Details</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getExamStatusBadge()}
                {getProctoringStatusBadge()}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleEdit}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Edit Exam
              </button>
              <button
                onClick={handleBack}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Back to List
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FontAwesomeIcon
                  icon={faInfoCircle}
                  className="mr-2 text-blue-600"
                />
                Basic Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exam Type
                    </label>
                    <p className="text-gray-900 font-medium">
                      {exam?.examType || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <p className="text-gray-900 font-medium flex items-center">
                      <FontAwesomeIcon
                        icon={faClock}
                        className="mr-1 text-blue-600"
                      />
                      {exam?.duration ? `${exam.duration} minutes` : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Class
                    </label>
                    <p className="text-gray-900 font-medium flex items-center">
                      <FontAwesomeIcon
                        icon={faGraduationCap}
                        className="mr-1 text-blue-600"
                      />
                      {exam?.clazz?.className || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teacher
                    </label>
                    <p className="text-gray-900 font-medium flex items-center">
                      <FontAwesomeIcon
                        icon={faChalkboardTeacher}
                        className="mr-1 text-blue-600"
                      />
                      {exam?.teacher?.firstName || "N/A"}{" "}
                      {exam?.teacher?.lastName || "N/A"}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Students
                  </label>
                  <p className="text-gray-900 font-medium flex items-center">
                    <FontAwesomeIcon
                      icon={faUsers}
                      className="mr-1 text-blue-600"
                    />
                    {exam?.studentCount || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Schedule Information */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FontAwesomeIcon
                  icon={faCalendarAlt}
                  className="mr-2 text-green-600"
                />
                Schedule
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Date
                  </label>
                  <p className="text-gray-900 font-medium text-lg">
                    {formatDate(exam?.examDate)}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time
                    </label>
                    <p className="text-gray-900 font-medium">
                      {formatTime(exam?.startTime)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time
                    </label>
                    <p className="text-gray-900 font-medium">
                      {formatTime(exam?.endTime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Scoring Information */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FontAwesomeIcon
                  icon={faTrophy}
                  className="mr-2 text-yellow-600"
                />
                Scoring
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Marks
                    </label>
                    <p className="text-gray-900 font-bold text-2xl text-blue-600">
                      {exam?.maxMark || 0}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pass Marks
                    </label>
                    <p className="text-gray-900 font-bold text-2xl text-green-600">
                      {exam?.passMark || 0}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pass Percentage
                  </label>
                  <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full h-4 flex-1 mr-4">
                      <div
                        className="bg-green-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${calculatePassPercentage()}%` }}
                      ></div>
                    </div>
                    <span className="text-gray-900 font-medium">
                      {calculatePassPercentage()}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FontAwesomeIcon
                  icon={faBookOpen}
                  className="mr-2 text-purple-600"
                />
                Settings
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Proctoring Status
                  </label>
                  <div className="flex items-center">
                    {getProctoringStatusBadge()}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam ID
                  </label>
                  <p className="text-gray-900 font-mono text-sm bg-gray-100 p-2 rounded">
                    {exam?.id || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions Section */}
          {exam?.instructions && (
            <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FontAwesomeIcon
                  icon={faFileText}
                  className="mr-2 text-indigo-600"
                />
                Exam Instructions
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {exam.instructions}
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-lg shadow-lg mt-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => navigate(`/teacher/examResults/${examId}`)}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faTrophy} className="mr-2" />
                View Results
              </button>
              <button
                onClick={() => navigate(`/teacher/examQuestions/${examId}`)}
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faFileText} className="mr-2" />
                Manage Questions
              </button>
              <button
                onClick={() => navigate(`/teacher/examStudents/${examId}`)}
                className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded flex items-center justify-center"
              >
                <FontAwesomeIcon icon={faUsers} className="mr-2" />
                View Students
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ExamDetails;
