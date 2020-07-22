const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')
const setTZ = require('set-tz')
const { expect } = require('chai')
// setTZ('UTC')

describe.only('Finances service object', () => {
   let db

   const {
      testUsers,
      testFinances
   } = helpers.makeFixturesFinances()

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
   
   // GET Finances
   describe(`GET /api/finances`, () => {
      context(`Given no finances`, () => {
         beforeEach(`insert users`, () => helpers.seedUsers(db, testUsers))

         it(`responds with 200 and empty finances lists`, () => {
            return supertest(app)
               .get('/api/finances')
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(200, [])
         })
      })

      context(`Given there are finances in the db`, () => {
         beforeEach(`insert finances`, () => helpers.seedFinancesTable(db, testUsers, testFinances))

         it(`Responds with 200 and users finances`, () => {
            const expectedFinances = testFinances.filter(finances => finances.user_id === testUsers[0].id)
            return supertest(app)
               .get(`/api/finances`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(200, expectedFinances)
         })
      })
   })

// END tests  
})
