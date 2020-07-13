const express = require('express')
const path = require('path')

const listsItemsRouter = express.Router()
const bodyParser = express.json()

listsItemsRouter
   .route('/')
   .get((req, res) => {
      res.send('You got the lists-items')
   })

module.exports = listsItemsRouter