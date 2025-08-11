import axios from "axios";

class StudentAnswerService {
  constructor() {
    // Base URL for the API - adjust this to match your backend URL
    this.baseURL =
      `${import.meta.env.VITE_API_BASE_URL}` || "http://localhost:1010";
    this.apiPath = "/api/v1/common/student-answers";

    // Create axios instance with default config
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000, // 30 seconds timeout
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor for authentication
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
   * Mark a student answer with marks, correctness, and feedback
   * @param {number} answerId - The answer ID to mark
   * @param {Object} markingData - Marking information
   * @param {number} markingData.marksAwarded - Marks awarded for the answer
   * @param {boolean} markingData.isCorrect - Whether the answer is correct
   * @param {string} markingData.teacherFeedback - Optional feedback from teacher
   * @returns {Promise<Object>} Updated StudentAnswerDTO
   */
  async markAnswer(answerId, markingData) {
    try {
      const response = await this.axiosInstance.put(
        `${this.apiPath}/${answerId}/mark`,
        {
          marksAwarded: markingData.marksAwarded,
          isCorrect: markingData.isCorrect,
          teacherFeedback: markingData.teacherFeedback || "",
        }
      );

      return {
        success: true,
        data: response.data,
        message: "Answer marked successfully",
      };
    } catch (error) {
      throw this.handleError(error, "Failed to mark answer");
    }
  }

  /**
   * Flag or unflag a student answer
   * @param {number} answerId - The answer ID to flag
   * @param {string} flagReason - Optional reason for flagging
   * @returns {Promise<Object>} Updated StudentAnswerDTO
   */
  async flagAnswer(answerId, flagReason = null) {
    try {
      const params = {};
      if (flagReason) {
        params.flagReason = flagReason;
      }

      const response = await this.axiosInstance.put(
        `${this.apiPath}/${answerId}/flag`,
        null,
        { params }
      );

      return {
        success: true,
        data: response.data,
        message: "Answer flagged successfully",
      };
    } catch (error) {
      throw this.handleError(error, "Failed to flag answer");
    }
  }

  /**
   * Get student answers by exam attempt ID
   * @param {number} attemptId - The exam attempt ID
   * @returns {Promise<Array>} Array of StudentAnswerDTO objects
   */
  async getAnswersByAttemptId(attemptId) {
    try {
      const response = await this.axiosInstance.get(
        `${this.apiPath}/attempt/${attemptId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to get answers by attempt ID");
    }
  }

  /**
   * Get student answers by student ID
   * @param {number} studentId - The student ID
   * @returns {Promise<Array>} Array of StudentAnswerDTO objects
   */
  async getAnswersByStudentId(studentId) {
    try {
      const response = await this.axiosInstance.get(
        `${this.apiPath}/student/${studentId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error, "Failed to get answers by student ID");
    }
  }

  /**
   * Get student answers by exam ID and student ID
   * @param {number} examId - The exam ID
   * @param {number} studentId - The student ID
   * @returns {Promise<Array>} Array of StudentAnswerDTO objects
   */
  async getAnswersByExamAndStudent(examId, studentId) {
    try {
      const response = await this.axiosInstance.get(
        `${this.apiPath}/exam/${examId}/student/${studentId}`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(
        error,
        "Failed to get answers by exam and student"
      );
    }
  }

  /**
   * Auto-mark answers based on question type and correct answers
   * @param {Array} answers - Array of answer objects to auto-mark
   * @returns {Promise<Array>} Array of marking results
   */
  async autoMarkAnswers(answers) {
    const results = [];

    for (const answer of answers) {
      try {
        const autoMarkResult = this.calculateAutoMark(answer);

        if (autoMarkResult.canAutoMark) {
          const markingResult = await this.markAnswer(answer.id, {
            marksAwarded: autoMarkResult.marksAwarded,
            isCorrect: autoMarkResult.isCorrect,
            teacherFeedback: "Auto-marked by system",
          });

          results.push({
            answerId: answer.id,
            success: true,
            result: markingResult,
          });
        } else {
          results.push({
            answerId: answer.id,
            success: false,
            reason: "Cannot auto-mark this question type",
          });
        }
      } catch (error) {
        results.push({
          answerId: answer.id,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
  }

  /**
   * Calculate auto-marking for an answer based on question type
   * @param {Object} answer - The answer object with question details
   * @returns {Object} Auto-marking calculation result
   */
  calculateAutoMark(answer) {
    const { questionDetails, answerText } = answer;

    if (!questionDetails || !questionDetails.correctAnswer) {
      return { canAutoMark: false, reason: "No correct answer available" };
    }

    const questionType = questionDetails.questionType;
    const correctAnswer = questionDetails.correctAnswer;
    const maxMarks = questionDetails.marks || 0;

    switch (questionType) {
      case "MULTIPLE_CHOICE":
      case "TRUE_FALSE":
        const isExactMatch =
          answerText?.toLowerCase().trim() ===
          correctAnswer.toLowerCase().trim();
        return {
          canAutoMark: true,
          isCorrect: isExactMatch,
          marksAwarded: isExactMatch ? maxMarks : 0,
        };

      case "SHORT_ANSWER":
        // For short answers, we can do basic text matching
        const isTextMatch =
          answerText?.toLowerCase().trim() ===
          correctAnswer.toLowerCase().trim();
        // Could also implement fuzzy matching or keyword checking here
        return {
          canAutoMark: true,
          isCorrect: isTextMatch,
          marksAwarded: isTextMatch ? maxMarks : 0,
        };

      case "ESSAY":
        // Essays typically require manual marking
        return {
          canAutoMark: false,
          reason: "Essay questions require manual marking",
        };

      default:
        return { canAutoMark: false, reason: "Unknown question type" };
    }
  }

  /**
   * Get marking statistics for an exam attempt
   * @param {number} attemptId - The exam attempt ID
   * @returns {Promise<Object>} Marking statistics
   */
  async getMarkingStatistics(attemptId) {
    try {
      const response = await this.axiosInstance.get(
        `${this.apiPath}/attempt/${attemptId}/statistics`
      );
      return response.data;
    } catch (error) {
      // If endpoint doesn't exist, calculate locally
      console.warn("Statistics endpoint not available, calculating locally");
      return this.calculateMarkingStatistics(attemptId);
    }
  }

  /**
   * Calculate marking statistics locally (fallback method)
   * @param {number} attemptId - The exam attempt ID
   * @returns {Promise<Object>} Calculated statistics
   */
  async calculateMarkingStatistics(attemptId) {
    try {
      const answers = await this.getAnswersByAttemptId(attemptId);

      const totalQuestions = answers.length;
      const markedQuestions = answers.filter((a) => a.isMarked).length;
      const correctAnswers = answers.filter((a) => a.isCorrect === true).length;
      const incorrectAnswers = answers.filter(
        (a) => a.isCorrect === false
      ).length;
      const flaggedAnswers = answers.filter((a) => a.isFlagged).length;

      const totalMarksAwarded = answers
        .filter((a) => a.marksAwarded !== null && a.marksAwarded !== undefined)
        .reduce((sum, a) => sum + (a.marksAwarded || 0), 0);

      const totalPossibleMarks = answers
        .filter((a) => a.questionDetails && a.questionDetails.marks)
        .reduce((sum, a) => sum + (a.questionDetails.marks || 0), 0);

      return {
        totalQuestions,
        markedQuestions,
        unmarkedQuestions: totalQuestions - markedQuestions,
        correctAnswers,
        incorrectAnswers,
        flaggedAnswers,
        totalMarksAwarded,
        totalPossibleMarks,
        percentage:
          totalPossibleMarks > 0
            ? (totalMarksAwarded / totalPossibleMarks) * 100
            : 0,
        markingProgress:
          totalQuestions > 0 ? (markedQuestions / totalQuestions) * 100 : 0,
      };
    } catch (error) {
      throw this.handleError(error, "Failed to calculate marking statistics");
    }
  }

  /**
   * Bulk update multiple answers
   * @param {Array} updates - Array of update objects {answerId, markingData}
   * @returns {Promise<Array>} Array of update results
   */
  async bulkUpdateAnswers(updates) {
    const results = [];

    for (const update of updates) {
      try {
        const result = await this.markAnswer(
          update.answerId,
          update.markingData
        );
        results.push({
          answerId: update.answerId,
          success: true,
          result,
        });
      } catch (error) {
        results.push({
          answerId: update.answerId,
          success: false,
          error: error.message,
        });
      }
    }

    return results;
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
const studentAnswerService = new StudentAnswerService();
export default studentAnswerService;

// Also export the class for custom instances if needed
export { StudentAnswerService };
