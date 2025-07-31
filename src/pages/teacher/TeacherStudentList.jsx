import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Header from "../../partials/Header";
import Sidebar from "../../partials/TeacherSidebar";
import { useNavigate } from "react-router-dom";
import ClassService from "../../service/ClassService";
import StudentService from "../../service/StudentService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faPlus,
  faFilter,
  faTimes,
  faTrashAlt,
  faUser,
  faEnvelope,
  faPhone,
  faCalendarAlt,
  faVenus,
  faMars,
  faGenderless,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function TeacherStudentList() {
  // State to hold the list of students
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");
  const teacherId = localStorage.getItem("id");

  // Custom styles for the data table
  const customStyles = {
    header: {
      style: {
        minHeight: "56px",
        backgroundColor: "#f8fafc",
      },
    },
    headRow: {
      style: {
        backgroundColor: "#e5e7eb",
        color: "#374151",
        fontSize: "14px",
        fontWeight: "600",
      },
    },
    headCells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
    cells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
        fontSize: "14px",
      },
    },
    rows: {
      style: {
        minHeight: "60px",
        "&:hover": {
          backgroundColor: "#f9fafb",
        },
      },
    },
    pagination: {
      style: {
        backgroundColor: "#f8fafc",
        borderTop: "1px solid #e5e7eb",
      },
    },
  };

  // Function to get gender icon
  const getGenderIcon = (gender) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return faMars;
      case "female":
        return faVenus;
      default:
        return faGenderless;
    }
  };

  // Function to get gender color
  const getGenderColor = (gender) => {
    switch (gender?.toLowerCase()) {
      case "male":
        return "text-blue-500";
      case "female":
        return "text-pink-500";
      default:
        return "text-gray-500";
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Column definitions for the data table
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "50px",
      cell: (row, index) => (
        <div className="text-center w-full">{index + 1}</div>
      ),
    },
    {
      name: "Registration No",
      selector: (row) => row.registrationNumber,
      sortable: true,
      width: "180px",
      cell: (row) => (
        <div className="font-medium text-gray-800">
          {row.registrationNumber}
        </div>
      ),
    },
    {
      name: "Full Name",
      selector: (row) =>
        `${row.firstName} ${row.middleName || ""} ${row.lastName}`.trim(),
      sortable: true,
      width: "280px",
      cell: (row) => (
        <div className="flex items-center">
          <FontAwesomeIcon icon={faUser} className="mr-2 text-gray-500" />
          <div className="font-medium text-gray-800">
            {`${row.firstName} ${row.middleName || ""} ${row.lastName}`.trim()}
          </div>
        </div>
      ),
    },
    // {
    //   name: "Class",
    //   selector: (row) => row.className,
    //   sortable: true,
    //   width: "150px",
    //   cell: (row) => (
    //     <div className="text-gray-600">{row.className || "N/A"}</div>
    //   ),
    // },
    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
      width: "200px",
      cell: (row) => (
        <div className="flex items-center text-gray-600">
          <FontAwesomeIcon icon={faEnvelope} className="mr-2 text-blue-500" />
          <div className="truncate">{row.email || "N/A"}</div>
        </div>
      ),
    },
    {
      name: "Contact",
      selector: (row) => row.contactNo,
      sortable: true,
      width: "140px",
      cell: (row) => (
        <div className="flex items-center text-gray-600">
          <FontAwesomeIcon icon={faPhone} className="mr-2 text-green-500" />
          <div>{row.contactNo || "N/A"}</div>
        </div>
      ),
    },
    // {
    //   name: "Age",
    //   selector: (row) => row.age,
    //   sortable: true,
    //   width: "80px",
    //   cell: (row) => (
    //     <div className="text-gray-600 text-center">{row.age || "N/A"}</div>
    //   ),
    // },
    {
      name: "Gender",
      selector: (row) => row.gender,
      sortable: true,
      width: "100px",
      cell: (row) => (
        <div className={`flex items-center ${getGenderColor(row.gender)}`}>
          <FontAwesomeIcon icon={getGenderIcon(row.gender)} className="mr-2" />
          <div>{row.gender || "N/A"}</div>
        </div>
      ),
    },
    {
      name: "DOB",
      selector: (row) => row.dob,
      sortable: true,
      width: "150px",
      cell: (row) => (
        <div className="text-gray-600 flex items-center">
          <FontAwesomeIcon
            icon={faCalendarAlt}
            className="mr-2 text-orange-500"
          />
          <div>{formatDate(row.dob)}</div>
        </div>
      ),
    },

    {
      name: "Actions",
      ignoreRowClick: true,
      width: "150px",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-200"
            onClick={() => handleEdit(row.id)}
            title="Edit Student"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-200"
            onClick={() => deleteStudent(row.id)}
            title="Delete Student"
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        </div>
      ),
    },
  ];

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, [teacherId]);

  // Apply filters when students or filter values change
  useEffect(() => {
    applyFilters();
  }, [students, selectedClass, selectedGender]);

  // Function to fetch students by class
  const fetchStudentsByClass = async (classId) => {
    if (!classId) {
      setStudents([]);
      return;
    }

    setLoading(true);
    try {
      const response = await StudentService.getStudentsByClass(classId, token);
      if (response.code === "00") {
        setStudents(response.content || []);
      } else {
        console.error("Failed to fetch students", response.message);
        toast.error(response.message || "Failed to fetch students");
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Error fetching students");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch teacher's classes
  const fetchClasses = async () => {
    try {
      const response = await ClassService.getClasses(teacherId, token);
      if (response.code === "00") {
        setClasses(response.content || []);
      } else {
        console.error("Failed to fetch classes", response.message);
        toast.error(response.message || "Failed to fetch classes");
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Error fetching classes");
    }
  };

  // Function to apply filters
  const applyFilters = () => {
    let filtered = [...students];

    // Filter by gender
    if (selectedGender) {
      filtered = filtered.filter(
        (student) =>
          student.gender?.toLowerCase() === selectedGender.toLowerCase()
      );
    }

    setFilteredStudents(filtered);
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSelectedClass("");
    setSelectedGender("");
    setStudents([]);
  };

  // Function to handle creating a new student
  const handleAddStudent = () => {
    navigate("/teacher/addStudent");
  };

  // Function to open the Edit Form and set the selected student
  const handleEdit = (studentId) => {
    navigate(`/teacher/editStudent/${studentId}`);
  };

  // Function to delete a student with confirmation
  const deleteStudent = async (studentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student? This action cannot be undone."
    );
    if (confirmDelete) {
      try {
        setLoading(true);
        const response = await StudentService.deleteStudent(studentId, token);
        if (response.code === "00") {
          toast.success(response.message || "Student deleted successfully");
          // Refresh the list after deletion
          if (selectedClass) {
            fetchStudentsByClass(selectedClass);
          }
        } else {
          console.error("Failed to delete student", response.message);
          toast.error(response.message || "Failed to delete student");
        }
      } catch (error) {
        console.error("Error deleting student:", error);
        toast.error("Error deleting student");
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle class selection change
  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    if (classId) {
      fetchStudentsByClass(classId);
    } else {
      setStudents([]);
    }
  };

  // Custom no data component
  const NoDataComponent = () => (
    <div className="text-center py-8 text-gray-500">
      {!selectedClass
        ? "Please select a class to view students."
        : students.length === 0
        ? "No students found in the selected class."
        : "No students match the selected filters."}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
        <Header />
        <main className="grow p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Student List</h1>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-200"
              onClick={handleAddStudent}
            >
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Register New Student
            </button>
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-200"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            {(selectedClass || selectedGender) && (
              <button
                className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center transition-colors duration-200"
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
                {/* Class Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Class *
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a Class</option>
                    {classes.map((classItem) => (
                      <option key={classItem.id} value={classItem.id}>
                        {classItem.className}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-500 mt-1">
                    Students will only be displayed after selecting a class
                  </p>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Gender
                  </label>
                  <select
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="mb-4">
            <p className="text-gray-600">
              {selectedClass ? (
                <>
                  Showing {filteredStudents.length} of {students.length}{" "}
                  students
                  {selectedGender && (
                    <span className="ml-2 text-blue-600">
                      (Filtered by gender)
                    </span>
                  )}
                </>
              ) : (
                "Select a class to view students"
              )}
            </p>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredStudents}
              progressPending={loading}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[5, 10, 15, 20, 25]}
              highlightOnHover
              pointerOnHover
              responsive
              customStyles={customStyles}
              noDataComponent={<NoDataComponent />}
              paginationComponentOptions={{
                rowsPerPageText: "Rows per page:",
                rangeSeparatorText: "of",
                selectAllRowsItem: true,
                selectAllRowsItemText: "All",
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

export default TeacherStudentList;
