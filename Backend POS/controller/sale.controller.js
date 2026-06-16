const sequelize = require('../data_access/database')
const sale = require('../data_access/model/sale.model')
const saleHistory = require('../data_access/model/sale_history.model')
const RepositoryBase = require('../data_access/repository.base')
const saleRepo = new RepositoryBase(sale)
const saleHistoryRepo = new RepositoryBase(saleHistory)
const { Op } = require('sequelize')


exports.GetAll = async (req, res) => {

    var { fromDate, toDate, page, length, sortBy, sortOrder, include } = req.query  
    // console.log(req.query)
    var whereSale = {
        deleted : false,       
    }

    // console.log(req.query)      
    var filter = {
        deleted : false
    }
    
    if(fromDate && toDate){
        whereSale.date = {
            [Op.between] : [`${fromDate} 00:00:00`, `${toDate} 23:59:59`]
        }
    }

    if(sortBy = 'name'){
        sortBy = 'item_id'
    }
    // console.log(filter)

    var result = await saleHistoryRepo.GetAll({
        filter: filter, 
        page: page,
        length: length,
        sortBy: sortBy || 'id',
        sortOrder: sortOrder || 'desc',
        include: [
            {association: 'item', where: {deleted: false}, required: false},
            {association: 'sale', where: whereSale, required: true}            
        ]
    })
    
    res.json(result)
}

exports.GetAllSale = async (req, res) => {
    var {page, length, sortBy, sortOrder, include} = req.query

    var filter = {
        deleted: false
    }

    var result = await saleRepo.GetAll({
        filter: filter,
        page: page,
        length: length,
        sortBy: sortBy,
        sortOrder: sortOrder,
        include: []
    })

    res.json(result)
}

exports.Save = async (req, res) => {
    const { items, date }  = req.body    
    var result
    // console.log(req.body)

    if (!items || items.length === 0){
        return res.json({success: false, message: "No Items have included."})
    }
    var totalAmount = 0
    var totalItem = 0

    items.forEach(function (item) {
        totalAmount += item.qty * item.price      
        totalItem += item.qty
    })

    // const t = await sequelize.transaction()
    try{
        const saleResult = await saleRepo.SaveOrUpdate(
            {
                id: null,
                total_item: totalItem, 
                total_amount: totalAmount,
                date: date ? new Date(date) : new Date()
            }, 
            // {
            //     transaction: t 
            // }
        )

        const sale = saleResult.data 

        for(var item of items){
            // console.log(sale.id)
            result = await saleHistoryRepo.SaveOrUpdate({
                id: null, 
                sale_id : sale.id,
                item_id : item.id,
                total_sale_item : item.qty,
                item_per_price : item.price,
                total_sale_amount : item.price * item.qty
            }, 
            // {
            //     transaction: t
            // }
        )}

        // await t.commit()
        res.json(result)
    }
    catch(error){
        // await t.rollback()
        console.log(error)
        res.status(500).json({success: false, message: error.message})
    }    
}



