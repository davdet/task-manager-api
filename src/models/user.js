const mongoose=require('mongoose')
const validator=require('validator')
const bcryptjs=require('bcryptjs')

//Creazione dello schema per l'oggetto User, in maniera tale da poter utilizzare il middleware per l'hashing della password
const userSchema=new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        //Custom validator per l'email (usa validator)
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    password:{
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        //Custom validator per la password
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('The password cannot contain the word "password".')
            }
        }
    },
    age:{
        type: Number,
        default: 0,
        //Custom validator per l'età
        validate(value){
            if(value<0){
                throw new Error('Age must be a positive number.')
            }
        }
    }
})

//Impostazione del middleware per l'hashing della password: si usa il metodo .pre per controllare ciò che avviene prima del salvataggio di un nuovo utente
userSchema.pre('save', async function(next){
    user=this

    //.isModified controlla che una proprietà sia stata modificata
    if(user.isModified('password')){
        //brcypts.js esegue l'hashing della password: il primo argomento è la password, il secondo il numero di volte che si vuole far girare l'algoritmo
        user.password=await bcryptjs.hash(user.password, 8)
        console.log('Password updated.')
    }

    //next() viene chiamato per dire avvertire che il middleware ha terminato il suo corso.
    next()
})

//Definizione del modello 'User'
const User=mongoose.model('User', userSchema)

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

module.exports=User