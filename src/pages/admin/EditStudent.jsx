import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import { useNavigate } from "react-router-dom";
import StudentService from "../../service/StudentService";
import ClassService from "../../service/ClassService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";
import {
  faArrowLeft,
  faEdit,
  faEraser,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import GradeService from "../../service/GradeService";

function EditStudent() {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the student ID from the URL

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");

  // State to hold the form data
  const [formData, setFormData] = useState({
    id: "",
    registrationNumber: "", // Auto-generated registration number
    firstName: "",
    middleName: "",
    lastName: "",
    nic: "",
    email: "",
    contactNo: "",
    address: "",
    age: "",
    dob: "",
    gender: "",
    gradeId: "",
    profilePhoto: null,
    classIds: [], // Add this for backend compatibility
    selectedClasses: [],
  });
  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null); // Create a reference to the file input element so we can programmatically reset or access it
  const [previewUrl, setPreviewUrl] = useState(null); // State for holding image preview URL
  const [formErrors, setFormErrors] = useState({}); // State for holding validation errors
  const [classes, setClasses] = useState([]); // State to hold fetched classes and subjects
  const [searchTerm, setSearchTerm] = useState(""); // State to store the current text input from the subject search field
  const [filteredClasses, setFilteredClasses] = useState([]); // State to store the filtered list of subjects based on the search term
  const [showClassDropdown, setShowClassDropdown] = useState(false); // State to control the visibility of the subject dropdown
  const [grades, setGrades] = useState([]); // State to hold fetched Grades

  // Auto-generate registration number when the component mounts
  // useEffect(() => {
  //   fetchData();
  //   fetchStudent(id);
  // }, []);

  useEffect(() => {
    const query = searchTerm.toLowerCase();
    const filtered = classes.filter((classs) => {
      const nameMatch = classs.className?.toLowerCase().includes(query);
      const idMatch = classs.id?.toString().toLowerCase().includes(query);
      return nameMatch || idMatch;
    });
    setFilteredClasses(filtered);
  }, [searchTerm, classes]);

  // Modified useEffect to fetch data in proper sequence
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchData(); // Wait for classes and classes to load first
        await fetchStudent(id); // Then fetch student data
      } catch (error) {
        console.error("Error initializing data:", error);
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      initializeData();
    } else {
      setError("No student ID provided");
      setLoading(false);
    }
  }, [id]);

  // Add this useEffect to handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowClassDropdown(false);
      }
    };

    // Add event listener when dropdown is open
    if (showClassDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    // Cleanup event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showClassDropdown]);

  // Add this useEffect to update selectedClasses when classes are loaded
  useEffect(() => {
    if (
      classes.length > 0 &&
      formData.classIds &&
      formData.classIds.length > 0 &&
      formData.selectedClasses.length === 0
    ) {
      const selectedClassesArray = classes.filter((classs) =>
        formData.classIds.includes(classs.id)
      );
      setFormData((prev) => ({
        ...prev,
        selectedClasses: selectedClassesArray,
      }));
    }
  }, [classes, formData.classIds, formData.selectedClasses.length]);

  // Fetch Class and Subject data
  const fetchData = async () => {
    try {
      //Fetch class
      const classResponse = await ClassService.getAllClasses(token);
      if (classResponse.code === "00") {
        setClasses(classResponse.content); // Populate the classes state with the fetched data
      } else {
        console.error("Failed to fetch Class", classResponse.message);
        toast.error("Failed to fetch classes");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Error fetching initial data");
    }

    try {
      const gradeRes = await GradeService.getAllGrades(token);
      if (gradeRes.code === "00") {
        setGrades(gradeRes.content); // Populate the Grades state with the fetched data
      } else {
        console.error("Failed to fetch Grades", gradeRes.message);
      }
    } catch (error) {
      console.error("Error fetching Grades:", error);
    }
  };

  // get Student Data
  const fetchStudent = async (id) => {
    try {
      const response = await StudentService.getStudentById(id, token);

      if (response.code === "00") {
        const student = response.content;

        // Generate image preview URL
        if (student.profilePhotoBase64) {
          // setPreviewUrl(student.profilePhotoBase64);
          const imageUrl = `data:image/jpeg;base64,${student.profilePhotoBase64}`;
          setPreviewUrl(imageUrl); // <--- for <img src={previewUrl} />
        }

        // Map subject IDs to actual subject objects from the classes array
        let selectedClassesArray = [];
        if (student.classIds && student.classIds.length > 0) {
          selectedClassesArray = classes.filter((classs) =>
            student.classIds.includes(classs.id)
          );
        }
        // If classes array is not loaded yet, we'll handle this in useEffect
        if (classes.length === 0 && student.classes) {
          selectedClassesArray = student.classes;
        }

        setFormData({
          ...student,
          selectedClasses: selectedClassesArray,
          classIds: student.classIds || [],
        });
        setError(null);
      } else if (response.code === "01") {
        setError("Student not found");
        toast.error("Student not found");
      } else {
        console.error("Failed to fetch Student", response.message);
        setError("Failed to fetch student data");
        toast.error("Failed to fetch student data");
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      setError("Error fetching student data");
      toast.error("Error fetching student data");
    } finally {
      setLoading(false);
    }
  };

  //Add subject to selected subjects
  const addClass = (classs) => {
    if (!formData.selectedClasses.some((s) => s.id === classs.id)) {
      const updatedClasses = [...formData.selectedClasses, classs];
      const updatedClassIds = updatedClasses.map((s) => s.id);

      setFormData((prev) => ({
        ...prev,
        selectedClasses: updatedClasses,
        classIds: updatedClassIds,
      }));
    }
    setSearchTerm("");
    setShowClassDropdown(false);
  };

  //Function to remove classes from the formData.selectedClasses list
  const removeClass = (classId) => {
    const updatedClasses = formData.selectedClasses.filter(
      (s) => s.id !== classId
    );
    const updatedClassIds = updatedClasses.map((s) => s.id);

    setFormData((prev) => ({
      ...prev,
      selectedClasses: updatedClasses,
      classIds: updatedClassIds,
    }));
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setShowClassDropdown(true);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Clear specific field error when user starts typing
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        e.target.value = ""; // Reset the file input
        return;
      }

      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB.");
        e.target.value = ""; // Reset the file input
        return;
      }

      // Set preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);

      // Save file to state
      setFormData({
        ...formData,
        profilePhoto: file, // Store the actual File object
      });
    }
  };

  // Handle back button
  const handleBack = () => {
    navigate("/admin/studentList");
  };

  // Function to validate form inputs
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.firstName.trim()) {
      errors.firstName = "First name is required.";
      isValid = false;
    }

    if (!formData.middleName) {
      errors.middleName = "Middle name is required.";
      isValid = false;
    }

    if (!formData.lastName) {
      errors.lastName = "Last name is required.";
      isValid = false;
    }

    if (!formData.nic) {
      errors.nic = "NIC is required.";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Invalid email format.";
      isValid = false;
    }

    if (!formData.contactNo) {
      errors.contactNo = "Contact number is required.";
      isValid = false;
    }

    if (!formData.age || formData.age < 0) {
      errors.age = "Please enter a valid age.";
      isValid = false;
    }

    if (!formData.gender) {
      errors.gender = "Gender is required.";
      isValid = false;
    }

    if (!formData.address) {
      errors.address = "Address is required.";
      isValid = false;
    }

    if (!formData.dob) {
      errors.dob = "Dat of birth is required.";
      isValid = false;
    }

    // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
    // if (!formData.password) {
    //   errors.password = "Password is required.";
    //   isValid = false;
    // } else if (!passwordRegex.test(formData.password)) {
    //   errors.password =
    //     "Password must be at least 6 characters and include uppercase, lowercase, and a symbol.";
    //   isValid = false;
    // }

    // if (!formData.subject) {
    //   errors.subject = "Subject is required.";
    //   isValid = false;
    // }

    if (!formData.selectedClasses || formData.selectedClasses.length === 0) {
      errors.selectedClasses = "At least one classs is required.";
      isValid = false;
    }
    setFormErrors(errors);
    return isValid;
  };

  // Function to reset form to initial state
  const handleReset = async () => {
    try {
      await fetchStudent(id);
      setFormErrors({});
      resetDropdown();
    } catch (error) {
      console.error("Error resetting form:", error);
      toast.error("Error resetting form");
    }
  };

  // Function to reset dropdown
  const resetDropdown = () => {
    setSearchTerm(""); // Clear the input field
    setFilteredClasses(classes); // Reset the filtered list to full list
    setShowClassDropdown(false); // Hide the dropdown
  };

  // Function to reset photo
  const handleResetPhoto = () => {
    setPreviewUrl(null);
    setFormData((prev) => ({
      ...prev,
      profilePhoto: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Function to handle form Update
  const handleEdit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setUpdateLoading(true);

    try {
      // Prepare student data for JSON payload
      const studentData = {
        id: formData.id, // Ensure ID is included for update
        registrationNumber: formData.registrationNumber.trim(),
        firstName: formData.firstName.trim(),
        middleName: formData.middleName?.trim() || null,
        lastName: formData.lastName.trim(),
        nic: formData.nic?.trim() || null,
        email: formData.email.trim().toLowerCase(),
        contactNo: formData.contactNo?.trim() || null,
        address: formData.address?.trim() || null,
        age: formData.age ? parseInt(formData.age) : null,
        dob: formData.dob || null,
        gender: formData.gender || null,
        gradeId: parseInt(formData.gradeId),
        classIds: formData.classIds, // Use classIds instead of selectedClasses
        userDetails: {
          username: formData.email.trim().toLowerCase(),
          // password: formData.password,
          role: "STUDENT",
        },
      };

      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append("student", JSON.stringify(studentData));
      console.log("Payload being sent:", formDataToSend); // Debug log

      // Only append profilePhoto if a new file is selected
      if (formData.profilePhoto instanceof File) {
        formDataToSend.append("profilePhoto", formData.profilePhoto);
      }

      const response = await StudentService.updateStudent(
        formDataToSend,
        token
      ); // Ensure token is valid

      handleSubmissionResponse(response); // Handle the response based on the updated backend structure
    } catch (error) {
      console.error("Error updating Student:", error);
      handleSubmissionError(error);
      toast.error(
        "An error occurred while updating the Student. Please try again."
      );
    } finally {
      setUpdateLoading(false); // Reset loading state
    }
  };

  // Separate function to response based on backend response codes
  const handleSubmissionResponse = (response) => {
    // Check if response has the expected structure
    if (!response || !response.code) {
      toast.error("Invalid response from server. Please try again.");
      return;
    }

    switch (response.code) {
      case "00": // VarList.RES_SUCCESS
        toast.success("Student updated successfully!");
        navigate("/admin/studentList");
        break;
      case "05": // VarList.RES_ERROR
        toast.error("Please enter valid student data");
        break;
      case "01": // VarList.RES_NO_DATE_FOUND
        toast.error("Student not found or has been deleted");
        break;
      case "06": // VarList.RES_DUPLICATE
        toast.error("Registration number already exists");
        break;
      case "12": // VarList.RES_DUPLICATE_NIC
        toast.error("NIC already exists");
        break;
      case "13": // VarList.RES_DUPLICATE_EMAIL
        toast.error("Email already exists");
        break;
      case "17": // VarList.RES_DUPLICATE_USERNAME
        toast.error("Username already exists");
        break;
      case "16": // VarList.RES_CLASS_NOT_FOUND
        toast.error("Selected class not found");
        break;
      case "15": // VarList.RES_NO_SUBJECTS
        toast.error("Student must have at least one class");
        break;
      case "14": // VarList.RES_INVALID_INPUT
        toast.error("One or more classs IDs are invalid");
        break;
      default:
        toast.error(response.message || "Failed to update student");
    }
  };

  // Separate function to handle network/unexpected errors
  const handleSubmissionError = (error) => {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400: // Bad Request
          toast.error(
            data?.message || "Invalid data provided. Please check your input."
          );
          break;

        case 404: // Bad Request
          toast.error(data?.message || "Student not found.");
          break;

        case 409: // Conflict (duplicate data)
          toast.error(
            data?.message || "Duplicate data detected. Please check your input."
          );
          break;

        case 413:
          toast.error(data?.message || "File size too large (max 5MB).");
          break;

        case 415:
          toast.error(
            data?.message || "Unsupported file type. Only images are allowed"
          );
          break;

        case 422:
          toast.error(data?.message || "Error processing file");
          break;

        case 500: // Internal Server Error
          toast.error("Server error. Please try again later");
          break;

        default:
          toast.error(
            data?.message || "An error occurred while updatind the student."
          );
          break;
      }
    } else if (error.request) {
      // Network error
      toast.error("Network error. Please check your connection and try again.");
    } else {
      // Other errors
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
          <Header />
          <main className="grow p-6 flex items-center justify-center">
            <div className="text-center">
              <FontAwesomeIcon
                icon={faSpinner}
                spin
                className="text-4xl text-blue-500 mb-4"
              />
              <p className="text-gray-600">Loading student data...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
          <Header />
          <main className="grow p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => fetchStudent(id)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Try Again
              </button>
              <button
                onClick={handleBack}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 ml-4 rounded"
              >
                Back to Students
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
        <Header />
        <main className="grow p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Edit Student
          </h1>
          <form
            onSubmit={handleEdit}
            className="bg-white p-8 rounded-lg shadow-lg space-y-6"
          >
            {/* Registration Number Section */}
            <div className="mb-6">
              <label
                htmlFor="registration_number"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Registration Number
              </label>
              <input
                type="text"
                name="registration_number"
                id="registration_number"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                readOnly
                className="shadow appearance-none border rounded w-full md:w-1/2 lg:w-1/3 py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            {/* Main Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                {/* <label
                            htmlFor="first_name"
                            className="block text-gray-700 text-sm font-bold mb-2"
                          >
                            First Name
                          </label> */}
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.firstName ? "border-red-500" : ""
                  }`}
                  aria-describedby="first_name_error"
                  // required
                  placeholder="Enter first name"
                />
                {formErrors.firstName && (
                  <p
                    id="firstName_error"
                    className="text-red-500 text-xs italic"
                  >
                    {formErrors.firstName}
                  </p>
                )}
              </div>

              {/* Middle Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  id="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.middleName ? "border-red-500" : ""
                  }`}
                  aria-describedby="middle_name_error"
                  // required
                  placeholder="Enter middle name"
                />
                {formErrors.middleName && (
                  <p
                    id="middle_name_error"
                    className="text-red-500 text-xs italic"
                  >
                    {formErrors.middleName}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.lastName ? "border-red-500" : ""
                  }`}
                  aria-describedby="last_name_error"
                  // required
                  placeholder="Enter last name"
                />
                {formErrors.lastName && (
                  <p
                    id="last_name_error"
                    className="text-red-500 text-xs italic"
                  >
                    {formErrors.lastName}
                  </p>
                )}
              </div>

              {/* NIC */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIC
                </label>
                <input
                  type="text"
                  name="nic"
                  id="nic"
                  value={formData.nic}
                  onChange={handleInputChange}
                  maxLength="10"
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.nic ? "border-red-500" : ""
                  }`}
                  placeholder="Enter NIC number"
                />
                {formErrors.nic && (
                  <p
                    id="last_name_error"
                    className="text-red-500 text-xs italic"
                  >
                    {formErrors.nic}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {/* <Mail className="w-4 h-4 inline mr-1" /> */}
                  <i className="fas fa-envelope mr-1"></i>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.email ? "border-red-500" : ""
                  }`}
                  aria-describedby="email_error"
                  // required
                  placeholder="Enter email address"
                />
                {formErrors.email && (
                  <p id="email_error" className="text-red-500 text-xs italic">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {/* Contact No */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-phone mr-1"></i>
                  Contact No
                </label>
                <input
                  type="tel"
                  name="contactNo"
                  id="contactNo"
                  value={formData.contactNo}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.contactNo ? "border-red-500" : ""
                  }`}
                  aria-describedby="contactNo_error"
                  maxLength="10"
                  // required
                  placeholder="Enter contact number"
                />
                {formErrors.contactNo && (
                  <p
                    id="contactNo_error"
                    className="text-red-500 text-xs italic"
                  >
                    {formErrors.contactNo}
                  </p>
                )}
              </div>

              {/* Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {/* <i className="fas fa-age mr-1"></i> */}
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  id="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.age ? "border-red-500" : ""
                  }`}
                  aria-describedby="age_error"
                  // required
                  placeholder="Enter age"
                />
                {formErrors.age && (
                  <p id="age_error" className="text-red-500 text-xs italic">
                    {formErrors.age}
                  </p>
                )}
              </div>

              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-calendar-alt mr-1"></i>
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  id="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Enter date of birth"
                />
                {formErrors.dob && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.dob}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-genderless mr-1"></i>
                  Gender
                </label>
                <select
                  name="gender"
                  id="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.gender ? "border-red-500" : ""
                  }`}
                  aria-describedby="gender_error"
                  // required
                  placeholder="Enter gender"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {formErrors.gender && (
                  <p id="gender_error" className="text-red-500 text-xs italic">
                    {formErrors.gender}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <i className="fas fa-location-arrow mr-1"></i>
                  Address
                </label>
                <textarea
                  name="address"
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
                  placeholder="Enter address"
                />
                {formErrors.address && (
                  <p className="text-red-500 text-xs italic mt-1">
                    {formErrors.address}
                  </p>
                )}
              </div>

              {/* Password */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  // type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.password ? "border-red-500" : ""
                  }`}
                  aria-describedby="password_error"
                  // required
                  placeholder="Enter password"
                />
                {formErrors.password && (
                  <p
                    id="password_error"
                    className="text-red-500 text-xs italic"
                  >
                    {formErrors.password}
                  </p>
                )}
              </div> */}

              {/* Grade */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grade
                </label>
                <select
                  name="gradeId"
                  id="gradeId"
                  value={formData.gradeId}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.gradeId ? "border-red-500" : ""
                  }`}
                  aria-describedby="grade_error"
                  // required
                >
                  <option value="">Select Grade</option>
                  {grades.map((grd, index) => (
                    <option key={index} value={grd.id}>
                      {grd.gradeName}
                    </option>
                  ))}
                </select>
                {formErrors.gradeId && (
                  <p
                    id="contactNo_error"
                    className="text-red-500 text-xs italic"
                  >
                    {formErrors.gradeId}
                  </p>
                )}
              </div>

              {/* Class */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <select
                  name="classId"
                  id="classId"
                  value={formData.classId}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.class ? "border-red-500" : ""
                  }`}
                  aria-describedby="class_error"
                  // required
                >
                  <option value="">Select Class</option>
                  {classes.map((cl, index) => (
                    <option key={index} value={cl.id}>
                      {cl.className}
                    </option>
                  ))}
                </select>
                {formErrors.classId && (
                  <p id="class_error" className="text-red-500 text-xs italic">
                    {formErrors.classId}
                  </p>
                )}
              </div> */}
            </div>

            {/* classes Search and Add */}
            <div className="relative mb-6" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Classess
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowClassDropdown(true)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                  placeholder="Search and select classs..."
                />
                {/* <Plus className="w-5 h-5 text-gray-400 absolute right-3 top-4" /> */}
              </div>

              {/* Dropdown */}
              {showClassDropdown && filteredClasses.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredClasses
                    .filter(
                      (classs) =>
                        !formData.selectedClasses.some(
                          (selected) => selected.id === classs.id
                        )
                    )
                    .map((classs) => (
                      <div
                        key={classs.id}
                        onClick={() => addClass(classs)}
                        className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-gray-900">
                              {classs.subjectName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {classs.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Selected Classe */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Selected Classes (
                  {formData.selectedClasses
                    ? formData.selectedClasses.length
                    : 0}
                  )
                </label>
              </div>
              {!formData.selectedClasses ||
              formData.selectedClasses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <i className="fas fa-book-open text-4xl text-gray-400 mb-3"></i>
                  <p className="text-gray-500">No classes selected yet</p>
                  <p className="text-sm text-gray-400">
                    Search and add classes from above
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {formData.selectedClasses.map((classs) => (
                    <div
                      key={classs.id}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {classs.subjectName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {classs.description || "No description available"}
                          </p>
                          <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            ID: {classs.id}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeClass(classs.id)}
                          className="ml-2 p-1 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {formErrors.selectedClasses && (
                <p id="firstName_error" className="text-red-500 text-xs italic">
                  {formErrors.selectedClasses}
                </p>
              )}
            </div>

            {/* Profile Photo Preview */}
            {previewUrl && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo Preview
                </label>
                <img
                  src={previewUrl}
                  alt="Profile Preview"
                  className="rounded-lg shadow-lg w-32 h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={handleResetPhoto}
                  className="mt-2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove Photo
                </button>
              </div>
            )}

            {/* Profile Photo Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <input
                type="file"
                name="profile_photo"
                id="profile_photo"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="shadow appearance-none border rounded w-full md:w-1/2 lg:w-1/3 py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center mt-4">
              <button
                type="submit"
                disabled={updateLoading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                {updateLoading ? "EDITING..." : "EDIT"}
                {/* EDIT */}
              </button>
              <button
                type="button"
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 ml-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                onClick={handleReset}
              >
                <FontAwesomeIcon icon={faEraser} className="mr-2" />
                RESET
              </button>
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-bold ml-4 py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
                onClick={handleBack}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                BACK
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default EditStudent;
