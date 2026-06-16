import api from "./api";
import authHeader from "./auth.header";

class SaleService {
    GetAll(param) {
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": authHeader.GetToken()
            },        
            params: {
                length: param.itemsPerPage,
                sortBy: param.sortBy[0] ? param.sortBy[0].key : 'id',
                sortOrder: param.sortBy[0] ? param.sortBy[0].order : 'desc',
                page: param.page,
                fromDate: param.search.fromDate ? param.search.fromDate : '',
                toDate: param.search.toDate ? param.search.toDate : ''
            }
        }            
        return api.get('/api/sale/sale-history', config);
    }

    Save(data) {
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader.GetToken()
            }
        }
        return api.post('/api/sale', data, config);
    }
}

export default new SaleService();