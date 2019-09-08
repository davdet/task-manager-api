const express = require('express')
const auth = require('../middleware/auth.js')
const Task = require('../models/task.js')
const router = new express.Router()



/********************************/
/************ CREATE ************/
/********************************/

//Endpoint /tasks: richiesta di POST (creazione di una risorsa di tipo Task)
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        //Copia tutte le proprietà di req.body in questo oggetto 
        ...req.body,
        //Aggiunge l'id dell'utente che ha creato la task
        owner: req.user._id
     })

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})


/******************************/
/************ READ ************/
/******************************/

//Endpoint /tasks: richiesta di GET (lettura di tutte le risorse di tipo Task)
router.get('/tasks', auth, async (req, res) => {
    try {
        const tasks = await Task.find({ owner: req.user._id })
        res.send(tasks)
        //Metodo alternativo alle due linee precedenti utilizzando populate
        // await user.populate('tasks').execPopulate()
        // res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

//Endpoint /tasks: richiesta di GET (lettura di una specifica risorsa di tipo Task). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        //Ricerca una task tramite il suo id e verifica che sia appartenente all'utente attualmente loggato
        const task = await Task.findOne({ _id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})


/********************************/
/************ UPDATE ************/
/********************************/

//Endpoint /tasks: richiesta di PATCH (update di una specifica risorsa di tipo Task). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(401).send({ error: 'Invalid or non-authorized updates.' })
    }

    try {
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(400).send()
        }

        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})


/********************************/
/************ DELETE ************/
/********************************/

//Endpoint /tasks: richiesta di DELETE (rimozione di una specifica risorsa di tipo Task). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(400).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})


/*----------------------------------------------------------------------------------------------------------------------------*/


//Esportazione di router
module.exports = router