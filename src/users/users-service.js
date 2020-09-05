const xss = require('xss')
const bcrypt = require('bcryptjs')
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
   validatePassword(password){
      if(password.length < 8){
         return 'Password must be longer than 8 characters'
      }
      if(password.length > 72){
         return 'Password must be less than 72 characters'
      }
      if(password.startsWith(' ') || password.endsWith(' ')){
         return 'Password must not start or end with empty spaces'
      }
      if(!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)){
         return 'Password must contain 1 upper case, lower case, number and special character'
      }
      return null
   },
   checkForDuplicateUsers(db, user_name) {
      return db
         .from('users')
         .where('user_name', user_name)
         .first()
         .then(user => !!user)
   },
   hashPassword(password){
      return bcrypt.hash(password, 12)
   },
   insertNewUser(db, newUser) {
      return db.raw(
         `with new_user as (
            INSERT INTO users (user_name, full_name, email, password)
            values ('${newUser.user_name}', '${newUser.full_name}', '${newUser.email}', '${newUser.password}')
            returning id
         )
         INSERT INTO balances (balance, user_id)
         values 
         (0.00,
            (select id from new_user)
         );`
      )
   },
   returnUserFullName(db, user_id) {
      return db
         .select('full_name', 'email')
         .from('users')
         .where('id', user_id)
   },
   serializeUser(user) {
      return {
         id: user.id,
         full_name: xss(user.full_name),
         email: xss(user.email),
         user_name: xss(user.user_name)
      }
   }
}

module.exports = UsersService