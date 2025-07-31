import React, { useState, useEffect } from "react";
import { useRef } from "react";
import { toast } from "react-toastify";
import Header from "../../partials/Header";
import TeacherSidebar from "../../partials/TeacherSidebar";
import FilterButton from "../../components/DropdownFilter";
import Datepicker from "../../components/Datepicker";
import ExamService from "../../service/ExamService";
import ClassService from "../../service/ClassService";

function TeacherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [examStats, setExamStats] = useState({
    totalExams: 0,
    liveExams: 0,
    upcomingExams: 0,
    completedExams: 0,
    totalStudents: 0,
    totalClasses: 0,
  });

  // Separate state for different exam categories
  const [liveExams, setLiveExams] = useState([]);
  const [todaysExams, setTodaysExams] = useState([]);
  const [upcomingExams, setUpcomingExams] = useState([]);

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");
  const teacherId = localStorage.getItem("id");

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (teacherId && token && !hasInitialized.current) {
      hasInitialized.current = true;
      fetchAllData();
    }
  }, [teacherId, token]);

  // Function to fetch all required data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchExams(),
        fetchExamStats(),
        fetchTodaysExams(),
        fetchUpcomingExams(),
        fetchClassesCount(),
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Error loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch all exams using ExamService
  const fetchExams = async () => {
    try {
      const response = await ExamService.getExamsByTeacher(teacherId, token);
      if (response.code === "00") {
        const examList = response.content || [];
        setExams(examList);

        // Categorize exams and update live exams
        categorizeExams(examList);
      } else {
        console.error("Failed to fetch exams", response.message);
        toast.error(response.message || "Failed to fetch exams");
      }
    } catch (error) {
      console.error("Error fetching exams:", error);
      toast.error("Error fetching exams");
    }
  };

  // Function to fetch exam statistics
  const fetchExamStats = async () => {
    try {
      const response = await ExamService.getExamStatsByTeacher(
        teacherId,
        token
      );
      if (response.code === "00") {
        setExamStats(
          response.content || {
            totalExams: 0,
            liveExams: 0,
            upcomingExams: 0,
            completedExams: 0,
            totalStudents: 0,
            totalClasses: 0,
          }
        );
      } else {
        console.error("Failed to fetch exam stats", response.message);
      }
    } catch (error) {
      console.error("Error fetching exam stats:", error);
    }
  };

  // Function to fetch today's exams
  const fetchTodaysExams = async () => {
    try {
      const response = await ExamService.getTodaysExams(token);
      if (response.code === "00") {
        const todayExams = response.content || [];
        // Filter for current teacher's exams
        const teacherTodayExams = todayExams.filter(
          (exam) => exam.teacherId === parseInt(teacherId)
        );
        setTodaysExams(teacherTodayExams);
      } else {
        console.error("Failed to fetch today's exams", response.message);
      }
    } catch (error) {
      console.error("Error fetching today's exams:", error);
    }
  };

  // Function to fetch upcoming exams
  const fetchUpcomingExams = async () => {
    try {
      const response = await ExamService.getUpcomingExamsByTeacher(
        teacherId,
        token
      );
      if (response.code === "00") {
        setUpcomingExams(response.content || []);
      } else {
        console.error("Failed to fetch upcoming exams", response.message);
      }
    } catch (error) {
      console.error("Error fetching upcoming exams:", error);
    }
  };

  // Function to fetch Total Class Count
  const fetchClassesCount = async () => {
    try {
      const response = await ClassService.getClassesCount(teacherId, token);
      if (response.code === "00") {
        // Update the examStats state with the classes count
        setExamStats((prevStats) => ({
          ...prevStats,
          totalClasses: response.content || 0,
        }));
      } else {
        console.error("Failed to fetch classes count", response.message);
        // Optional: Show toast error
        // toast.error(response.message || "Failed to fetch classes count");
      }
    } catch (error) {
      console.error("Error fetching classes count:", error);
      // Optional: Show toast error
      // toast.error("Error fetching classes count");
    }
  };

  // Function to categorize exams and find live exams
  const categorizeExams = (examList) => {
    const live = examList.filter((exam) => getExamStatus(exam) === "Live");
    setLiveExams(live);
  };

  // Function to determine exam status based on date and time
  const getExamStatus = (exam) => {
    if (!exam.examDate || !exam.startTime) return "Unknown";

    try {
      const now = new Date();

      // Parse the exam date and time
      const examDate = new Date(exam.examDate);
      const [startHours, startMinutes] = exam.startTime.split(":").map(Number);

      // Create exam start datetime
      const examStartDateTime = new Date(examDate);
      examStartDateTime.setHours(startHours, startMinutes, 0, 0);

      // Calculate exam end time
      const examEndDateTime = new Date(
        examStartDateTime.getTime() + (exam.duration || 0) * 60000
      );

      // Compare current time with exam times
      if (now < examStartDateTime) {
        return "Upcoming";
      } else if (now >= examStartDateTime && now < examEndDateTime) {
        return "Live";
      } else if (now >= examEndDateTime) {
        return "Completed";
      } else {
        return "Expired";
      }
    } catch (error) {
      console.error("Error calculating exam status:", error);
      return "Unknown";
    }
  };

  // Function to get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Live":
        return "bg-red-100 text-red-800";
      case "Upcoming":
        return "bg-yellow-100 text-yellow-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Function to format time display
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return timeString;
  };

  // Function to format date display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Stats data for cards
  const stats = [
    {
      title: "Total Students",
      value: examStats.totalStudents || "0",
      bgColor: "bg-gray-600",
      textColor: "text-white",
      icon: (
        <svg
          className="w-8 h-8 opacity-50"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      ),
    },
    {
      title: "Total Exams",
      value: examStats.totalExams || "0",
      bgColor: "bg-teal-500",
      textColor: "text-white",
      icon: (
        <svg
          className="w-8 h-8 opacity-50"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      ),
    },
    {
      title: "Live Exams",
      value: liveExams.length.toString(),
      bgColor: "bg-red-500",
      textColor: "text-white",
      icon: (
        <svg
          className="w-8 h-8 opacity-50"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,6A1.5,1.5 0 0,1 13.5,7.5A1.5,1.5 0 0,1 12,9A1.5,1.5 0 0,1 10.5,7.5A1.5,1.5 0 0,1 12,6M17,15.5C17,17.43 14.86,19 12,19C9.14,19 7,17.43 7,15.5C7,14.67 7.5,13.9 8.41,13.34C9.22,12.84 10.54,12.5 12,12.5C13.46,12.5 14.78,12.84 15.59,13.34C16.5,13.9 17,14.67 17,15.5Z" />
        </svg>
      ),
    },
    {
      title: "Total Classes",
      value: examStats.totalClasses || "0",
      bgColor: "bg-yellow-500",
      textColor: "text-white",
      icon: (
        <svg
          className="w-8 h-8 opacity-50"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
        </svg>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <TeacherSidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header />
          <main className="grow flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading dashboard...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <TeacherSidebar />

        {/* Content area */}
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Site header */}
          <Header />

          <main className="grow">
            <div className="px-4 sm:px-6 lg:px-8 py-3 w-full max-w-9xl mx-auto">
              {/* Dashboard actions */}
              <div className="sm:flex sm:justify-between sm:items-center mb-8">
                {/* Left: Title */}
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                    Teacher Dashboard
                  </h1>
                </div>

                {/* Right: Actions */}
                <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                  <button
                    onClick={fetchAllData}
                    className="btn bg-indigo-500 hover:bg-indigo-600 text-white"
                    disabled={loading}
                  >
                    <svg
                      className="w-4 h-4 fill-current opacity-50 shrink-0"
                      viewBox="0 0 16 16"
                    >
                      <path d="M8 0C3.6 0 0 3.6 0 8s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm0 12c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" />
                    </svg>
                    <span className="hidden xs:block ml-2">Refresh</span>
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`${stat.bgColor} ${stat.textColor} p-6 rounded-lg shadow-sm relative overflow-hidden`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl md:text-4xl font-bold mb-2">
                          {stat.value}
                        </div>
                        <div className="text-sm opacity-90">{stat.title}</div>
                      </div>
                      <div className="absolute top-4 right-4">{stat.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Exam Tables */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                {/* Live Exams */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                        Live Exams
                      </h2>
                      <div className="ml-3 flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="ml-2 text-sm text-red-600 font-medium">
                          LIVE
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={fetchAllData}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M4 2a1 1 0 000 2h12a1 1 0 100-2H4zM4 6a1 1 0 000 2h12a1 1 0 100-2H4zM4 10a1 1 0 000 2h12a1 1 0 100-2H4z" />
                      </svg>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Exam Name
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Type
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Duration
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {liveExams.length === 0 ? (
                          <tr>
                            <td
                              colSpan="4"
                              className="py-8 text-center text-gray-500 dark:text-gray-400"
                            >
                              No live exams at the moment
                            </td>
                          </tr>
                        ) : (
                          liveExams.map((exam, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100 dark:border-gray-700"
                            >
                              <td className="py-3 text-sm text-gray-800 dark:text-gray-200 font-medium">
                                {exam.examName}
                              </td>
                              <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                                {exam.examType}
                              </td>
                              <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                                {exam.duration} min
                              </td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                                    getExamStatus(exam)
                                  )}`}
                                >
                                  {getExamStatus(exam)}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 text-center">
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200">
                      Monitor Live Exams
                    </button>
                  </div>
                </div>

                {/* Today's Exams */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                      Today's Exams
                    </h2>
                    <button
                      onClick={fetchTodaysExams}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zM4 8h12v8H4V8z" />
                      </svg>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Exam Name
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Type
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Start Time
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {todaysExams.length === 0 ? (
                          <tr>
                            <td
                              colSpan="4"
                              className="py-8 text-center text-gray-500 dark:text-gray-400"
                            >
                              No exams scheduled for today
                            </td>
                          </tr>
                        ) : (
                          todaysExams.map((exam, index) => (
                            <tr
                              key={index}
                              className="border-b border-gray-100 dark:border-gray-700"
                            >
                              <td className="py-3 text-sm text-gray-800 dark:text-gray-200 font-medium">
                                {exam.examName}
                              </td>
                              <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                                {exam.examType}
                              </td>
                              <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                                {formatTime(exam.startTime)}
                              </td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(
                                    getExamStatus(exam)
                                  )}`}
                                >
                                  {getExamStatus(exam)}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 text-center">
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors duration-200">
                      View Today's Schedule
                    </button>
                  </div>
                </div>
              </div>

              {/* Upcoming Exams */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Upcoming Exams
                  </h2>
                  <button
                    onClick={fetchUpcomingExams}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                    </svg>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Exam Name
                        </th>
                        <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Type
                        </th>
                        <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Date
                        </th>
                        <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Start Time
                        </th>
                        <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingExams.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="py-8 text-center text-gray-500 dark:text-gray-400"
                          >
                            No upcoming exams scheduled
                          </td>
                        </tr>
                      ) : (
                        upcomingExams.map((exam, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 dark:border-gray-700"
                          >
                            <td className="py-3 text-sm text-gray-800 dark:text-gray-200 font-medium">
                              {exam.examName}
                            </td>
                            <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                              {exam.examType}
                            </td>
                            <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                              {formatDate(exam.examDate)}
                            </td>
                            <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                              {formatTime(exam.startTime)}
                            </td>
                            <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                              {exam.duration} min
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-center">
                  <button className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md transition-colors duration-200">
                    View All Upcoming Exams
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default TeacherDashboard;
