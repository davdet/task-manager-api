const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app.js')
const User = require('../src/models/user.js')


/*----------------------------------------------------------------------------------------------------------------------------*/


//DEFINIZIONE DI UN UTENTE DA UTILIZZARE NEI TEST CHE RICHIEDONO LA PRESENZA DI UN UTENTE NEL DB

//Creazione di un ID tramite Mongoose da assegnare all'utente
const userOneId = new mongoose.Types.ObjectId()

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


/*----------------------------------------------------------------------------------------------------------------------------*/


//DEFINIZIONE DELLE OPERAZIONI PRELIMINARI

//Definizione delle operazioni da effettuare prima di ogni test
beforeEach(async () => {
    //Rimuove tutti gli utenti del db in maniera tale da poter eseguire il test di creazione dell'utente più volte, senza che fallisca a causa della presenza di dati uguali
    await User.deleteMany()
    //Salva userOne nel db
    await new User(userOne).save()
})


/*----------------------------------------------------------------------------------------------------------------------------*/


//Test sulla creazione di un nuovo utente
test('Should signup a new user', async () => {
    //Esegue una richiesta di POST all'app Express sull'endpoint /user (creazione di un utente)
    //La variabile response contiene il body della risposta
    const response = await request(app).post('/users').send({
        //Definisce i dati dell'utente di test da inserire
        name: 'Dave',
        email: 'dv@example.com',
        password: 'MyPazz666#'
    //Controlla che il codice HTTP restituito sia 201 (created)
    }).expect(201)

    //Conferma che l'utente è stato inserito correttamente nel database andando a cercarlo tramite il suo ID
    const user = await User.findById(response.body.user._id)
    expect(user).not.toBeNull()

    //Conferma che l'utente inserito nel db ha almeno i seguenti campi
    expect(response.body).toMatchObject({
        user: {
            name: 'Dave',
            email: 'dv@example.com'
        },
        token: user.tokens[0].token
    })

    //Conferma che la password dell'utente inserito nel db non è stata salvata in plain text
    expect(user.password).not.toBe('MyPazz666#')
})

//Test sul login di un utente (userOne)
test('Should login existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: userOne.email,
        password: userOne.password
    }).expect(200)

    //Conferma che l'utente ha ricevuto un nuovo token di autorizzazione
    const user = await User.findById(userOne._id)
    expect(response.body.token).toBe(user.tokens[1].token)
})

//Test sul login di un utente
test('Should not login nonexistent user', async () => {
    await request(app).post('/users/login').send({
        email: 'wrong@example.com',
        password: 'noWAY!714'
    }).expect(400)
})

//Test sulla lettura del profilo di un utente loggato (userOne)
test('Should get profile for user', async () => {
    await request(app)
        .get('/users/me')
        //Setup dell'autorizzazione (invio del token di userOne) nell'header della richiesta HTTP
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)
})

//Test sulla lettura del profilo di un utente non loggato
test('Should not get profile for unauthenticated user', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401)
})

//Test sull'eliminazione dell'account di un utente loggato
test('Should delete account for user', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200)

    //Conferma che l'account è stato eliminato
    const user = await User.findById(userOne._id)
    expect(user).toBeNull()
})

//Test sull'eliminazione dell'account di un utente non loggato
test('Should not delete account for unauthenticated user', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401)
})

//Test sull'upload dell'avatar
test('Should upload avatar image', async () => {
    await request(app)
        .post('/users/me/avatar')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        //Permette di allegare un file alla richiesta. Il primo argomento è il form field e il secondo è il path al file
        .attach('avatar', 'tests/fixtures/profile-pic.jpg')
        .expect(200)
    
    //Conferma che i dati binari dell'immagine sono stati memorizzati nel buffer
    const user = await User.findById(userOne._id)
    //Per confrontare due oggetti va utilizzato .toEqual in quanto .toBe utilizza l'operatore triple equals (===)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

//Test sull'update di una proprietà consentita
test('Should update valid user fields', async () => {
    const response = await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Jennifer'
        })
        .expect(200)

    //Conferma che il nome è stato cambiato
    const user = await User.findById(userOne._id)
    expect(user.name).toEqual('Jennifer')
})

//Test sull'update di una proprietà non consentita
test('Should not update invalid user fields', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            tokens: []
        })
        .expect(401)

    //Conferma di non aver svuotato l'array dei token
    const user = await User.findById(userOne._id)
    expect(user.tokens).not.toBeNull()
})