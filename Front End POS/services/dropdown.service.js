import api from "./api";
import authHeader from "./auth.header";

class DropDownService {
    GetCategoryList() {
        const token = authHeader.GetToken();
        
        let config = {
            headers: {
                'Content-Type': 'application/json',
                // Token ရှိမှ Bearer ထည့်ပေးပြီး မရှိရင် blank ထားပါမည်
                'Authorization': token ? `Bearer ${token}` : ''
            }
        }
        return api.get('/api/dropdown/get_category_list', config);
    }

    GetItemListByCategoryId(id) {
        const token = authHeader.GetToken();

        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            }, 
            params: {
                category_id: id ? id : 0
            }
        }
        return api.get('/api/dropdown/get_item_list_by_category_id', config);
    }
}

export default new DropDownService();