const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')

describe('Lists Items service object', () => {
   let db

   const {
      testUsers,
      testLists,
      testListsItems
   } = helpers.makeFixturesListsItems()

   before(`make db connection instance`, () => {
      db = knex({
         client: 'pg',
         connection: process.env.TEST_DATABASE_URL,
      })
      app.set('db', db)
   })

   after('disconnect from db', () => db.destroy())

   before('cleanup', () => helpers.cleanTables(db))

   afterEach('cleanup tables', () => helpers.cleanTables(db))
   
   //GET lists items test
   describe(`GET /api/lists_items`, () => {
      context(`Given no lists items`, () => {
         beforeEach(`insert users`, () => helpers.seedUsers(db, testUsers))

         it(`Respond with 200 and empty lists items`, () => {
            return supertest(app)
               .get(`/api/lists_items`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(200, [])
         })
      })

      context(`Given there are lists items in db return users data`, () => {
         beforeEach(`insert lists items`, () => {
            helpers.seedListsItemsTable(db, testUsers, testLists, testListsItems)
         })
         
         it(`responds with 200 and user lists items`, () => {
            const expectedListsItems = testListsItems.filter(items => items.user_id === testUsers[0].id)
            return supertest(app)
               .get('/api/lists_items')
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(200, expectedListsItems)
         })
      })
   })

   // PATCH lists items 
   describe(`PATCH /api/lists_items/:lists_itemId`, () => {
      context(`Given no lists items`, () => {
         beforeEach('insert useres', () => helpers.seedUsers(db, testUsers))

         it(`Responds with 404`, () => {
            const lists_itemId = 999
            return supertest(app)
               .patch(`/api/lists_items/${lists_itemId}`)
               .set(`Authorization`, helpers.makeAuthHeader(testUsers[0]))
               .expect(404, { error: { message: `List Item doesn't exist` }})
         })
      })

      context(`Given tehre are lists items in the db`, () => {
         beforeEach(`insert lists items`, () => helpers.seedListsItemsTable(db, testUsers, testLists, testListsItems))

         it(`Responds with 204 and patches iscomplete`, () => {
            const listsItemToUpdate = 1
            const updatedListItem = {
               iscomplete: true
            }
            const findListsItemToUpdate = testListsItems.filter(item => item.id === listsItemToUpdate)
            const expectedListsItems = {
               ...findListsItemToUpdate,
               ...updatedListItem
            }
            return supertest(app)
               .patch(`/api/lists_items/${listsItemToUpdate}`)
               .set(`Authorization`, helpers.makeAuthHeader(testUsers[0]))
               .send(updatedListItem)
               .expect(204)
               .then(res => {
                  supertest(app)
                     .get(`/api/lists_items/${listsItemToUpdate}`)
                     .set(`Authorization`, helpers.makeAuthHeader(testUsers[0]))
                     .expect(expectedListsItems)
               })
         })
      })
   })

   //DELETE lists items test
   describe(`DELETE /api/lists_items/:lists_itemId`, () => {
      context(`Given no lists items`, () => {
         beforeEach(`insert users`, () => helpers.seedUsers(db, testUsers))

         it(`Responds with 404`, () => {
            const lists_itemId = 44
            return supertest(app)
               .delete(`/api/lists_items/${lists_itemId}`)
               .set(`Authorization`, helpers.makeAuthHeader(testUsers[0]))
               .expect(404, { error: { message: `List Item doesn't exist` }})
         })
      })

      context(`Given there are lists items in the DB`, () => {
         beforeEach(`insert lists items`, () => helpers.seedListsItemsTable(db, testUsers, testLists, testListsItems))

         it(`Responds with 204 and removes the lists item`, () => {
            const idToRemove = 1
            const expectedListsItem = testListsItems.filter(item => item.id !== idToRemove)
            return supertest(app)
               .delete(`/api/lists_items/${idToRemove}`)
               .set(`Authorization`, helpers.makeAuthHeader(testUsers[0]))
               .expect(204)
               .then(res => {
                  supertest(app)
                     .get(`/api/lists`)
                     .set(`Authorization`, helpers.makeAuthHeader(testUsers[0]))
                     .expect(expectedListsItem)
               })
         })
      })
   })

})