import api from "./api";
import authHeader from "./auth.header";

class UserService {
    GetRoleList() {
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader.GetToken()
            },
        }
        return api.get('/api/dropdown/get_role_list', config);
    }

    GetAll(param) {
        let config = {
            headers: {
                'Content-Type': 'application/json',
                "Authorization": authHeader.GetToken()
            },
            params: {
                length: param.itemsPerPage,
                sortBy: param.sortBy[0] ? param.sortBy[0].key : 'id',
                sortOrder: param.sortBy[0] ? param.sortBy[0].order : 'desc',
                page: param.page,
                name: param.search.name ? param.search.name : '',
                role_id: param.search.role_id ? param.search.role_id : '',
            }
        }
        return api.get('/api/user', config);
    }

    Save(data) {
        let config = {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': authHeader.GetToken()
            }
        }

        const formData = new FormData();
        formData.append('type', 'user');
        formData.append('id', data.id || '');
        formData.append('name', data.name || '');
        formData.append('password', data.password || '');
        formData.append('role_id', data.role_id || '');
        if (data.image instanceof File) {
            formData.append('image', data.image);
        }

        return api.post('/api/user', formData, config);
    }

    GetById(id) {
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader.GetToken()
            },
            params: { id: id }
        }
        return api.get('/api/user/getbyid', config);
    }

    Delete(id) {
        let config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader.GetToken()
            },
            params: { id: id }
        }
        return api.delete('/api/user/delete', config);
    }
}

export default new UserService();