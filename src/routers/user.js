const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user.js')
const auth = require('../middleware/auth.js')
//Destrutturazione ES6: preleva solamente sendWelcomeEmail dall'oggetto restituito da account.js
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account.js')
//Creazione di un nuovo router
const router = new express.Router()


//Endpoint /users: richiesta di POST (creazione di una risorsa di tipo User)
router.post('/users', async (req, res) => {
    //Creazione di un nuovo utente
    const user = new User(req.body)

    //Salvataggio di un utente
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        //Generazione del token
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
        //Se il salvataggio non va a buon fine viene restituito un errore
    } catch (e) {
        res.status(400).send(e)
    }
})

//Endpoint /users/login: richiesta di POST (login di un utente)
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

//Endpoint /users/logout: richiesta di POST (logout di una sessione di un utente)
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

//Endpoint /users/logoutAll: richiesta di POST (logout di tutte le sessioni di un utente)
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

//Endpoint /users/me: richiesta di GET (lettura del profilo dell'utente loggato)
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user)
})

//Endpoint /users/me: richiesta di PATCH (update di una specifica risorsa di tipo User).
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

//Endpoint /users/me: richiesta di DELETE (eliminazione del profilo di un utente).
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

//Creazione di un oggetto per l'upload dei dati
const upload = multer({
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

//Endpoint /users/me/avatar: richiesta di POST (upload dell'avatar di un utente)
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    //req.file.buffer contiene i dati binari dell'immagine che vengono passati da upload.single. Questi dati vengono passati a Sharp che tramite .resize effettua il resize dell'immagine, e tramite .png la converte in formato png. Infine con il metodo .toBuffer viene restituito un buffer di dati binari dell'immagine modificata
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    //L'immagine così modificata viene salvata nel campo avatar del modello user
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => { // <-- Callback per il controllo di eventuali errori durante la procedura di upload.
    res.status(400).send({ error: error.message })
})

//Endpoint /users/me/avatar: richiesta di DELETE (rimozione dell'avatar di un utente)
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

//Endpoint /users/:id/avatar: richiesta di GET (lettura dell'avatar di un utente)
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        //Fornisce all'header del requester HTTP informazioni sul tipo di dati sta ricevendo
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})


/*----------------------------------------------------------------------------------------------------------------------------*/


//Esportazione di router
module.exports = router