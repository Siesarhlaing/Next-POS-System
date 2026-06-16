import api from "./api";

class ItemService {
  GetCategoryList() {
    let config = { headers: { 'Content-Type': 'application/json' } };
    return api.get('/api/dropdown/get_category_list', config);
  }

  GetAll(param) {
    let config = {
      headers: { 'Content-Type': 'application/json' },
      params: {
        length: param?.itemsPerPage || 10,
        sortBy: param?.sortBy?.[0] ? param.sortBy[0].key : 'id',
        sortOrder: param?.sortBy?.[0] ? param.sortBy[0].order : 'desc',
        page: param?.page || 1,
        name: param?.search?.name ? param.search.name : '',
        category_id: param?.search?.category_id ? param.search.category_id : ''
      }
    };
    return api.get('/api/item', config);
  }

  GetById(id) {
    let config = {
      headers: { 'Content-Type': 'application/json' },
      params: { id: id }
    };
    return api.get('/api/item/getbyid', config);
  }

  Save(data) {
    let config = { headers: { 'Content-Type': 'multipart/form-data' } };
    const formData = new FormData();
    formData.append('type', 'item');
    formData.append('id', data.id || '');
    formData.append('name', data.name || '');
    formData.append('price', data.price || '');
    formData.append('category_id', data.category_id || '');
    formData.append('deleted', data.deleted || false);
    
    if (data.image instanceof File) {
      formData.append('image', data.image);
    }
    return api.post('/api/item', formData, config);
  }

  Delete(id) {
    let config = {
      headers: { 'Content-Type': 'application/json' },
      params: { id: id }
    };
    return api.delete('/api/item/delete', config);
  }
}

export default new ItemService();