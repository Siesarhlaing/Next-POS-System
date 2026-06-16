const sequelize = require('../database')
const { DataTypes } = require('sequelize')
const Sale = require('../model/sale.model')
const Item = require('../model/item.model')

const SaleHistory = sequelize.define('tbl_sale_history', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true,
        allowNull: true
    },
    sale_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    item_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_sale_item: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    item_per_price: {
        type: DataTypes.DECIMAL(10, 0),
        allowNull: false
    },
    total_sale_amount: {
        type: DataTypes.DECIMAL(10, 0),
        allowNull: false,
        defaultValue: 0
    },
    deleted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
},{
    freezeTableName: true,
    timestamps: false
})

SaleHistory.belongsTo(Sale, {foreignKey: 'sale_id', as: 'sale'})
SaleHistory.belongsTo(Item, {foreignKey: 'item_id', as:'item'})

module.exports = SaleHistory