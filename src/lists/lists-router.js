const express = require('express')
const path = require('path')
const ListsService = require('./lists-service')
const { requireAuth } = require('../middleware/basic-auth')

const listRouter = express.Router()
const bodyParser = express.json()

listRouter
   .route('/')
   .all(requireAuth)
   .get((req, res, next) => {
      const knexInstance = req.app.get('db')
      ListsService.getAllLists(knexInstance)
         .then(lists => {
            res.json(lists.map(ListsService.serializeLists))
         })
         .catch(next)
   })
   

module.exports = listRouter