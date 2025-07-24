import React, { useEffect, useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import Header from "../partials/Header";
import Sidebar from "../partials/Sidebar";
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
  faSearch,
  faEye,
  faTrashAlt,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function ClassList() {
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

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  const navigate = useNavigate();

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");

  // Custom styles for DataTable
  const customStyles = {
    header: {
      style: {
        minHeight: "56px",
        backgroundColor: "#f8fafc",
      },
    },
    headRow: {
      style: {
        borderTopStyle: "solid",
        borderTopWidth: "1px",
        borderTopColor: "#e2e8f0",
        backgroundColor: "#f1f5f9",
        minHeight: "52px",
      },
    },
    headCells: {
      style: {
        fontSize: "12px",
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        color: "#64748b",
        paddingLeft: "16px",
        paddingRight: "16px",
      },
    },
    cells: {
      style: {
        paddingLeft: "16px",
        paddingRight: "16px",
        paddingTop: "12px",
        paddingBottom: "12px",
      },
    },
    rows: {
      style: {
        minHeight: "60px",
        "&:hover": {
          backgroundColor: "#f8fafc",
          cursor: "pointer",
        },
      },
      highlightOnHoverStyle: {
        backgroundColor: "#f1f5f9",
        borderBottomColor: "#FFFFFF",
        borderRadius: "25px",
        outline: "1px solid #FFFFFF",
      },
    },
    pagination: {
      style: {
        borderTopStyle: "solid",
        borderTopWidth: "1px",
        borderTopColor: "#e2e8f0",
        minHeight: "56px",
        fontSize: "14px",
      },
      pageButtonsStyle: {
        borderRadius: "50%",
        height: "40px",
        width: "40px",
        padding: "8px",
        margin: "0 4px",
        cursor: "pointer",
        transition: "0.4s",
        color: "#64748b",
        fill: "#64748b",
        backgroundColor: "transparent",
        "&:disabled": {
          cursor: "unset",
          color: "#cbd5e1",
          fill: "#cbd5e1",
        },
        "&:hover:not(:disabled)": {
          backgroundColor: "#e2e8f0",
        },
        "&:focus": {
          outline: "none",
          backgroundColor: "#e2e8f0",
        },
      },
    },
  };

  // Fetch all classes, grades, and subjects on component mount
  useEffect(() => {
    fetchClasses();
    fetchGrades();
    fetchSubjects();
  }, []);

  // Apply filters when classes or filter values change
  useEffect(() => {
    applyFilters();
  }, [classes, selectedGrade, selectedSubject]);

  // Function to fetch all classes using ClassService
  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await ClassService.getAllClasses(token);
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
      const response = await GradeService.getAllGrades(token);
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
      const response = await SubjectService.getAllSubject(token);
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

    if (selectedGrade) {
      filtered = filtered.filter(
        (classItem) =>
          classItem.grade && classItem.grade.id === parseInt(selectedGrade)
      );
    }

    if (selectedSubject) {
      filtered = filtered.filter(
        (classItem) =>
          classItem.subject &&
          classItem.subject.id === parseInt(selectedSubject)
      );
    }

    setFilteredClasses(filtered);
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSelectedGrade("");
    setSelectedSubject("");
    setSearchTerm("");
  };

  // Function to open the Edit Form and set the selected class
  const handleEdit = (id) => {
    console.log(id);
    navigate(`/admin/editClass/${id}`);
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

  // Define table columns
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
      wrap: true,
      minWidth: "180px",
      cell: (row) => (
        <div className="font-medium text-gray-900">{row.className}</div>
      ),
    },
    {
      name: "Grade",
      selector: (row) => row.grade?.gradeName || "N/A",
      sortable: true,
      minWidth: "120px",
      cell: (row) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {row.grade ? row.grade.gradeName : "N/A"}
        </span>
      ),
    },
    {
      name: "Subject",
      selector: (row) => row.subject?.subjectName || "No Subject",
      sortable: true,
      minWidth: "150px",
      cell: (row) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
          {row.subject ? row.subject.subjectName : "No Subject"}
        </span>
      ),
    },
    {
      name: "Date",
      selector: (row) => row.classDate,
      sortable: true,
      minWidth: "120px",
      cell: (row) => (
        <div className="text-sm text-gray-900">{formatDate(row.classDate)}</div>
      ),
    },
    {
      name: "Time",
      selector: (row) => row.startTime,
      sortable: true,
      minWidth: "100px",
      cell: (row) => (
        <div className="text-sm text-gray-900">{formatTime(row.startTime)}</div>
      ),
    },
    {
      name: "Description",
      selector: (row) => row.description || "No description",
      wrap: true,
      minWidth: "200px",
      cell: (row) => (
        <div
          className="text-sm text-gray-900 max-w-xs truncate"
          title={row.description}
        >
          {row.description || "No description"}
        </div>
      ),
    },
    {
      name: "Students",
      selector: (row) => row.studentCount || 0,
      sortable: true,
      minWidth: "100px",
      center: true,
      cell: (row) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
          {row.studentCount || "0"}
        </span>
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

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm) return filteredClasses;

    return filteredClasses.filter(
      (item) =>
        item.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.grade?.gradeName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.subject?.subjectName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [filteredClasses, searchTerm]);

  // Custom search component
  const SearchComponent = () => (
    <div className="relative max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search classes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );

  // Custom header actions
  const HeaderActions = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <SearchComponent />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
        onClick={() => navigate("/admin/addClass")}
      >
        <FontAwesomeIcon icon={faPlus} className="mr-2" />
        Add Class
      </button>
      <button
        className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
        onClick={() => setShowFilters(!showFilters)}
      >
        <FontAwesomeIcon icon={faFilter} className="mr-2" />
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>
      {(selectedGrade || selectedSubject || searchTerm) && (
        <button
          className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
          onClick={clearFilters}
        >
          <FontAwesomeIcon icon={faTimes} className="mr-2" />
          Clear All Filters
        </button>
      )}
    </div>
  );

  // Custom no data component
  const NoDataComponent = () => (
    <div className="flex flex-col items-center justify-center py-12">
      <svg
        className="w-12 h-12 text-gray-300 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <p className="text-lg font-medium text-gray-900 mb-2">No classes found</p>
      <p className="text-sm text-gray-500">
        {classes.length === 0
          ? "No classes have been created yet."
          : "Try adjusting your search or filters."}
      </p>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
        <Header />
        <main className="grow p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Class Management
            </h1>
            <p className="text-gray-600">
              Manage and organize your classes efficiently
            </p>
          </div>

          {/* Header Actions */}
          <div className="mb-6">
            <HeaderActions />
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
              Showing {filteredData.length} of {classes.length} classes
              {(selectedGrade || selectedSubject || searchTerm) && (
                <span className="ml-2 text-blue-600 font-medium">
                  (Filtered)
                </span>
              )}
            </p>
          </div>

          {/* Enhanced DataTable */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <DataTable
              columns={columns}
              data={filteredData}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[5, 10, 25, 50]}
              highlightOnHover
              pointerOnHover
              responsive
              // customStyles={customStyles}
              progressPending={loading}
              progressComponent={
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">Loading classes...</span>
                </div>
              }
              noDataComponent={<NoDataComponent />}
              defaultSortFieldId="className"
              defaultSortAsc={true}
              paginationComponentOptions={{
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

export default ClassList;
