const sequelize = require('../database')
const { DataTypes } = require('sequelize')

const Role = sequelize.define('tbl_role', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false
    },
    deleted:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
},{
    freezeTableName: true,
    timestamps: false
})

module.exports = Role