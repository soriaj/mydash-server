const express = require('express')
const path = require('path')

const financesRouter = express.Router()
const bodyParser = express.json()

financesRouter
   .route('/')
   .get((req, res) => {
      res.send('You made it to the finances')
   })

module.exports = financesRouter