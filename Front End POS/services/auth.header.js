class AuthHeader {
    GetToken() {
        if (typeof window !== 'undefined') { 
            const token = localStorage.getItem('token');
            if (token) {
                return `Bearer ${token}`;
            }
            
            const user = localStorage.getItem('pos_user');
            if (user) {
                try {
                    const data = JSON.parse(user);
                    return `Bearer ${data.token}`;
                } catch (e) {
                    return '';
                }
            }
        }
        return '';
    }
}

export default new AuthHeader();