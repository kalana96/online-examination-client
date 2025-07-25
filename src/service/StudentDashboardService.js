import axios from "axios";

// Base configuration for API calls
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1010/';
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/`;


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

class StudentDashboardService {
  static BASE_URL = "http://localhost:1010/";

  // ===== STUDENT DASHBOARD FUNCTIONS =====

  /**
   * Get student dashboard data (stats, upcoming exams, recent results, notifications)
   * @param {number} studentId - The ID of the student
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - API response with dashboard data
   */
  static async getStudentDashboard(studentId, token = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.get(`api/v1/student/dashboard/${studentId}`, {
        headers,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching student dashboard:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get student statistics
   * @param {number} studentId - The ID of the student
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - API response with student stats
   */
  static async getStudentStats(studentId, token = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.get(`api/v1/student/stats/${studentId}`, {
        headers,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching student stats:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get upcoming exams for student
   * @param {number} studentId - The ID of the student
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - API response with upcoming exams
   */
  static async getStudentUpcomingExams(studentId, token = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.get(`api/v1/student/exams/upcoming/${studentId}`, {
        headers,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming exams:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get recent exam results for student
   * @param {number} studentId - The ID of the student
   * @param {number} limit - Number of results to fetch (default: 10)
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - API response with recent results
   */
  static async getStudentRecentResults(studentId, limit = 10, token = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.get(`api/v1/student/results/recent/${studentId}`, {
        params: { limit },
        headers,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching recent results:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get student notifications
   * @param {number} studentId - The ID of the student
   * @param {number} limit - Number of notifications to fetch (default: 10)
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - API response with notifications
   */
  static async getStudentNotifications(studentId, limit = 10, token = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.get(`api/v1/student/notifications/${studentId}`, {
        params: { limit },
        headers,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get student profile information
   * @param {number} studentId - The ID of the student
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - API response with student profile
   */
  static async getStudentProfile(studentId, token = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.get(`api/v1/student/profile/${studentId}`, {
        headers,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching student profile:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get today's exams for student
   * @param {number} studentId - The ID of the student
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - API response with today's exams
   */
  static async getStudentTodaysExams(studentId, token = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.get(`api/v1/student/exams/today/${studentId}`, {
        headers,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching today\'s exams:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get student's class rank
   * @param {number} studentId - The ID of the student
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - API response with class rank
   */
  static async getStudentClassRank(studentId, token = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.get(`api/v1/student/rank/${studentId}`, {
        headers,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching class rank:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get student's exam history
   * @param {number} studentId - The ID of the student
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Number of results per page (default: 10)
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - API response with exam history
   */
  static async getStudentExamHistory(studentId, page = 1, limit = 10, token = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.get(`api/v1/student/exams/history/${studentId}`, {
        params: { page, limit },
        headers,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching exam history:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get student's performance analytics
   * @param {number} studentId - The ID of the student
   * @param {string} period - Time period ('week', 'month', 'semester', 'year')
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - API response with performance analytics
   */
  static async getStudentPerformanceAnalytics(studentId, period = 'month', token = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.get(`api/v1/student/analytics/${studentId}`, {
        params: { period },
        headers,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching performance analytics:', error);
      return this.handleApiError(error);
    }
  }

  // ===== TEACHER DASHBOARD FUNCTIONS =====

  /**
   * Get teacher dashboard data
   * @param {number} teacherId - The ID of the teacher
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - API response with teacher dashboard data
   */
  static async getTeacherDashboard(teacherId, token = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.get(`api/v1/teacher/dashboard/${teacherId}`, {
        headers,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching teacher dashboard:', error);
      return this.handleApiError(error);
    }
  }

  // ===== EXAM MANAGEMENT FUNCTIONS (from original ExamService) =====

  /**
   * Schedule a new exam
   * @param {Object} examData - Exam data payload
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - API response
   */
  static async scheduleExam(examData, token = null) {
    try {
      if (!examData) {
        throw new Error('Exam data is required');
      }

      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.post('api/v1/teacher/exam/scheduleExam', examData, {
        headers,
      });

      return response;
    } catch (error) {
      console.error('Error scheduling exam:', error);
      throw error;
    }
  }

  /**
   * Update an existing exam
   * @param {Object} examData - Exam data payload
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - API response
   */
  static async updateExam(examData, token = null) {
    try {
      if (!examData) {
        throw new Error('Exam data is required');
      }

      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.put('api/v1/teacher/exam/updateExam', examData, {
        headers,
      });

      return response;
    } catch (error) {
      console.error('Error updating exam:', error);
      throw error;
    }
  }

  /**
   * Get exam details by exam ID
   * @param {number} examId - The ID of the exam
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - API response with exam details
   */
  static async getExamById(examId, token = null) {
    try {
      const response = await axios.get(
        `${DashboardService.BASE_URL}api/v1/teacher/exam/getExam/${examId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  /**
   * Delete an exam by ID
   * @param {number} examId - The ID of the exam
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - API response
   */
  static async deleteExam(examId, token = null) {
    try {
      const response = await axios.delete(
        `${DashboardService.BASE_URL}api/v1/teacher/exam/deleteExam/${examId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data;
    } catch (error) {
      return this.handleApiError(error);
    }
  }

  // ===== UTILITY FUNCTIONS =====

  /**
   * Mark notification as read
   * @param {number} notificationId - The ID of the notification
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - API response
   */
  static async markNotificationAsRead(notificationId, token = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.put(`api/v1/notifications/mark-read/${notificationId}`, {}, {
        headers,
      });

      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return this.handleApiError(error);
    }
  }

  /**
   * Get current user information
   * @param {string} token - Authentication token (optional)
   * @returns {Promise} - API response with user info
   */
  static async getCurrentUser(token = null) {
    try {
      const headers = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await apiClient.get('api/v1/auth/me', {
        headers,
      });

      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return this.handleApiError(error);
    }
  }

  // ===== HELPER METHODS =====

  /**
   * Helper method to handle common request configuration
   * @param {string} token - Authentication token
   * @param {boolean} includeContentType - Whether to include content-type header
   * @returns {Object} - Request configuration object
   */
  static getRequestConfig(token, includeContentType = false) {
    const config = {
      headers: { Authorization: `Bearer ${token}` }
    };
    
    if (includeContentType) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  }

  /**
   * Helper method to handle API errors consistently
   * @param {Error} error - The error object
   * @returns {Object} - Standardized error response
   */
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
}

export default StudentDashboardService;