const express=require('express')
//Non è necessario creare una variabile perché non verrà estratto nulla da mongoose.js: è necessario solo che mongoose.js venga aperto per connettere mongoose al db.
require('./db/mongoose.js')
const User=require('./models/user.js')
const Task=require('./models/task.js')

//Creazione applicazione express
const app=express()
//Definizione della porta
const port=process.env.PORT || 3000

//Parsing automatico dei dati JSON
app.use(express.json())

//Creazione endpoint /users: richiesta di POST (creazione di una risorsa di tipo User)
app.post('/users', (req, res)=>{
    //Creazione di un nuovo utente
    const user=new User(req.body)

    //Salvataggio di un nuovo utente
    user.save().then(()=>{
        res.send(user)
    }).catch((e)=>{
        //Cambia lo stato in 400: BAD REQUEST e manda l'errore al client
        res.status(400).send(e)
        //Versione estesa del comando precedente
        // res.status(400)
        // res.send(e)
    })
})

//Creazione endpoint /tasks: richiesta di POST (creazione di una risorsa di tipo Task)
app.post('/tasks', (req, res)=>{
    const task=new Task(req.body)

    task.save().then(()=>{
        res.send(task)
    }).catch((e)=>{
        res.status(400).send(e)
    })

})

//Inizializzazione del server
app.listen(port, ()=>{
    console.log('Server is up on port ' + port + '.')
})