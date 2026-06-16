const { DataTypes } = require('sequelize')
const sequelize = require('../database')
const Category = require('../model/category.model')

const Item = sequelize.define("tbl_item", {
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
    category_id:{
        type: DataTypes.INTEGER, 
        allowNull: false,
        defaultValue: 0
    },
    image:{
        type: DataTypes.STRING,
        allowNull: true
    },
    price:{
        type: DataTypes.DECIMAL(10, 0),
        allowNull: false,
        defaultValue: 0.0
    },
    deleted:{
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
},{
    freezeTableName: true,  //to prevent tableName become plueral noun 
    timestamps:false
})

Item.belongsTo(Category, {foreignKey:'category_id', as:'category'})

module.exports = Item


