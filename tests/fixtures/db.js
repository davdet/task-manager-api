const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const User = require('../../src/models/user.js')
const Task = require('../../src/models/task.js')


/*----------------------------------------------------------------------------------------------------------------------------*/


//DEFINIZIONE DEGLI UTENTI DA UTILIZZARE NEI TEST CHE NE RICHIEDONO LA PRESENZA NEL DB

//Creazione di un ID tramite Mongoose da assegnare all'utente
const userOneId = new mongoose.Types.ObjectId()

//Creazione di un primo utente di test
const userOne = {
    _id: userOneId,
    name: 'Monica',
    email: 'mon@example.com',
    password: '613so_WhaTH?!',
    tokens: [{
        //Creazione di un token di autenticazione tramite JWT
        token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
    }]
}

//Creazione di un ID tramite Mongoose da assegnare all'utente
const userTwoId = new mongoose.Types.ObjectId()

//Creazione di un secondo utente di test
const userTwo = {
    _id: userTwoId,
    name: 'Jennifer',
    email: 'jen@example.com',
    password: '750hvA_Da!?',
    tokens: [{
        //Creazione di un token di autenticazione tramite JWT
        token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
    }]
}


/*----------------------------------------------------------------------------------------------------------------------------*/


//DEFINIZIONE DELLE TASK DA UTILIZZARE NEI TEST CHE NE RICHIEDONO LA PRESENZA NEL DB

//Creazione di una prima task di test
const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'First task',
    completed: false,
    owner: userOne._id
}

//Creazione di una seconda task di test
const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Second task',
    completed: true,
    owner: userOne._id
}

//Creazione di una terza task di test
const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Third task',
    completed: true,
    owner: userTwo._id
}


/*----------------------------------------------------------------------------------------------------------------------------*/


//SETUP DEL DATABASE PER I TEST

const setupDatabase = async () => {
    //Rimuove tutti gli utenti presenti nel db
    await User.deleteMany()
    //Rimuove tutte le task presenti nel db
    await Task.deleteMany()
    //Salva userOne nel db
    await new User(userOne).save()
    //Salva userTwo nel db
    await new User(userTwo).save()
    //Salva taskOne nel db
    await new Task(taskOne).save()
    //Salva taskTwo nel db
    await new Task(taskTwo).save()
    //Salva taskThree nel db
    await new Task(taskThree).save()
}


/*----------------------------------------------------------------------------------------------------------------------------*/


module.exports = {
    userOne,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}