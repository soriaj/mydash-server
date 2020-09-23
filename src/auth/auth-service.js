const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config')

const AuthService = {
   getUserWithUserName(db, user_name) {
      return db
         .from('users')
         .where('user_name', user_name)
         .first()
   },
   compareLoginPassword(password, hash) {
      return bcrypt.compare(password, hash)
   },
   createBasicToken(user_name, password) {
      return Buffer.from(`${user_name}:${password}`).toString('base64')
   },
   createJwt(sub, payload) {
      return jwt.sign(payload, config.JWT_SECRET, {
         subject: sub,
         algorithm: 'HS256',
      })
   },
   verifyJwt(token) {
      return jwt.verify(token, config.JWT_SECRET, {
         algorithms: ['HS256'],
      })
   },
   parseBasicToken(token) {
     return Buffer.from(token, 'base64').toString().split(':')
   },
}
 
module.exports = AuthService