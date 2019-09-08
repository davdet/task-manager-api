const mongoose = require('mongoose')

//Definizione del modello 'Task'
const Task = mongoose.model('Task', {
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        //Il tipo è un ObjectId di Mongoose
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        //Crea una relazione tra questo campo e un altro modello (User)
        ref: 'User'
    }
})

// //Creazione di una variabile che usa il modello 'Tasks'
// const task=new Task({
//     //description: 'Prepare dinner',
//     completed: false
// })

// //Salvataggio della variabile nel db
// task.save().then(()=>{
//     console.log(task)
// }).catch((error)=>{
//     console.log('Error!', error)
// })

module.exports = Task