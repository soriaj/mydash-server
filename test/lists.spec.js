
const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')


describe('Lists service object', () => {
   let db

   const {
      testUsers,
      testLists
   } = helpers.makeFixtures()

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
   
   describe('GET /api/lists', () => {
      context(`Given no lists`, () => {
         beforeEach(`insert users`, () => {
            helpers.seedUsers(db, testUsers)
         })
         
         it(`responds with 200 and empty list`, () => {
            return supertest(app)
               .get('/api/lists')
               .set(`Authorization`, helpers.makeAuthHeader(testUsers[0]))
               .expect(200, [])
         })
      })

      context(`Given there are lists in the db`, () => {
         beforeEach(`insert lists`, () => {
            helpers.seedListsTable(db, testUsers, testLists)
         })

         it(`responds with 200 and all of the lists`, () => {
            const expectedLists = testLists.map(list => 
               helpers.makeExpectedLists(testUsers, list)
            )
            return supertest(app)
               .get('/api/lists')
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(200, expectedLists)
         })
      })
   })
   
})

