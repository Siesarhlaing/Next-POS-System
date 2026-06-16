const express = require('express')
const itemController = require('../controller/item.controller')
const router = express.Router()
const authService = require('../Utilities/auth/jwt.service')
const upload = require('../Utilities/upload')

router.get('/', authService.AuthGuard, itemController.GetAll)
router.get('/getbyid', itemController.GetById)
// router.get('/delete', itemController.Delete)
router.delete('/delete', itemController.Delete)
router.post('/', upload.single('image'), itemController.Save)

module.exports = router