import React, { useEffect, useState, useRef } from "react";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import { useNavigate } from "react-router-dom";
import TeacherService from "../../service/TeacherService";
import ClassService from "../../service/ClassService";
import SubjectService from "../../service/SubjectService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "react-toastify";

import {
  faArrowLeft,
  faEraser,
  faSave,
} from "@fortawesome/free-solid-svg-icons";

function AddTeacher() {
  const navigate = useNavigate();

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");

  // State to hold the form data
  const [formData, setFormData] = useState({
    teacherCode: "", // Auto-generated teacher code
    firstName: "",
    lastName: "",
    email: "",
    nic: "",
    contactNo: "",
    address: "",
    gender: "",
    subjectId: "",
    qualification: "",
    password: "",
    profilePhoto: null,
    selectedClasses: [],
  });

  const fileInputRef = useRef(null); // Create a reference to the file input element
  const [previewUrl, setPreviewUrl] = useState(null); // State for holding image preview URL
  const [formErrors, setFormErrors] = useState({}); // State for holding validation errors
  const [classes, setClasses] = useState([]); // State to store the complete list of available Classes
  const [subjects, setSubjects] = useState([]); // State to store the complete list of available Subjects
  const [searchTerm, setSearchTerm] = useState(""); // State to store the current text input from the class search field
  const [filteredClasses, setFilteredClasses] = useState([]); // State to store the filtered list of classes based on the search term
  const [showClassDropdown, setShowClassDropdown] = useState(false); // State to control the visibility of the class dropdown
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef(null);

  // Auto-generate teacher code when the component mounts
  useEffect(() => {
    const teacherCode = generateTeacherCode();
    setFormData((prevData) => ({
      ...prevData,
      teacherCode: teacherCode,
    }));
    fetchData(); // Fetch classes and subjects
  }, []);

  // Filter classes based on search query
  useEffect(() => {
    const query = searchTerm.toLowerCase();
    const filtered = classes.filter(
      (classs) =>
        classs.className.toLowerCase().includes(query) ||
        String(classs.id).toLowerCase().includes(query)
    );
    setFilteredClasses(filtered);
  }, [searchTerm, classes]);

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

  // Function to Fetch classes and subjects
  const fetchData = async () => {
    try {
      const classRes = await ClassService.getAllClasses(token);
      if (classRes.code === "00") {
        setClasses(classRes.content); // Populate the classes state with the fetched data
        setFilteredClasses(classRes.content); // Initially show all
      } else {
        console.error("Failed to fetch Classes", classRes.message);
      }
    } catch (error) {
      console.error("Error fetching Classes:", error);
    }

    try {
      const subjectRes = await SubjectService.getAllSubject(token);
      if (subjectRes.code === "00") {
        setSubjects(subjectRes.content); // Populate the subjects state with the fetched data
      } else {
        console.error("Failed to fetch Subjects", subjectRes.message);
      }
    } catch (error) {
      console.error("Error fetching Subjects:", error);
    }
  };

  // Enhanced addClass function
  const addClass = (classs) => {
    if (!formData.selectedClasses.some((s) => s.id === classs.id)) {
      setFormData((prev) => {
        const newSelectedClasses = [...prev.selectedClasses, classs];
        return {
          ...prev,
          selectedClasses: newSelectedClasses,
        };
      });
    }
    setSearchTerm("");
    setShowClassDropdown(false);
  };

  // Function to remove classes from the formData.selectedClasses list
  const removeClass = (id) => {
    setFormData((prev) => ({
      ...prev,
      selectedClasses: prev.selectedClasses.filter((s) => s.id !== id),
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
    setFormData((prev) => ({
      ...prev,
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

  // Function to Handle back button
  const handleBack = () => {
    navigate("/admin/teacherList");
  };

  // Function to Handle file change (for profile photo)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
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

  // Function to generate a unique teacher code
  const generateTeacherCode = () => {
    const prefix = "TCH";
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // e.g., "20231016"
    const randomPart = Math.floor(Math.random() * 10000); // Random number between 0-9999
    return `${prefix}-${datePart}-${randomPart}`; // e.g., "TCH-20231016-1234"
  };

  // Function to reset form to initial state
  const handleReset = () => {
    setFormData({
      teacherCode: generateTeacherCode(), // Regenerate the teacher code
      firstName: "",
      lastName: "",
      email: "",
      nic: "",
      contactNo: "",
      address: "",
      gender: "",
      subjectId: "",
      qualification: "",
      password: "",
      profilePhoto: null,
      selectedClasses: [],
    });
    resetDropdown();
    handleResetPhoto();
    setFormErrors({}); // Clear validation errors
  };

  // Function to reset dropdown
  const resetDropdown = () => {
    setSearchTerm(""); // Clear the input field
    setFilteredClasses(classes); // Reset the filtered list to full list
    setShowClassDropdown(false); // Hide the dropdown
  };

  // Function to reset photo
  const handleResetPhoto = () => {
    setFormData((prev) => ({
      ...prev,
      profilePhoto: null,
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPreviewUrl(null);
  };

  // Function to validate form inputs
  const validateForm = () => {
    const errors = {};
    let isValid = true;

    if (!formData.firstName) {
      errors.firstName = "First name is required.";
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
    if (!formData.gender) {
      errors.gender = "Gender is required.";
      isValid = false;
    }
    if (!formData.address) {
      errors.address = "Address is required.";
      isValid = false;
    }

    if (!formData.subjectId) {
      errors.subjectId = "Subject is required.";
      isValid = false;
    }

    if (!formData.qualification) {
      errors.qualification = "Qualification is required.";
      isValid = false;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
    if (!formData.password) {
      errors.password = "Password is required.";
      isValid = false;
    } else if (!passwordRegex.test(formData.password)) {
      errors.password =
        "Password must be at least 6 characters and include uppercase, lowercase, and a symbol.";
      isValid = false;
    }
    if (!formData.selectedClasses || formData.selectedClasses.length === 0) {
      errors.selectedClasses = "At least one class must be selected";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    setIsSubmitting(true); // Add loading state
    try {
      const payload = {
        teacherCode: formData.teacherCode.trim(),
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        nic: formData.nic?.trim() || null,
        contactNo: formData.contactNo?.trim() || null,
        address: formData.address?.trim() || null,
        gender: formData.gender || null,
        subjectId: parseInt(formData.subjectId),
        qualification: formData.qualification?.trim() || null,
        classIds: formData.selectedClasses.map((classs) => classs.id),
        userDetails: {
          username: formData.email.trim().toLowerCase(),
          password: formData.password,
          role: "TEACHER",
        },
      };

      const formDataToSend = new FormData();
      formDataToSend.append("teacher", JSON.stringify(payload));

      // Optionally add the actual file if your backend also expects it separately
      if (formData.profilePhoto) {
        formDataToSend.append("profilePhoto", formData.profilePhoto);
      }

      console.log("Payload being sent:", payload); // Debug log

      const response = await TeacherService.addTeacher(formDataToSend, token); // Ensure token is valid

      handleSubmissionResponse(response); // Handle the response based on the updated backend structure
    } catch (error) {
      console.error("Error adding Teacher:", error);
      handleSubmissionError(error);
      toast.error(
        "An error occurred while adding the Teacher. Please try again."
      );
    } finally {
      setIsSubmitting(false); // Reset loading state
    }
  };

  // Separate function to handle successful/failed responses from backend
  const handleSubmissionResponse = (response) => {
    // Check if response has the expected structure
    if (!response || !response.code) {
      toast.error("Invalid response from server. Please try again.");
      return;
    }

    switch (response.code) {
      case "00": // Success
        toast.success("Teacher added successfully!");
        navigate("/admin/teacherList");
        break;

      case "05": // Invalid teacher data
        toast.error("Please enter valid teacher data");
        break;

      case "06": // Teacher code exists
        toast.error(
          "A teacher with this teacher code already exists. Please use a different teacher code."
        );
        break;

      case "12": // NIC duplicate
        toast.error(
          "A teacher with this NIC already exists. Please check the NIC number."
        );
        break;

      case "13": // Email duplicate
        toast.error(
          "A teacher with this email already exists. Please use a different email address."
        );
        break;

      case "18": // Password already exists
        toast.error(
          "This password is already in use. Please choose a different password."
        );
        break;

      case "15": // No classes selected
        toast.error("A teacher must have at least one class");
        break;

      case "16": // Subject not found
        toast.error(
          "The selected subject was not found. Please choose a valid subject."
        );
        break;

      case "04": // Invalid class IDs
        toast.error(
          "One or more selected classes are invalid. Please review your class selection."
        );
        break;

      case "10": // General failure
        toast.error("Failed to save teacher. Please try again.");
        break;

      default:
        console.error(
          "Unexpected response code:",
          response.code,
          response.message
        );
        toast.error(
          response.message || "An unexpected error occurred. Please try again."
        );
        break;
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

        case 409: // Conflict (duplicate data)
          toast.error(
            data?.message || "Duplicate data detected. Please check your input."
          );
          break;

        case 500: // Internal Server Error
          toast.error(
            "Server error occurred. Please try again later or contact support."
          );
          break;

        default:
          toast.error(
            data?.message || "An error occurred while adding the teacher."
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

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
        <Header />
        <main className="grow p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Teacher Registration
          </h1>
          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-lg shadow-lg space-y-6"
          >
            {/* Teacher Code Section */}
            <div className="mb-6">
              <label
                htmlFor="teacher_code"
                className="block text-gray-700 text-sm font-bold mb-2"
              >
                Teacher Code
              </label>
              <input
                type="text"
                name="teacher_code"
                id="teacher_code"
                value={formData.teacherCode}
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

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  placeholder="Enter email address"
                />
                {formErrors.email && (
                  <p id="email_error" className="text-red-500 text-xs italic">
                    {formErrors.email}
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
                  maxLength="12"
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.nic ? "border-red-500" : ""
                  }`}
                  placeholder="Enter NIC number"
                />
                {formErrors.nic && (
                  <p id="nic_error" className="text-red-500 text-xs italic">
                    {formErrors.nic}
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

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  name="subjectId"
                  id="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.subjectId ? "border-red-500" : ""
                  }`}
                  aria-describedby="subject_error"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((subject, index) => (
                    <option key={index} value={subject.id}>
                      {subject.subjectName}
                    </option>
                  ))}
                </select>
                {formErrors.subjectId && (
                  <p id="subject_error" className="text-red-500 text-xs italic">
                    {formErrors.subjectId}
                  </p>
                )}
              </div>

              {/* Qualification */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  id="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.qualification ? "border-red-500" : ""
                  }`}
                  aria-describedby="qualification_error"
                  placeholder="Enter qualification"
                />
                {formErrors.qualification && (
                  <p
                    id="qualification_error"
                    className="text-red-500 text-xs italic"
                  >
                    {formErrors.qualification}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
                    formErrors.password ? "border-red-500" : ""
                  }`}
                  aria-describedby="password_error"
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
              </div>

              {/* Address - spans 2 columns */}
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
                  className={`shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24 ${
                    formErrors.address ? "border-red-500" : ""
                  }`}
                  placeholder="Enter address"
                />
                {formErrors.address && (
                  <p id="address_error" className="text-red-500 text-xs italic">
                    {formErrors.address}
                  </p>
                )}
              </div>
            </div>

            {/* Class Search and Add */}
            <div className="relative mb-6" ref={dropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Classes
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => setShowClassDropdown(true)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-10"
                  placeholder="Search and select classes..."
                />
              </div>

              {/* Dropdown */}
              {showClassDropdown && filteredClasses.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredClasses.map((classs) => (
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
                            {classs.gradeName}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected classes */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selected classes
                </label>
              </div>

              {formData.selectedClasses.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <i className="fas fa-book-open text-4xl text-gray-400 mb-3"></i>
                  <p className="text-gray-500">No classes selected yet</p>
                  <p className="text-sm text-gray-400">
                    Search and add classes from above
                  </p>
                </div>
              ) : (
                <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                            {classs.gradeName}
                          </p>
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
                  alt="Profile Preview"
                  src={previewUrl}
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
                name="profilePhoto"
                id="profilePhoto"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="shadow appearance-none border rounded w-full md:w-1/2 lg:w-1/3 py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            {/* Submit */}
            <div className="flex items-center mt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              >
                <FontAwesomeIcon icon={faSave} className="mr-2" />
                {isSubmitting ? "SAVING..." : "SAVE"}
                {/* SAVE */}
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

export default AddTeacher;
