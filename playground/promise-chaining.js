require('../src/db/mongoose')
const User=require('../src/models/user')

const updateAgeAndCount=async(id, age)=>{
    const user=await User.findByIdAndUpdate(id, {age})
    const count=await User.countDocuments({age})
    return {user, count}
}

updateAgeAndCount('5d6906b27e24f5460f6f6c21', 2).then((count)=>{
    console.log(count)
}).catch((e)=>{
    console.log(e)
})

// Equivalente di quanto sopra ma senza async/await

// User.findByIdAndUpdate('5d691ae7b41ecd4f5106b86d', {age: 1}).then((user)=>{
//     console.log(user)
//     return User.countDocuments({age: 1})
// }).then((result)=>{
//     console.log(result)
// }).catch((e)=>{
//     console.log(e)
// })