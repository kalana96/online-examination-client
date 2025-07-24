import axios from "axios";

class ClassService {
  static BASE_URL = "http://localhost:1010/";

  // Add Class
  static async addClass(data, token) {
    try {
      const response = await axios.post(
        `${ClassService.BASE_URL}api/v1/admin/saveClassDirect`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
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

  // Update Class
  static async updateClass(data, token) {
    try {
      const response = await axios.put(
        `${ClassService.BASE_URL}api/v1/admin/updateClass`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
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

  // Delete Class by ID
  static async deleteClass(id, token) {
    try {
      const response = await axios.delete(
        `${ClassService.BASE_URL}api/v1/admin/deleteClass/${id}`,
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

  // Get All Classes
  static async getAllClasses(token) {
    try {
      const response = await axios.get(
        `${ClassService.BASE_URL}api/v1/admin/getAllClasses`,
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

  // Get Class by ID
  static async getClassById(id, token) {
    try {
      const response = await axios.get(
        `${ClassService.BASE_URL}api/v1/admin/searchClass/${id}`,
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

  // Get Classes by Subject ID
  static async getClassesBySubject(subjectId, token) {
    try {
      const response = await axios.get(
        `${ClassService.BASE_URL}api/v1/admin/getClassesBySubject/${subjectId}`,
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

  // Get Classes by Grade ID
  static async getClassesByGrade(gradeId, token) {
    try {
      const response = await axios.get(
        `${ClassService.BASE_URL}api/v1/admin/getClassesByGrade/${gradeId}`,
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

  // Search Classes by Name
  static async searchClassesByName(className, token) {
    try {
      const response = await axios.get(
        `${ClassService.BASE_URL}api/v1/admin/searchClassesByName/${className}`,
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





  // Get All Classes associated with Student
  static async getClassesByStudent(studentId, token) {
    try {
      const response = await axios.get(
        `${ClassService.BASE_URL}api/v1/student/getClassesByStudent/${studentId}`,
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


    // Get All Classes associated with teacher
  static async getClassesByTeacher(teacherId, token) {
    try {
      const response = await axios.get(
        `${ClassService.BASE_URL}api/v1/teacher/getClassesWithStudentCountByTeacher/${teacherId}`,
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

  // Get All Classes for Teacher
  static async getClasses(id, token) {
    try {
      const response = await axios.get(
        `${ClassService.BASE_URL}api/v1/teacher/getClassesByTeacher/${id}`,
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

  // Get All Classes for Teacher
  static async getClassesCount(id, token) {
    try {
      const response = await axios.get(
        `${ClassService.BASE_URL}api/v1/teacher/getClassCountByTeacher/${id}`,
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

   // Update Class Bt Teacher
  static async updateClassByTeacher(data, token) {
    try {
      const response = await axios.put(
        `${ClassService.BASE_URL}api/v1/teacher/updateClass`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
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

   // Get Class by Teacher
  static async getClassById(id, token) {
    try {
      const response = await axios.get(
        `${ClassService.BASE_URL}api/v1/teacher/searchClass/${id}`,
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

export default ClassService;