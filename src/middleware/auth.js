const jwt = require('jsonwebtoken')
const User = require('../models/user.js')

const auth = async (req, res, next) => {
    try {
        //Estrazione del token dall'header della richiesta. Il metodo .replace sostituisce una stringa con un'altra
        const token = req.header('Authorization').replace('Bearer ', '')
        //Decodifica e verifica che il token sia effettivamente valido e non scaduto
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        //Ricerca dell'utente nel database tramite l'associazione del token appena letto. L'argomento di .findOne è il criterio di ricerca: la prima proprietà dell'oggetto è l'id dell'utente presente nel token, la seconda proprietà dell'oggetto verifica che il token decodificato sia effettivamente presente nell'array dei token dell'utente con quell'id
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

        if (!user) {
            //Se non viene trovato nessun utente, viene inviato un errore che triggera il catch sottostante
            throw new Error()
        }

        //Ai route handler viene restituito il token creando una nuova proprietà nella richiesta (req.token)
        req.token = token
        //Ai route handler viene restituito l'utente creando una nuova proprietà nella richiesta (req.user)
        req.user = user
        next()
    } catch (e) {
        //Se l'utente non risulta autenticato viene restituito un errore
        res.status(401).send({ error: 'Please authenticate' })
    }
}


/*----------------------------------------------------------------------------------------------------------------------------*/


module.exports = auth