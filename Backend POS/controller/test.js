const express = require('express')
const multer = require('multer')
const app = express()

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
})
const upload = multer({ storage })

app.post('/api/items', upload.single('image'), (req, res) => {
  const name = req.body.name
  const imagePath = req.file ? req.file.path : null

  // Save name and imagePath to DB...
  res.json({ message: 'Item created', name, imagePath })
})



// repository SaveOrUpdate method 

async SaveOrUpdate(data, options = {}){
        var result = new CommandResult()
        try{
            if(data.id > 0){
               await this.model.update(data, {where:{id: data.id}, ...options})
                
                result.data = data
                result.success = true
                result.message = 'successfully update'
            }
            else{
                data.id = null            
                result.data = await this.model.create(data, options)
                result.success = true
                result.message = 'Data are successfully save.'
            }
        }
        catch(error){
            result.success = false
            result.message = error
        }
        
        return result
    }


    // controller method 

    exports.save = async (req, res) => {
    // console.log(req.body)
    var category = {
        id: null,
        name: '',
        image: '',
        deleted: false
    }

    category = req.body

    var result = await CategoryRepo.SaveOrUpdate(category)
    res.json(result)
}

