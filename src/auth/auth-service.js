const bcrypt = require('bcryptjs')

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
   parseBasicToken(token) {
     return Buffer.from(token, 'base64').toString().split(':')
   },
}
 
module.exports = AuthService