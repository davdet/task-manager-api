const mongoose=require('mongoose')
const validator=require('validator')

//Definizione del modello 'User'
const User=mongoose.model('User', {
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