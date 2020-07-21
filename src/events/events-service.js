const xss = require('xss')

const EventService = {
   getAllEvents(db, user_id) {
      return db
         .from('events')
         .where('user_id', user_id)
         .select('*')
   },
   getEventById(db, id) {
      return db
         .select('*')
         .from('events')
         .where('id', id)
         .first()
   },
   insertEvent(db, newEvent) {
      return db
         .insert(newEvent)
         .into('events')
         .returning('*')
         .then(rows => rows[0])
   },
   deleteEvent(db, id) {
      return db
         .from('events')
         .where('id', id)
         .delete()
   },
   updateEvent(db, newEventData, id) {
      return db
         .from('events')
         .where('id', id)
         .update(newEventData)
   },
   serializeEvents(events) {
      return {
         id: events.id,
         date: events.date,
         event_name: xss(events.event_name),
         event_loc: xss(events.event_loc),
         description: xss(events.description),
         user_id: events.user_id
      }
   }
}

module.exports = EventService