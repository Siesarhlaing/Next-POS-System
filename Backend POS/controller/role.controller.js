const Role = require('../data_access/model/role.model')
const RepositoryBase = require('../data_access/repository.base')
const CommandResult = require('../Utilities/command.result')
const RoleRepo = new RepositoryBase(Role)
const {Op} = require('sequelize')

exports.GetAll = async (req, res) => {
    // res.send('Get all roles')
    var {name, page, length, sortBy, sortOrder} = req.query

    var filter = {
        deleted: false
    }    

    if(name){
     // filter.name = name
        filter.name = {
            [Op.like]:`%${name}%`
        }                 
    }

    var result = await RoleRepo.GetAll({
        filter: filter,
        page : page,
        length : length, 
        sortBy : sortBy,
        sortOrder : sortOrder
    })

    res.json(result)
}

exports.GetById = async (req, res) => {
    var id = req.query.id
    var result = await RoleRepo.GetById(id)
    res.json(result)
}

exports.Delete = async (req, res) => {
    var id = req.query.id ? req.query.id : 0
    var result = new CommandResult()
    if(id > 0){
        var role = await RoleRepo.GetById(id)
        if(role){
            result = await RoleRepo.Delete(role.toJSON())
        }
        else{
            result.success = false
            result.message = "Role not found"
        }
    }
    res.json(result)
}

exports.Save = async (req, res) => {
    var role = {
        id: null,
        name: '',
        deleted: false
    }

    role = req.body
    var result = await RoleRepo.SaveOrUpdate(role)
    res.json(result)
}
