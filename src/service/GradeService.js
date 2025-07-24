import axios from "axios";

class GradeService{
    static BASE_URL = "http://localhost:1010"


      static async getAllGrades(token){
        try{
            const response = await axios.get(`${GradeService.BASE_URL}/api/v1/admin/getAllGrades`, 
            {
                headers: {Authorization: `Bearer ${token}`}
            })
            return response.data;
        }catch(err){
            throw err;
        }
    }

    static async addGrade(gradeData, token) {
        try {
          const response = await axios.post(`${GradeService.BASE_URL}/api/v1/admin/saveClass`, gradeData, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return response.data;
        } catch (err) {
          throw err;
        }
      }

      static async updateGrade(gradeData, token){
        try{
            const response = await axios.put(`${GradeService.BASE_URL}/api/v1/admin/updateGrade`, gradeData,
            {
                headers: {Authorization: `Bearer ${token}`}
            })
            return response.data;
        }catch(err){
            throw err;
        }
    }

      static async deleteGrade(id, token){
        try{
            const response = await axios.delete(`${GradeService.BASE_URL}/api/v1/admin/deleteGrade/${id}`, 
            {
                headers: {Authorization: `Bearer ${token}`}
            })
            return response.data;
        }catch(err){
            throw err;
        }
    }
   

    static async getYourProfile(token){
        try{
            const response = await axios.get(`${UserService.BASE_URL}/api/v1/admin//adminuser/get-profile`, 
            {
                headers: {Authorization: `Bearer ${token}`}
            })
            return response.data;
        }catch(err){
            throw err;
        }
    }

    static async getUserById(userId, token){
        try{
            const response = await axios.get(`${UserService.BASE_URL}/api/v1/admin//admin/get-users/${userId}`, 
            {
                headers: {Authorization: `Bearer ${token}`}
            })
            return response.data;
        }catch(err){
            throw err;
        }
    }


    //Teacher Service

    static async getAllGradesForTeacher(token){
        try{
            const response = await axios.get(`${GradeService.BASE_URL}/api/v1/teacher/getAllGrades`, 
            {
                headers: {Authorization: `Bearer ${token}`}
            })
            return response.data;
        }catch(err){
            throw err;
        }
    }


 

    /**AUTHENTICATION CHECKER */
    // static logout(){
    //     localStorage.removeItem('token')
    //     localStorage.removeItem('role')
    // }

    // static isAuthenticated(){
    //     const token = localStorage.getItem('token')
    //     return !!token
    // }

    // static isAdmin(){
    //     const role = localStorage.getItem('role')
    //     return role === 'ADMIN'
    // }

    // static isStudent(){
    //     const role = localStorage.getItem('role')
    //     return role === 'STUDENT'
    // }

    // static isTeacher(){
    //     const role = localStorage.getItem('role')
    //     return role === 'TEACHER'
    // }

    // static adminOnly(){
    //     return this.isAuthenticated() && this.isAdmin();
    // }

}

export default GradeService;