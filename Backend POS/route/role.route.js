const  express  = require('express')
const RoleController = require('../controller/role.controller')
const router = express.Router()
const authService = require('../Utilities/auth/jwt.service')

router.get('/', authService.AuthGuard, RoleController.GetAll)
router.get('/getbyid', RoleController.GetById)
router.delete('/delete', RoleController.Delete)
router.post('/', RoleController.Save)

module.exports = router