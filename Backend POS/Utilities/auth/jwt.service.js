const jwt = require('jsonwebtoken')

const dotenv = require('dotenv')
dotenv.config()

let secretKey = process.env.SECRET_KEY

// console.log(secretKey)
exports.GenerateToken = (user) => {
    let payload = {
        id: user.id,
        role_id: user.role_id
    }

    return jwt.sign(payload, secretKey, {expiresIn: '30d'})
}

exports.AuthGuard = (req, res, next) => {
    //authorization : Bearer Token
    const authHeader = req.headers['authorization']
    const tokenHeader = authHeader && authHeader.split(' ')
    if(!tokenHeader || tokenHeader.length < 2){
        return res.status(401).json({message: 'Unauthorized'})
    }    
    const token = tokenHeader[1]
    jwt.verify(token, secretKey, (err, user) => {
        if(err){
            console.log(err)
            return res.status(401).json({message: 'Unauthorized'})
        }
        req.user = user
        next()
    })
}