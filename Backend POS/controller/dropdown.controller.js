const Category = require("../data_access/model/category.model")
const RepositoryBase = require("../data_access/repository.base")
const Role = require('../data_access/model/role.model')

const CategoryRepo = new RepositoryBase(Category)
const RoleRepo = new RepositoryBase(Role)

exports.GetCategoryList = async(req, res) => {
    var result = await CategoryRepo.Get()
    res.json(result)
}

exports.GetRoleList = async(req, res) => {
    var result = await RoleRepo.Get()
    res.json(result)
}