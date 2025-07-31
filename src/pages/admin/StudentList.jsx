import React, { useEffect, useState } from "react";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import { useNavigate } from "react-router-dom";
import StudentService from "../../service/StudentService"; // Adjust this to match your service path
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faPlus,
  faFilter,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function StudentList() {
  // State to hold the list of students
  const [students, setStudents] = useState([]);
  // State to hold filtered students
  const [filteredStudents, setFilteredStudents] = useState([]);
  // State to hold the selected student (for editing or deleting)
  const [selectedStudent, setSelectedStudent] = useState(null);
  const navigate = useNavigate();

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");

  // State for holding the form data (used when adding a student)
  const [formData, setFormData] = useState({
    studentName: "",
    email: "",
    age: "",
  });

  // State for validation errors
  const [formErrors, setFormErrors] = useState({
    studentName: "",
    email: "",
    age: "",
  });

  // Filter states
  const [selectedStudentName, setSelectedStudentName] = useState("");
  const [selectedClassName, setSelectedClassName] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Handle input change for student edit form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedStudent((prev) => ({ ...prev, [name]: value }));
  };

  // Fetch all students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Apply filters when students or filter values change
  useEffect(() => {
    applyFilters();
  }, [students, selectedStudentName, selectedClassName]);

  // Function to fetch all students using StudentService
  const fetchStudents = async () => {
    try {
      const response = await StudentService.getAllStudents(token);
      if (response.code === "00") {
        setStudents(response.content); // Populate the students state with the fetched data
      } else {
        console.error("Failed to fetch students", response.message);
        toast.error("Failed to fetch students");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Error fetching students");
    }
  };

  // Function to apply filters
  const applyFilters = () => {
    let filtered = [...students];

    // Filter by student name (first name + last name)
    if (selectedStudentName.trim()) {
      filtered = filtered.filter((student) => {
        const fullName =
          `${student.firstName} ${student.lastName}`.toLowerCase();
        return fullName.includes(selectedStudentName.toLowerCase().trim());
      });
    }

    // Filter by class name
    if (selectedClassName.trim()) {
      filtered = filtered.filter((student) =>
        student.gradeName
          .toLowerCase()
          .includes(selectedClassName.toLowerCase().trim())
      );
    }

    setFilteredStudents(filtered);
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSelectedStudentName("");
    setSelectedClassName("");
  };

  // Function to open the Edit Form and set the selected student
  const handleEdit = (id) => {
    navigate(`/admin/EditStudent/${id}`);
  };

  // Function to handle the View student profile
  const handleView = (id) => {
    navigate(`/admin/viewStudent/${id}`);
  };

  // Function to delete a student with confirmation
  const deleteStudent = async (studentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this Student?"
    );
    if (confirmDelete) {
      try {
        const response = await StudentService.deleteStudent(studentId, token);
        if (response.code === "00") {
          toast.success(response.message);
          fetchStudents(); // Refresh the list after deletion
        } else {
          console.error("Failed to delete student", response.message);
          toast.error("Failed to delete student");
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        toast.error("Error deleting student");
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
            Student Registration
          </h1>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              onClick={() => navigate("/admin/addStudent")}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Add Student
            </button>

            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            {(selectedStudentName || selectedClassName) && (
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
                {/* Student Name Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Student Name
                  </label>
                  <input
                    type="text"
                    value={selectedStudentName}
                    onChange={(e) => setSelectedStudentName(e.target.value)}
                    placeholder="Search by first or last name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Class Name Filter */}
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Class
                  </label>
                  <input
                    type="text"
                    value={selectedClassName}
                    onChange={(e) => setSelectedClassName(e.target.value)}
                    placeholder="Search by class name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div> */}
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="mb-4">
            <p className="text-gray-600">
              Showing {filteredStudents.length} of {students.length} students
              {(selectedStudentName || selectedClassName) && (
                <span className="ml-2 text-blue-600">(Filtered)</span>
              )}
            </p>
          </div>

          {/* Table of students */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow-lg">
              <thead>
                <tr className="bg-gray-200 text-gray-600">
                  <th className="w-1/12 px-4 py-3 text-left font-semibold">
                    #
                  </th>
                  <th className="w-2/12 px-4 py-3 text-left font-semibold">
                    Registration No
                  </th>
                  <th className="w-2/12 px-4 py-3 text-left font-semibold">
                    First Name
                  </th>
                  <th className="w-2/12 px-4 py-3 text-left font-semibold">
                    Last Name
                  </th>
                  <th className="w-2/12 px-4 py-3 text-left font-semibold">
                    Grade
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
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-500">
                      {students.length === 0
                        ? "No students found."
                        : "No students match the selected filters."}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-100 transition duration-200"
                    >
                      <td className="border px-4 py-3 text-gray-700">
                        {index + 1}
                      </td>
                      <td className="border px-4 py-3 text-gray-800 font-medium">
                        {item.registrationNumber}
                      </td>
                      <td className="border px-4 py-3 text-gray-600">
                        {item.firstName}
                      </td>
                      <td className="border px-4 py-3 text-gray-600">
                        {item.lastName}
                      </td>
                      <td className="border px-4 py-3 text-gray-600">
                        {item.gradeId}
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
                            title="View Student"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          {/* Edit Button */}
                          <button
                            className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition duration-150"
                            onClick={() => handleEdit(item.id)}
                            title="Edit Student"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          {/* Delete Button */}
                          <button
                            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition duration-150"
                            onClick={() => deleteStudent(item.id)}
                            title="Delete Student"
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

export default StudentList;
