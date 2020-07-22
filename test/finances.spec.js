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

    // POST Finances
    describe(`POST /api/finances`, () => {
      context(`Given no finances`, () => {
         beforeEach(`insert users`, () => helpers.seedUsers(db, testUsers))

         it(`Create a new transaction, responding with 201 and the new transaction`, function() {
            this.retries(3)

            const newTransaction = {
               date: new Date(),
               type: "credit",
               description: "Side Gig",
               amount: "$2,550.35",
               user_id: testUsers[0].id
            }
            return supertest(app)
               .post(`/api/finances`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .send(newTransaction)
               .expect(201)
               .expect(res => {
                  const expectedDate = new Date(newTransaction.date).toISOString()
                  const actualDate = new Date(res.body.date).toISOString()
                  expect(res.body).to.have.property('id')
                  expect(expectedDate).to.eql(actualDate)
                  expect(res.body.type).to.eql(newTransaction.type)
                  expect(res.body.description).to.eql(newTransaction.description)
                  expect(res.body.amount).to.eql(newTransaction.amount)
                  expect(res.header.location).to.eql(`/api/finances/${res.body.id}`)
               })
               .then(postRes => {
                  supertest(app)
                     .get(`/api/finances/${postRes.body.id}`)
                     .expect(postRes.body)
               })
         })

         const required = ['date', 'type', 'amount']
         required.forEach(field => {
            const newTransaction = {
               date: new Date(),
               type: "credit",
               description: "Side Gig",
               amount: "$2,550.35",
               user_id: testUsers[0].id
            }
            it(`Responds with 400 and error message when the '${field}' is missing`, () => {
               delete newTransaction[field]
               return supertest(app)
                  .post(`/api/finances`)
                  .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                  .send(newTransaction)
                  .expect(400, { error: `Missing '${field}' in request body` })
            })
         })
      })
   })

// END tests  
})
