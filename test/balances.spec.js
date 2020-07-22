const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')
const setTZ = require('set-tz')
const { expect } = require('chai')

describe.only('Balances service object', () => {
   let db

   const {
      testUsers,
      testBalances
   } = helpers.makeFixturesBalances()

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
   
   // GET Balances
   describe(`GET /api/balances`, () => {
      context(`Given no balances`, () => {
         beforeEach(`insert users`, () => helpers.seedUsers(db, testUsers))

         it(`Responds 200 and with an empty balances array`, () => {
            return supertest(app)
               .get('/api/balances')
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(200, [])
         })
      })

      context(`Given there are balances in the db`, () => {
         beforeEach(`insert balances`, () => helpers.seedBalancesTable(db, testUsers, testBalances))

         it(`Responds with 200 and users balance`, () => {
            const expectedBalance = testBalances.filter(balance => balance.user_id === testUsers[0].id)
            return supertest(app)
               .get('/api/balances')
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(200, expectedBalance)
         })
      })
   })

// END Tests
})

