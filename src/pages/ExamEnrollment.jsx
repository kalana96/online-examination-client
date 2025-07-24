import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../partials/Header";
import Sidebar from "../partials/StudentSidebar";
import ExamService from "../service/ExamService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faInfoCircle,
  faClock,
  faCalendarAlt,
  faBookOpen,
  faSpinner,
  faPlay,
  faArrowLeft,
  faShieldAlt,
  faFileAlt,
  faQuestionCircle,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function ExamEnrollment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);

  const token = localStorage.getItem("token");
  const studentId = localStorage.getItem("id");
  const examId = id;

  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  useEffect(() => {
    if (exam) {
      const timer = setInterval(() => {
        updateTimeRemaining();
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [exam]);

  const fetchExamDetails = async () => {
    try {
      const response = await ExamService.getExamByStudent(examId, token);
      if (response.code === "00") {
        setExam(response.content);
      } else {
        toast.error("Failed to fetch exam details");
        navigate("/student/today-exams");
      }
    } catch (error) {
      console.error("Error fetching exam:", error);
      toast.error("Error fetching exam details");
      navigate("/student/today-exams");
    } finally {
      setLoading(false);
    }
  };

  const updateTimeRemaining = () => {
    if (!exam?.examDate || !exam?.startTime) return;

    const now = new Date();
    const examDate = new Date(exam.examDate);
    const [hours, minutes] = exam.startTime.split(":").map(Number);
    const examStartTime = new Date(examDate);
    examStartTime.setHours(hours, minutes, 0, 0);

    const diff = examStartTime - now;

    if (diff > 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeRemaining(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    } else {
      setTimeRemaining(null);
    }
  };

  const handleEnrollAndStart = async () => {
    setEnrolling(true);
    try {
      // Simulate enrollment process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to exam taking page
      navigate(`/student/takingExam`);
      //   navigate(`/student/takeingExam/${examId}`);
      toast.success("Successfully enrolled in exam!");
    } catch (error) {
      console.error("Error enrolling in exam:", error);
      toast.error("Failed to enroll in exam");
    } finally {
      setEnrolling(false);
    }
  };

  const getExamStatus = () => {
    if (!exam?.examDate || !exam?.startTime) return "Unknown";

    const now = new Date();
    const examDate = new Date(exam.examDate);
    const [hours, minutes] = exam.startTime.split(":").map(Number);
    const examStartTime = new Date(examDate);
    examStartTime.setHours(hours, minutes, 0, 0);
    const examEndTime = new Date(
      examStartTime.getTime() + (exam.duration || 0) * 60000
    );

    if (now < examStartTime) return "Upcoming";
    if (now >= examStartTime && now < examEndTime) return "Ongoing";
    return "Completed";
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hours, minutes] = timeString.split(":").map(Number);
    const time = new Date();
    time.setHours(hours, minutes, 0, 0);
    return time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const examInstructions = [
    "Read all questions carefully before answering",
    "You must complete the exam within the allocated time limit",
    "No external resources or materials are allowed unless specified",
    "Do not leave the exam window or switch to other applications",
    "Any suspicious activity will be flagged and may result in disqualification",
    "Technical issues should be reported immediately to the proctor",
    "Submit your answers before the time expires to avoid loss of work",
    "You cannot pause or restart the exam once it begins",
    "Ensure you have a stable internet connection throughout the exam",
    "Use a quiet, well-lit environment for the exam",
  ];

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        {/* <Sidebar /> */}
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
          {/* <Header /> */}
          <main className="grow flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <FontAwesomeIcon
                icon={faSpinner}
                className="text-4xl text-blue-500 animate-spin"
              />
              <p className="text-gray-600">Loading exam details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const examStatus = getExamStatus();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* <Sidebar /> */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
        {/* <Header /> */}
        <main className="grow p-6">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => navigate("/student/todayExam")}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
              >
                <FontAwesomeIcon icon={faArrowLeft} />
                <span>Back to Today's Exams</span>
              </button>
            </div>

            {/* Exam Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {exam?.examName}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {exam?.clazz?.className}
                  </p>
                </div>
                <div className="text-right">
                  <div
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                      examStatus === "Ongoing"
                        ? "bg-green-100 text-green-800"
                        : examStatus === "Upcoming"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <FontAwesomeIcon
                      icon={
                        examStatus === "Ongoing"
                          ? faPlay
                          : examStatus === "Upcoming"
                          ? faClock
                          : faCheckCircle
                      }
                      className="mr-2"
                    />
                    {examStatus}
                  </div>
                  {timeRemaining && (
                    <p className="text-sm text-gray-500 mt-2">
                      Starts in: {timeRemaining}
                    </p>
                  )}
                </div>
              </div>

              {/* Exam Description */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-3 flex items-center">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="mr-2 text-blue-500"
                  />
                  Exam Description
                </h2>
                {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-700">
                    {exam?.description ||
                      "This is a comprehensive examination covering the topics discussed in class. Please read all instructions carefully before beginning and ensure you have a stable internet connection throughout the exam."}
                  </p>
                </div> */}
              </div>

              {/* Exam Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="text-blue-500 text-xl"
                    />
                    <div>
                      <p className="text-gray-500 text-sm">Date</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(exam?.examDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="text-green-500 text-xl"
                    />
                    <div>
                      <p className="text-gray-500 text-sm">Start Time</p>
                      <p className="font-semibold text-gray-900">
                        {formatTime(exam?.startTime)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon
                      icon={faBookOpen}
                      className="text-purple-500 text-xl"
                    />
                    <div>
                      <p className="text-gray-500 text-sm">Duration</p>
                      <p className="font-semibold text-gray-900">
                        {exam?.duration} minutes
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <FontAwesomeIcon
                      icon={faFileAlt}
                      className="text-orange-500 text-xl"
                    />
                    <div>
                      <p className="text-gray-500 text-sm">Type</p>
                      <p className="font-semibold text-gray-900">
                        {exam?.examType}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Exam Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Questions:</span>
                      <span className="font-medium">
                        {exam?.totalQuestions || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Passing Score:</span>
                      <span className="font-medium">
                        {exam?.passingScore || "N/A"}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Attempts Allowed:</span>
                      <span className="font-medium">1</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3">
                    Before You Start
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Ensure stable internet connection</li>
                    <li>• Close all unnecessary applications</li>
                    <li>• Have your student ID ready</li>
                    <li>• Use a quiet, well-lit environment</li>
                    <li>• Check your camera and microphone</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Exam Instructions */}
            {/* <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <FontAwesomeIcon
                  icon={faShieldAlt}
                  className="mr-2 text-red-500"
                />
                Exam Instructions
              </h2>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-700 font-medium">
                  ⚠️ Important: Please read all instructions carefully.
                  Violation of any rules may result in disqualification.
                </p>
              </div>

              <div className="space-y-3">
                {examInstructions.map((instruction, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
                      {index + 1}
                    </div>
                    <span className="text-gray-700 flex-1">{instruction}</span>
                  </div>
                ))}
              </div>
            </div> */}

            {/* Enroll Button */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Ready to take the exam?
                </h3>
                <p className="text-gray-600 mb-6">
                  Once you click "Enroll & Start Exam", you will be redirected
                  to the exam interface. Make sure you have read all
                  instructions and are prepared to begin.
                </p>

                <button
                  onClick={handleEnrollAndStart}
                  disabled={enrolling || examStatus !== "Ongoing"}
                  className={`px-8 py-4 rounded-lg font-medium text-lg transition-colors flex items-center justify-center space-x-3 mx-auto ${
                    enrolling || examStatus !== "Ongoing"
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl"
                  }`}
                >
                  {enrolling ? (
                    <>
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="animate-spin"
                      />
                      <span>Enrolling & Starting...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faPlay} />
                      <span>Enroll & Start Exam</span>
                    </>
                  )}
                </button>

                {examStatus !== "Ongoing" && (
                  <p className="text-sm text-gray-500 mt-3">
                    {examStatus === "Upcoming"
                      ? "Exam is not yet available. Please wait for the scheduled time."
                      : "This exam has already been completed."}
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ExamEnrollment;
