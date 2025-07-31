import React, { useEffect, useState } from "react";
import Header from "../../partials/Header";
import Sidebar from "../../partials/StudentSidebar";
import { useNavigate } from "react-router-dom";
import ClassService from "../../service/ClassService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBook,
  faClock,
  faCalendarAlt,
  faUsers,
  faChalkboardTeacher,
  faSpinner,
  faExclamationCircle,
  faGraduationCap,
  faStar,
  faBookOpen,
  faAward,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function StudentClass() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");
  const studentId = localStorage.getItem("id");

  useEffect(() => {
    if (!token || !studentId) {
      toast.error("Please login to view your classes");
      navigate("/login");
      return;
    }

    fetchEnrolledClasses();
  }, [token, studentId, navigate]);

  const fetchEnrolledClasses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Assuming ClassService has a method to get enrolled classes by student ID
      const response = await ClassService.getClassesByStudent(studentId, token);

      if (response.code === "00") {
        setClasses(response.content);
      } else {
        console.error("Failed to fetch classes", response.message);
        toast.error("Failed to fetch classes");
      }
    } catch (err) {
      console.error("Error fetching enrolled classes:", err);
      setError("Failed to load enrolled classes. Please try again.");
      toast.error("Failed to load enrolled classes");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    const time = new Date(`1970-01-01T${timeString}`);
    return time.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getSubjectColor = (subject) => {
    const colors = {
      Mathematics: "from-blue-500 to-indigo-600",
      Science: "from-green-500 to-teal-600",
      English: "from-purple-500 to-pink-600",
      History: "from-orange-500 to-red-600",
      Physics: "from-cyan-500 to-blue-600",
      Chemistry: "from-emerald-500 to-green-600",
      Biology: "from-lime-500 to-green-600",
      Literature: "from-violet-500 to-purple-600",
      Art: "from-pink-500 to-rose-600",
      Music: "from-yellow-500 to-orange-600",
      default: "from-gray-500 to-gray-600",
    };
    return colors[subject] || colors["default"];
  };

  const renderClassCard = (classItem, index) => (
    <div
      key={classItem.id}
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Gradient Header */}
      <div
        className={`h-32 bg-gradient-to-r ${getSubjectColor(
          classItem.subjectName
        )} relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute top-4 right-4">
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold text-gray-800">
            {classItem.gradeName || `Grade ${classItem.gradeId}`}
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-yellow-200 transition-colors">
            {classItem.className}
          </h3>
          <div className="flex items-center text-white text-opacity-90">
            <FontAwesomeIcon icon={faBookOpen} className="mr-2 text-sm" />
            <span className="text-sm font-medium">
              {classItem.subjectName || "Subject"}
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-white bg-opacity-10 rounded-full -translate-y-10 translate-x-10"></div>
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-white bg-opacity-10 rounded-full translate-y-8 -translate-x-8"></div>
      </div>

      {/* Card Content */}
      <div className="p-6">
        <p className="text-gray-600 text-sm mb-6 line-clamp-2">
          {classItem.description ||
            "Explore this exciting course designed to enhance your learning experience and knowledge."}
        </p>

        <div className="space-y-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mr-4">
              <FontAwesomeIcon
                icon={faCalendarAlt}
                className="text-white text-sm"
              />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Class Date
              </span>
              <div className="text-gray-800 font-semibold">
                {formatDate(classItem.classDate)}
              </div>
            </div>
          </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mr-4">
              <FontAwesomeIcon icon={faClock} className="text-white text-sm" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Start Time
              </span>
              <div className="text-gray-800 font-semibold">
                {formatTime(classItem.startTime)}
              </div>
            </div>
          </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
              <FontAwesomeIcon icon={faUsers} className="text-white text-sm" />
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                Classmates
              </span>
              <div className="text-gray-800 font-semibold">
                {classItem.studentCount || 0} Students
              </div>
            </div>
          </div>

          {classItem.teacherNamesString && (
            <div className="flex items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center mr-4">
                <FontAwesomeIcon
                  icon={faChalkboardTeacher}
                  className="text-white text-sm"
                />
              </div>
              <div>
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                  Instructor
                </span>
                <div className="text-gray-800 font-semibold">
                  {classItem.teacherNamesString}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hover Effect Border */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 rounded-2xl transition-all duration-300 pointer-events-none"></div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gradient-to-br from-gray-50 to-blue-50">
        <Header />
        <main className="grow p-6">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Enrolled Classes
              </h1>
              <p className="text-gray-600">
                View all your enrolled classes and their details
              </p>
            </div>

            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-blue-200 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-20 h-20 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                </div>
                <p className="text-lg text-gray-600 mt-6 font-medium">
                  Loading your amazing classes...
                </p>
              </div>
            )}

            {error && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-8 mb-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FontAwesomeIcon
                    icon={faExclamationCircle}
                    className="text-red-500 text-2xl"
                  />
                </div>
                <h3 className="text-red-800 font-bold text-xl mb-2">
                  Oops! Something went wrong
                </h3>
                <p className="text-red-600 mb-6">{error}</p>
                <button
                  onClick={fetchEnrolledClasses}
                  className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && classes.length === 0 && (
              <div className="text-center py-20">
                <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                  <FontAwesomeIcon
                    icon={faBook}
                    className="text-6xl text-blue-400"
                  />
                </div>
                <h3 className="text-2xl font-bold text-gray-700 mb-4">
                  Ready to Start Learning?
                </h3>
                <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                  You haven't enrolled in any classes yet. Contact your
                  administrator to begin your learning adventure!
                </p>
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold">
                  <FontAwesomeIcon icon={faStar} className="mr-2" />
                  Get Started Today
                </div>
              </div>
            )}

            {!loading && !error && classes.length > 0 && (
              <>
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faBook}
                          className="text-white text-lg"
                        />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-800">
                          {classes.length}
                        </div>
                        <div className="text-gray-500 text-sm">
                          Total Classes
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(classes.length * 20, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faBookOpen}
                          className="text-white text-lg"
                        />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-800">
                          {new Set(classes.map((c) => c.subjectName)).size}
                        </div>
                        <div className="text-gray-500 text-sm">Subjects</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            new Set(classes.map((c) => c.subjectName)).size *
                              25,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                        <FontAwesomeIcon
                          icon={faUsers}
                          className="text-white text-lg"
                        />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-gray-800">
                          {classes.reduce(
                            (total, c) => total + (c.studentCount || 0),
                            0
                          )}
                        </div>
                        <div className="text-gray-500 text-sm">Classmates</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
                        style={{ width: "85%" }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Classes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {classes.map((classItem, index) =>
                    renderClassCard(classItem, index)
                  )}
                </div>

                {/* Achievement Section */}
                <div className="mt-16 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FontAwesomeIcon
                      icon={faAward}
                      className="text-white text-2xl"
                    />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    Keep Up the Great Work!
                  </h3>
                  <p className="text-gray-600 text-lg">
                    You're enrolled in {classes.length}{" "}
                    {classes.length === 1 ? "class" : "classes"}. Stay motivated
                    and achieve your goals!
                  </p>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default StudentClass;
