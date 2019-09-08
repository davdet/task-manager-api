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

//Registrazione di una funzione middleware
// app.use((req, res, next) => {
//     if (req.method === 'GET') {
//         res.send('GET requests are disabled')
//     } else {
//         //next() viene chiamato per avvertire che il middleware ha terminato il suo corso
//         next()
//     }
// })

// app.use((req, res, next) => {
//     res.status(503).send('The website is under maintenance.')
// })

//Parsing automatico dei dati JSON
app.use(express.json())
//Utilizzo dei router
app.use(userRouter)
app.use(taskRouter)

//Inizializzazione del server
app.listen(port, () => {
    console.log('Server is up on port ' + port + '.')
})

const Task = require('./models/task.js')
const User = require('./models/user.js')

const main = async () => {
    // const task = await Task.findById('5d752ae3ac29b92323928996')
    // //Popola task.owner cercando il suo riferimento all'interno del modello User
    // await task.populate('owner').execPopulate()
    // console.log(task.owner)

    const user = await User.findById('5d75293298a479220236aee6')
    await user.populate('tasks').execPopulate()
    console.log(user.tasks)
}

main()