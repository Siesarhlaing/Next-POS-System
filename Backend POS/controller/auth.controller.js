const { where } = require("sequelize")
const User = require("../data_access/model/user.model")
const RepositoryBase = require("../data_access/repository.base")
const LoginResult = require("../Utilities/login.result")
const bcrypt = require('bcrypt')
const authService = require('../Utilities/auth/jwt.service')

const UserRepo = new RepositoryBase(User)

exports.Login = async (req, res) => {
    var result = new LoginResult()

    // console.log(req.body)
    var loginuser = {
        username: req.body.username,
        password: req.body.password
    }
    
    var filter = {
        deleted : false,
        name : loginuser.username
    }
    var user = await UserRepo.CustomQuery({
        filter: filter,
        include: [{association: 'role', where: {deleted: false}, required: false}]
    })

    if(user){
        var isMatch = await bcrypt.compare(loginuser.password, user.password)
        if(isMatch){
            result.success = true
            result.message = "Login Successful."
            result.data = user.toJSON()
            result.token = authService.GenerateToken(user)
        }
        else{
            result.success = false
            result.message = "Wrong password"
        }
    }
    else{
        result.success = false
        result.message = "Invalid Login, username does not exit."
    }
    res.json(result)
}

exports.Logout = async (req, res) => {
    
}