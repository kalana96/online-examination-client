import axios from "axios";

class StudentService {
  static BASE_URL = "http://localhost:1010/api/v1/student/";

  // Add Student
  static async addStudent(data, token) {
    try {
      const response = await axios.post(
        `${StudentService.BASE_URL}saveStudent`,data,
        {
          headers: { Authorization: `Bearer ${token}`,
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
        `${StudentService.BASE_URL}updateStudent`,
        data,
        {
          headers: { Authorization: `Bearer ${token}`, },
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
        `${StudentService.BASE_URL}updateStudentProfile`,
        data,
        {
          headers: { Authorization: `Bearer ${token}`, },
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
  static async updateStudentProfile(formData, token) {

    try {
      const payload = {
        id: formData.id.toString().trim(),
        registrationNumber: formData.registrationNumber?.trim() || "",
        firstName: formData.firstName?.trim() || "",
        lastName: formData.lastName?.trim() || "",
        address: formData.address?.trim() || "",
        dob: formData.dateOfBirth?.trim() || "",
        email: formData.email?.trim().toLowerCase() || "",
        contactNo: formData.contactNo?.trim() || null,
        address: formData.address?.trim() || null
      };

       // Add user details if username or password is provided
      if (formData.username || formData.password) {
          payload.userDetails = {
              username: formData.username?.trim() || "",
              password: formData.password || "",
              role: "ADMIN"
          };
      }

      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append("student", JSON.stringify(payload));

      // Add user details as separate JSON if needed
      if (payload.userDetails) {
          formDataToSend.append("userDetails", JSON.stringify(payload.userDetails));
      }

      // Add profile photo if provided
      if (formData.profilePhoto && formData.profilePhoto instanceof File) {
          formDataToSend.append("profilePhoto", formData.profilePhoto);
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
        `${StudentService.BASE_URL}deleteStudent/${id}`,
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
        `${StudentService.BASE_URL}getAllStudents`,
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
  static async getStudentById(id, token){
    try{
        const response = await axios.get(`${StudentService.BASE_URL}getStudent/${id}`, 
        {
            headers: {Authorization: `Bearer ${token}`}
        })
        return response.data;
    }catch(err){
        throw err;
    }
}

 static async getStudentByEmail(email, token){
  
    try{
        const response = await axios.get(`${StudentService.BASE_URL}getStudentByEmail/${email}`, 
        {
            headers: {Authorization: `Bearer ${token}`}
        })
        return response.data;
    }catch(err){
        throw err;
    }
}
  
}

export default StudentService;
