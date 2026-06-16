const express = require('express')
const categoryController = require('../controller/category.controller')
const router = express.Router()
const authService = require('../Utilities/auth/jwt.service')
const upload = require('../Utilities/upload.js')

router.get('/', authService.AuthGuard, categoryController.GetAll)
router.get('/getbyid', categoryController.GetById)
// router.get('/delete', categoryController.Delete)
router.delete('/delete', categoryController.Delete)
router.post('/', upload.single('image'), categoryController.save)
router.get('/excel_export', categoryController.ExcelReport)
router.get('/docx_export', categoryController.ExportDocx)

module.exports = router