const express = require('express')
const path = require('path')
const UsersService = require('./users-service')

const usersRouter = express.Router()
const bodyParser = express.json()

usersRouter
   .post('/', bodyParser, (req, res, next) => {
      const { full_name, email, user_name, password } = req.body
      const newUser = { full_name, email, user_name, password }
      const knexInstance = req.app.get('db')

      // Check if any required value has been left out
      for(const [k, v] of Object.entries(newUser)) 
         if(v == null) {
            return res.json(400).json({ error: { message: `Missing '${k}' in request body` }})
         }
      
         // Check for password errors
         const passwordError = UsersService.validatePassword(password)
         if(passwordError) {
            return res.status(400).json({ error: passwordError })
         }
         // Check for duplicate user_name
         UsersService.checkForDuplicateUsers(knexInstance, newUser.user_name)
            .then(user => {
               if(user) {
                  return res.status(400).json({ error: `Username is already exists`})
               }
               // Hash password into the db
               return UsersService.hashPassword(password)
                  .then(hashedPassword => {
                     const newUser = {
                        full_name,
                        email,
                        user_name,
                        password: hashedPassword
                     }
                     // Add new user to the db
                     return UsersService.insertNewUser(knexInstance, newUser)
                        .then(user => {
                           res.status(201)
                           .location(path.posix.join(req.originalUrl, `/${user.id}`))
                           .json(UsersService.serializeUser(user))
                        })
                  })
            })
            .catch(next)
   })

   module.exports = usersRouter