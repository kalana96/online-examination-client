import axios from "axios";

class TeacherService {
  static BASE_URL = "http://localhost:1010/api/v1/admin/";

  // Add Teacher
  static async addTeacher(data, token) {
    try {
      const response = await axios.post(
        `${TeacherService.BASE_URL}saveTeacher`,
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

  // Update Teacher
  static async updateTeacher(data, token) {
    try {
      const response = await axios.put(
        `${TeacherService.BASE_URL}updateTeacher`,
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

  // Delete Teacher by ID
  static async deleteTeacher(id, token) {
    try {
      const response = await axios.delete(
        `${TeacherService.BASE_URL}deleteTeacher/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  // Get All Teachers
  static async getAllTeachers(token) {
    try {
      const response = await axios.get(
        `${TeacherService.BASE_URL}getAllTeachers`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  // Get Teacher by ID
  static async getTeacherById(id, token) {
    try {
      const response = await axios.get(
        `${TeacherService.BASE_URL}searchTeacher/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  // Get Teachers by Class ID
  static async getTeachersByClass(classId, token) {
    try {
      const response = await axios.get(
        `${TeacherService.BASE_URL}getTeachersByClass/${classId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }

  // Get Teachers by Subject ID
  static async getTeachersBySubject(subjectId, token) {
    try {
      const response = await axios.get(
        `${TeacherService.BASE_URL}getTeachersBySubject/${subjectId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (err) {
      throw err;
    }
  }
}

export default TeacherService;