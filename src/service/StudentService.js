import axios from "axios";

class StudentService {
  // static BASE_URL = "http://localhost:1010";
  static BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

  // Add Student
  static async addStudent(data, token) {
    try {
      const response = await axios.post(
        `${StudentService.BASE_URL}saveStudent`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // 'Content-Type': 'multipart/form-data'
          },
        }
      );
      return response.data;
    } catch (error) {
      // Return error response data for ALL HTTP error status codes
      if (error.response) {
        // Server responded with an error status (4xx, 5xx)
        return error.response.data;
      }
      // For network errors or other issues, throw them
      throw error;
    }
  }

  // Add Student
  // static async addStudent(studentData) {
  //   try {
  //     const response = await this.axiosInstance.post('saveStudent', studentData);
  //     // Return structured response for success cases
  //     return {
  //       success: true,
  //       data: response.data,
  //       status: response.status
  //     };
  //   } catch (error) {
  //     // Handle different error scenarios
  //     if (error.response) {
  //       // Server responded with error status
  //       return {
  //         success: false,
  //         data: error.response.data,
  //         status: error.response.status,
  //         error: error.response.data.message || 'Server error occurred'
  //       };
  //     } else if (error.request) {
  //       // Network error
  //       return {
  //         success: false,
  //         data: null,
  //         status: null,
  //         error: 'Network error - please check your connection'
  //       };
  //     } else {
  //       // Other error
  //       return {
  //         success: false,
  //         data: null,
  //         status: null,
  //         error: 'An unexpected error occurred'
  //       };
  //     }
  //   }
  // }

  // Update Student

  static async updateStudent(data, token) {
    try {
      const response = await axios.put(
        `${StudentService.BASE_URL}/api/v1/admin/updateStudent`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      // Return error response data for ALL HTTP error status codes
      if (error.response) {
        // Server responded with an error status (4xx, 5xx)
        return error.response.data;
      }
      // For network errors or other issues, throw them
      throw error;
    }
  }

  static async updateStudent1(data, token) {
    try {
      const response = await axios.put(
        `${StudentService.BASE_URL}/api/v1/admin/updateStudentProfile`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      // Return error response data for ALL HTTP error status codes
      if (error.response) {
        // Server responded with an error status (4xx, 5xx)
        return error.response.data;
      }
      // For network errors or other issues, throw them
      throw error;
    }
  }

  // Convenience method for updating admin (handles partial updates)
  static async updateStudentProfile(adminData, token) {
    try {
      const payload = {
        id: adminData.id.toString().trim(),
        registrationNumber: adminData.registrationNumber?.trim() || "",
        firstName: adminData.firstName?.trim() || "",
        lastName: adminData.lastName?.trim() || "",
        address: adminData.address?.trim() || "",
        dob: adminData.dateOfBirth?.trim() || "",
        email: adminData.email?.trim().toLowerCase() || "",
        contactNo: adminData.contactNo?.trim() || null,
        address: adminData.address?.trim() || null,
      };

      // Add user details if username or password is provided
      if (adminData.username || adminData.password) {
        payload.userDetails = {
          username: adminData.username?.trim() || "",
          password: adminData.password || "",
          role: "ADMIN",
        };
      }

      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append("student", JSON.stringify(payload));

      // Add user details as separate JSON if needed
      if (payload.userDetails) {
        formDataToSend.append(
          "userDetails",
          JSON.stringify(payload.userDetails)
        );
      }

      // Add profile photo if provided
      if (adminData.profilePhoto && adminData.profilePhoto instanceof File) {
        formDataToSend.append("profilePhoto", adminData.profilePhoto);
      }
      console.log("Payload being sent:", payload);

      return this.updateStudent1(formDataToSend, token);
    } catch (error) {
      console.error("Error in updateAdminProfile:", error);
      throw error;
    }
  }

  // Delete Student by ID
  static async deleteStudent(id, token) {
    try {
      const response = await axios.delete(
        `${StudentService.BASE_URL}/api/v1/admin/deleteStudent/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  // Get All Students
  static async getAllStudents(token) {
    try {
      const response = await axios.get(
        `${StudentService.BASE_URL}/api/v1/admin/getAllStudents`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  // Get Students by ID
  static async getStudentById(id, token) {
    try {
      const response = await axios.get(
        `${StudentService.BASE_URL}/api/v1/admin/searchStudent/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  static async getStudentByEmail(email, token) {
    try {
      const response = await axios.get(
        `${StudentService.BASE_URL}/api/v1/admin/getStudentByEmail/${email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  // Add Student By Teacher
  static async addStudentByTeacher(data, token) {
    try {
      const response = await axios.post(
        `${StudentService.BASE_URL}/api/v1/teacher/saveStudent`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // 'Content-Type': 'multipart/form-data'
          },
        }
      );
      return response.data;
    } catch (error) {
      // Return error response data for ALL HTTP error status codes
      if (error.response) {
        // Server responded with an error status (4xx, 5xx)
        return error.response.data;
      }
      // For network errors or other issues, throw them
      throw error;
    }
  }

  // Add Student By Teacher
  static async getStudentsByClass(classId, token) {
    try {
      const response = await axios.get(
        `${StudentService.BASE_URL}/api/v1/teacher/getStudentByClass/${classId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // 'Content-Type': 'multipart/form-data'
          },
        }
      );
      return response.data;
    } catch (error) {
      // Return error response data for ALL HTTP error status codes
      if (error.response) {
        // Server responded with an error status (4xx, 5xx)
        return error.response.data;
      }
      // For network errors or other issues, throw them
      throw error;
    }
  }

  // Teacher Edit Student
  static async editStudentByTeacher(data, token) {
    try {
      const response = await axios.put(
        `${StudentService.BASE_URL}/api/v1/teacher/editStudent`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // 'Content-Type': 'multipart/form-data'
          },
        }
      );
      return response.data;
    } catch (error) {
      // Return error response data for ALL HTTP error status codes
      if (error.response) {
        // Server responded with an error status (4xx, 5xx)
        return error.response.data;
      }
      // For network errors or other issues, throw them
      throw error;
    }
  }

  // Get Student Profile by Teacher
  static async getStudentProfileByTeacher(id, token) {
    try {
      const response = await axios.get(
        `${StudentService.BASE_URL}/api/v1/teacher/getStudentProfile/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      // Return error response data for ALL HTTP error status codes
      if (error.response) {
        // Server responded with an error status (4xx, 5xx)
        return error.response.data;
      }
      // For network errors or other issues, throw them
      throw error;
    }
  }

  //Delete student by teacher
  static async deleteStudentByTeacher(id, token) {
    try {
      const response = await axios.delete(
        `${StudentService.BASE_URL}/api/v1/teacher/deleteStudent/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      // Return error response data for ALL HTTP error status codes
      if (error.response) {
        // Server responded with an error status (4xx, 5xx)
        return error.response.data;
      }
      // For network errors or other issues, throw them
      throw error;
    }
  }
}

export default StudentService;
