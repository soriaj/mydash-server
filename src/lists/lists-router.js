const express = require('express')
const path = require('path')

const listRouter = express.Router()
const bodyParser = express.json()

listRouter
   .route('/')
   .get((req, res) => {
      res.send('You got to the lists api')
   })

module.exports = listRouter