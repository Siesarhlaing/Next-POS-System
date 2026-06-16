const sequelize = require('../database')
const { DataTypes } = require('sequelize')
const Role = require('./role.model')

const User = sequelize.define('tbl_user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: true
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false,        
    },
    role_id:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    image: {
        type: DataTypes.STRING,
        allowNull: true,        
    },
    password: {
        type: DataTypes.STRING(500),
        allowNull: true
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

User.belongsTo(Role, {foreignKey: 'role_id', as:'role'})
module.exports = User