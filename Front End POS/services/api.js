import axios from 'axios';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

const api = axios.create({
    baseURL: apiUrl
});

// 🌟 Global Request Interceptor: ခေါ်သမျှ API တိုင်းတွင် Token ကို အလိုအလျောက် သယ်ဆောင်ပေးခြင်း
api.interceptors.request.use(
    (config) => {
        // ပုံစံနှစ်မျိုးလုံးမှ အဆင်ပြေရာ Token ကို လှမ်းယူခြင်း
        let token = localStorage.getItem('token');
        
        if (!token) {
            const userObj = localStorage.getItem('pos_user');
            if (userObj) {
                try {
                    token = JSON.parse(userObj)?.token;
                } catch (e) {
                    token = null;
                }
            }
        }

        if (token) {
            // Headers ထဲသို့ Bearer Token အမှန်ကို ထည့်သွင်းခြင်း
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;