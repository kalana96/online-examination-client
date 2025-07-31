import axios from "axios";

class AdminDashboardService {
  // static BASE_URL = "http://localhost:1010";
  static BASE_URL = `${import.meta.env.VITE_API_BASE_URL}`;

  // Get Dashboard Statistics
  static async getDashboardStats(token) {
    try {
      const response = await axios.get(
        `${DashboardService.BASE_URL}/api/v1/admin/dashboard/stats`,
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

  // Get Live Exams
  static async getLiveExams(token) {
    try {
      const response = await axios.get(
        `${DashboardService.BASE_URL}/api/v1/admin/exams/live`,
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

  // Get Today's Exams
  static async getTodaysExams(token) {
    try {
      const response = await axios.get(
        `${DashboardService.BASE_URL}/api/v1/admin/exams/today`,
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

  // Get Upcoming Exams
  static async getUpcomingExams(token) {
    try {
      const response = await axios.get(
        `${DashboardService.BASE_URL}/api/v1/admin/exams/getUpcomingExams`,
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

  // Get All Students Count
  static async getTotalStudents(token) {
    try {
      const response = await axios.get(
        `${DashboardService.BASE_URL}/api/v1/admin/getStudentCount`,
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

  // Get All Teachers Count
  static async getTotalTeachers(token) {
    try {
      const response = await axios.get(
        `${DashboardService.BASE_URL}/api/v1/admin/getTeacherCount`,
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

  // Get All Exams Count
  static async getTotalExams(token) {
    try {
      const response = await axios.get(
        `${DashboardService.BASE_URL}/api/v1/admin/exams/count`,
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

  // Get Current Exam Students Count
  static async getCurrentExamStudents(token) {
    try {
      const response = await axios.get(
        `${DashboardService.BASE_URL}/api/v1/admin/exams/current-students`,
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
}

export default AdminDashboardService;