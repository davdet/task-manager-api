const mongoose = require('mongoose')
const validator = require('validator')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task.js')

//Creazione dello schema per l'oggetto User, in maniera tale da poter utilizzare il middleware per l'hashing della password
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        //Due utenti diversi non possono avere la stessa email
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        //Custom validator per l'email (usa validator)
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        //Custom validator per la password
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('The password cannot contain the word "password".')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        //Custom validator per l'età
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number.')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            require: true
        }
    }]
})

//Creazione di una proprietà virtuale per collegare un utente alle proprie task. Una proprietà virtuale non è un dato contenuto nel database ma una relazione tra due entità
userSchema.virtual('tasks', {
    ref: 'Task',
    //Nome del campo che stabilisce la relazione in questo modello
    localField: '_id',
    //Nome del campo con il quale si vuole stabilire la relazione nell'altro modello
    foreignField: 'owner'
})

//NB: LA DIFFERENZA TRA .methods E .statics È CHE I PRIMI SONO ACCESSIBILI DALLE ISTANZE, MENTRE I SECONDI DAI MODELLI

//Impostazione di un nuovo metodo per la generazione di un token per un utente specifico
userSchema.methods.generateAuthToken = async function () {
    const user = this
    //Generazione del token. Primo argomento: payload (informazioni contenute nel token); secondo argomento: secret per validare il token
    const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewcourse')

    //Salvataggio del token nell'array dei token di un utente
    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

//Quando un documento viene passato a res.send, moongoose converte l'oggetto in un JSON. Il metodo .toJSON è utile per customizzare questo oggetto in maniera tale da poterne modificare alcune delle proprietà (in questo caso vengono oscurate la password e l'array dei token)
userSchema.methods.toJSON = function () {
    const user = this
    //.toObject() è un metodo che mongoose mette a disposizione per restituire un oggetto raw da poter modificare
    const userObject = user.toObject()

    //Eliminazione del campo password
    delete userObject.password
    //Eliminazione dell'array dei token
    delete userObject.tokens

    return userObject
}

//Impostazione di un nuovo metodo per la ricerca di un utente in fase di login
userSchema.statics.findByCredentials = async (email, password) => {
    //.findOne funziona come .findById ma prende come argomento un oggetto di proprietà
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    //Viene comparata la password inserita con quella presente nel database
    const isMatch = await bcryptjs.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

//Impostazione del middleware per l'hashing della password: si usa il metodo .pre per controllare ciò che avviene prima del salvataggio di un nuovo utente
userSchema.pre('save', async function (next) {
    const user = this

    //.isModified controlla che una proprietà sia stata modificata
    if (user.isModified('password')) {
        //brcypts.js esegue l'hashing della password: il primo argomento è la password, il secondo il numero di volte che si vuole far girare l'algoritmo
        user.password = await bcryptjs.hash(user.password, 8)
    }

    //next() viene chiamato per avvertire che il middleware ha terminato il suo corso
    next()
})

//Impostazione del middleware per rimuovere tutte le tasks associate ad un utente che elimina il suo profilo
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})


/*----------------------------------------------------------------------------------------------------------------------------*/


//Definizione del modello 'User'
const User = mongoose.model('User', userSchema)

// //Creazione di una variabile che usa il modello 'User'
// const me=new User({
//     name: 'Trevor',
//     email: 'trevor@oqiewrhgoe.com',
//     password: 'wnvoerpassWOrd123'
// })

// //Salvataggio della variabile nel db
// me.save().then(()=>{
//     console.log(me)
// }).catch((error)=>{
//     console.log('Error!', error)
// })


/*----------------------------------------------------------------------------------------------------------------------------*/


module.exports = User