require('../src/db/mongoose.js')
const Task=require('../src/models/task.js')

const deleteTaskAndCount=async(id)=>{
    const task=await Task.findByIdAndDelete(id)
    const count=await Task.countDocuments({completed: false})
    return {task, count}
}

deleteTaskAndCount('5d6bb899694c907a6e72d6e9').then((data)=>{
    if(!data.task){
        console.log('Error: no tasks found.')
    }else{
        console.log(data.task)
        console.log(data.count)
    }
}).catch((e)=>{
    console.log(e)
})

// Equivalente di quanto sopra ma senza async/await
// Task.findByIdAndDelete('5d6b9bc7cd79ae6dc843a8bf').then((task)=>{
//     if(!task){
//         console.log('No tasks found.')
//     }else{
//         console.log(task)
//     }
//     return Task.countDocuments({completed: false})
// }).then((result)=>{
//     console.log(result)
// }).catch((e)=>{
//     console.log(e)
// })

