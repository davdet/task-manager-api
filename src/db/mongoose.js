const mongoose = require('mongoose')

//Connessione di mongoose al database
mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
})