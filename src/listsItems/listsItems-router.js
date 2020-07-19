const express = require('express')
const path = require('path')
const ListsItemsService = require('./listsItems-service')
const { requireAuth } = require('../middleware/basic-auth')

const listsItemsRouter = express.Router()
const bodyParser = express.json()

listsItemsRouter
   .route('/')
   .get(requireAuth, (req, res, next) => {
       // Make DB connection
       const knexInstance = req.app.get('db')
      // Get authenticated user.id
      const user_id = req.user.id
       // Call Get All Lists items from ListsItemsService
       ListsItemsService.getAllListsItems(knexInstance, user_id)
          .then(lists_items => res.json(lists_items.map(ListsItemsService.serializeListsItems)))
          .catch(next)
   })
   // .post(requireAuth, bodyParser, (req, res, next) => {
   //    const { name } = req.body
   //    const newListItem = { name }
   //    const { list_id } = req.params
   //    const knexInstance = req.app.get('db')
      
   //    for(const [k, v] of Object.entries(newListItem))
   //       if(v == null) {
   //          return res.status(400).json({ error: `Missing '${key} in the request body`})
   //       }
         
   //       newListItem.iscomplete = false
   //       newListItem.user_id = req.user.id
   //       newListItem.list_id = 2

   //       ListsItemsService.insertItem(knexInstance, newListItem)
   //          .then(list_item => {
   //             res.status(201)
   //             .location(path.posix.join(req.originalUrl, `/${list_item.id}`))
   //             .json(ListsItemsService.serializeListsItems(list_item))
   //          })
   //          .catch(next)
   // })

listsItemsRouter
   .route('/:list_itemId')
   .all(requireAuth)
   .all((req, res, next) => {
      const { list_itemId } = req.params
      const user_id = req.user.id
      const knexInstance = req.app.get('db')

      ListsItemsService.getListsItemById(knexInstance, list_itemId)
         .then(list_item => {
            if(!list_item || list_item.user_id !== user_id ) {
               return res.status(404).json({ error: { message: `List Item doesn't exist` }})
            }
            res.list_item = list_item
            next()
         })
         .catch(next)
   })
   .get((req, res) => {
      res.json(ListsItemsService.serializeListsItems(res.list_item))
   })
   // .post(requireAuth, bodyParser, (req, res, next) => {
   //    const { name } = req.body
   //    const newListItem = { name }
   //    const { list_id } = req.params
   //    const knexInstance = req.app.get('db')
      
   //    for(const [k, v] of Object.entries(newListItem))
   //       if(v == null) {
   //          return res.status(400).json({ error: `Missing '${key} in the request body`})
   //       }
         
   //       newListItem.iscomplete = false
   //       newListItem.user_id = req.user.id
   //       newListItem.list_id = 1

   //       ListsItemsService.insertItem(knexInstance, newListItem)
   //          .then(list_item => {
   //             res.status(201)
   //             .location(path.posix.join(req.originalUrl, `/${list_item.id}`))
   //             .json(ListsItemsService.serializeListsItems(list_item))
   //          })
   //          .catch(next)
   // })
   .delete(requireAuth, (req, res, next) => {
      const { list_itemId } = req.params
      const knexInstance = req.app.get('db')
      ListsItemsService.deleteItem(knexInstance, list_itemId)
         .then(() => {
            res.status(204).end()
         })
         .catch(next)
   })

module.exports = listsItemsRouter