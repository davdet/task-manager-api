const express=require('express')
const Task=require('../models/task.js')
const router=new express.Router()



/********************************/
/************ CREATE ************/
/********************************/

//Endpoint /tasks: richiesta di POST (creazione di una risorsa di tipo Task)
router.post('/tasks', async(req, res)=>{
    const task=new Task(req.body)

    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})


/******************************/
/************ READ ************/
/******************************/

//Endpoint /tasks: richiesta di GET (lettura di tutte le risorse di tipo Task)
router.get('/tasks', async(req, res)=>{
    try{
        const tasks=await Task.find({})
        res.send(tasks)
    }catch(e){
        res.status(500).send()
    }
})

//Endpoint /tasks: richiesta di GET (lettura di una specifica risorsa di tipo Task). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
router.get('/tasks/:id', async(req, res)=>{
    const _id=req.params.id

    try{
        const task=await Task.findById(_id)

        if(!task){
            return res.status(404).send()
        }

        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})


/********************************/
/************ UPDATE ************/
/********************************/

//Endpoint /tasks: richiesta di PATCH (update di una specifica risorsa di tipo Task). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
router.patch('/tasks/:id', async(req, res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=['description', 'completed']
    const isValidOperation=updates.every((update)=>allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(401).send({error: 'Invalid or non-authorized updates.'})
    }

    try{
        const task=await Task.findById(req.params.id)

        updates.forEach((update)=>task[update]=req.body[update])
        await task.save()

        // const task=await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

        if(!task){
            return res.status(400).send()
        }

        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})


/********************************/
/************ DELETE ************/
/********************************/

//Endpoint /tasks: richiesta di DELETE (rimozione di una specifica risorsa di tipo Task). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
router.delete('/tasks/:id', async(req, res)=>{
    try{
        const task=await Task.findByIdAndDelete(req.params.id)

        if(!task){
            return res.status(400).send()
        }

        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})


/*----------------------------------------------------------------------------------------------------------------------------*/


//Esportazione di router
module.exports=router