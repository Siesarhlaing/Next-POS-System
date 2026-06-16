const sequelize = require('../database')
const { DataTypes } = require('sequelize')
const User = require('./user.model')

const Sale = sequelize.define('tbl_sale', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true
    },
    total_item: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 0), 
        allowNull: false,
        defaultValue: 0.0
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
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

module.exports = Sale

// Sale.belongsTo(User, {foreignKey: 'user_id', as: 'user'})