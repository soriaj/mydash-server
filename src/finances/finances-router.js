const express = require('express')
const path = require('path')
const { requireAuth } = require('../middleware/basic-auth')
const FinancesService = require('./finances-service')
const FinanceService = require('./finances-service')

const financesRouter = express.Router()
const bodyParser = express.json()

financesRouter
   .route('/')
   .get(requireAuth, (req, res, next) => {
       // Make DB connection
       const knexInstance = req.app.get('db')
       // Get authenticated user.id
       const user_id = req.user.id
       // Call Get All Events from FinancesService
       FinanceService.getAllFinances(knexInstance, user_id)
       .then(finances => res.json(finances.map(FinanceService.serializeFinances)))
       .catch(next)
   })

module.exports = financesRouter