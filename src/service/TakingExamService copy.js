import axios from "axios";

class TakingExamService {
  constructor() {
    // Base URL for the API - adjust this to match your backend URL
    this.baseURL =
      `${import.meta.env.VITE_API_BASE_URL}` || "http://localhost:1010";
    this.apiPath = "/api/v1/student/taking-exam";

    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for authentication if needed
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add authorization token if available
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error("API Error:", error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get exam details for taking (without answers)
   * @param {number} examId - The exam ID
   * @param {number} studentId - The student ID
   * @returns {Promise<Object>} ExamTakeDTO object
   */
  async getExamForTaking(examId, studentId) {
    try {
      const response = await this.axiosInstance.get(
        `${this.apiPath}/${examId}/take`,
        {
          params: { studentId },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to get exam for taking");
    }
  }

  /**
   * Start exam attempt and get questions
   * @param {number} examId - The exam ID
   * @param {number} studentId - The student ID
   * @param {string} ipAddress - Optional IP address
   * @returns {Promise<Object>} ExamSessionDTO object
   */
  async startExamSession(examId, studentId, ipAddress = null) {
    try {
      const params = { studentId };
      if (ipAddress) {
        params.ipAddress = ipAddress;
      }

      const response = await this.axiosInstance.post(
        `${this.apiPath}/${examId}/start`,
        null,
        { params }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to start exam session");
    }
  }

  /**
   * Get exam time remaining
   * @param {number} attemptId - The attempt ID
   * @returns {Promise<Object>} TimeRemainingDTO object
   */
  async getTimeRemaining(attemptId) {
    try {
      const response = await this.axiosInstance.get(
        `${this.apiPath}/attempt/${attemptId}/time-remaining`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to get time remaining");
    }
  }

  /**
   * Auto-save exam progress
   * @param {number} attemptId - The attempt ID
   * @param {Array} answers - Array of StudentAnswerDTO objects
   * @returns {Promise<void>}
   */
  async autoSaveProgress(attemptId, answers) {
    try {
      await this.axiosInstance.post(
        `${this.apiPath}/attempt/${attemptId}/auto-save`,
        answers
      );
    } catch (error) {
      throw this.handleError(error, "Failed to auto-save progress");
    }
  }

  /**
   * Final exam submission
   * @param {number} attemptId - The attempt ID
   * @returns {Promise<Object>} ExamSubmissionResultDTO object
   */
  async submitExamFinal(attemptId) {
    try {
      const response = await this.axiosInstance.post(
        `${this.apiPath}/attempt/${attemptId}/submit-final`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to submit exam");
    }
  }

  /**
   * Helper method to get client IP address
   * @returns {Promise<string>} IP address
   */
  async getClientIPAddress() {
    try {
      const response = await axios.get("https://api.ipify.org?format=json");
      return response.data.ip;
    } catch (error) {
      console.warn("Could not fetch IP address:", error);
      return null;
    }
  }

  /**
   * Utility method to handle errors consistently
   * @param {Error} error - The error object
   * @param {string} defaultMessage - Default error message
   * @returns {Error} Formatted error
   */
  handleError(error, defaultMessage) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      const message = data?.message || data?.error || defaultMessage;
      return new Error(`${message} (Status: ${status})`);
    } else if (error.request) {
      // Request made but no response received
      return new Error("Network error - please check your connection");
    } else {
      // Something else happened
      return new Error(error.message || defaultMessage);
    }
  }

  /**
   * Set authentication token
   * @param {string} token - JWT token
   */
  setAuthToken(token) {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  /**
   * Clear authentication token
   */
  clearAuthToken() {
    localStorage.removeItem("token");
  }
}

// Export a singleton instance
const takingExamService = new TakingExamService();
export default takingExamService;

// Also export the class for custom instances if needed
export { TakingExamService };
