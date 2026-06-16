const User = require("../data_access/model/user.model");
const RepositoryBase = require("../data_access/repository.base");
const UserRepo = new RepositoryBase(User);
const { Op } = require('sequelize')
const bcrypt = require('bcrypt')
const path = require('path');
const fs = require('fs')

exports.GetAll = async (req, res) => {
  var { name, role_id, page, length, sortBy, sortOrder, include } = req.query;
  var filter = {
    deleted: false,
  };

  if (name) {
    filter.name = {
      [Op.like]: `%${name}%`,
    };
  }

  if (role_id) {
    filter.role_id = {
      [Op.like]: `%${role_id}%`,
    };
  }

  if (sortBy === 'role') { 
    sortBy = 'role_id'
  }
  
  var result = await UserRepo.GetAll({
    filter: filter,
    page: page,
    length: length,
    sortBy: sortBy,
    sortOrder: sortOrder,
    include: [
      { association: "role", where: { deleted: false }, required: false },
    ],
  });
  res.json(result);
};

exports.GetById = async (req, res) => {
  var id = req.query.id;
  var result = await UserRepo.GetById(id);
  res.json(result);
};


exports.Delete = async (req, res) => {
  var id = req.query.id ? req.query.id : 0;
  var result;
  if (id > 0) {
    var user = await UserRepo.GetById(id);
    if (user) {
      console.log(user)
      var oldImgPath = null;
      
      if (user.image) {
        oldImgPath = path.join(__dirname, '../uploads/images/user/', user.image);
      }
      
      result = await UserRepo.Delete(user.toJSON());
      
      
      if (oldImgPath && fs.existsSync(oldImgPath)) {
        fs.unlinkSync(oldImgPath);
      }
    }
  }
  res.json(result);
};


exports.Save = async (req, res) => {
  var user = req.body;
  console.log(req.body);

  
  if (req.file) {
    user.image = req.file.filename;
  }

  var oldImgPath = null;
  var shouldDeleteOldImage = false;

  if (user && user.id > 0) {
  
    var existingUser = await UserRepo.GetById(user.id);
    console.log(existingUser);
    
    if (existingUser) {
      
      user.password = existingUser.password;
     
      if (existingUser.image && req.file) {
        oldImgPath = path.join(__dirname, '../uploads/images/user/', existingUser.image);
        shouldDeleteOldImage = true;
      } 
      
      else if (!req.file) {
        user.image = existingUser.image;
      }
    }
  }
  else {
    
    const saltRounds = 10;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
  
  
  var result = await UserRepo.SaveOrUpdate(user);
  
  
  if (shouldDeleteOldImage && oldImgPath && fs.existsSync(oldImgPath)) {
    fs.unlinkSync(oldImgPath);
  }

  res.json(result);
};