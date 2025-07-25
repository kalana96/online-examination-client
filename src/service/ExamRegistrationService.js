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

class ExamRegistrationService {
  // static baseURL = "http://localhost:1010";
  static baseURL = `${import.meta.env.VITE_API_BASE_URL}`;

  /**
   * Register student for an exam
   */
  static async registerForExam(studentId, examId, token, notes = null) {
    try {
      const requestBody = {
        studentId: parseInt(studentId),
        examId: parseInt(examId),
        notes: notes
      };

      const response = await fetch(`${this.baseURL}/api/v1/student/exam-registration/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      // If JSON parsing fails, try to get text
      const textResponse = await response.text();
      throw new Error(textResponse || `HTTP error! status: ${response.status}`);
    }

    // If response is not ok, throw error with backend message

      if (!response.ok) {
        // Backend returns ResponseDTO even for errors
      const errorMessage = responseData?.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
      }

     return responseData;

    } catch (error) {
      console.error('Error registering for exam:', error);
      throw error;
    }
  }

  /**
   * Get exam registration status for a student
   */
  static async getExamRegistrationStatus(studentId, examId, token) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/student/exam-registration/student/${studentId}/exam/${examId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response;
    } catch (error) {
      console.error('Network error:', error);
      throw error;
    }
  }

  /**
   * Get all registrations for a student
   */
  static async getStudentRegistrations(studentId, token) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/student/exam-registration/student/${studentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching student registrations:', error);
      throw error;
    }
  }

  /**
   * Cancel exam registration
   */
  static async cancelExamRegistration(studentId, examId, token) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/student/exam-registration/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: parseInt(studentId),
          examId: parseInt(examId)
        }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error canceling exam registration:', error);
      throw error;
    }
  }

  /**
   * Get upcoming exams for a student (if needed)
   */
  static async getUpcomingExamsByStudent(studentId, token) {
    try {
      const response = await fetch(`${this.baseURL}/api/v1/student/exams/upcoming/${studentId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching upcoming exams:', error);
      throw error;
    }
  }
}

export default ExamRegistrationService;