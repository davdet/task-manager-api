const express = require('express')
const auth = require('../middleware/auth.js')
const Task = require('../models/task.js')
const router = new express.Router()


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

//Endpoint /tasks: richiesta di GET (lettura di tutte le risorse di tipo Task di un utente in base a diversi criteri di ricerca)
//GET /task?completed=true          task complete o incomplete
//GET /task?limit=10&skip=20        paginazione
//GET /task?sortBy=createdAt:desc   ordine discendente di creazione
router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}

    //Se req.query.completed è stato passato
    if (req.query.completed) {
        //Se il valore di req.query.completed è uguale alla stringa 'true', allora match.completed viene posto a true. Se req.query.completed è diverso dalla stringa 'true', allora match.completed viene posto a false 
        match.completed = req.query.completed === 'true'
    }
    //Se req.query.completed non viene passato, il valore di match.completed rimane undefined e tutte le task vengono visualizzate, sia quelle completate che quelle non completate

    //Se req.query.sortBy è stato passato
    if (req.query.sortBy) {
        //Il valore di req.query.sortBy viene splittato in due dal carattere ':'
        const parts = req.query.sortBy.split(':')
        //console.log(parts[0])
        //console.log(parts[1])
        //sort[parts[0]] contiene il criterio di ricerca mentre parts[1] il modo ascendente o discendente. Se il valore di parts[1] è uguale alla stringa 'desc', allora a sort[parts[0]] viene assegnato il valore -1 (discendente). Se il valore di parts[1] è diverso dalla stringa 'desc', allora a sort[parts[0]] viene assegnato il valore 1 (ascendente)
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                //Esegue il parsing dei numeri contenuti nella stringa req.query.limit
                limit: parseInt(req.query.limit),
                //Esegue il parsing dei numeri contenuti nella stringa req.query.skip
                skip: parseInt(req.query.skip),
                //Ordine ascendente = 1, ordine discendente = -1
                sort
            }
        }).execPopulate()
        res.send(req.user.tasks)
    } catch (e) {
        res.status(500).send()
    }
})

//Endpoint /tasks/:id: richiesta di GET (lettura di una specifica risorsa di tipo Task). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
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

//Endpoint /tasks/:id: richiesta di PATCH (update di una specifica risorsa di tipo Task). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
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

//Endpoint /tasks/:id: richiesta di DELETE (rimozione di una specifica risorsa di tipo Task). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})


/*----------------------------------------------------------------------------------------------------------------------------*/


//Esportazione di router
module.exports = router