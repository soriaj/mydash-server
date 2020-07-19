const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')
const { makeExpectedListsItems } = require('./test-helpers')

describe.only('Lists Items service object', () => {
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
         beforeEach(`insert users`, () => {
            helpers.seedUsers(db, testUsers)
         })

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

   //GET lists items test
   describe(`GET /api/lists`, () => {
      context(`Given no lists items`, () => {
         beforeEach(`insert users`, () => {
            helpers.seedUsers(db, testUsers)
         })

         it(`Respond with 200 and empty lists items`, () => {
            return supertest(app)
               .get(`/api/lists_items`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(200, [])
         })
      })
   })

})