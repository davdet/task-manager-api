const express = require('express')
//Non è necessario creare una variabile perché non verrà estratto nulla da mongoose.js: è necessario solo che mongoose.js venga aperto per connettere mongoose al db.
require('./db/mongoose.js')
//Importazione del router per le CRUD sulle risorse di tipo User
const userRouter = require('./routers/user.js')
//Importazione del router per le CRUD sulle risorse di tipo Task
const taskRouter = require('./routers/task.js')

//Creazione applicazione express
const app = express()
//Definizione della porta tramite una variabile d'ambiente
const port = process.env.PORT

//Parsing automatico dei dati JSON
app.use(express.json())
//Utilizzo dei router
app.use(userRouter)
app.use(taskRouter)

//Inizializzazione del server
app.listen(port, () => {
    console.log('Server is up on port ' + port + '.')
})