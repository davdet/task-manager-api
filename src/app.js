/*Questo file serve per creare la app che verrà esportata ed utilizzata in index.js. E' utile tenere i due file separati perché in questo modo è possibile accedere alle funzionalità di test tramite supertest*/

const express = require('express')
//Non è necessario creare una variabile perché non verrà estratto nulla da mongoose.js: è necessario solo che mongoose.js venga aperto per connettere mongoose al db.
require('./db/mongoose.js')
//Importazione del router per le CRUD sulle risorse di tipo User
const userRouter = require('./routers/user.js')
//Importazione del router per le CRUD sulle risorse di tipo Task
const taskRouter = require('./routers/task.js')

//Creazione applicazione express
const app = express()

//Parsing automatico dei dati JSON
app.use(express.json())
//Utilizzo dei router
app.use(userRouter)
app.use(taskRouter)


/*----------------------------------------------------------------------------------------------------------------------------*/


module.exports = app