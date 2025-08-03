import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../partials/Header";
import Sidebar from "../../partials/TeacherSidebar";
import StudentService from "../../service/StudentService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faEnvelope,
  faPhone,
  faCalendarAlt,
  faVenus,
  faMars,
  faGenderless,
  faArrowLeft,
  faEdit,
  faIdCard,
  faHome,
  faUserGraduate,
  faBook,
  faClock,
  faMapMarkerAlt,
  faUsers,
  faChevronRight,
  faGraduationCap,
  faChalkboardTeacher,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";

function TeacherStudentView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Retrieve token from local storage for authentication
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  // Function to fetch student details
  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const response = await StudentService.getStudentProfileByTeacher(
        id,
        token
      );
      if (response.code === "00") {
        setStudent(response.content);
      } else {
        console.error("Failed to fetch student details", response.message);
        toast.error(response.message || "Failed to fetch student details");
        navigate("/teacher/studentList");
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error("Error fetching student details");
      navigate("/teacher/studentList");
    } finally {
      setLoading(false);
    }
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
      month: "long",
      day: "numeric",
    });
  };

  // Function to calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return "N/A";
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  // Function to handle edit navigation
  const handleEdit = () => {
    navigate(`/teacher/editStudent/${id}`);
  };

  // Function to handle back navigation
  const handleBack = () => {
    navigate("/teacher/studentList");
  };

  // Function to get unique teachers from all classes
  const getAllTeachers = (classes) => {
    const teacherMap = new Map();
    classes?.forEach((cls) => {
      cls.teachers?.forEach((teacher) => {
        teacherMap.set(teacher.id, teacher);
      });
    });
    return Array.from(teacherMap.values());
  };

  if (loading) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
          <Header />
          <main className="grow p-6 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading student details...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden bg-gray-100">
          <Header />
          <main className="grow p-6 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-600">Student not found.</p>
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
          {/* Breadcrumb Navigation */}
          <div className="flex items-center text-sm text-gray-600 mb-6">
            <button
              onClick={handleBack}
              className="hover:text-blue-600 transition-colors duration-200"
            >
              Student List
            </button>
            <FontAwesomeIcon icon={faChevronRight} className="mx-2 text-xs" />
            <span className="text-gray-800 font-medium">Student Details</span>
          </div>

          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Student Profile
              </h1>
              <p className="text-gray-600">
                Complete details and information about the student
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleBack}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Back to List
              </button>
              <button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                Edit Student
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="xl:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center">
                  {/* Avatar */}
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    {student.profilePhotoBase64 ? (
                      <img
                        src={`data:image/jpeg;base64,${student.profilePhotoBase64}`}
                        alt="Student Profile"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-white text-4xl"
                      />
                    )}
                  </div>

                  {/* Student Name */}
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {`${student.firstName} ${student.middleName || ""} ${
                      student.lastName
                    }`.trim()}
                  </h2>

                  {/* Registration Number */}
                  <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                    <FontAwesomeIcon icon={faIdCard} className="mr-2" />
                    {student.registrationNumber}
                  </div>

                  {/* Status Badge */}
                  <div
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      student.userDetails?.active
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        student.userDetails?.active
                          ? "bg-green-500"
                          : "bg-yellow-500"
                      }`}
                    ></div>
                    {student.userDetails?.active
                      ? "Active Student"
                      : "Inactive Student"}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {student.age || calculateAge(student.dob)}
                      </div>
                      <div className="text-sm text-gray-600">Years Old</div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`text-2xl font-bold ${getGenderColor(
                          student.gender
                        )}`}
                      >
                        <FontAwesomeIcon icon={getGenderIcon(student.gender)} />
                      </div>
                      <div className="text-sm text-gray-600">
                        {student.gender || "Not Specified"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Details Section */}
            <div className="xl:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 p-3 rounded-lg mr-4">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-blue-600 text-xl"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Personal Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        First Name
                      </label>
                      <div className="text-gray-800 font-medium">
                        {student.firstName || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Middle Name
                      </label>
                      <div className="text-gray-800 font-medium">
                        {student.middleName || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Last Name
                      </label>
                      <div className="text-gray-800 font-medium">
                        {student.lastName || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        NIC Number
                      </label>
                      <div className="text-gray-800 font-medium">
                        {student.nic || "N/A"}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Date of Birth
                      </label>
                      <div className="flex items-center text-gray-800 font-medium">
                        <FontAwesomeIcon
                          icon={faCalendarAlt}
                          className="mr-2 text-orange-500"
                        />
                        {formatDate(student.dob)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Age
                      </label>
                      <div className="flex items-center text-gray-800 font-medium">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="mr-2 text-purple-500"
                        />
                        {student.age || calculateAge(student.dob)} years
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Gender
                      </label>
                      <div
                        className={`flex items-center font-medium ${getGenderColor(
                          student.gender
                        )}`}
                      >
                        <FontAwesomeIcon
                          icon={getGenderIcon(student.gender)}
                          className="mr-2"
                        />
                        {student.gender || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-green-100 p-3 rounded-lg mr-4">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="text-green-600 text-xl"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Contact Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Email Address
                    </label>
                    <div className="flex items-center text-gray-800 font-medium">
                      <FontAwesomeIcon
                        icon={faEnvelope}
                        className="mr-2 text-blue-500"
                      />
                      <a
                        href={`mailto:${student.email}`}
                        className="hover:text-blue-600 transition-colors duration-200"
                      >
                        {student.email || "N/A"}
                      </a>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Contact Number
                    </label>
                    <div className="flex items-center text-gray-800 font-medium">
                      <FontAwesomeIcon
                        icon={faPhone}
                        className="mr-2 text-green-500"
                      />
                      <a
                        href={`tel:${student.contactNo}`}
                        className="hover:text-green-600 transition-colors duration-200"
                      >
                        {student.contactNo || "N/A"}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-purple-100 p-3 rounded-lg mr-4">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-purple-600 text-xl"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Address Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Address
                    </label>
                    <div className="text-gray-800 font-medium">
                      {student.address || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="flex items-center mb-6">
                  <div className="bg-indigo-100 p-3 rounded-lg mr-4">
                    <FontAwesomeIcon
                      icon={faUserGraduate}
                      className="text-indigo-600 text-xl"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Academic Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Grade ID
                    </label>
                    <div className="flex items-center text-gray-800 font-medium">
                      <FontAwesomeIcon
                        icon={faGraduationCap}
                        className="mr-2 text-indigo-500"
                      />
                      {student.gradeId || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Registration Number
                    </label>
                    <div className="flex items-center text-gray-800 font-medium">
                      <FontAwesomeIcon
                        icon={faIdCard}
                        className="mr-2 text-blue-500"
                      />
                      {student.registrationNumber || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Enrolled Classes */}
              {student.classes && student.classes.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-emerald-100 p-3 rounded-lg mr-4">
                      <FontAwesomeIcon
                        icon={faBook}
                        className="text-emerald-600 text-xl"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Enrolled Classes ({student.classes.length})
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {student.classes.map((cls, index) => (
                      <div
                        key={cls.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800">
                              {cls.className}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {cls.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              <FontAwesomeIcon
                                icon={faCalendarAlt}
                                className="mr-1"
                              />
                              {formatDate(cls.classDate)}
                            </div>
                            <div className="text-sm text-gray-600">
                              <FontAwesomeIcon
                                icon={faClock}
                                className="mr-1"
                              />
                              {cls.startTime}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">
                              Grade:{" "}
                            </span>
                            <span className="text-gray-800">
                              {cls.grade?.gradeName || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Subject:{" "}
                            </span>
                            <span className="text-gray-800">
                              {cls.subject?.subjectName || "N/A"}
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Teachers:{" "}
                            </span>
                            <span className="text-gray-800">
                              {cls.teachers
                                ?.map(
                                  (teacher) =>
                                    `${teacher.firstName} ${teacher.lastName}`
                                )
                                .join(", ") || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Account Information */}
              {student.userDetails && (
                <div className="bg-white rounded-2xl shadow-lg p-8">
                  <div className="flex items-center mb-6">
                    <div className="bg-cyan-100 p-3 rounded-lg mr-4">
                      <FontAwesomeIcon
                        icon={faUser}
                        className="text-cyan-600 text-xl"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      User Account Information
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Username
                      </label>
                      <div className="text-gray-800 font-medium">
                        {student.userDetails.username || "N/A"}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Role
                      </label>
                      <div className="inline-flex items-center bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-medium">
                        {student.userDetails.role || "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={handleBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Back to Student List
            </button>
            <button
              onClick={handleEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center transition-colors duration-200"
            >
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              Edit Student Details
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default TeacherStudentView;
