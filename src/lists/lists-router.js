const express = require('express')
const path = require('path')
const ListsService = require('./lists-service')
const ListsItemsService = require('../listsItems/listsItems-service')
const { requireAuth } = require('../middleware/jwt-auth')

const listRouter = express.Router()
const bodyParser = express.json()

listRouter
   .route('/')
   .get(requireAuth, (req, res, next) => {
      // Make DB connection
      const knexInstance = req.app.get('db')
      // Get authenticated user.id
      const user_id = req.user.id
      // Call Get All Lists from ListsService
      ListsService.getAllLists(knexInstance, user_id)
         .then(lists => res.json(lists.map(ListsService.serializeLists)))
         .catch(next)
   })
   .post(requireAuth, bodyParser, (req, res, next) => {
      const { name } = req.body
      const newList = { name }
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

listRouter
   .route('/:list_id')
   .all(requireAuth)
   .all((req, res, next) => {
      const { list_id } = req.params
      const user_id = req.user.id
      const knexInstance = req.app.get('db')

      ListsService.getListById(knexInstance, list_id)
         .then(list => {
            if(!list || list.user_id !== user_id) {
               return res.status(404).json({ error: { message: "List doesn't exist" }})
            }
            res.list = list
            next()
         })
         .catch(next)
   })
   // GET list_id will return list_id list_items
   // Ex: list_id = 1 will return lists_items.list_id = 1
   .get(requireAuth, (req, res, next) => {
      const { list_id } = req.params
      const user_id = req.user.id
      const knexInstance = req.app.get('db')

      ListsService.getItemsWithListId(knexInstance, user_id, list_id)
         .then(items => res.json(items.map(ListsItemsService.serializeListsItems)))
   })
   // POST list_id will add new lists_items with lists_items.list_id equal to req.params
   // Ex: lists_id = 1 will add new lists_items and associate it with lists_items.list_id = 1
   .post(requireAuth, bodyParser, (req, res, next) => {
      const { name } = req.body
      const newListItem = { name }
      const { list_id } = req.params
      const knexInstance = req.app.get('db')
      
      for(const [k, v] of Object.entries(newListItem))
         if(v == null) {
            return res.status(400).json({ error: `Missing '${k} in the request body`})
         }
         
         newListItem.iscomplete = false
         newListItem.user_id = req.user.id
         newListItem.list_id = list_id

         ListsItemsService.insertItem(knexInstance, newListItem)
            .then(list_item => {
               res.status(201)
               .location(path.posix.join(req.originalUrl, `/${list_item.id}`))
               .json(ListsItemsService.serializeListsItems(list_item))
            })
            .catch(next)
   })
   .delete(requireAuth, (req, res, next) => {
      const { list_id } = req.params
      const user_id = req.user.id
      const knexInstance = req.app.get('db')
      
      ListsService.deleteList(knexInstance, list_id)
         .then(() => res.status(204).end()).catch(next)
   })

module.exports = listRouter