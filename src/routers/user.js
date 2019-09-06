const express = require('express')
const User = require('../models/user.js')
//Creazione di un nuovo router
const router = new express.Router()



/**********************************/
/************ [C]REATE ************/
/**********************************/

//Endpoint /users: richiesta di POST (creazione di una risorsa di tipo User)
router.post('/users', async (req, res) => {
    //Creazione di un nuovo utente
    const user = new User(req.body)

    //Salvataggio di un utente
    try {
        await user.save()
        //Generazione del token
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
        //Se il salvataggio non va a buon fine viene restituito un errore
    } catch (e) {
        res.status(400).send(e)
    }

    //Equivalente a quanto sopra ma senza async/await
    // user.save().then(()=>{
    //     res.status(201).send(user)
    // }).catch((e)=>{
    //     //Cambia lo stato in 400: BAD REQUEST e manda l'errore al client
    //     res.status(400).send(e)
    //     //Versione estesa del comando precedente
    //     // res.status(400)
    //     // res.send(e)
    // })
})


/********************************/
/************ [R]EAD ************/
/********************************/

//Endpoint /users: richiesta di GET (lettura di tutte le risorse di tipo User)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find({})
        res.send(users)
    } catch (e) {
        res.status(500).send()
    }

    //Equivalente a quanto sopra ma senza async/await
    // User.find({}).then((users)=>{
    //     res.send(users)
    // }).catch((e)=>{
    //     res.status(500).send()
    // })
})

//Endpoint /users: richiesta di GET (lettura di una specifica risorsa di tipo User). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
router.get('/users/:id', async (req, res) => {
    const _id = req.params.id

    try {
        const user = await User.findById(_id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.send(500).send()
    }

    //Equivalente a quanto sopra ma senza async/await
    // User.findById(_id).then((user)=>{
    //     if(!user){
    //         return res.status(404).send()
    //     }

    //     res.send(user)
    // }).catch((e)=>{
    //     res.status(500).send()
    // })
})


/**********************************/
/************ [U]PDATE ************/
/**********************************/

//Endpoint /users: richiesta di PATCH (update di una specifica risorsa di tipo User). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
router.patch('/users/:id', async (req, res) => {
    //Restituisce un array con le chiavi di tutte le proprietà in req.body
    const updates = Object.keys(req.body)
    //Array statico che contiene le chiavi delle proprietà che possono essere modificate
    const allowUpdates = ['name', 'email', 'password', 'age']
    //Il metodo .every esegue una callback per tante volte quanti sono gli elementi di updates. Il metodo .includes verifica che il parametro update (singolo elemento di updates) sia presente in una qualsiasi posizione dell'array allowUpdates. Se è presente ritorna true, altrimenti ritorna false. Alla fine se every avrà restituito tutti true, isValidOperation verrà posta a true; se anche un solo ciclo di every avrà restituito false, isValidOperation verrà posta a false
    const isValidOperation = updates.every((update) => {
        return allowUpdates.includes(update)
    })

    if (!isValidOperation) {
        return res.status(401).send({ error: 'Invalid or non-authorized updates.' })
    }

    try {
        const user = await User.findById(req.params.id)

        //.forEach esegue una callback per ogni singolo elemento dell'array
        updates.forEach((update) => {
            //Le parentesi quadre servono per accedere dinamicamente ad una proprietà
            user[update] = req.body[update]
        })
        //Si attende che il middleware per il salvataggio impostato all'interno di ../models/user.js compia l'hashing della password (nel caso sia stata modificata la password)
        await user.save()

        //Primo argomento: id; secondo argomento: proprietà da modificare; terzo argomento: opzioni. Questa procedura non va bene nel caso si volesse utilizzare un middleware (come quello per l'hashing della password) perché ne farebbe l'override
        // const user=await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(400).send(e)
    }
})


/**********************************/
/************ [D]ELETE ************/
/**********************************/

//Endpoint /users: richiesta di DELETE (rimozione di una specifica risorsa di tipo User). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(500).send()
    }
})


/**********************************/
/************ NON-CRUD ************/
/**********************************/

//Endpoint per il login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        //Restituisce un oggetto con sia l'user che il token
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})


/*----------------------------------------------------------------------------------------------------------------------------*/


//Esportazione di router
module.exports = router