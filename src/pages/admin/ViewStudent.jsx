import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StudentService from "../../service/StudentService";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Edit3,
  ArrowLeft,
  BookOpen,
  GraduationCap,
  CreditCard,
  Users,
} from "lucide-react";

const ViewStudent = () => {
  const { id } = useParams();
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch student details on component mount
  useEffect(() => {
    setTimeout(() => {
      fetchStudent();
      setLoading(false);
    }, 1000);
  }, [id]);

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
    classId: "",
    className: "",
    classes: "",
    profilePhoto: null,
  });

  // Function to fetch individual student data
  const fetchStudent = async () => {
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
        setFormData({
          ...student,
          classes: student.classes || [],
        });
      } else if (response.code === "01") {
        toast.error("Student not found");
      } else {
        console.error("Failed to fetch Student", response.message);
      }
    } catch (error) {
      console.error("Error fetching student:", error);
      toast.error("Error fetching student data");
    }
  };

  const handleBack = () => {
    navigate("/admin/studentList");
  };

  const handleEdit = (studentId) => {
    navigate(`/admin/EditStudent/${studentId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="max-w-4xl mx-auto my-8 p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Student Not Found
          </h2>
          <p className="text-red-600">
            The requested student profile could not be found.
          </p>
          <button
            onClick={handleBack}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Back to Student List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Student List
          </button>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Profile Header with Gradient Background */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white">
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
              {/* Profile Photo */}
              <div className="relative">
                <div className="w-32 h-32 bg-white rounded-full p-1 shadow-lg">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Student Info */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  {formData.firstName} {formData.lastName}
                </h1>
                <div className="flex items-center justify-center md:justify-start mb-2">
                  <CreditCard className="w-4 h-4 mr-2" />
                  <span className="text-blue-100">
                    Registration: {formData.registrationNumber}
                  </span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  <span className="text-blue-100">
                    Grade: {formData.gradeId}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <div className="md:self-start">
                <button
                  onClick={() => handleEdit(formData.id)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 backdrop-blur-sm"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Personal Information */}
              <div className="lg:col-span-2">
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-500" />
                    Personal Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">NIC Number</p>
                          <p className="font-medium text-gray-800">
                            {formData.nic}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Email Address</p>
                          <p className="font-medium text-gray-800">
                            {formData.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">
                            Contact Number
                          </p>
                          <p className="font-medium text-gray-800">
                            {formData.contactNo}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Date of Birth</p>
                          <p className="font-medium text-gray-800">
                            {formData.dob}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Gender</p>
                          <p className="font-medium text-gray-800">
                            {formData.gender}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="font-medium text-gray-800">
                            {formData.address}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <div className="bg-blue-50 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2 text-blue-500" />
                    Academic Information
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Grade</p>
                      <div className="bg-white rounded-lg p-3 border-l-4 border-blue-500">
                        <p className="font-medium text-gray-800">
                          {formData.gradeId}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 mb-3">
                        Enrolled Classes
                      </p>
                      <div className="space-y-2">
                        {formData.classes && formData.classes.length > 0 ? (
                          formData.classes.map((cls, index) => (
                            <div
                              key={index}
                              className="bg-white rounded-lg px-4 py-2 border-l-4 border-green-400 shadow-sm"
                            >
                              <p className="font-medium text-gray-800">
                                {cls.className}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="bg-white rounded-lg p-4 text-center">
                            <p className="text-gray-500">No classes assigned</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {formData.subjects && formData.subjects.length > 0 && (
                      <div className="mt-4 p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-500">Total Classes</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formData.classes.length}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => handleEdit(formData.id)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>

            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>View Exam History</span>
            </button>

            <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewStudent;
