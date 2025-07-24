import React, { useState, useEffect } from "react";
import Header from "../../partials/Header";
import AdminDashboardService from "../../service/AdminDashboardService";
import Sidebar from "../../partials/Sidebar";

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalExams: 0,
    currentExamStudents: 0,
    liveExams: [],
    todaysExams: [],
    upcomingExams: [],
  });

  // Get token from localStorage or your auth context
  const getToken = () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  };

  // Fetch all dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = getToken();

      if (!token) {
        setError("Authentication token not found");
        setLoading(false);
        return;
      }

      // Fetch all data in parallel
      const [
        studentsResponse,
        teachersResponse,
        examsResponse,
        currentExamStudentsResponse,
        liveExamsResponse,
        todaysExamsResponse,
        upcomingExamsResponse,
      ] = await Promise.all([
        AdminDashboardService.getTotalStudents(token),
        AdminDashboardService.getTotalTeachers(token),
        AdminDashboardService.getTotalExams(token),
        AdminDashboardService.getCurrentExamStudents(token),
        AdminDashboardService.getLiveExams(token),
        AdminDashboardService.getTodaysExams(token),
        AdminDashboardService.getUpcomingExams(token),
      ]);

      // Update state with fetched data
      setDashboardData({
        totalStudents:
          studentsResponse?.count || studentsResponse?.data?.count || 0,
        totalTeachers:
          teachersResponse?.count || teachersResponse?.data?.count || 0,
        totalExams: examsResponse?.count || examsResponse?.data?.count || 0,
        currentExamStudents:
          currentExamStudentsResponse?.count ||
          currentExamStudentsResponse?.data?.count ||
          0,
        liveExams: liveExamsResponse?.data || liveExamsResponse || [],
        todaysExams: todaysExamsResponse?.data || todaysExamsResponse || [],
        upcomingExams:
          upcomingExamsResponse?.data || upcomingExamsResponse || [],
      });

      setError(null);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    // fetchDashboardData();
  }, []);

  // Stats configuration with dynamic values
  const stats = [
    {
      title: "Total Current Exams Students",
      value: loading ? "..." : dashboardData.currentExamStudents.toString(),
      bgColor: "bg-green-600",
      textColor: "text-white",
      icon: (
        <svg
          className="w-12 h-12 opacity-30 absolute top-4 right-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-4h3v-3c0-1.1.9-2 2-2h7c1.1 0 2 .9 2 2v3h3v4h-3v4c0 1.1-.9 2-2 2H9c-1.1 0-2-.9-2-2v-4H4zm5-6v8h6v-8H9z" />
        </svg>
      ),
    },
    {
      title: "Total Exams",
      value: loading ? "..." : dashboardData.totalExams.toString(),
      bgColor: "bg-cyan-500",
      textColor: "text-white",
      icon: (
        <svg
          className="w-12 h-12 opacity-30 absolute top-4 right-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
        </svg>
      ),
    },
    {
      title: "Total Students",
      value: loading ? "..." : dashboardData.totalStudents.toString(),
      bgColor: "bg-yellow-500",
      textColor: "text-white",
      icon: (
        <svg
          className="w-12 h-12 opacity-30 absolute top-4 right-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z" />
        </svg>
      ),
    },
    {
      title: "Total Teachers",
      value: loading ? "..." : dashboardData.totalTeachers.toString(),
      bgColor: "bg-red-600",
      textColor: "text-white",
      icon: (
        <svg
          className="w-12 h-12 opacity-30 absolute top-4 right-4"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      ),
    },
  ];

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Render table rows for exams
  const renderExamRows = (exams, showStudents = false) => {
    if (loading) {
      return (
        <tr>
          <td
            colSpan={showStudents ? "4" : "4"}
            className="py-8 text-center text-gray-500 dark:text-gray-400"
          >
            Loading...
          </td>
        </tr>
      );
    }

    if (exams.length === 0) {
      return (
        <tr>
          <td
            colSpan={showStudents ? "4" : "4"}
            className="py-8 text-center text-gray-500 dark:text-gray-400 text-4xl"
          >
            —
          </td>
        </tr>
      );
    }

    return exams.map((exam, index) => (
      <tr
        key={exam.id || index}
        className="border-b border-gray-100 dark:border-gray-700"
      >
        <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
          {exam.examCode || exam.code || "N/A"}
        </td>
        <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
          {exam.title || exam.examTitle || "N/A"}
        </td>
        <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
          {exam.type || exam.examType || "N/A"}
        </td>
        <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
          {showStudents
            ? exam.totalStudents || exam.studentsCount || 0
            : formatDate(exam.startAt || exam.startTime || exam.scheduledAt)}
        </td>
      </tr>
    ));
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

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
                    Admin Dashboard
                  </h1>
                </div>

                {/* Right: Refresh button */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={fetchDashboardData}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? "Refreshing..." : "Refresh Data"}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`${stat.bgColor} ${stat.textColor} p-6 rounded-lg shadow-sm relative overflow-hidden`}
                  >
                    <div className="relative z-10">
                      <div className="text-2xl md:text-3xl font-bold mb-2">
                        {stat.value}
                      </div>
                      <div className="text-sm opacity-90">{stat.title}</div>
                    </div>
                    {stat.icon}
                  </div>
                ))}
              </div>

              {/* Exam Tables */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
                {/* Live Exams */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                      Live Exams ({dashboardData.liveExams.length})
                    </h2>
                    <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Exam Code
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Title
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Type
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Total Students
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {renderExamRows(dashboardData.liveExams, true)}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 text-center">
                    <button className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200">
                      View All Exams
                    </button>
                  </div>
                </div>

                {/* Today's Exams */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                      Today's Exams ({dashboardData.todaysExams.length})
                    </h2>
                    <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Exam Code
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Title
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Type
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Start At
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {renderExamRows(dashboardData.todaysExams, false)}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-6 text-center">
                    <button className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200">
                      View All Exams
                    </button>
                  </div>
                </div>
              </div>

              {/* Upcoming Exams */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Upcoming Exams ({dashboardData.upcomingExams.length})
                  </h2>
                  <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                        <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Exam Code
                        </th>
                        <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Title
                        </th>
                        <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Type
                        </th>
                        <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                          Start At
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {renderExamRows(dashboardData.upcomingExams, false)}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 text-center">
                  <button className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200">
                    View All Exams
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

export default AdminDashboard;
