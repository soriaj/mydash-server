const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')
const { expect } = require('chai')

describe('Balances service object', () => {
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

   // GET Balances by id
   describe(`Get /api/balances/:balance_id`, () => {
      context(`Given no balances`, () => {
         beforeEach(`insert users`, () => helpers.seedUsers(db, testUsers))

         it(`Responds with 404`, () => {
            const balanceId = 999
            return supertest(app)
               .get(`/api/balances/${balanceId}`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(404, { error: { message: `Balance doesn't exist` }})
         })
      })

      context(`Given there are balacnes in the db`, () => {
         beforeEach(`insert balances`, () => helpers.seedBalancesTable(db, testUsers, testBalances))

         it(`Responds with 200 and the specified balance`, () => {
            const balanceId = 1
            const expectedBalance = testBalances.find(balance => balance.id === balanceId)
            return supertest(app)
               .get(`/api/balances/${balanceId}`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(200, expectedBalance)
         })
      })
   })

   // PATCH Balances by id
   describe(`Patch /api/balances/:balance_id`, () => {
      context(`Given no balances`, () => {
         beforeEach(`insert users`, () => helpers.seedUsers(db, testUsers))

         it(`Responds with 404`, () => {
            const balanceId = 999
            return supertest(app)
               .get(`/api/balances/${balanceId}`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(404, { error: { message: `Balance doesn't exist` }})
         })
      })

      context(`Given there are balancs in the db`, () => {
         beforeEach('insert balances into db', () => helpers.seedBalancesTable(db, testUsers, testBalances))

         it(`Responds with 204 and then updates the balance`, () => {
            const balanceIdToUpdate = 1
            const updatedBalance = {
               balance: '350000.00'
            }

            const findBalanceToUpdate = testBalances.filter(balance => balance.id == balanceIdToUpdate)
            const expectedBalance = { ...findBalanceToUpdate, ...updatedBalance}
            return supertest(app)
               .patch(`/api/balances/${balanceIdToUpdate}`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .send(updatedBalance)
               .expect(204)
               .then(res => {
                  supertest(app)
                     .get(`/api/balances/${balanceIdToUpdate}`)
                     .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                     .expect(expectedBalance)
               })
         })

         it(`Responds with 400 when a balance is not present`, () => {
            const balanceIdToUpdate = 1
            return supertest(app)
               .patch(`/api/balances/${balanceIdToUpdate}`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .send({ fakeBalance: 'This is some non related data to balances' })
               .expect(400, { error: { message: `Request body must contain 'balance'` }})
         })
      })
   })

// END Tests
})

