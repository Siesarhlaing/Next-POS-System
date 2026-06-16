const Item = require('../data_access/model/item.model')
const RepositoryBase = require('../data_access/repository.base')
const ItemRepo = new RepositoryBase(Item)
const {Op} = require('sequelize')
const fs  = require('fs')
const path  = require('path')

// http://localhost:8080/api/item?page=1&length=10&sortBy=name&sortOrder=asc&category_id=&name=
exports.GetAll = async (req, res) => {
    var { name, category_id, page, length, sortBy, sortOrder, include } = req.query
    // console.log(req.query)
    var filter = {
        deleted : false, 
    }
    // var name = req.query.name
    if(name){
        filter.name = {
            [Op.like] : `%${name}%`
        }        
    }
    if(category_id){   
        filter.category_id = category_id    
    }
    if(sortBy == 'category'){
        sortBy = category_id
    }
    // console.log(filter)
    var result = await ItemRepo.GetAll({        
        filter : filter, 
        page: page, 
        length: length,
        sortBy: sortBy || 'id',
        sortOrder: sortOrder || 'desc',
        include:[{association: 'category', where:{deleted: false}, required: false}]
    });
    res.json(result)
}

exports.GetById = async (req, res) => {
    var id = req.query.id
    var result = await ItemRepo.GetById(id)
    res.json(result)
}


// by id 

// exports.Delete = async (req, res) => {
//     var id = req.query.id
//     // console.log(id)
//     var result = await ItemRepo.Delete(id)
//     res.json(result)
// }


// by data 
exports.Delete = async (req, res) => {
    var id = req.query.id ? req.query.id : 0
    var result
    if(id > 0){
        var item = await ItemRepo.GetById(id)
        if(item){
            if(item.image){
                var oldImgPath = path.join(__dirname, '../uploads/images/item', item.image)
            }
            result = await ItemRepo.Delete(item.toJSON())
            if(fs.existsSync(oldImgPath)){
                fs.unlinkSync(oldImgPath)
            }
        }
    }
    res.json(result)
}


exports.Save = async (req, res) => {
    // console.log(req.body)
    var item = {
        id: null,
        name: '',
        category_id:'',
        image: '',
        price:'',
        deleted: false
    }
    item = req.body
    if(req.file){
        item.image = req.file.filename
    }

    if(item.id > 0){
        var oldItemImgPath
        var oldItem = await ItemRepo.GetById(item.id)
        oldItemImgPath = path.join(__dirname, '../uploads/images/item', oldItem.image)
    }

    var result = await ItemRepo.SaveOrUpdate(item)
    
    if(fs.existsSync(oldItemImgPath)){
        fs.unlinkSync(oldItemImgPath)
    }
    
    res.json(result)
}

exports.GetByCategoryId = async (req, res) => {
    var id = req.query.category_id ? req.query.category_id : 0
    var filter = {
        deleted : false
    }
    if(id > 0){
        filter.category_id = id
    }

    var result = await ItemRepo.CustomQueryFindAll({
        filter: filter
    })

    res.json(result)
}