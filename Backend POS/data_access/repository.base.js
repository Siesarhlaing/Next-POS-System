const PageResult = require('../Utilities/page.result')
const CommandResult = require('../Utilities/command.result')

class RepositoryBase {
    
    constructor(model){
        this.model = model
    }

    //getAll with Pagination
    //offset mean skip
    //limit mean limit
    async GetAll({filter = {}, page = 1 , length = 10, sortBy = 'id', sortOrder='desc', include = []}){
        var result = new PageResult()
        result.total = await this.model.count({where: filter})
        if(length < 0){
            // console.log("small length less than 0")
            page = 1
            length = result.total
        }
        
        if(result.total > 0 ){
                result.data = await this.model.findAll({
                where: filter,
                order: [[sortBy, sortOrder]],
                //for pagination
                offset: (parseInt(page) - 1 ) * parseInt(length),
                limit: parseInt(length),
                include: include
            })
        }        
        return result
    }

    async Get(){
        var result = await this.model.findAll({where: {deleted: false}})
        return result
    }

    async GetById(id){
        return await this.model.findByPk(parseInt(id))
    }

    // async Delete(id){
    //     var result = this.model.update({deleted:true}, {where:{id}})
    //     return result
    // }

    async Delete(data){
        var result = new CommandResult()
        if(data.id > 0){
            data.deleted = true
            await this.model.update(data, {where:{id: data.id}})
            result.data = data
            result.success = true
            result.message = 'delete successfully'
        }
        
        return result
    }

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

    async CustomQuery({filter={}, include=[]}){
        var data = await this.model.findOne({where:filter, include: include})
        return data
    }

    async CustomQueryFindAll({filter={}, include=[]}){
        var data = await this.model.findAll({where:filter, include: include})
        return data
    }
}

module.exports = RepositoryBase