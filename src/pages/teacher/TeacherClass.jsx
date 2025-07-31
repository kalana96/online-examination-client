import React, { useEffect, useState } from "react";
import Header from "../../partials/Header";
import Sidebar from "../../partials/TeacherSidebar";
import { useNavigate } from "react-router-dom";
import ClassService from "../../service/ClassService";
import GradeService from "../../service/GradeService";
import SubjectService from "../../service/SubjectService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
} from "lucide-react";

function TeacherClass() {
  // State to hold the list of classes
  const [classes, setClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");
  const teacherId = localStorage.getItem("id");

  // Function to fetch all classes using ClassService
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await ClassService.getClassesByTeacher(teacherId, token);
      if (response.code === "00") {
        setClasses(response.content);
      } else {
        console.error("Failed to fetch classes", response.message);
        toast.error("Failed to fetch classes");
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Error fetching classes");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch all grades
  const fetchGrades = async () => {
    try {
      const response = await GradeService.getAllGradesForTeacher(token);
      if (response.code === "00") {
        setGrades(response.content);
      } else {
        console.error("Failed to fetch grades", response.message);
      }
    } catch (error) {
      console.error("Error fetching grades:", error);
    }
  };

  // Function to fetch all subjects
  const fetchSubjects = async () => {
    try {
      const response = await SubjectService.getAllSubjectByTeacher(token);
      if (response.code === "00") {
        setSubjects(response.content);
      } else {
        console.error("Failed to fetch subjects", response.message);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  // Function to open the Edit Form and set the selected class
  const handleEdit = (id) => {
    console.log("class id: ", id);
    navigate(`/teacher/editClass/${id}`);
  };

  // Function to handle the View class details
  const handleView = (id) => {
    // navigate(`/admin/addClass/${id}`);
  };

  // Function to delete a class with confirmation
  const deleteClass = async (classId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Class?"
    );
    if (confirmDelete) {
      try {
        const response = await ClassService.deleteClass(classId, token);
        if (response.code === "00") {
          toast.success(response.message);
          fetchClasses(); // Refresh the list after deletion
        } else {
          console.error("Failed to delete class", response.message);
          toast.error("Failed to delete class");
        }
      } catch (error) {
        console.error("Error deleting class:", error);
        toast.error("Error deleting class");
      }
    }
  };

  // Utility functions
  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ongoing":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const time = new Date(`1970-01-01T${timeString}`);
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const filteredClasses = classes.filter((classItem) => {
    const matchesSearch =
      !searchTerm ||
      classItem.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesGrade =
      !selectedGrade || classItem.gradeName === selectedGrade;
    const matchesSubject =
      !selectedSubject || classItem.subjectName === selectedSubject;

    return matchesSearch && matchesGrade && matchesSubject;
  });

  useEffect(() => {
    fetchClasses();
    fetchGrades();
    fetchSubjects();
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-50">
        <Header />
        <main className="grow p-6">
          {/* Header Section */}
          <h1 className="text-3xl font-bold text-gray-800 mb-6">My Classes</h1>

          <div className="">
            {/* Search and Filters */}
            <div className="mb-8 space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search classes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Grades</option>
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.gradeName}>
                        {grade.gradeName}
                      </option>
                    ))}
                  </select>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.subjectName}>
                        {subject.subjectName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active filters */}
              {(selectedGrade || selectedSubject || searchTerm) && (
                <div className="flex flex-wrap gap-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {searchTerm && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      Search: {searchTerm}
                    </span>
                  )}
                  {selectedGrade && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      {selectedGrade}
                    </span>
                  )}
                  {selectedSubject && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                      {selectedSubject}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setSelectedGrade("");
                      setSelectedSubject("");
                      setSearchTerm("");
                    }}
                    className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm hover:bg-red-200 transition-colors"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredClasses.length} of {classes.length} classes
              </p>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading classes...</p>
              </div>
            )}

            {/* Cards Grid */}
            {!loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClasses.map((classItem) => (
                  <div
                    key={classItem.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    {/* Card Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {classItem.className}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <BookOpen className="w-4 h-4 mr-1" />
                              {classItem.subjectName}
                            </div>
                            <div className="flex items-center">
                              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                              {classItem.gradeName}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            classItem.status || "upcoming"
                          )}`}
                        >
                          {classItem.status || "upcoming"}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <div className="space-y-4">
                        {/* Date and Time */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {classItem.classDate
                              ? formatDate(classItem.classDate)
                              : "Date TBD"}
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {classItem.startTime && classItem.endTime
                              ? `${formatTime(
                                  classItem.startTime
                                )} - ${formatTime(classItem.endTime)}`
                              : "Time TBD"}
                          </div>
                        </div>

                        {/* Students */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2" />
                            {classItem.studentCount || 0}/
                            {classItem.maxStudents || 0} students
                          </div>
                          <div className="text-sm text-gray-600">
                            {classItem.room || "Room TBD"}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                classItem.maxStudents > 0
                                  ? (classItem.studentCount /
                                      classItem.maxStudents) *
                                    100
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {classItem.description || "No description available"}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 rounded-b-xl">
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleView(classItem.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(classItem.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Edit Class"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteClass(classItem.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Class"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <button
                          onClick={() => handleView(classItem.id)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {classItem.status === "upcoming"
                            ? "Start Class"
                            : "View Details"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredClasses.length === 0 && (
              <div className="text-center py-12">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No classes found
                </h3>
                <p className="text-gray-600 mb-4">
                  {classes.length === 0
                    ? "You haven't been assigned any classes yet."
                    : "No classes match your current filters."}
                </p>
                {classes.length === 0 && (
                  <button
                    onClick={() => navigate("/teacher/addClass")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Class
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default TeacherClass;
