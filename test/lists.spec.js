
const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')
const { expect } = require('chai')


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
   
   // GET Lists tests
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

   // POST Lists tests
   describe('POST /api/lists', () => {
      beforeEach(`insert lists into db`, () => {
         helpers.seedListsTable(
            db,
            testUsers,
            testLists
         )
      })

      it(`Create a new list and respond with 201 and the new lsit`, function() {
         this.retries(3)

         const newList = {
            name: 'New List Title',
            content: 'New List Content',
            user_id: testUsers[0].id
         }
         return supertest(app)
            .post('/api/lists')
            .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
            .send(newList)
            .expect(201)
            .expect(res => {
               expect(res.body).to.have.property('id')
               expect(res.body.name).to.eql(newList.name)
               expect(res.body.content).to.eql(newList.content)
               expect(res.headers.location).to.eql(`/api/lists/${res.body.id}`)
            })
            .then(postRes => {
               supertest(app)
                  .get(`/api/lists/${postRes.body.id}`)
                  .expect(postRes.body)
            })
      })
   })
   
})

