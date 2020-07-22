const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')
const setTZ = require('set-tz')
const { expect } = require('chai')
setTZ('UTC')

describe('Events service object', () => {
   let db

   const {
      testUsers,
      testEvents
   } = helpers.makeFixturesEvents()

   before(`Make db connection instance`, () => {
      db = knex({
         client: 'pg',
         connection: process.env.TEST_DATABASE_URL,
      })
      app.set('db', db)
   })

   after('disconnect from db', () => db.destroy())

   before('cleanup', () => helpers.cleanTables(db))

   afterEach('cleanup tables', () => helpers.cleanTables(db))
   
   // GET Events
   describe(`GET /api/events`, () => {
      context(`Given no events`, () => {
         beforeEach(`insert users`, () => helpers.seedUsers(db, testUsers))

         it(`responds with 200 and empty events lists`, () => {
            return supertest(app)
               .get('/api/events')
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(200, [])
         })
      })

      context(`Given there are events in the db`, () => {
         beforeEach(`insert events`, () => helpers.seedEventsTable(db, testUsers, testEvents))

         it(`Responds with 200 and all users events`, () => {
            const expectedEvents = testEvents.filter(event => event.user_id === testUsers[0].id)
            return supertest(app)
               .get('/api/events')
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(200, expectedEvents)
         })
      })
   })

    // GET Events by id
    describe(`GET /api/evets/:event_id`, () => {
      context('Given no events', () => {
         beforeEach(`insert useres`, () => helpers.seedUsers(db, testUsers))
         
         it(`Responds with 404`, () => {
            const eventId = 1234
            return supertest(app)
               .get(`/api/events/${eventId}`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(404, { error: { message: `Event doesn't exist` }})
         })
      })
   })

   // POST Event
   describe(`POST /api/events`, () => {
      context(`Given no events`, () => {
         beforeEach('insert users', () => helpers.seedUsers(db, testUsers))

         it(`Create a new event, responding with 201 and the new event`, function() {
            this.retries(3)

            const newEvent = {
               date: new Date(),
               event_name: "Test New Event",
               event_loc: "Test Event Location",
               description: "Lorem ipsum dolor sit amet",
               user_id: testUsers[0].id
            }
            return supertest(app)
               .post('/api/events')
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .send(newEvent)
               .expect(201)
               .expect(res => {
                  const expectedDate = new Date(newEvent.date).toISOString()
                  const actualDate = new Date(res.body.date).toISOString()
                  expect(res.body).to.have.property('id')
                  expect(expectedDate).to.eql(actualDate)
                  expect(res.body.event_name).to.eql(newEvent.event_name)
                  expect(res.body.event_loc).to.eql(newEvent.event_loc)
                  expect(res.body.description).to.eql(newEvent.description)
                  expect(res.headers.location).to.eql(`/api/events/${res.body.id}`)
               })
               .then(postRes => {
                  supertest(app)
                     .get(`/api/events/${postRes.body.id}`)
                     .expect(postRes.body)
               })
         })

         const required = ['date', 'event_name']
         required.forEach(field => {
            const newEvent = {
               date: new Date(),
               event_name: "Test New Event",
               event_loc: "Test Event Location",
               description: "Lorem ipsum dolor sit amet",
               user_id: testUsers[0].id
            }

            it(`Responds with 400 and error message when the '${field}' is missing`, () => {
               delete newEvent[field]
               return supertest(app)
                  .post('/api/events')
                  .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                  .send(newEvent)
                  .expect(400, { error: `Missing '${field}' in request body` })
            })
         })
      })
   })

   // DELETE Event
   describe(`DELETE /api/events/:event_id`, () => {
      context(`Given no event`, () => {
         beforeEach('insert users', () => helpers.seedUsers(db, testUsers))

         it(`Responds with 404`, () => {
            const eventId = 1234
            return supertest(app)
               .delete(`/api/events/${eventId}`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(404, { error: { message: `Event doesn't exist` }})
         })
      })

      context(`Given there are events in the db`, () => {
         beforeEach('insert events', () => helpers.seedEventsTable(db, testUsers, testEvents))

         it(`Responds with 204 and then removes the event from the db`, () => {
            const eventIdToRemove = 1
            const expectedEvents = testEvents.filter(event => event.id !== eventIdToRemove)
            return supertest(app)
               .delete(`/api/events/${eventIdToRemove}`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(204)
               .then(res => {
                  supertest(app)
                     .get(`/api/events`)
                     .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                     .expect(expectedEvents)
               })
         })
      })
   })

   // PATCH Event
   describe(`PATCH /api/events/:event_id`, () => {
      context(`Given no events`, () => {
         beforeEach('insert users', () => helpers.seedUsers(db, testUsers))

         it(`Responds with 404`, () => {
            const eventId = 1234
            return supertest(app)
               .patch(`/api/events/${eventId}`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(404, { error: { message: `Event doesn't exist` }})
         })
      })

      context(`Given there are events in the db`, () => {
         beforeEach('insert events', () => helpers.seedEventsTable(db, testUsers, testEvents))

         it(`Responds with 204 and then updates the event`, () => {
            const eventIdToUpdate = 1
            const updatedEvent = {
               date: new Date(),
               event_name: "Updated Event Name",
               event_loc: "Updated Event Location",
               description: "Updated Event Description",
            }

            const findEventToUpdate = testEvents.filter(event => event.id == eventIdToUpdate)
            const expectedEvent = {
               ...findEventToUpdate,
               ...updatedEvent
            }
            return supertest(app)
               .patch(`/api/events/${eventIdToUpdate}`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .send(updatedEvent)
               .expect(204)
               .then(res => {
                  supertest(app)
                     .get(`/api/events/${eventIdToUpdate}`)
                     .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                     .expect(expectedEvent)
               })
         })

         it(`Responds with 400 when required fields are not add`, () => {
            const eventIdToUpdate = 1
            return supertest(app)
               .patch(`/api/events/${eventIdToUpdate}`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .send({ fakeData: `This data shouldn't be udpated` })
               .expect(400, { error: { message: `Request body must contain either 'date', 'event name', 'event location', description'` }})
         })

         it(`Responds with 204 when updating only a part of the event`, () => {
            const eventIdToUpdate = 1
            const updatedEvent = { description: 'Updated Event Description'}
            const findEventToUpdate = testEvents.filter(event => event.id == eventIdToUpdate)
            const expectedEvent = {
               ...findEventToUpdate,
               ...updatedEvent
            }
            return supertest(app)
               .patch(`/api/events/${eventIdToUpdate}`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .send({ ...updatedEvent, fakeData: `This data shouldn't be updated` })
               .expect(204)
               .then(res => {
                  supertest(app)
                     .get(`/api/events/${eventIdToUpdate}`)
                     .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                     .expect(expectedEvent)
               })
         })
      })
   })

// END TESTS   
})
