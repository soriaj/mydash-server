const express = require('express')
const path = require('path')
const ListsService = require('./lists-service')
const { requireAuth } = require('../middleware/basic-auth')

const listRouter = express.Router()
const bodyParser = express.json()

listRouter
   .route('/')
   .get(requireAuth, (req, res, next) => {
      // Make DB connection
      const knexInstance = req.app.get('db')
      // Call Get All Lists from ListsService
      ListsService.getAllLists(knexInstance)
         .then(lists => res.json(lists.map(ListsService.serializeLists)))
         .catch(next)
   })
   .post(requireAuth, bodyParser, (req, res, next) => {
      const { name, content } = req.body
      const newList = { name, content }
      const knexInstance = req.app.get('db')

      // Check newList doesn't contain null values
      for(const [k, v] of Object.entries(newList))
         if(v == null) {
            return res.status(400).json({ error: `Missing '${k}' in the request body`})
         }
      // Add authenicated users id to newList
      newList.user_id = req.user.id
      // Call insert list from ListsService
      ListsService.insertList(knexInstance, newList)
         .then(list => {
            res.status(201)
            .location(path.posix.join(req.originalUrl, `/${list.id}`))
            .json(ListsService.serializeLists(list))
         })
         .catch(next)
   })

   
module.exports = listRouter