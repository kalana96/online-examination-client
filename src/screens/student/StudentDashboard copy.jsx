import React, { useState } from "react";
import Header from "../../partials/Header";
import StudentSidebar from "../../partials/StudentSidebar"; // Replace with student sidebar

function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const stats = [
    {
      title: "Enrolled Classes",
      value: "5",
      bgColor: "bg-blue-500",
      textColor: "text-white",
      icon: (
        <svg
          className="w-8 h-8 opacity-50"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
        </svg>
      ),
    },
    {
      title: "Upcoming Exams",
      value: "3",
      bgColor: "bg-green-500",
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
      title: "Completed Exams",
      value: "8",
      bgColor: "bg-purple-500",
      textColor: "text-white",
      icon: (
        <svg
          className="w-8 h-8 opacity-50"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm1-9H6a2 2 0 0 0-2 2v16l4-4h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z" />
        </svg>
      ),
    },
  ];

  const upcomingExams = [];
  const completedExams = [];

  return (
    <div className="flex h-screen overflow-hidden">
      <StudentSidebar />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header />

        <main className="grow">
          <div className="px-4 sm:px-6 lg:px-8 py-3 w-full max-w-9xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center mb-8">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl md:text-3xl text-gray-800 dark:text-gray-100 font-bold">
                  Student Dashboard
                </h1>
              </div>
            </div>

            {/* Stats */}
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

            {/* Upcoming Exams */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Upcoming Exams
                </h2>
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
                        Start At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingExams.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          No upcoming exams
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
                            {exam.startAt}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Completed Exams */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  Completed Exams
                </h2>
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
                        Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {completedExams.length === 0 ? (
                      <tr>
                        <td
                          colSpan="3"
                          className="py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          No completed exams
                        </td>
                      </tr>
                    ) : (
                      completedExams.map((exam, index) => (
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
                            {exam.score}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentDashboard;
