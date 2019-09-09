const express = require('express')
const multer = require('multer')
const User = require('../models/user.js')
const auth = require('../middleware/auth.js')
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
})


/********************************/
/************ [R]EAD ************/
/********************************/

//Endpoint /users/me: richiesta di GET (lettura della risorsa User appartenente all'utente loggato)
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

// //Endpoint /users: richiesta di GET (lettura di una specifica risorsa di tipo User). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
// router.get('/users/:id', async (req, res) => {
//     const _id = req.params.id

//     try {
//         const user = await User.findById(_id)

//         if (!user) {
//             return res.status(404).send()
//         }

//         res.send(user)
//     } catch (e) {
//         res.send(500).send()
//     }

//     //Equivalente a quanto sopra ma senza async/await
//     // User.findById(_id).then((user)=>{
//     //     if(!user){
//     //         return res.status(404).send()
//     //     }

//     //     res.send(user)
//     // }).catch((e)=>{
//     //     res.status(500).send()
//     // })
// })


/**********************************/
/************ [U]PDATE ************/
/**********************************/

//Endpoint /users: richiesta di PATCH (update di una specifica risorsa di tipo User).
router.patch('/users/me', auth, async (req, res) => {
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
        //.forEach esegue una callback per ogni singolo elemento dell'array
        updates.forEach((update) => {
            //Le parentesi quadre servono per accedere dinamicamente ad una proprietà
            req.user[update] = req.body[update]
        })
        //Si attende che il middleware per il salvataggio impostato all'interno di ../models/user.js compia l'hashing della password (nel caso sia stata modificata la password)
        await req.user.save()

        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})


/**********************************/
/************ [D]ELETE ************/
/**********************************/

//Endpoint /users: richiesta di DELETE (rimozione di una specifica risorsa di tipo User).
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
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

//Endpoint per il logout (chiusura di una sessione)
router.post('/users/logout', auth, async (req, res) => {
    try {
        //L'array dei token viene filtrato fino a trovare il token corrispondente a quello dell'attuale login
        req.user.tokens = req.user.tokens.filter((token) => {
            //Il metodo .filter scansiona l'array dei token. Se l'elemento scansionato è diverso da quello ricercato, la callback restituisce true e continua la scansione dell'array, se invece è uguale restituisce false ed elimina l'elemento dall'array. La dicitura token.token serve perché il token è un oggetto che al suo interno ha un id e il token stesso
            return token.token !== req.token
        })
        await req.user.save()

        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//Endpoint per il logout (chiusura di tutte le sessioni di un utente)
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//Endpoint per l'upload di un avatar
//Creazione di un oggetto per l'upload dei dati
const upload = multer({
    dest: 'avatars',
    limits: {
        //Massima dimensione consentita per l'upload (in byte)
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        //Il controllo dell'estensione del file viene fatto con una regex (maggiori informazioni su https://regex101.com)
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image (jpg, jpg, png).', undefined))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', upload.single('avatar'), (req, res) => {
    res.send()
}, (error, req, res, next) => { /*<-- Callback per il controllo di eventuali errori durante la procedura di upload.*/
    res.status(400).send({ error: error.message })
})


/*----------------------------------------------------------------------------------------------------------------------------*/


//Esportazione di router
module.exports = router