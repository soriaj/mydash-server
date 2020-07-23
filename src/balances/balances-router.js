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

balancesRouter
   .route('/:balance_id')
   .all(requireAuth)
   .all((req, res, next) => {
      const knexInstance = req.app.get('db')
      const { balance_id } = req.params
      const user_id = req.user.id

      BalancesService.getBalanceById(knexInstance, balance_id)
         .then(balance => {
            if(!balance || balance.user_id !== user_id) {
               return res.status(404).json({ error: { message: `Balance doesn't exist` }})
            }
            res.balance = balance
            next()
         })
         .catch(next)
   })
   .get((req, res) => res.json(BalancesService.serializeBalances(res.balance)))


module.exports = balancesRouter