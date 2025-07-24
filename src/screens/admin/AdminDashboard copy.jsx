import React, { useState } from "react";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import FilterButton from "../../components/DropdownFilter";
import Datepicker from "../../components/Datepicker";

function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sample data for admin dashboard
  const stats = [
    {
      title: "Total Users",
      value: "2,847",
      change: "+12%",
      changeType: "positive",
      bgColor: "bg-blue-600",
      textColor: "text-white",
      icon: (
        <svg
          className="w-8 h-8 opacity-60"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      title: "Active Exams",
      value: "23",
      change: "+5",
      changeType: "positive",
      bgColor: "bg-green-600",
      textColor: "text-white",
      icon: (
        <svg
          className="w-8 h-8 opacity-60"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Teachers",
      value: "156",
      change: "+8",
      changeType: "positive",
      bgColor: "bg-purple-600",
      textColor: "text-white",
      icon: (
        <svg
          className="w-8 h-8 opacity-60"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
    },
    {
      title: "Students",
      value: "2,691",
      change: "+18%",
      changeType: "positive",
      bgColor: "bg-orange-600",
      textColor: "text-white",
      icon: (
        <svg
          className="w-8 h-8 opacity-60"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6L21 10.09V17h2V9L12 3z" />
        </svg>
      ),
    },
    {
      title: "System Health",
      value: "99.8%",
      change: "Excellent",
      changeType: "positive",
      bgColor: "bg-teal-600",
      textColor: "text-white",
      icon: (
        <svg
          className="w-8 h-8 opacity-60"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: "Revenue",
      value: "$45,720",
      change: "+23%",
      changeType: "positive",
      bgColor: "bg-pink-600",
      textColor: "text-white",
      icon: (
        <svg
          className="w-8 h-8 opacity-60"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V9M12 8C14.76 8 17 10.24 17 13S14.76 18 12 18 7 15.76 7 13 9.24 8 12 8Z" />
        </svg>
      ),
    },
  ];

  const recentUsers = [
    {
      name: "John Smith",
      role: "Teacher",
      email: "john@example.com",
      status: "Active",
      joinDate: "2024-06-01",
    },
    {
      name: "Sarah Johnson",
      role: "Student",
      email: "sarah@example.com",
      status: "Active",
      joinDate: "2024-06-02",
    },
    {
      name: "Mike Wilson",
      role: "Teacher",
      email: "mike@example.com",
      status: "Pending",
      joinDate: "2024-06-03",
    },
    {
      name: "Emma Davis",
      role: "Student",
      email: "emma@example.com",
      status: "Active",
      joinDate: "2024-06-04",
    },
    {
      name: "Alex Brown",
      role: "Student",
      email: "alex@example.com",
      status: "Inactive",
      joinDate: "2024-06-05",
    },
  ];

  const systemActivities = [
    {
      action: "New exam created",
      user: "Dr. Smith",
      time: "2 minutes ago",
      type: "exam",
    },
    {
      action: "User registration",
      user: "John Doe",
      time: "5 minutes ago",
      type: "user",
    },
    {
      action: "System backup completed",
      user: "System",
      time: "1 hour ago",
      type: "system",
    },
    {
      action: "Exam submitted",
      user: "Jane Smith",
      time: "2 hours ago",
      type: "submission",
    },
    {
      action: "New teacher approved",
      user: "Admin",
      time: "3 hours ago",
      type: "approval",
    },
  ];

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "inactive":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "exam":
        return <div className="w-3 h-3 bg-blue-500 rounded-full"></div>;
      case "user":
        return <div className="w-3 h-3 bg-green-500 rounded-full"></div>;
      case "system":
        return <div className="w-3 h-3 bg-purple-500 rounded-full"></div>;
      case "submission":
        return <div className="w-3 h-3 bg-orange-500 rounded-full"></div>;
      case "approval":
        return <div className="w-3 h-3 bg-teal-500 rounded-full"></div>;
      default:
        return <div className="w-3 h-3 bg-gray-500 rounded-full"></div>;
    }
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
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Welcome back! Here's what's happening with your examination
                    system.
                  </p>
                </div>

                {/* Right: Actions */}
                <div className="grid grid-flow-col sm:auto-cols-max justify-start sm:justify-end gap-2">
                  {/* Filter button */}
                  <FilterButton align="right" />
                  {/* Datepicker built with flatpickr */}
                  <Datepicker align="right" />
                  {/* Add view button */}
                  <button className="btn bg-gray-900 text-gray-100 hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-800 dark:hover:bg-white">
                    <svg
                      className="fill-current shrink-0 xs:hidden"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                    >
                      <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                    </svg>
                    <span className="max-xs:sr-only">Add View</span>
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className={`${stat.bgColor} ${stat.textColor} p-6 rounded-lg shadow-sm relative overflow-hidden`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-2xl font-bold mb-1">
                          {stat.value}
                        </div>
                        <div className="text-sm opacity-90 mb-2">
                          {stat.title}
                        </div>
                        <div
                          className={`text-xs flex items-center ${
                            stat.changeType === "positive"
                              ? "text-green-200"
                              : "text-red-200"
                          }`}
                        >
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            {stat.changeType === "positive" ? (
                              <path
                                fillRule="evenodd"
                                d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            ) : (
                              <path
                                fillRule="evenodd"
                                d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            )}
                          </svg>
                          {stat.change}
                        </div>
                      </div>
                      <div className="absolute top-4 right-4 opacity-60">
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                {/* Recent Users */}
                <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                      Recent Users
                    </h2>
                    <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      View All
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left border-b border-gray-200 dark:border-gray-700">
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Name
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Role
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Email
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Status
                          </th>
                          <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                            Join Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsers.map((user, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-100 dark:border-gray-700"
                          >
                            <td className="py-3">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                                  <span className="text-sm font-medium text-gray-600">
                                    {user.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </span>
                                </div>
                                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                  {user.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                              {user.role}
                            </td>
                            <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                              {user.email}
                            </td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                                  user.status
                                )}`}
                              >
                                {user.status}
                              </span>
                            </td>
                            <td className="py-3 text-sm text-gray-600 dark:text-gray-400">
                              {user.joinDate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* System Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                      System Activity
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

                  <div className="space-y-4">
                    {systemActivities.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 dark:text-gray-200">
                            <span className="font-medium">
                              {activity.action}
                            </span>
                            {activity.user !== "System" && (
                              <span className="text-gray-600 dark:text-gray-400">
                                {" "}
                                by {activity.user}
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="w-full text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                      View All Activities
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">
                  Quick Actions
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                    <svg
                      className="w-8 h-8 text-blue-600 dark:text-blue-400 mr-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                    <div className="text-left">
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        Add User
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Create new account
                      </div>
                    </div>
                  </button>

                  <button className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                    <svg
                      className="w-8 h-8 text-green-600 dark:text-green-400 mr-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-left">
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        Monitor Exams
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        View active sessions
                      </div>
                    </div>
                  </button>

                  <button className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                    <svg
                      className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div className="text-left">
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        View Reports
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        System analytics
                      </div>
                    </div>
                  </button>

                  <button className="flex items-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors">
                    <svg
                      className="w-8 h-8 text-orange-600 dark:text-orange-400 mr-3"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="text-left">
                      <div className="font-medium text-gray-800 dark:text-gray-200">
                        System Settings
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Configure system
                      </div>
                    </div>
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
