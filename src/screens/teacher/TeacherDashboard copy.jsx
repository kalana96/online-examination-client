import React, { useState } from "react";
import Header from "../../partials/Header";
import TeacherSidebar from "../../partials/TeacherSidebar";
import FilterButton from "../../components/DropdownFilter";
import Datepicker from "../../components/Datepicker";

function TeacherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");
  const teacherId = localStorage.getItem("id");

  // Sample data for demonstration
  const stats = [
    {
      title: "Total Students",
      value: "0",
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
      value: "4",
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
      title: "Total Classes",
      value: "6",
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

  const liveExams = [];
  const todaysExams = [];
  const upcomingExams = [];

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
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                      Live Exams
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
                              <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                                {exam.code}
                              </td>
                              <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                                {exam.title}
                              </td>
                              <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                                {exam.type}
                              </td>
                              <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                                {exam.students}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 text-center">
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200">
                      View All Exams
                    </button>
                  </div>
                </div>

                {/* Today's Exams */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                      Today's Exams
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
                              <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                                {exam.code}
                              </td>
                              <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                                {exam.title}
                              </td>
                              <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                                {exam.type}
                              </td>
                              <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                                {exam.startAt}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-4 text-center">
                    <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200">
                      View All Exams
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
                      {upcomingExams.length === 0 ? (
                        <tr>
                          <td
                            colSpan="4"
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
                            <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                              {exam.code}
                            </td>
                            <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                              {exam.title}
                            </td>
                            <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                              {exam.type}
                            </td>
                            <td className="py-3 text-sm text-gray-800 dark:text-gray-200">
                              {exam.startAt}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 text-center">
                  <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200">
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

export default TeacherDashboard;
