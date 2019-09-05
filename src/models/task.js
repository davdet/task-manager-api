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