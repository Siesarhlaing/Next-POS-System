const { Sequelize } = require('sequelize')


const sequelize = new Sequelize("POS", "root", "soobinroot", {
    host: 'localhost',
    port: 3306, // 3306 is the default MySQL port, change if your Workbench uses a different one
    dialect: 'mysql',
    logging: console.log
});


module.exports = sequelize