import api from "./api";

class AuthService {
    async Login(user) {
        var result = await api.post('/api/auth/login', user);
        if (result.data && result.data.token) {
            localStorage.setItem('pos_user', JSON.stringify(result.data));
        }
        return result.data;
    }
}

export default new AuthService();