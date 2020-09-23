const express = require('express')
const path = require('path')
// const { requireAuth } = require('../middleware/jwt-auth')
const { requireAuth } = require('../middleware/basic-auth')
const EventsService = require('./events-service')

const eventsRouter = express.Router()
const bodyParser = express.json()

eventsRouter
   .route('/')
   .get(requireAuth, (req, res, next) => {
      // Make DB connection
      const knexInstance = req.app.get('db')
      // Get authenticated user.id
      const user_id = req.user.id
      // Call Get All Events from EventsService
      EventsService.getAllEvents(knexInstance, user_id)
         .then(events => res.json(events.map(EventsService.serializeEvents)))
         .catch(next)
   })
   .post(requireAuth, bodyParser, (req, res, next) => {
      const { date, event_name, event_loc, description } = req.body
      const newEvent = { date, event_name, event_loc, description }
      const knexInstance = req.app.get('db')

      // Check event values are not null. If they are event has missing item
      for(const [k, v] of Object.entries(newEvent)) {
         if(v == null) {
            return res.status(400).json({ error: `Missing '${k}' in request body` })
         }
      }
      
      newEvent.user_id = req.user.id
      EventsService.insertEvent(knexInstance, newEvent)
         .then(event => {
            res.status(201)
            .location(path.posix.join(req.originalUrl, `/${event.id}`))
            .json(EventsService.serializeEvents(event))
         })
         .catch(next)
   })

eventsRouter
   .route('/:event_id')
   .all(requireAuth)
   .all((req, res, next) => {
      const { event_id } = req.params
      const user_id = req.user.id
      const knexInstance = req.app.get('db')

      // Verify if an event exist
      EventsService.getEventById(knexInstance, event_id)
         .then(event => {
            if(!event || event.user_id !== user_id) {
               return res.status(404).json({ error: { message: `Event doesn't exist` }})
            }
            res.event = event
            next()
         })
         .catch(next)
   })
   .get((req, res) => res.json(EventsService.serializeEvents(res.event)))
   .delete(requireAuth, (req, res, next) => {
      const { event_id } = req.params
      const knexInstance = req.app.get('db')

      // Delete a specified event
      EventsService.deleteEvent(knexInstance, event_id)
         .then(() => res.status(204).end()).catch(next)
   })
   .patch(requireAuth, bodyParser, (req, res, next) => {
      const { date, event_name, event_loc, description } = req.body
      const eventToUpdate = { date, event_name, event_loc, description }
      const knexInstance = req.app.get('db')
      const { event_id } = req.params

      // Check event values are not false or 0 and return array length
      const eventValuesNotZero = Object.values(eventToUpdate).filter(Boolean).length
      if(eventValuesNotZero === 0) {
         return res.status(400).json({ 
            error: 
               { 
                  message: `Request body must contain either 'date', 'event name', 'event location', description'` 
               }
         })
      }

      eventToUpdate.user_id = req.user.id
      EventsService.updateEvent(knexInstance, eventToUpdate, event_id)
         .then(() => res.status(204).end()).catch(next)
   })

module.exports = eventsRouter