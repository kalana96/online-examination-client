import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminService from "../../service/AdminService";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Edit3,
  ArrowLeft,
  Save,
  X,
  Eye,
  EyeOff,
  UserPlus,
  Settings,
  CheckCircle,
  Upload,
  Camera,
  Code,
  Calendar,
  MapPin,
} from "lucide-react";

const AdminProfile = () => {
  // const { id = "1" } = useParams();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const navigate = useNavigate();
  const id = localStorage.getItem("id");
  const token = localStorage.getItem("token");

  // Check if we're in create mode
  useEffect(() => {
    const initializeData = async () => {
      try {
        await fetchAdmin(); // Then fetch Admin data
      } catch (error) {
        console.error("Error initializing data:", error);
        toast.error("Error loading data");
      } finally {
        setLoading(false);
      }
    };

    // if (id === "new") {
    //   setIsCreating(true);
    //   setIsEditing(true);
    //   setLoading(false);
    // } else {
    //   fetchAdmin();
    // }

    if (id) {
      initializeData();
    } else {
      toast.error("No student ID provided");
      setLoading(false);
    }
  }, [id]);

  // useEffect(() => {
  //   const initializeData = async () => {
  //     try {
  //       await fetchData(); // Wait for classes and classes to load first
  //       await fetchStudent(id); // Then fetch student data
  //     } catch (error) {
  //       console.error("Error initializing data:", error);
  //       setError("Error loading data");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   if (id) {
  //     initializeData();
  //   } else {
  //     setError("No student ID provided");
  //     setLoading(false);
  //   }
  // }, [id]);

  // State to hold the form data
  const [formData, setFormData] = useState({
    id: "",
    adminCode: "",
    firstName: "",
    lastName: "",
    email: "",
    contactNo: "",
    // dateOfBirth: "",
    address: "",
    profilePhoto: null,
    isActive: true,
    // User details for account creation/update
    username: "",
    password: "",
    confirmPassword: "",
    role: "ADMIN",
  });

  // State for form validation errors
  const [errors, setErrors] = useState({});

  // Function to fetch individual admin data
  const fetchAdmin = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getAdminById(id, token);

      if (response.code === "00") {
        const admin = response.content;

        setFormData({
          ...formData,
          id: admin.id || "",
          adminCode: admin.adminCode || "",
          firstName: admin.firstName || "",
          lastName: admin.lastName || "",
          email: admin.email || "",
          contactNo: admin.contactNo || "",
          // dateOfBirth: admin.dateOfBirth ? admin.dateOfBirth.split("T")[0] : "",
          address: admin.address || "",
          isActive: admin.userDetails?.isActive ?? true,
          // User details
          username: admin.userDetails?.username || "",
          role: admin.userDetails?.role || "ADMIN",
          password: "", // Don't populate password for security
          confirmPassword: "",
          profilePhoto: null, // Reset file input
        });

        console.log("Admin data fetched:", admin);
        console.log("Form data updated:", formData);

        // Handle profile photo preview
        if (admin.profilePhotoBase64) {
          try {
            // Convert base64 to blob for preview
            const base64Data = admin.profilePhotoBase64;
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);

            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: "image/jpeg" });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
          } catch (photoError) {
            console.error("Error processing profile photo:", photoError);
            setPreviewUrl(null);
          }
        } else {
          setPreviewUrl(null);
        }
      } else if (response.code === "01") {
        toast.error("Admin not found");
        // navigate("/admin/administrators");
      } else {
        console.error("Failed to fetch Admin:", response.message);
        toast.error(response.message || "Failed to fetch admin details");
      }
    } catch (error) {
      console.error("Error fetching admin:", error);
      toast.error("Error fetching admin data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file only");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB");
        return;
      }

      // setProfilePhoto(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!formData.contactNo.trim()) {
      newErrors.contactNo = "Contact number is required";
    }

    if (isCreating && !formData.adminCode.trim()) {
      newErrors.adminCode = "Admin code is required";
    }

    if (isCreating || formData.password) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      setLoading(true);

      let response;
      if (isCreating) {
        response = await AdminService.createAdmin(formData, token);
      } else {
        response = await AdminService.updateAdminProfile(formData, token);
      }

      if (response.code === "00") {
        toast.success(
          isCreating
            ? "Admin created successfully!"
            : "Admin updated successfully!"
        );
        if (isCreating) {
          navigate("/admin/profile");
        } else {
          setIsEditing(false);
          fetchAdmin(); // Refresh data
        }
      } else {
        // Handle specific error codes
        handleErrorResponse(response);
      }
    } catch (error) {
      console.error("Error saving admin:", error);
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to handle error responses
  const handleErrorResponse = (response) => {
    if (!response) {
      toast.error("No response received from server");
      return;
    }

    switch (response.code) {
      case "06":
        toast.error("Admin code already exists");
        break;
      case "07":
        toast.error("Email already exists");
        break;
      case "08":
        toast.error("Username already exists");
        break;
      case "09":
        toast.error("Password already exists in the system");
        break;
      case "01":
        toast.error("Admin not found");
        break;
      default:
        toast.error(response.message || "Failed to save admin");
    }
  };

  // Helper function to handle generic errors
  const handleError = (error) => {
    if (error.response) {
      // Server responded with error
      const errorMessage =
        error.response.data?.message || "Server error occurred";
      toast.error(errorMessage);
    } else if (error.request) {
      // Network error
      toast.error("Network error. Please check your connection.");
    } else {
      // Other error
      toast.error("An unexpected error occurred");
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    if (isCreating) {
      navigate("/admin/profile2");
    } else {
      setIsEditing(false);
      setProfilePhoto(null);
      fetchAdmin(); // Reset form data
    }
  };

  // Handle status toggle
  const handleToggleStatus = async () => {
    try {
      const response = await AdminService.toggleAdminStatus(
        id,
        !formData.isActive,
        token
      );
      if (response.code === "00") {
        toast.success(response.message);
        fetchAdmin(); // Refresh data
      } else {
        toast.error(response.message || "Failed to toggle admin status");
      }
    } catch (error) {
      console.error("Error toggling admin status:", error);
      toast.error("Error updating admin status");
    }
  };

  const handleBack = () => {
    navigate("/admin/dashboard");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Admin List
          </button>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : isCreating ? (
                    <UserPlus className="w-8 h-8" />
                  ) : (
                    <User className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {isCreating
                      ? "Create New Admin"
                      : isEditing
                      ? "Edit Admin Profile"
                      : "Admin Profile"}
                  </h1>
                  <p className="text-indigo-100">
                    {isCreating
                      ? "Add a new administrator to the system"
                      : isEditing
                      ? "Update administrator information"
                      : `${formData.firstName} ${formData.lastName}`}
                  </p>
                  {!isCreating && formData.adminCode && (
                    <p className="text-indigo-200 text-sm">
                      Code: {formData.adminCode}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {!isCreating && !isEditing && (
                  <>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        formData.isActive
                          ? "bg-green-500 bg-opacity-20 text-green-100"
                          : "bg-red-500 bg-opacity-20 text-red-100"
                      }`}
                    >
                      {formData.isActive ? "Active" : "Inactive"}
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Profile Photo Section */}
              {isEditing && (
                <div className="md:col-span-2">
                  <div className="bg-gray-50 rounded-xl p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <Camera className="w-5 h-5 mr-2 text-indigo-500" />
                      Profile Photo
                    </h2>

                    <div className="flex items-center space-x-6">
                      <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {previewUrl ? (
                          <img
                            src={previewUrl}
                            alt="Profile Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-12 h-12 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <label className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2">
                          <Upload className="w-4 h-4" />
                          <span>Choose File</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="text-sm text-gray-500 mt-2">
                          Upload a photo (Max 5MB, Image files only)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Information Section */}
              <div className="md:col-span-2">
                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <User className="w-5 h-5 mr-2 text-indigo-500" />
                    Personal Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Admin Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Code {isCreating ? "*" : ""}
                      </label>
                      <div className="relative">
                        <Code className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="adminCode"
                          value={formData.adminCode}
                          onChange={handleInputChange}
                          disabled={!isEditing || !isCreating}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                            !isEditing || !isCreating
                              ? "bg-gray-100 cursor-not-allowed"
                              : "bg-white"
                          } ${
                            errors.adminCode
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter admin code"
                        />
                      </div>
                      {errors.adminCode && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.adminCode}
                        </p>
                      )}
                    </div>

                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                          !isEditing
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white"
                        } ${
                          errors.firstName
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder="Enter first name"
                      />
                      {errors.firstName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.firstName}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                          !isEditing
                            ? "bg-gray-100 cursor-not-allowed"
                            : "bg-white"
                        } ${
                          errors.lastName ? "border-red-500" : "border-gray-300"
                        }`}
                        placeholder="Enter last name"
                      />
                      {errors.lastName && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.lastName}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                            !isEditing
                              ? "bg-gray-100 cursor-not-allowed"
                              : "bg-white"
                          } ${
                            errors.email ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="Enter email address"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Contact Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="contactNo"
                          value={formData.contactNo}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                            !isEditing
                              ? "bg-gray-100 cursor-not-allowed"
                              : "bg-white"
                          } ${
                            errors.contactNo
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter contact number"
                        />
                      </div>
                      {errors.contactNo && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.contactNo}
                        </p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    {/* <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                            !isEditing
                              ? "bg-gray-100 cursor-not-allowed"
                              : "bg-white"
                          } border-gray-300`}
                        />
                      </div>
                    </div> */}

                    {/* Address */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          rows={3}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                            !isEditing
                              ? "bg-gray-100 cursor-not-allowed"
                              : "bg-white"
                          } border-gray-300`}
                          placeholder="Enter address"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Information Section */}
              <div className="md:col-span-2">
                <div className="bg-indigo-50 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-indigo-500" />
                    Account Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Username */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                            !isEditing
                              ? "bg-gray-100 cursor-not-allowed"
                              : "bg-white"
                          } ${
                            errors.username
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter username"
                        />
                      </div>
                      {errors.username && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.username}
                        </p>
                      )}
                    </div>

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                        <select
                          name="role"
                          value={formData.role}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors ${
                            !isEditing
                              ? "bg-gray-100 cursor-not-allowed"
                              : "bg-white"
                          } border-gray-300`}
                        >
                          <option value="ADMIN">Admin</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                      </div>
                    </div>

                    {/* Password */}
                    {isEditing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Password{" "}
                          {isCreating ? "*" : "(Leave blank to keep current)"}
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white ${
                              errors.password
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder={
                              isCreating
                                ? "Enter password"
                                : "Enter new password"
                            }
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.password}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Confirm Password */}
                    {isEditing && (isCreating || formData.password) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Confirm Password *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors bg-white ${
                              errors.confirmPassword
                                ? "border-red-500"
                                : "border-gray-300"
                            }`}
                            placeholder="Confirm password"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5" />
                            ) : (
                              <Eye className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                        {errors.confirmPassword && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.confirmPassword}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="mt-8 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>
                        {isCreating ? "Create Admin" : "Save Changes"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* View Mode Actions */}
        {!isEditing && !isCreating && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>Activate Account</span>
              </button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Reset Password</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProfile;
