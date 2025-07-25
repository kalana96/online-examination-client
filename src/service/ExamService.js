import axios from "axios";

// Base configuration for API calls
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1010/';

// Create axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors globally
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class ExamService {
  // static BASE_URL = "http://localhost:1010/";
  static BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/`;

  //  // Schedule a new exam
  // static async scheduleExam(data, token) {
  //   try {
  //     const response = await axios.post(
  //       `${ExamService.BASE_URL}api/v1/teacher/scheduleExam`,
  //       data,
  //       {
  //         headers: { 
  //           Authorization: `Bearer ${token}`,
  //           'Content-Type': 'application/json'
  //         },
  //       }
  //     );
  //     return response;
  //   } catch (error) {
  //     // Return error response data for ALL HTTP error status codes
  //     if (error.response) {
  //       // Server responded with an error status (4xx, 5xx)
  //       return error.response;
  //     }
  //     // For network errors or other issues, throw them
  //     throw error;
  //   }
  // }

  /**
   * Schedule a new exam
   * @param {Object} examData - Exam data payload
   * @param {string} token - Authentication token (optional, will use from localStorage if not provided)
   * @returns {Promise} - API response
   */
  static async scheduleExam(examData, token = null) {
    try {
      // Validate required fields
      if (!examData) {
        throw new Error('Exam data is required');
      }

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Make API call to schedule exam
      const response = await apiClient.post('api/v1/teacher/exam/scheduleExam', examData, {
        headers,
      });

      return response;
    } catch (error) {
      console.error('Error scheduling exam:', error);
      throw error;
    }
  }


  // Update an existing exam
  static async updateExam(examData, token) {
    try {
      // Validate required fields
      if (!examData) {
        throw new Error('Exam data is required');
      }

      // Prepare headers
      const headers = {
        'Content-Type': 'application/json',
      };

      // Add authorization header if token is provided
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Make API call to schedule exam
      const response = await apiClient.put('api/v1/teacher/exam/updateExam', examData, {
        headers,
      });

      return response;
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  }

  // Get exam details by exam ID
  static async getExamById(examId, token) {
    try {
      const response = await axios.get(
        `${ExamService.BASE_URL}api/v1/teacher/exam/getExam/${examId}`,
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

  // Delete an exam by ID
  static async deleteExam(examId, token) {
    try {
      const response = await axios.delete(
        `${ExamService.BASE_URL}api/v1/teacher/exam/deleteExam/${examId}`,
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

  // Get all exams for a specific teacher
  static async getExamsByTeacher(teacherId, token) {
    try {
      const response = await axios.get(
        `${ExamService.BASE_URL}api/v1/teacher/exam/getExamsByTeacher/${teacherId}`,
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

   // Get all exams for a specific teacher
  static async getCompletdeExamsByTeacher(teacherId, token) {
    try {
      const response = await axios.get(
        `${ExamService.BASE_URL}api/v1/teacher/exam/getPublishedPastExamsByTeacher/${teacherId}`,
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

  // Get all exams for a specific class
  static async getExamsByClass(classId, token) {
    try {
      const response = await axios.get(
        `${ExamService.BASE_URL}api/v1/teacher/exam/getExamsByClass/${classId}`,
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

  // Get exams by teacher and class
  static async getExamsByTeacherAndClass(teacherId, classId, token) {
    try {
      const response = await axios.get(
        `${ExamService.BASE_URL}api/v1/teacher/exam/getExamsByTeacherAndClass/${teacherId}/${classId}`,
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

  // Get upcoming exams for a teacher
  static async getUpcomingExamsByTeacher(teacherId, token) {
    try {
      const response = await axios.get(
        `${ExamService.BASE_URL}api/v1/teacher/exam/getUpcomingExamsByTeacher/${teacherId}`,
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

  // Get exam statistics for a teacher
  static async getExamStatsByTeacher(teacherId, token) {
    try {
      const response = await axios.get(
        `${ExamService.BASE_URL}api/v1/teacher/exam/getExamStatsByTeacher/${teacherId}`,
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

   // Get all active exams
  static async getAllActiveExams(token) {
    try {
      const response = await axios.get(
        `${ExamService.BASE_URL}api/v1/teacher/exam/getAllExams`,
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

  // Get all upcoming exams
  static async getUpcomingExams(token) {
    try {
      const response = await axios.get(
        `${ExamService.BASE_URL}api/v1/teacher/exam/getUpcomingExams`,
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

  // Get today's exams
  static async getTodaysExams(token) {
    try {
      const response = await axios.get(
        `${ExamService.BASE_URL}api/v1/teacher/exam/getTodaysExams`,
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

  // Search exams by name
  static async searchExamsByName(searchTerm, token) {
    try {
      const response = await axios.get(
        `${ExamService.BASE_URL}api/v1/teacher/exam/searchExams`,
        {
          params: { searchTerm },
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

  // Get exams by type
  static async getExamsByType(examType, token) {
    try {
      const response = await axios.get(
        `${ExamService.BASE_URL}api/v1/teacher/exam/getExamsByType/${examType}`,
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



// ===== PUBLISH STATUS MANAGEMENT FUNCTIONS =====

/**
 * Update exam publish status
 * @param {number} examId - The ID of the exam
 * @param {boolean} isPublished - The publish status to set
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Response data
 */
static async updateExamPublishStatus(examId, isPublished, token) {
  try {
    const response = await axios.put(
      `${ExamService.BASE_URL}api/v1/teacher/exam/updateExamPublishStatus/${examId}`,
      null,
      {
        params: { isPublished },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    return ExamService.handleApiError(error);
  }
}

/**
 * Get all published exams
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Response data containing list of published exams
 */
static async getAllPublishedExams(token) {
  try {
    const response = await axios.get(
      `${ExamService.BASE_URL}api/v1/teacher/exam/getAllPublishedExams`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    return ExamService.handleApiError(error);
  }
}

/**
 * Get all draft exams
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Response data containing list of draft exams
 */
static async getAllDraftExams(token) {
  try {
    const response = await axios.get(
      `${ExamService.BASE_URL}api/v1/teacher/exam/getAllDraftExams`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    return ExamService.handleApiError(error);
  }
}

/**
 * Get published exams by teacher
 * @param {number} teacherId - The ID of the teacher
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Response data containing list of published exams for the teacher
 */
static async getPublishedExamsByTeacher(teacherId, token) {
  try {
    const response = await axios.get(
      `${ExamService.BASE_URL}api/v1/teacher/exam/getPublishedExamsByTeacher/${teacherId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    return ExamService.handleApiError(error);
  }
}

/**
 * Get draft exams by teacher
 * @param {number} teacherId - The ID of the teacher
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Response data containing list of draft exams for the teacher
 */
static async getDraftExamsByTeacher(teacherId, token) {
  try {
    const response = await axios.get(
      `${ExamService.BASE_URL}api/v1/teacher/exam/getDraftExamsByTeacher/${teacherId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    return ExamService.handleApiError(error);
  }
}

/**
 * Get published exams by class
 * @param {number} classId - The ID of the class
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Response data containing list of published exams for the class
 */
static async getPublishedExamsByClass(classId, token) {
  try {
    const response = await axios.get(
      `${ExamService.BASE_URL}api/v1/teacher/exam/getPublishedExamsByClass/${classId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    return ExamService.handleApiError(error);
  }
}

/**
 * Get draft exams by class
 * @param {number} classId - The ID of the class
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Response data containing list of draft exams for the class
 */
static async getDraftExamsByClass(classId, token) {
  try {
    const response = await axios.get(
      `${ExamService.BASE_URL}api/v1/teacher/exam/getDraftExamsByClass/${classId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    return ExamService.handleApiError(error);
  }
}

/**
 * Get published upcoming exams
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Response data containing list of published upcoming exams
 */
static async getPublishedUpcomingExams(token) {
  try {
    const response = await axios.get(
      `${ExamService.BASE_URL}api/v1/teacher/exam/getPublishedUpcomingExams`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    return ExamService.handleApiError(error);
  }
}

/**
 * Get published exams for today
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Response data containing list of published exams for today
 */
static async getPublishedTodaysExams(token) {
  try {
    const response = await axios.get(
      `${ExamService.BASE_URL}api/v1/teacher/exam/getPublishedTodaysExams`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    return ExamService.handleApiError(error);
  }
}

/**
 * Get exam statistics with publish status for a teacher
 * @param {number} teacherId - The ID of the teacher
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Response data containing exam statistics with publish status
 */
static async getExamStatsWithPublishStatus(teacherId, token) {
  try {
    const response = await axios.get(
      `${ExamService.BASE_URL}api/v1/teacher/exam/getExamStatsWithPublishStatus/${teacherId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    return ExamService.handleApiError(error);
  }
}

/**
 * Check if an exam can be published
 * @param {number} examId - The ID of the exam
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Response data containing whether the exam can be published
 */
static async canPublishExam(examId, token) {
  try {
    const response = await axios.get(
      `${ExamService.BASE_URL}api/v1/teacher/exam/canPublishExam/${examId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    return ExamService.handleApiError(error);
  }
}

/**
 * Get publish status summary for a teacher
 * @param {number} teacherId - The ID of the teacher
 * @param {string} token - Authorization token
 * @returns {Promise<Object>} Response data containing publish status summary
 */
static async getPublishStatusSummary(teacherId, token) {
  try {
    const response = await axios.get(
      `${ExamService.BASE_URL}api/v1/teacher/exam/getPublishStatusSummary/${teacherId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    return ExamService.handleApiError(error);
  }
}

  // Helper method to handle common request configuration
  static getRequestConfig(token, includeContentType = false) {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    if (includeContentType) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  }

  // Helper method to handle API errors consistently
  static handleApiError(error) {
    if (error.response) {
      // Server responded with error status
      return error.response.data;
    } else if (error.request) {
      // Request was made but no response received
      return {
        code: "NETWORK_ERROR",
        message: "Network error. Please check your connection.",
        content: null
      };
    } else {
      // Something else happened
      return {
        code: "UNKNOWN_ERROR",
        message: "An unexpected error occurred.",
        content: null
      };
    }
  }


   // Get upcoming exams for a teacher
  static async getUpcomingExamsByStudent(studentId, token) {
    try {
      const response = await axios.get(
        `${ExamService.BASE_URL}api/v1/student/exam/getUpcomingExamsByStudent/${studentId}`,
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


   // Get today exams for a teacher
  static async getTodayExamsByStudent(studentId, token) {
    try {
      const response = await axios.get(
        `${ExamService.BASE_URL}api/v1/student/exam/getTodayExamsByStudent/${studentId}`,
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

    // Get exam details byStudent
  static async getExamByStudent(examId, token) {
    try {
      const response = await axios.get(
        `${ExamService.BASE_URL}api/v1/student/exam/getExam/${examId}`,
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

export default ExamService;