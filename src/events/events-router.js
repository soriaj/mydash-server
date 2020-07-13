const express = require('express')
const path = require('path')

const eventsRouter = express.Router()
const bodyParser = express.json()

eventsRouter
   .route('/')
   .get((req, res) => {
      res.send('You made it to the events')
   })

module.exports = eventsRouter