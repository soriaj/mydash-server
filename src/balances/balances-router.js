const express = require('express')
const path = require('path')

const balancesRouter = express.Router()
const bodyParser = express.json()

balancesRouter
   .route('/')
   .get((req, res) => {
      res.send('You made it to the balances')
   })

module.exports = balancesRouter