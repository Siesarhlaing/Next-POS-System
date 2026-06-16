const  express  = require('express')
const UserController = require('../controller/user.controller')
const router = express.Router()
const authService = require('../Utilities/auth/jwt.service')
const upload = require('../Utilities/upload')


router.get('/', authService.AuthGuard, UserController.GetAll)
router.get('/getbyid', UserController.GetById)
router.delete('/delete', UserController.Delete)
router.post('/', upload.single('image'), UserController.Save)

module.exports = router