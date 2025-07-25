import axios from "axios";

class AdminService {
  // static BASE_URL = process.env.REACT_APP_API_BASE_URL;
  // static BASE_URL = "http://localhost:1010/api/v1/admin/";
  // static BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/api/v1/admin/`;
  static BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/admin/`;
  

  // Save Admin
  static async saveAdmin(adminData, userDetails, profilePhoto, token) {
    try {
      const formData = new FormData();
      formData.append('admin', JSON.stringify(adminData));
      formData.append('userDetails', JSON.stringify(userDetails));
      
      if (profilePhoto) {
        formData.append('profilePhoto', profilePhoto);
      }

      const response = await axios.post(
        `${this.BASE_URL}saveAdmin`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Update Admin API call
  static async updateAdmin(formData, token) {
    try {
      if (!token) {
          throw new Error("Authentication token is required");
      }

      const response = await axios.put(
        `${AdminService.BASE_URL}updateAdmin`,formData,
        {
          headers: { Authorization: `Bearer ${token}`,
          // 'Content-Type': 'multipart/form-data'
         },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error in updateAdmin API call:", error);
      
      if (error.response) {
          // Server responded with error status
          console.error("Error response:", error.response.data);
          return error.response.data;
      } else if (error.request) {
          // Network error
          console.error("Network error:", error.request);
          return {
              code: "NETWORK_ERROR",
              message: "Network error. Please check your connection."
          };
      } else {
          // Other error
          console.error("Unexpected error:", error.message);
          return {
              code: "UNEXPECTED_ERROR",
              message: error.message || "An unexpected error occurred"
          };
      }
    }
  }

  // Get All Admins
  static async getAllAdmins(token) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}getAllAdmins`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Get Admin by ID
  static async getAdminById(id, token) {
    console.log('BASE_URL:', AdminService.BASE_URL);
    try {
      const response = await axios.get(
        `${this.BASE_URL}getAdminWithUser/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Search Admin by ID
  static async searchAdmin(id, token) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}searchAdmin/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Get Admin by Admin Code
  static async getAdminByAdminCode(adminCode, token) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}getAdminByCode/${adminCode}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Get Admin by Email
  static async getAdminByEmail(email, token) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}getAdminByEmail/${email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Delete Admin by ID
  static async deleteAdmin(id, token) {
    try {
      const response = await axios.delete(
        `${this.BASE_URL}deleteAdmin/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Toggle Admin Status
  static async toggleAdminStatus(id, isActive, token) {
    try {
      const response = await axios.put(
        `${this.BASE_URL}toggleStatus/${id}?isActive=${isActive}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      if (error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Convenience method for creating admin (combines admin data and user details)
  static async createAdmin(adminData, token) {
    const userDetails = {
      username: adminData.username,
      password: adminData.password,
      role: adminData.role || 'ADMIN'
    };

    // Remove user details from admin data to avoid duplication
    const cleanAdminData = { ...adminData };
    delete cleanAdminData.username;
    delete cleanAdminData.password;
    delete cleanAdminData.role;
    delete cleanAdminData.confirmPassword;

    return this.saveAdmin(cleanAdminData, userDetails, null, token);
  }

  // Convenience method for updating admin (handles partial updates)
  static async updateAdminProfile(adminData, token) {

    try {
      const payload = {
        id: adminData.id.toString().trim(),
        adminCode: adminData.adminCode?.trim() || "",
        firstName: adminData.firstName?.trim() || "",
        lastName: adminData.lastName?.trim() || "",
        email: adminData.email?.trim().toLowerCase() || "",
        contactNo: adminData.contactNo?.trim() || null,
        address: adminData.address?.trim() || null
      };

       // Add user details if username or password is provided
      if (adminData.username || adminData.password) {
          payload.userDetails = {
              username: adminData.username?.trim() || "",
              password: adminData.password || "",
              role: "ADMIN"
          };
      }

      // Create FormData
      const formDataToSend = new FormData();
      formDataToSend.append("admin", JSON.stringify(payload));

      // Add user details as separate JSON if needed
      if (payload.userDetails) {
          formDataToSend.append("userDetails", JSON.stringify(payload.userDetails));
      }

      // Add profile photo if provided
      if (adminData.profilePhoto && adminData.profilePhoto instanceof File) {
          formDataToSend.append("profilePhoto", adminData.profilePhoto);
      }
      console.log("Payload being sent:", payload);

      return this.updateAdmin(formDataToSend, token);

    } catch (error) {
      console.error("Error in updateAdminProfile:", error);
      throw error;
    }

  }
}

export default AdminService;