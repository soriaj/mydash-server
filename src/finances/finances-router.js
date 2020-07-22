const express = require('express')
const path = require('path')
const { requireAuth } = require('../middleware/basic-auth')
const FinancesService = require('./finances-service')

const financesRouter = express.Router()
const bodyParser = express.json()

financesRouter
   .route('/')
   .get(requireAuth, (req, res, next) => {
       // Make DB connection
       const knexInstance = req.app.get('db')
       // Get authenticated user.id
       const user_id = req.user.id
       // Get all finances from FinancesService
       FinancesService.getAllFinances(knexInstance, user_id)
       .then(finances => res.json(finances.map(FinancesService.serializeFinances)))
       .catch(next)
   })
   .post(requireAuth, bodyParser, (req, res, next) => {
      const { date, type, description, amount } = req.body
      const newTransaction = { date, type, description, amount }
      const knexInstance = req.app.get('db')

      // Check newTransaction values are not null. If they are the transaction has missing item
      for(const [k, v] of Object.entries(newTransaction)) {
         if(v == null) {
            return res.status(400).json({ error: `Missing '${k}' in request body` })
         }
      }

      newTransaction.user_id = req.user.id
      FinancesService.insertTransaction(knexInstance, newTransaction)
         .then(trx => {
            res.status(201)
            res.location(path.posix.join(req.originalUrl, `/${trx.id}`))
            .json(FinancesService.serializeFinances(trx))
         })
         .catch(next)      
   })

financesRouter
   .route('/:finance_id')
   .all(requireAuth)
   .all((req, res, next) => {
      const { finance_id } = req.params
      const user_id = req.user.id
      const knexInstance = req.app.get('db')

      FinancesService.getFinanceById(knexInstance, finance_id)
         .then(trx => {
            if(!trx || trx.user_id !== user_id) {
               return res.status(404).json({ error: { message: `Transaction doesn't exist` }})
            }
            res.trx = trx
            next()
         })
         .catch(next)
   })
   .get((req, res) => res.json(FinancesService.serializeFinances(res.trx)))

module.exports = financesRouter