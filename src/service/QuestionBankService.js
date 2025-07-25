// Updated QuestionService methods to fix API endpoints
import axios from 'axios';

// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:1010/api/v1/teacher/questionBank';
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/teacher/questionBank`;

class QuestionBankService {
  // Create a new question
  async createQuestion(questionData, token) {
    try {
      const response = await axios.post(`${API_BASE_URL}/saveQuestion`,
        questionData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response;
   } catch (error) {
      console.error('Error saving question:', error);
      throw error;
    }
  }

  // Update an existing question - Fixed endpoint
  async updateQuestion(questionData, token) {
    try {
      const response = await axios.put(`${API_BASE_URL}/updateQuestion`,
        questionData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response;
    } catch (error) {
      console.error('Error updating question:', error);
      if (error.response && error.response.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Get questions by teacher - Fixed
  async getQuestionsByTeacher(teacherId, token) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/getQuestionsByTeacher/${teacherId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response;
    } catch (error) {
      console.error('Error getting questions:', error);
      throw error;
    }
  }

  //  // Get questions by teacher and class
  // async getQuestionsByTeacher(teacherId, classId, token) {
  //   try {
  //     const response = await axios.get(
  //       `${API_BASE_URL}/getQuestionsByTeacher/${teacherId}`,
  //       {
  //         headers: {
  //           'Authorization': `Bearer ${token}`,
  //           'Content-Type': 'application/json',
  //         },
  //       }
  //     );
  //     return response;
  //   } catch (error) {
  //     console.error('Error getting questions:', error);
  //     throw error;
  //   }
  // }

  // Get a specific question by ID
  async getQuestionById(questionId, token) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/getQuestion/${questionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching question:', error);
      if (error.response && error.response.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Delete a question
  async deleteQuestion(questionId, token) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/${questionId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting question:', error);
      if (error.response && error.response.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Duplicate question
  async duplicateQuestion(questionId, token) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/${questionId}/duplicate`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error saving question:', error);
      throw error;
    }
  }

  // Get all questions with filters
  async getAllQuestions(filters = {}, token) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.classId) queryParams.append('classId', filters.classId);
      if (filters.subjectId) queryParams.append('subjectId', filters.subjectId);
      if (filters.questionType) queryParams.append('questionType', filters.questionType);
      if (filters.difficulty) queryParams.append('difficulty', filters.difficulty);
      if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);
      if (filters.sortDirection) queryParams.append('sortDirection', filters.sortDirection);

      const response = await axios.get(
        `${API_BASE_URL}?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching questions:', error);
      if (error.response && error.response.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Get questions by class
  async getQuestionsByClass(classId, token) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/class/${classId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response;
    } catch (error) {
      console.error('Error fetching questions by class:', error);
      if (error.response && error.response.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Get questions by subject
  async getQuestionsBySubject(subjectId, token) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/subject/${subjectId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching questions by subject:', error);
      if (error.response && error.response.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Get random questions
  async getRandomQuestions(classId, subjectId, difficulty, limit, token) {
    try {
      const queryParams = new URLSearchParams({
        classId: classId,
        subjectId: subjectId,
        difficulty: difficulty,
        limit: limit
      });

      const response = await axios.get(
        `${API_BASE_URL}/random?${queryParams.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching random questions:', error);
      if (error.response && error.response.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Get question statistics
  async getQuestionStatistics(token) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/statistics`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching question statistics:', error);
      if (error.response && error.response.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  // Increment question usage
  async incrementQuestionUsage(questionId, token) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/${questionId}/increment-usage`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error incrementing question usage:', error);
      if (error.response && error.response.data) {
        return error.response.data;
      }
      throw error;
    }
  }
}

export default new QuestionBankService();