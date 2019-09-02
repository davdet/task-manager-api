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



/****************************************/
/************CREATE ENDPOINTS************/
/****************************************/

//Endpoint /users: richiesta di POST (creazione di una risorsa di tipo User)
app.post('/users', async(req, res)=>{
    //Creazione di un nuovo utente
    const user=new User(req.body)

    //Salvataggio di un utente
    try{
        await user.save()
        res.status(201).send(user)
    //Se il salvataggio non va a buon fine viene restituito un errore
    }catch(e){
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

//Endpoint /tasks: richiesta di POST (creazione di una risorsa di tipo Task)
app.post('/tasks', async(req, res)=>{
    const task=new Task(req.body)

    try{
        await task.save()
        res.status(201).send(task)
    }catch(e){
        res.status(400).send(e)
    }
})



/**************************************/
/************READ ENDPOINTS************/
/**************************************/

//Endpoint /users: richiesta di GET (lettura di tutte le risorse di tipo User)
app.get('/users', async(req, res)=>{
    try{
        const users=await User.find({})
        res.send(users)
    }catch(e){
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
app.get('/users/:id', async(req, res)=>{
    const _id=req.params.id

    try{
        const user=await User.findById(_id)

        if(!user){
            return res.status(404).send()
        }

        res.send(user)
    }catch(e){
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

//Endpoint /tasks: richiesta di GET (lettura di tutte le risorse di tipo Task)
app.get('/tasks', async(req, res)=>{
    try{
        const tasks=await Task.find({})
        res.send(tasks)
    }catch(e){
        res.status(500).send()
    }
})

//Endpoint /tasks: richiesta di GET (lettura di una specifica risorsa di tipo Task). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
app.get('/tasks/:id', async(req, res)=>{
    const _id=req.params.id

    try{
        const task=await Task.findById(_id)

        if(!task){
            return res.status(404).send()
        }

        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})



/****************************************/
/************UPDATE ENDPOINTS************/
/****************************************/

//Endpoint /users: richiesta di PATCH (update di una specifica risorsa di tipo User). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
app.patch('/users/:id', async(req, res)=>{
    //Restituisce un array con le chiavi di tutte le proprietà in req.body
    const updates=Object.keys(req.body)
    //Array statico che contiene le chiavi delle proprietà che possono essere modificate
    const allowUpdates=['name', 'email', 'password', 'age']
    //Il metodo .every esegue una callback per tante volte quanti sono gli elementi di updates. Il metodo .includes verifica che il parametro update (singolo elemento di updates) sia presente in una qualsiasi posizione dell'array allowUpdates. Se è presente ritorna true, altrimenti ritorna false. Alla fine se every avrà restituito tutti true, isValidOperation verrà posta a true; se anche un solo ciclo di every avrà restituito false, isValidOperation verrà posta a false
    const isValidOperation=updates.every((update)=>{
        return allowUpdates.includes(update)
    })

    if(!isValidOperation){
        return res.status(401).send({error: 'Invalid or non-authorized updates.'})
    }

    try{
        //Primo argomento: id; secondo argomento: proprietà da modificare; terzo argomento: opzioni
        const user=await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

        if(!user){
            return res.status(404).send()
        }

        res.send(user)
    }catch(e){
        res.status(400).send(e)
    }
})

//Endpoint /tasks: richiesta di PATCH (update di una specifica risorsa di tipo Task). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
app.patch('/tasks/:id', async(req, res)=>{
    const updates=Object.keys(req.body)
    const allowedUpdates=['description', 'completed']
    const isValidOperation=updates.every((update)=>allowedUpdates.includes(update))

    if(!isValidOperation){
        return res.status(401).send({error: 'Invalid or non-authorized updates.'})
    }

    try{
        const task=await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})

        if(!task){
            return res.status(400).send()
        }

        res.send(task)
    }catch(e){
        res.status(400).send(e)
    }
})



/****************************************/
/************DELETE ENDPOINTS************/
/****************************************/

//Endpoint /users: richiesta di DELETE (rimozione di una specifica risorsa di tipo User). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
app.delete('/users/:id', async(req, res)=>{
    try{
        const user=await User.findByIdAndDelete(req.params.id)

        if(!user){
            return res.status(404).send()
        }

        res.send(user)
    }catch(e){
        res.status(500).send()
    }
})

//Endpoint /tasks: richiesta di DELETE (rimozione di una specifica risorsa di tipo Task). :id fa riferimento a qualcosa di dinamico a cui si accede tramite la proprietà params di req
app.delete('/tasks/:id', async(req, res)=>{
    try{
        const task=await Task.findByIdAndDelete(req.params.id)

        if(!task){
            return res.status(400).send()
        }

        res.send(task)
    }catch(e){
        res.status(500).send()
    }
})






//Inizializzazione del server
app.listen(port, ()=>{
    console.log('Server is up on port ' + port + '.')
})


