import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import Header from "../partials/Header";
import Sidebar from "../partials/TeacherSidebar";
import { useNavigate } from "react-router-dom";
import ClassService from "../service/ClassService";
import GradeService from "../service/GradeService";
import SubjectService from "../service/SubjectService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faPlus,
  faFilter,
  faTimes,
  faEye,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function TeacherClass() {
  // State to hold the list of classes
  const [classes, setClasses] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
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

  // Column definitions for the data table
  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      sortable: false,
      width: "60px",
      center: true,
    },
    {
      name: "Class Name",
      selector: (row) => row.className,
      sortable: true,
      minWidth: "150px",
      cell: (row) => (
        <div className="font-medium text-gray-800">{row.className}</div>
      ),
    },
    {
      name: "Grade",
      selector: (row) => row.gradeName || "N/A",
      sortable: true,
      minWidth: "100px",
      cell: (row) => (
        <div className="text-gray-600">{row.gradeName || "N/A"}</div>
      ),
    },
    {
      name: "Subject",
      selector: (row) => row.subjectName || "No Subject",
      sortable: true,
      minWidth: "120px",
      cell: (row) => (
        <div className="text-gray-600">{row.subjectName || "No Subject"}</div>
      ),
    },
    {
      name: "Date",
      selector: (row) => row.classDate,
      sortable: true,
      minWidth: "100px",
      cell: (row) => (
        <div className="text-gray-600">{formatDate(row.classDate)}</div>
      ),
    },
    {
      name: "Time",
      selector: (row) => row.startTime,
      sortable: true,
      minWidth: "80px",
      cell: (row) => (
        <div className="text-gray-600">{formatTime(row.startTime)}</div>
      ),
    },
    {
      name: "Description",
      selector: (row) => row.description || "No description",
      sortable: false,
      minWidth: "200px",
      cell: (row) => (
        <div
          className="max-w-xs truncate text-gray-600"
          title={row.description || "No description"}
        >
          {row.description || "No description"}
        </div>
      ),
    },
    {
      name: "Students",
      selector: (row) => row.studentCount || 0,
      sortable: true,
      minWidth: "80px",
      center: true,
      cell: (row) => (
        <div className="text-gray-600">{row.studentCount || "0"}</div>
      ),
    },
    {
      name: "Actions",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      minWidth: "150px",
      cell: (row) => (
        <div className="flex space-x-2">
          <button
            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors duration-200"
            onClick={() => handleView(row.id)}
            title="View Class"
          >
            <FontAwesomeIcon icon={faEye} />
          </button>
          <button
            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors duration-200"
            onClick={() => handleEdit(row.id)}
            title="Edit Class"
          >
            <FontAwesomeIcon icon={faEdit} />
          </button>
          <button
            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors duration-200"
            onClick={() => deleteClass(row.id)}
            title="Delete Class"
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
        </div>
      ),
    },
  ];

  // Fetch all classes, grades, and subjects on component mount
  useEffect(() => {
    fetchClasses(teacherId);
    fetchGrades();
    fetchSubjects();
  }, [teacherId]);

  // Apply filters when classes or filter values change
  useEffect(() => {
    applyFilters();
  }, [classes, selectedGrade, selectedSubject]);

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

  // Function to apply filters
  const applyFilters = () => {
    let filtered = [...classes];

    console.log("All classes:", classes);
    console.log("Selected grade:", selectedGrade);
    console.log("Selected subject:", selectedSubject);

    if (selectedGrade) {
      filtered = filtered.filter((classItem) => {
        // First try gradeId (direct property)
        if (classItem.gradeId) {
          return classItem.gradeId === parseInt(selectedGrade);
        }
        // Then try nested grade object
        if (classItem.grade && classItem.grade.id) {
          return classItem.grade.id === parseInt(selectedGrade);
        }
        return false;
      });
      console.log("After grade filter:", filtered);
    }

    if (selectedSubject) {
      filtered = filtered.filter((classItem) => {
        // First try subjectId (direct property)
        if (classItem.subjectId) {
          return classItem.subjectId === parseInt(selectedSubject);
        }
        // Then try nested subject object
        if (classItem.subject && classItem.subject.id) {
          return classItem.subject.id === parseInt(selectedSubject);
        }
        return false;
      });
      console.log("After subject filter:", filtered);
    }

    console.log("Final filtered classes:", filtered);

    setFilteredClasses(filtered);
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSelectedGrade("");
    setSelectedSubject("");
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

  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Function to format time
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const time = new Date(`1970-01-01T${timeString}`);
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Custom no data component
  const NoDataComponent = () => (
    <div className="text-center py-8 text-gray-500">
      {classes.length === 0
        ? "No classes found."
        : "No classes match the selected filters."}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
        <Header />
        <main className="grow p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Class List</h1>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              onClick={() => setShowFilters(!showFilters)}
            >
              <FontAwesomeIcon icon={faFilter} className="mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>

            {(selectedGrade || selectedSubject) && (
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
                {/* Grade Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filter by Grade
                  </label>
                  <select
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Grades</option>
                    {grades.map((grade) => (
                      <option key={grade.id} value={grade.id}>
                        {grade.gradeName}
                      </option>
                    ))}
                  </select>
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
                      <option key={subject.id} value={subject.id}>
                        {subject.subjectName}
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
              Showing {filteredClasses.length} of {classes.length} classes
              {(selectedGrade || selectedSubject) && (
                <span className="ml-2 text-blue-600">(Filtered)</span>
              )}
            </p>
          </div>

          {/* Data Table */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredClasses}
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

export default TeacherClass;
