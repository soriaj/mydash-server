const bcrypt = require('bcryptjs')
const AuthService = require('../auth/auth-service')

function requireAuth(req, res, next) {
   const authToken = req.get('Authorization') || ''

   let basicToken
   if(!authToken.toLowerCase().startsWith('basic ')){
      return res.status(401).json({ error: 'Missing basic token' })
   } else {
      basicToken = authToken.slice('basic '.length, authToken.length)
   }
   const [tokenUserName, tokenPassword] = AuthService.parseBasicToken(basicToken)

   if(!tokenUserName || !tokenPassword){
      return res.status(401).json({ error: 'Unauthorized request' })
   }

   AuthService.getUserWithUserName(
      req.app.get('db'),
      tokenUserName
    )
      .then(user => {
         if(!user) {
            return res.status(401).json({ error: 'Unauthorized request' })
         }
         return bcrypt.compare(tokenPassword, user.password)
            .then(passwordsMatch => {
               passwordsMatch ? (req.user = user, next()) : res.status(401).json({ error: `Unauthorized request`}) 
            })
      })
      .catch(next)
}
 
module.exports = { requireAuth }