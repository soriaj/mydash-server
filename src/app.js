require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')
const listsRouter = require('./lists/lists-router')
const listsItemsRouter = require('./listsItems/listsItems-router')
const eventsRouter = require('./events/events-router')
const financesRouter = require('./finances/finances-router')
const balancesRouter = require('./balances/balances-router')

const app = express()

app.use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
   skip: () => NODE_ENV === 'test',
}))
app.use(helmet())
app.use(cors())

app.use('/api/lists', listsRouter)
app.use('/api/lists_items', listsItemsRouter)
app.use('/api/events', eventsRouter)
app.use('/api/finances', financesRouter)
app.use('/api/balances', balancesRouter)

app.get('/', (req, res) => {
   res.send('Hello, World!')
})

app.use(function errorHandler(error, req, res, next) {
   let response
   if (NODE_ENV === 'production') {
      response = { error: { message: 'server error' } }
   } else {
      console.error(error)
      response = { message: error.message, error }
   }
   res.status(500).json(response)
})

module.exports = app