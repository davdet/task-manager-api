const app = require('./app')
//Definizione della porta tramite una variabile d'ambiente
const port = process.env.PORT

//Inizializzazione del server
app.listen(port, () => {
    console.log('Server is up on port ' + port + '.')
})