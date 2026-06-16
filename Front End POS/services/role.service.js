import api from "./api";
import authHeader from "./auth.header";

class RoleService {
    GetAll(param) {
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader.GetToken()
            },
            params: {
                length: param.itemsPerPage,
                sortBy: param.sortBy[0] ? param.sortBy[0].key : 'id',
                sortOrder: param.sortBy[0] ? param.sortBy[0].sortOrder : 'desc',
                page: param.page,
                name: param.search.name ? param.search.name : ''
            }
        }
        return api.get('/api/role', config);
    }

    Save(data) {
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader.GetToken()
            },
        }
        return api.post('/api/role', data, config);
    }

    GetById(id) {
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader.GetToken()
            },
            params: { id: id }
        }
        return api.get('/api/role/getbyid', config);
    }

    Delete(id) {
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader.GetToken()
            },
            params: { id: id }
        }
        return api.delete('/api/role/delete', config);
    }
}

export default new RoleService();