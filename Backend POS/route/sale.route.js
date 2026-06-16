const  express  = require('express')
const SaleController = require('../controller/sale.controller')
const router = express.Router()
const authService = require('../Utilities/auth/jwt.service')

router.get('/sale-history', authService.AuthGuard, SaleController.GetAll)
router.get('/', SaleController.GetAllSale)
router.post('/', SaleController.Save)

module.exports = router