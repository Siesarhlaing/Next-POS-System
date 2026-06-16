import api from "./api";

class CategoryService {
    GetAll(param) {
        let config = {
            headers: { 'Content-Type': 'application/json' },
            params: {
                length: param?.itemsPerPage || 10,
                sortBy: param?.sortBy?.[0] ? param.sortBy[0].key : 'id',
                sortOrder: param?.sortBy?.[0] ? param.sortBy[0].order : 'desc',
                page: param?.page || 1,
                name: param?.search?.name ? param.search.name : '',
            }
        }
        return api.get('/api/category', config);
    }

    ExportExcel(param) {
        let config = {
            headers: { 'Content-Type': 'application/json' },
            params: {
                length: -1,
                sortBy: param?.sortBy?.[0] ? param.sortBy[0].key : 'id',
                sortOrder: param?.sortBy?.[0] ? param.sortBy[0].order : 'desc',
                page: 1,
                name: param?.search?.name ? param.search.name : '',
            },
            responseType: 'blob'
        }
        return api.get('/api/category/excel_export', config);
    }

    GetById(id) {
        let config = {
            headers: { 'Content-Type': 'application/json' },
            params: { id: id }            
        }
        return api.get(`/api/category/getbyid`, config);
    }

    Save(data) {
        let config = { headers: { 'Content-Type': 'multipart/form-data' } };
        const formData = new FormData();
        formData.append('type', 'category');
        formData.append('id', data.id || '');
        formData.append('name', data.name || '');
        formData.append('deleted', data.deleted || false);

        if (data.image instanceof File) {
            formData.append('image', data.image);
        }
        return api.post('/api/category', formData, config);
    }

    Delete(id) {
        let config = {
            headers: { 'Content-Type': 'application/json' },
            params: { id: id }       
        }
        return api.delete('/api/category/delete', config);
    }
}

export default new CategoryService();