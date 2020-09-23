const AuthService = require('../auth/auth-service')

function requireAuth(req, res, next) {
   const authToken = req.get('Authorization') || ''
   const knexInstance = req.app.get('db')

   let bearerToken;
   // Check to see if authorization header exists with bearer, if not return an error
   if(!authToken.toLowerCase().startsWith('bearer ')){
      return res.status(401).json({ error: 'Unauthorized request' })
   } else {
      // Set variable bearerToken equal to token value
      bearerToken = authToken.slice('bearer '.length, authToken.length)
   }

   try {
      // Validate jwt signature matches and return payload
      const payload = AuthService.verifyJwt(bearerToken)
      // Verify username from DB
      AuthService.getUserWithUserName(
        knexInstance,
        payload.sub,
      )
      // If no user found return unauthorized request
         .then(user => {
            if (!user) {
              return res.status(401).json({ error: 'Unauthorized request' })
            }
            // Set req.user to DB user and continue
            req.user = user
            next()
         })
         .catch(err => { 
            console.error(err)
            next(err)
         })
   } catch(error) {
      res.status(401).json({ error: 'Unauthorized request' })
   }
}
  
  module.exports = { requireAuth }