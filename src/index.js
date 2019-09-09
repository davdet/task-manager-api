const express = require('express')
//Non è necessario creare una variabile perché non verrà estratto nulla da mongoose.js: è necessario solo che mongoose.js venga aperto per connettere mongoose al db.
require('./db/mongoose.js')
//Importazione del router per le CRUD sulle risorse di tipo User
const userRouter = require('./routers/user.js')
//Importazione del router per le CRUD sulle risorse di tipo Task
const taskRouter = require('./routers/task.js')

//Creazione applicazione express
const app = express()
//Definizione della porta
const port = process.env.PORT || 3000




const multer = require('multer')
const upload = multer({
    dest: 'images',
    limits: {
        //Limite del file da uploadare in byte
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(doc|docx)$/)) {
            return cb(new Error('Please upload a Word document'), undefined)
        }

        cb(undefined, true)
        // cb(new Error('File must be a PDF'), undefined)
        // cb(undefined, true)
        // cb(undefined, false)
    }
})

const errorMiddleware = (req, res, next) => {
    throw new Error('From my middleware')
}

app.post('/upload', upload.single('upload'), (req, res) => {
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})




//Parsing automatico dei dati JSON
app.use(express.json())
//Utilizzo dei router
app.use(userRouter)
app.use(taskRouter)

//Inizializzazione del server
app.listen(port, () => {
    console.log('Server is up on port ' + port + '.')
})