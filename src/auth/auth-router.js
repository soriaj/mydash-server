const express = require('express')
const AuthService = require('./auth-service')

const authRouter = express.Router()
const bodyParser = express.json()

authRouter
   .route('/login')
   .post(bodyParser, (req, res, next) => {
      const { user_name, password } = req.body
      const login = { user_name, password }
      const knexInstance = req.app.get('db')

      // Check user_name or password was provided
      for(const [k, v] of Object.entries(login))
         if(v == null) {
            return res.status(400).json({ error: `Missing '${k}' in request body` })
         }
      
      AuthService.getUserWithUserName(knexInstance, login.user_name)
         .then(dbUser => {
            // If response from db is undefined return error
            if(!dbUser) {
               return res.status(400).json({ error: `Incorrect username or password` })
            }
            // Check if passwords match login
            return AuthService.compareLoginPassword(login.password, dbUser.password)
               .then(passwordMatch => {
                  // If responds from db is undefined return error
                  if(!passwordMatch) {
                     return res.status(400).json({ error: `Incorrect username or password` })
                  }
                  // If username and password match db entry respond with JWT authToken
                  const sub = dbUser.user_name
                  const payload = { sub: sub, user_id: dbUser.id }
                  res.send({ authToken: AuthService.createJwt(payload) })
               })
         })
         .catch(next)
   })

module.exports = authRouter