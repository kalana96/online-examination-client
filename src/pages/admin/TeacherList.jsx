import React, { useEffect, useState } from "react";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import { useNavigate } from "react-router-dom";
import TeacherService from "../../service/TeacherService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faPlus,
  faFilter,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function TeacherList() {
  // State to hold the list of teachers
  const [teachers, setTeachers] = useState([]);
  // State to hold filtered teachers
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  // State to hold the list of subjects for dropdown
  const [subjects, setSubjects] = useState([]);
  // State to hold the selected teacher (for editing or deleting)
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const navigate = useNavigate();

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");

  // Filter states
  const [selectedTeacherName, setSelectedTeacherName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Handle input change for teacher edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedTeacher((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch all teachers on component mount
  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, []);

  // Apply filters when teachers or filter values change
  useEffect(() => {
    applyFilters();
  }, [teachers, selectedTeacherName, selectedSubject]);

  // Function to fetch all teachers using TeacherService
  const fetchTeachers = async () => {
    try {
      const response = await TeacherService.getAllTeachers(token);
      if (response.code === "00") {
        setTeachers(response.content); // Populate the teachers state with the fetched data
      } else {
        console.error("Failed to fetch teachers", response.message);
        toast.error("Failed to fetch teachers");
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast.error("Error fetching teachers");
    }
  };

  // Function to fetch all subjects (you'll need to implement SubjectService)
  const fetchSubjects = async () => {
    try {
      // Assuming you have a SubjectService similar to TeacherService
      // If not, you can create a mock array or implement the SubjectService

      // Mock subjects for now - replace with actual service call
      const mockSubjects = [
        { id: 1, name: "Mathematics" },
        { id: 2, name: "Science" },
        { id: 3, name: "English" },
        { id: 4, name: "History" },
        { id: 5, name: "Geography" },
        { id: 6, name: "Physics" },
        { id: 7, name: "Chemistry" },
        { id: 8, name: "Biology" },
      ];

      setSubjects(mockSubjects);

      // Uncomment and implement when you have SubjectService
      /*
      const response = await SubjectService.getAllSubjects(token);
      if (response.code === "00") {
        setSubjects(response.content);
      } else {
        console.error("Failed to fetch subjects", response.message);
        toast.error("Failed to fetch subjects");
      }
      */
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Error fetching subjects");
    }
  };

  // Function to apply filters
  const applyFilters = () => {
    let filtered = [...teachers];

    // Filter by teacher name
    if (selectedTeacherName.trim()) {
      filtered = filtered.filter((teacher) => {
        const fullName =
          `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
        return fullName.includes(selectedTeacherName.toLowerCase().trim());
      });
    }

    // Filter by subject
    if (selectedSubject.trim()) {
      filtered = filtered.filter((teacher) =>
        teacher.subjectName
          .toLowerCase()
          .includes(selectedSubject.toLowerCase().trim())
      );
    }

    setFilteredTeachers(filtered);
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSelectedTeacherName("");
    setSelectedSubject("");
  };

  // Function to open the Edit Form and set the selected teacher
  const handleEdit = (id) => {
    navigate(`/admin/EditTeacher/${id}`);
  };

  // Function to handle the View teacher profile
  const handleView = (id) => {
    navigate(`/admin/viewTeacher/${id}`);
  };

  // Function to delete a teacher with confirmation
  const deleteTeacher = async (teacherId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Teacher?"
    );
    if (confirmDelete) {
      try {
        const response = await TeacherService.deleteTeacher(teacherId, token);
        if (response.code === "00") {
          toast.success(response.message);
          fetchTeachers(); // Refresh the list after deletion
        } else {
          console.error("Failed to delete teacher", response.message);
          toast.error("Failed to delete teacher");
        }
      } catch (error) {
        console.error("Error deleting teacher:", error);
        toast.error("Error deleting teacher");
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
        <Header />
        <main className="grow p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Teacher Management
          </h1>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              onClick={() => navigate("/admin/addTeacher")}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Teacher
            </button>

            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            {(selectedTeacherName || selectedSubject) && (
              <button
                className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                onClick={clearFilters}
              >
                <FontAwesomeIcon icon={faTimes} className="mr-2" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Filter Section */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow-lg mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Filters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Teacher Name Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Teacher Name
                  </label>
                  <input
                    type="text"
                    value={selectedTeacherName}
                    onChange={(e) => setSelectedTeacherName(e.target.value)}
                    placeholder="Search by first or last name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Subject Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Subject
                  </label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.name}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="mb-4">
            <p className="text-gray-600">
              Showing {filteredTeachers.length} of {teachers.length} teachers
              {(selectedTeacherName || selectedSubject) && (
                <span className="ml-2 text-blue-600">(Filtered)</span>
              )}
            </p>
          </div>

          {/* Table of teachers */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-lg">
              <thead>
                <tr className="bg-gray-200 text-gray-600">
                  <th className="w-1/12 px-4 py-3 text-left font-semibold">
                    #
                  </th>
                  <th className="w-2/12 px-4 py-3 text-left font-semibold">
                    Teacher Code
                  </th>
                  <th className="w-2/12 px-4 py-3 text-left font-semibold">
                    First Name
                  </th>
                  <th className="w-2/12 px-4 py-3 text-left font-semibold">
                    Last Name
                  </th>
                  <th className="w-2/12 px-4 py-3 text-left font-semibold">
                    Subject
                  </th>
                  <th className="w-2/12 px-4 py-3 text-left font-semibold">
                    Contact No
                  </th>
                  <th className="w-1/12 px-4 py-3 text-left font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      {teachers.length === 0
                        ? "No teachers found."
                        : "No teachers match the selected filters."}
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-100 transition duration-200"
                    >
                      <td className="border px-4 py-3 text-gray-700">
                        {index + 1}
                      </td>
                      <td className="border px-4 py-3 text-gray-800 font-medium">
                        {item.teacherCode}
                      </td>
                      <td className="border px-4 py-3 text-gray-600">
                        {item.firstName}
                      </td>
                      <td className="border px-4 py-3 text-gray-600">
                        {item.lastName}
                      </td>
                      <td className="border px-4 py-3 text-gray-600">
                        {item.subjectName}
                      </td>
                      <td className="border px-4 py-3 text-gray-600">
                        {item.contactNo}
                      </td>
                      <td className="border px-4 py-3">
                        <div className="flex justify-center space-x-2">
                          {/* View Button */}
                          <button
                            className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition duration-150"
                            onClick={() => handleView(item.id)}
                            title="View Teacher"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {/* Edit Button */}
                          <button
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition duration-150"
                            onClick={() => handleEdit(item.id)}
                            title="Edit Teacher"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {/* Delete Button */}
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-150"
                            onClick={() => deleteTeacher(item.id)}
                            title="Delete Teacher"
                          >
                            <i className="fas fa-trash-alt"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default TeacherList;
