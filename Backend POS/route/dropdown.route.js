const express = require('express')
const {route}  = require('./category.route')
const router = express.Router()
const dropdwonController = require('../controller/dropdown.controller')
const itemController = require('../controller/item.controller')
const authService = require('../Utilities/auth/jwt.service')

router.get('/get_category_list', authService.AuthGuard,  dropdwonController.GetCategoryList)
router.get('/get_role_list', dropdwonController.GetRoleList)
router.get('/get_item_list_by_category_id', itemController.GetByCategoryId)

module.exports = router 

