import axios from "axios";

class UserService{
    // static BASE_URL = "http://localhost:1010/api/v1/auth"
    static BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth`;

    // Configure axios to include credentials for CORS
    static axiosConfig = {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    static async login(username, password){
        try {
            const response = await axios.post(
                `${UserService.BASE_URL}/login`, 
                { username, password },
                UserService.axiosConfig
            );
            return response.data;
        } catch (err) {
            // Handle different error scenarios
            if (err.response && err.response.data) {
                throw new Error(err.response.data.message || 'Login failed');
            }
            throw new Error(err.message || 'Network error occurred');
        }
    }

    static async register(userData, token){
        try {
            const response = await axios.post(
                `${UserService.BASE_URL}/register`, 
                userData,
                UserService.axiosConfig
            );
            return response.data;
        } catch (err) {
            if (err.response && err.response.data) {
                throw new Error(err.response.data.message || 'Registration failed');
            }
            throw new Error(err.message || 'Network error occurred');
        }
    }

     static async refreshToken(refreshToken) {
        try {
            const response = await axios.post(
                `${UserService.BASE_URL}/refresh`,
                { token: refreshToken },
                UserService.axiosConfig
            );
            return response.data;
        } catch (err) {
            if (err.response && err.response.data) {
                throw new Error(err.response.data.message || 'Token refresh failed');
            }
            throw new Error(err.message || 'Network error occurred');
        }
    }

    static async logout() {
        try {
            const token = UserService.getToken();
            // Call backend logout endpoint if token exists
            if (token) {
                const response = await axios.post(
                    `${UserService.BASE_URL}/logout`,
                    {},
                    {
                        ...UserService.axiosConfig,
                        headers: {
                            ...UserService.axiosConfig.headers,
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                // Clear local storage regardless of backend response
                this.clearUserData();
                return response.data;
            } else {
                // No token, just clear local storage
                this.clearUserData();
                return { message: 'Logged out successfully' };
            }
        } catch (err) {
            // Even if backend call fails, clear local storage
            this.clearUserData();
            if (err.response && err.response.data) {
                console.warn('Logout warning:', err.response.data.message);
            } else {
                console.warn('Logout warning:', err.message);
            }
            // Return success even if backend fails - user is logged out locally
            return { message: 'Logged out successfully' };
        }
    }

    // Enhanced logout with proper error handling and callback support
    static async logoutWithCallback(onSuccess, onError) {
        try {
            // Clear local storage
            this.clearUserData();

            const result = await this.logout();
            if (onSuccess) {
                onSuccess(result);
            }
            return result;
        } catch (error) {
            if (onError) {
                onError(error);
            }
            throw error;
        }
    }

    // Force logout (clears everything immediately)
    static forceLogout() {
        this.clearUserData();
        // Optionally redirect to login page
        if (typeof window !== 'undefined' && window.location) {
            window.location.href = '/';
        }
    }

    static async getAllUsers(token){
        try {
            const response = await axios.get(
                `${UserService.BASE_URL}/get-all-users`,
                {
                    ...UserService.axiosConfig,
                    headers: {
                        ...UserService.axiosConfig.headers,
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (err) {
            if (err.response && err.response.data) {
                throw new Error(err.response.data.message || 'Failed to fetch users');
            }
            throw new Error(err.message || 'Network error occurred');
        }
    }


    static async getYourProfile(token){
         try {
            const response = await axios.get(
                `${UserService.BASE_URL}/get-profile`,
                {
                    ...UserService.axiosConfig,
                    headers: {
                        ...UserService.axiosConfig.headers,
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (err) {
            if (err.response && err.response.data) {
                throw new Error(err.response.data.message || 'Failed to fetch profile');
            }
            throw new Error(err.message || 'Network error occurred');
        }
    }

    static async getUserById(userId, token){
        try {
            const response = await axios.get(
                `${UserService.BASE_URL}/getUserById/${userId}`,
                {                    
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data;
        }catch (err) {
            if (err.response && err.response.data) {
            return err.response.data; // Let React handle statusCode logic
            }
            throw new Error(err.message || 'Network error occurred');
        }
    }


    static async deleteUser(userId, token){
        try {
            const response = await axios.delete(
                `${UserService.BASE_URL}/delete/${userId}`,
                {
                    ...UserService.axiosConfig,
                    headers: {
                        ...UserService.axiosConfig.headers,
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (err) {
            if (err.response && err.response.data) {
                throw new Error(err.response.data.message || 'Failed to delete user');
            }
            throw new Error(err.message || 'Network error occurred');
        }
    }


    static async updateUser(userId, userData, token){
        try {
            const response = await axios.put(
                `${UserService.BASE_URL}/update/${userId}`, 
                userData,
                {
                    ...UserService.axiosConfig,
                    headers: {
                        ...UserService.axiosConfig.headers,
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (err) {
            if (err.response && err.response.data) {
                throw new Error(err.response.data.message || 'Failed to update user');
            }
            throw new Error(err.message || 'Network error occurred');
        }
    }

    // Token Management Methods
    static saveUserData(userData) {
        if (userData.token) {
            localStorage.setItem('token', userData.token);
        }
        if (userData.refreshToken) {
            localStorage.setItem('refreshToken', userData.refreshToken);
        }
        if (userData.role) {
            localStorage.setItem('role', userData.role);
        }
        if (userData.name) {
            localStorage.setItem('name', userData.name);
        }
        if (userData.expirationTime) {
            localStorage.setItem('tokenExpiration', userData.expirationTime);
        }
        if (userData.username) {
            localStorage.setItem('username', userData.username);
        }
        if (userData.id) {
            localStorage.setItem('id', userData.id);
        }
    }

    static getToken() {
        return localStorage.getItem('token');
    }

    static getRefreshToken() {
        return localStorage.getItem('refreshToken');
    }

    static getRole() {
        return localStorage.getItem('role');
    }

    static getUserName() {
        return localStorage.getItem('name');
    }

    static getUserId() {
        return localStorage.getItem('id');
    }

    

    // Auto-refresh token if needed
    static async getValidToken() {
        const token = UserService.getToken();
        const refreshToken = UserService.getRefreshToken();
        
        if (!token && !refreshToken) {
            throw new Error('No authentication tokens available');
        }

        // In a real application, you'd want to check token expiration
        // For now, we'll just return the current token
        return token;
    }

    static clearUserData() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        localStorage.removeItem('name');
        localStorage.removeItem('tokenExpiration');
        localStorage.removeItem('id');
    }


    // Authentication Methods
    static isAuthenticated() {
        const token = localStorage.getItem('token');
        return !!token;
    }

    static isAdmin(){
        const role = localStorage.getItem('role')
        return role === 'ADMIN'
    }

    static isStudent(){
        const role = localStorage.getItem('role')
        return role === 'STUDENT'
    }

    static isTeacher(){
        const role = localStorage.getItem('role')
        return role === 'TEACHER'
    }

    static adminOnly(){
        return UserService.isAuthenticated() && UserService.isAdmin();
    }

    static teacherOnly() {
        return UserService.isAuthenticated() && UserService.isTeacher();
    }

    static studentOnly() {
        return UserService.isAuthenticated() && UserService.isStudent();
    }

    static hasAnyRole() {
        return UserService.isAuthenticated() && (UserService.isAdmin() || UserService.isTeacher() || UserService.isStudent());
    }

    // Utility method to handle API calls with automatic token refresh
    static async makeAuthenticatedRequest(requestFunction) {
        try {
            const token = await UserService.getValidToken();
            return await requestFunction(token);
        } catch (error) {
            // If token is invalid, try to refresh
            if (error.response && error.response.status === 401) {
                try {
                    const refreshToken = UserService.getRefreshToken();
                    if (refreshToken) {
                        const refreshData = await this.refreshToken(refreshToken);
                        UserService.saveUserData(refreshData);
                        const newToken = refreshData.token;
                        return await requestFunction(newToken);
                    }
                } catch (refreshError) {
                    // Refresh failed, logout user
                    UserService.logout();
                    throw new Error('Session expired. Please login again.');
                }
            }
            throw error;
        }
    }

    
}

export default UserService;