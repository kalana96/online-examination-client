import React, { useState, useEffect } from "react";
import Header from "../../partials/Header";
import StudentSidebar from "../../partials/StudentSidebar";
import StudentDashboardService from "../../service/StudentDashboardService";
import {
  Calendar,
  Clock,
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  FileText,
  Bell,
  Loader2,
  RefreshCw,
} from "lucide-react";

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState({
    student: null,
    stats: null,
    upcomingExams: [],
    recentResults: [],
    notifications: [],
  });

  // Get student ID from localStorage or context (adjust as needed)
  const getStudentId = () => {
    // This should be implemented based on your authentication system
    // For now, assuming it's stored in localStorage or you have a user context
    const user = JSON.parse(localStorage.getItem("id") || "{}");
    return user.id || user.studentId || 1; // fallback to 1 for demo
  };

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem("token");
  };

  // Load data on component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch all dashboard data
  const fetchDashboardData = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const studentId = getStudentId();
      const token = getAuthToken();

      // Fetch all required data concurrently
      const [
        dashboardResponse,
        statsResponse,
        upcomingExamsResponse,
        recentResultsResponse,
        notificationsResponse,
        profileResponse,
      ] = await Promise.allSettled([
        StudentDashboardService.getStudentDashboard(studentId, token),
        StudentDashboardService.getStudentStats(studentId, token),
        StudentDashboardService.getStudentUpcomingExams(studentId, token),
        StudentDashboardService.getStudentRecentResults(studentId, 5, token),
        StudentDashboardService.getStudentNotifications(studentId, 5, token),
        StudentDashboardService.getStudentProfile(studentId, token),
      ]);

      // Process responses
      const newDashboardData = {
        student: null,
        stats: null,
        upcomingExams: [],
        recentResults: [],
        notifications: [],
      };

      // Handle profile data
      if (
        profileResponse.status === "fulfilled" &&
        profileResponse.value.code === "SUCCESS"
      ) {
        newDashboardData.student = profileResponse.value.content;
      }

      // Handle stats data
      if (
        statsResponse.status === "fulfilled" &&
        statsResponse.value.code === "SUCCESS"
      ) {
        newDashboardData.stats = statsResponse.value.content;
      } else if (
        dashboardResponse.status === "fulfilled" &&
        dashboardResponse.value.code === "SUCCESS"
      ) {
        // Fallback to dashboard stats if available
        newDashboardData.stats = dashboardResponse.value.content.stats;
      }

      // Handle upcoming exams
      if (
        upcomingExamsResponse.status === "fulfilled" &&
        upcomingExamsResponse.value.code === "SUCCESS"
      ) {
        newDashboardData.upcomingExams =
          upcomingExamsResponse.value.content || [];
      }

      // Handle recent results
      if (
        recentResultsResponse.status === "fulfilled" &&
        recentResultsResponse.value.code === "SUCCESS"
      ) {
        newDashboardData.recentResults =
          recentResultsResponse.value.content || [];
      }

      // Handle notifications
      if (
        notificationsResponse.status === "fulfilled" &&
        notificationsResponse.value.code === "SUCCESS"
      ) {
        newDashboardData.notifications =
          notificationsResponse.value.content || [];
      }

      // Use dashboard response as fallback for missing data
      if (
        dashboardResponse.status === "fulfilled" &&
        dashboardResponse.value.code === "SUCCESS"
      ) {
        const dashboardContent = dashboardResponse.value.content;

        if (!newDashboardData.student && dashboardContent.student) {
          newDashboardData.student = dashboardContent.student;
        }
        if (!newDashboardData.stats && dashboardContent.stats) {
          newDashboardData.stats = dashboardContent.stats;
        }
        if (
          newDashboardData.upcomingExams.length === 0 &&
          dashboardContent.upcomingExams
        ) {
          newDashboardData.upcomingExams = dashboardContent.upcomingExams;
        }
        if (
          newDashboardData.recentResults.length === 0 &&
          dashboardContent.recentResults
        ) {
          newDashboardData.recentResults = dashboardContent.recentResults;
        }
        if (
          newDashboardData.notifications.length === 0 &&
          dashboardContent.notifications
        ) {
          newDashboardData.notifications = dashboardContent.notifications;
        }
      }

      setDashboardData(newDashboardData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh data handler
  const handleRefresh = () => {
    fetchDashboardData(true);
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = getAuthToken();
      await StudentDashboardService.markNotificationAsRead(
        notificationId,
        token
      );

      // Update local state
      setDashboardData((prev) => ({
        ...prev,
        notifications: prev.notifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        ),
      }));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "excellent":
        return "text-green-600 bg-green-50";
      case "good":
        return "text-blue-600 bg-blue-50";
      case "average":
        return "text-yellow-600 bg-yellow-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "excellent":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "good":
        return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case "average":
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <XCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getScoreStatus = (score, maxScore) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "excellent";
    if (percentage >= 80) return "good";
    if (percentage >= 70) return "average";
    return "poor";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <StudentSidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading dashboard...</p>
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
        <StudentSidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const { student, stats, upcomingExams, recentResults, notifications } =
    dashboardData;

  return (
    <div className="flex h-screen overflow-hidden">
      <StudentSidebar />
      {/* px-4 sm:px-6 lg:px-8 py-3 w-full max-w-9xl mx-auto */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header />
        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-3 w-full max-w-9xl mx-auto">
          <div className="sm:flex sm:justify-between sm:items-center mb-8">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                Student Dashboard
              </h1>
              {student && (
                <p className="text-gray-600 mt-1">
                  Welcome back, {student.name || student.firstName || "Student"}
                  !
                </p>
              )}
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Exams
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.totalExams || 0}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.completedExams || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Average Score
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats?.averageScore || 0}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Class Rank
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    #{stats?.rank || "N/A"}
                  </p>
                </div>
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Exams */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Upcoming Exams
                  </h2>
                </div>
                <div className="p-6">
                  {upcomingExams.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingExams.map((exam) => (
                        <div
                          key={exam.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">
                                {exam.subject || exam.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {formatDate(exam.date)} at{" "}
                                {formatTime(exam.time || exam.startTime)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {exam.duration || "TBD"}
                            </span>
                            <p className="text-sm text-gray-500 mt-1">
                              Duration
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No upcoming exams</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Notifications */}
            <div>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Bell className="w-5 h-5 mr-2" />
                    Recent Notifications
                  </h2>
                </div>
                <div className="p-6">
                  {notifications.length > 0 ? (
                    <div className="space-y-4">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex items-start space-x-3 cursor-pointer p-2 rounded ${
                            notification.read ? "opacity-75" : ""
                          }`}
                          onClick={() =>
                            !notification.read &&
                            markNotificationAsRead(notification.id)
                          }
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-2 ${
                              notification.type === "success" ||
                              notification.type === "good"
                                ? "bg-green-500"
                                : notification.type === "warning"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                            }`}
                          ></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">
                              {notification.message || notification.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time ||
                                formatDate(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No notifications</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Results */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Award className="w-5 h-5 mr-2" />
                  Recent Results
                </h2>
              </div>
              <div className="p-6">
                {recentResults.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentResults.map((result) => {
                      const status = getScoreStatus(
                        result.score,
                        result.maxScore || 100
                      );
                      return (
                        <div
                          key={result.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-medium text-gray-900">
                              {result.subject || result.examTitle}
                            </h3>
                            {getStatusIcon(status)}
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Score:
                              </span>
                              <span className="font-semibold text-gray-900">
                                {result.score}/{result.maxScore || 100}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Grade:
                              </span>
                              <span
                                className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                                  status
                                )}`}
                              >
                                {result.grade ||
                                  Math.round(
                                    (result.score / (result.maxScore || 100)) *
                                      100
                                  ) + "%"}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                              {formatDate(result.date || result.completedAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No recent results</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Take Practice Test
                    </span>
                  </button>
                  <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <FileText className="w-5 h-5 mr-2 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">
                      View Results
                    </span>
                  </button>
                  <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Calendar className="w-5 h-5 mr-2 text-purple-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Exam Schedule
                    </span>
                  </button>
                  <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Users className="w-5 h-5 mr-2 text-orange-600" />
                    <span className="text-sm font-medium text-gray-900">
                      Study Groups
                    </span>
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

export default StudentDashboard;
