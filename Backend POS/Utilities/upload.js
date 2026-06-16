const express = require('express')
const multer = require('multer')
const path = require ('path')
const fs = require('fs')


//storage config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
         // Extract type from req.body or req.params or req.query
        let type  = req.body.type || 'default'
        let uploadPath = `uploads/images/${type}`

        // Create folder if not exists
        if(!fs.existsSync(uploadPath)){
            fs.mkdirSync(uploadPath, {recursive: true})
        }
        cb(null, uploadPath)

    },    
    filename: (req, file, cb) => {
        // const ext = path.extname(file.originalname)
        const uniImageName = Date.now() + '_' + file.originalname
        cb(null, uniImageName)
    }  
})

//file filter (allow only image)
const fileFilter = (req, file, cb) => {
    const allowTypes = ['image/jpeg', 'image/jpg', 'image/png']
    if(allowTypes.includes(file.mimetype)) cb(null, true)
    else cb(new error('Image types jpeg, jpg, png are only allowed. '), false)
}

const upload = multer({storage, fileFilter})
module.exports = upload