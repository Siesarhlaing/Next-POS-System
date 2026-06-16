const express = require('express')
const sequelize = require('./data_access/database')
const categoryRoute = require('./route/category.route')
const itemRoute = require('./route/item.route')
const bodyParser = require('body-parser')
const cors = require('cors')
const dropdownRoute = require('./route/dropdown.route')
const roleRoute = require('./route/role.route')
const userRoute = require('./route/user.route')
const authRoute = require('./route/auth.route')
const saleRoute = require('./route/sale.route')
const path = require('path')

const app = express()
const port = 8080

app.use(bodyParser.urlencoded()) // for formdata
app.use(bodyParser.json()) // for json data
app.use(cors({origin: '*'})) // to connect allow for all different port
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/category', categoryRoute)
app.use('/api/item', itemRoute)
app.use('/api/dropdown', dropdownRoute)
app.use('/api/role', roleRoute)
app.use('/api/sale', saleRoute)
app.use('/api/user', userRoute)
app.use('/api/auth', authRoute)

sequelize.authenticate().then((res) => {
    console.log("connection is establish.")
})

sequelize.sync().then((res) => {
    app.listen(port, () =>{
    console.log(`http://localhost:${port}`)
    })
})

// to sync data to database and auto redisign table when model is change 

// sequelize.sync({force:true}).then((res) => {
//     app.listen(port, () =>{
//     console.log(`http:localhost:${port}`)
//     })
// })
