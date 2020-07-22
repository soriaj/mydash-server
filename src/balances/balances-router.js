const express = require('express')
const path = require('path')
const { requireAuth } = require('../middleware/basic-auth')
const BalancesService = require('./balances-service')

const balancesRouter = express.Router()
const bodyParser = express.json()

balancesRouter
   .route('/')
   .get(requireAuth, (req, res, next) => {
      const knexInstance = req.app.get('db')
      const user_id = req.user.id

      BalancesService.getAllBalances(knexInstance, user_id)
         .then(balances => res.json(balances.map(BalancesService.serializeBalances)))
         .catch(next)
   })

module.exports = balancesRouter