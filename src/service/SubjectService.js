import axios from "axios";

class SubjectService{
    static BASE_URL = "http://localhost:1010/api/v1/"



    static async addSubject(data, token) {
        try {
          const response = await axios.post(`${SubjectService.BASE_URL}admin/saveSubject`, data, {
            headers: { Authorization: `Bearer ${token}` }
          });
          return response.data;
        } catch (err) {
          throw err;
        }
      }


      static async updateSubject(data, token){
        try{
            const response = await axios.put(`${SubjectService.BASE_URL}admin/updateSubject`, data,
            {
                headers: {Authorization: `Bearer ${token}`}
            })
            return response.data;
        }catch(err){
            throw err;
        }
    }


      static async deleteSubject(id, token){
        try{
            const response = await axios.delete(`${SubjectService.BASE_URL}admin/deleteSubject/${id}`, 
            {
                headers: {Authorization: `Bearer ${token}`}
            })
            return response.data;
        }catch(err){
            throw err;
        }
    }


    static async getAllSubject(token){
        try{
            const response = await axios.get(`${SubjectService.BASE_URL}admin/getAllSubjects`, 
            {
                headers: {Authorization: `Bearer ${token}`}
            })
            return response.data;
        }catch(err){
            throw err;
        }
    }

    static async getAllSubjectByTeacher(token){
        try{
            const response = await axios.get(`${SubjectService.BASE_URL}teacher/getAllSubjects`, 
            {
                headers: {Authorization: `Bearer ${token}`}
            })
            return response.data;
        }catch(err){
            throw err;
        }
    }
}

export default SubjectService;