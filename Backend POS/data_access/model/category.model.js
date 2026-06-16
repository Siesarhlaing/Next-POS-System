const { DataTypes } = require('sequelize')
const sequelize = require('../database')

const Category = sequelize.define("tbl_category", {
    id:{
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true,
        allowNull : true
    },
    name:{
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    image:{
        type: DataTypes.STRING,
        allowNull: true
    },
    deleted:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
},{
    freezeTableName: true,
    timestamps:false
})

module.exports = Category