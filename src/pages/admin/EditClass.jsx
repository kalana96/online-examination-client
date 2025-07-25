import React, { useEffect, useState } from "react";
import Header from "../../partials/Header";
import Sidebar from "../../partials/Sidebar";
import { useNavigate, useParams } from "react-router-dom";
import ClassService from "../../service/ClassService";
import GradeService from "../../service/GradeService";
import SubjectService from "../../service/SubjectService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSave,
  faArrowLeft,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function EditClass() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [grades, setGrades] = useState([]);
  const [subjects, setSubjects] = useState([]);

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");

  // State for form data
  const [formData, setFormData] = useState({
    id: "",
    className: "",
    description: "",
    classDate: "",
    startTime: "",
    gradeId: "",
    subjectId: "",
  });

  // State for validation errors
  const [formErrors, setFormErrors] = useState({
    className: "",
    classDate: "",
    startTime: "",
    gradeId: "",
  });

  //Fetch class data, grades, and subjects on component mount
  useEffect(() => {
    if (id) {
      fetchClassData(id);
      fetchGrades();
      fetchSubjects();
    }
  }, [id]);

  // useEffect(() => {
  //   toast.error(id);

  //   // let id = 10;
  //   // setLoading(false);
  //   // fetchGrades();
  //   // fetchSubjects();
  //   // fetchClassData(id);
  // }, [id]);

  // Function to fetch class data by ID
  const fetchClassData = async (id) => {
    try {
      setLoading(true);
      const response = await ClassService.getClassById(id, token);

      if (response.code === "00" && response.content) {
        const classData = response.content;
        setFormData({
          id: classData.id || "",
          className: classData.className || "",
          description: classData.description || "",
          classDate: classData.classDate || "",
          startTime: classData.startTime || "",
          gradeId: classData.grade ? classData.grade.id : "",
          subjectId: classData.subject ? classData.subject.id : "",
        });
      } else {
        toast.error("Failed to fetch class data");
        // navigate("/admin/classList");
      }
    } catch (error) {
      console.error("Error fetching class data:", error);
      toast.error("Error fetching class data");
      //   navigate("/admin/classList");
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

  // Handle input changes
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

  // Validate form data
  const validateForm = () => {
    const errors = {};

    if (!formData.className.trim()) {
      errors.className = "Class name is required";
    }

    if (!formData.classDate) {
      errors.classDate = "Class date is required";
    }

    if (!formData.startTime) {
      errors.startTime = "Start time is required";
    }

    if (!formData.gradeId) {
      errors.gradeId = "Grade selection is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the validation errors");
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        id: parseInt(formData.id),
        className: formData.className.trim(),
        description: formData.description.trim(),
        classDate: formData.classDate,
        startTime: formData.startTime,
        gradeId: parseInt(formData.gradeId),
        subjectId: formData.subjectId ? parseInt(formData.subjectId) : 0,
      };

      const response = await ClassService.updateClass(updateData, token);

      if (response.code === "00") {
        toast.success("Class updated successfully!");
        navigate("/admin/classList");
      } else {
        if (response.code === "06") {
          toast.error(
            "A class with the same name, date, and time already exists"
          );
        } else if (response.code === "02") {
          toast.error("Grade not found");
        } else if (response.code === "07") {
          toast.error("Subject not found");
        } else {
          toast.error(response.message || "Failed to update class");
        }
      }
    } catch (error) {
      console.error("Error updating class:", error);
      toast.error("Error updating class");
    } finally {
      setSaving(false);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    navigate("/admin/classList");
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
          <Header />
          <main className="grow flex items-center justify-center">
            <div className="text-center">
              <FontAwesomeIcon
                icon={faSpinner}
                className="fa-spin text-4xl text-blue-500 mb-4"
              />
              <p className="text-gray-600">Loading class data...</p>
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
          <div className=" mx-auto h-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 lg:mb-6 gap-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
                Edit Class
              </h1>
              <button
                onClick={handleBack}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center text-sm lg:text-base"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Back to List
              </button>
            </div>

            {/* Main Content Container */}
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full">
              {/* Form Section */}
              <div className="flex-1 bg-white rounded-lg shadow-lg p-4 lg:p-6 overflow-y-auto">
                <form onSubmit={handleSubmit} className="h-full flex flex-col">
                  <div className="flex-1">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                      {/* Class Name */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Class Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="className"
                          value={formData.className}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${
                            formErrors.className
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          placeholder="Enter class name"
                        />
                        {formErrors.className && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.className}
                          </p>
                        )}
                      </div>

                      {/* Grade */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Grade <span className="text-red-500">*</span>
                        </label>
                        <select
                          name="gradeId"
                          value={formData.gradeId}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${
                            formErrors.gradeId
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          <option value="">Select Grade</option>
                          {grades.map((grade) => (
                            <option key={grade.id} value={grade.id}>
                              {grade.gradeName}
                            </option>
                          ))}
                        </select>
                        {formErrors.gradeId && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.gradeId}
                          </p>
                        )}
                      </div>

                      {/* Subject */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject (Optional)
                        </label>
                        <select
                          name="subjectId"
                          value={formData.subjectId}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base"
                        >
                          <option value="">Select Subject (Optional)</option>
                          {subjects.map((subject) => (
                            <option key={subject.id} value={subject.id}>
                              {subject.subjectName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Class Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Class Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="classDate"
                          value={formData.classDate}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${
                            formErrors.classDate
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {formErrors.classDate && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.classDate}
                          </p>
                        )}
                      </div>

                      {/* Start Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Start Time <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="time"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleInputChange}
                          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base ${
                            formErrors.startTime
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                        />
                        {formErrors.startTime && (
                          <p className="text-red-500 text-sm mt-1">
                            {formErrors.startTime}
                          </p>
                        )}
                      </div>

                      {/* Description */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm lg:text-base resize-none"
                          placeholder="Enter class description (optional)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline text-sm lg:text-base order-2 sm:order-1"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className={`font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline flex items-center justify-center text-sm lg:text-base order-1 sm:order-2 ${
                        saving
                          ? "bg-gray-400 cursor-not-allowed text-gray-700"
                          : "bg-blue-500 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {saving ? (
                        <>
                          <FontAwesomeIcon
                            icon={faSpinner}
                            className="fa-spin mr-2"
                          />
                          Updating...
                        </>
                      ) : (
                        <>
                          <FontAwesomeIcon icon={faSave} className="mr-2" />
                          Update Class
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Information Card - Side Panel */}
              {/* <div className="lg:w-80 lg:flex-shrink-0">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sticky top-4">
                  <h3 className="text-blue-800 font-semibold mb-3 text-sm lg:text-base">
                    Important Notes:
                  </h3>
                  <ul className="text-blue-700 text-xs lg:text-sm space-y-2">
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-0.5">•</span>
                      <span>
                        Class name, date, time, and grade are required fields
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-0.5">•</span>
                      <span>Subject selection is optional</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-0.5">•</span>
                      <span>
                        Each class must have a unique combination of name, date,
                        and time
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-0.5">•</span>
                      <span>
                        Make sure the selected grade and subject are active
                      </span>
                    </li>
                  </ul>
                </div>
              </div> */}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default EditClass;
