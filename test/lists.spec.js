const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')

describe('Lists service object', () => {
   let db

   const {
      testUsers,
      testLists
   } = helpers.makeFixturesLists()

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
         beforeEach(`insert users`, () => helpers.seedUsers(db, testUsers))
         
         it(`responds with 200 and empty list`, () => {
            return supertest(app)
               .get('/api/lists')
               .set(`Authorization`, helpers.makeAuthHeader(testUsers[0]))
               .expect(200, [])
         })
      })

      context(`Given there are lists in the db`, () => {
         beforeEach(`insert lists`, () => helpers.seedListsTable(db, testUsers, testLists))

         it(`Responds with 200 and all uesrs lists`, () => {
            const expectedLists = testLists.filter(list => list.user_id === testUsers[0].id)
            return supertest(app)
               .get('/api/lists')
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(200, expectedLists)
         })
      })
   })

   // POST Lists tests
   describe('POST /api/lists', () => {
      beforeEach(`Insert Users into DB`, () => helpers.seedUsers(db, testUsers))

      it(`Create a new list and respond with 201 and the new list`, function() {
         this.retries(3)

         const newList = {
            name: 'New List Title',
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
               expect(res.headers.location).to.eql(`/api/lists/${res.body.id}`)
            })
            .then(postRes => {
               supertest(app)
                  .get(`/api/lists/${postRes.body.id}`)
                  .expect(postRes.body)
            })
      })
   })

   // DELETE Lists test
   describe(`DELETE /api/lists/:list_id`, () => {
      context(`Given lists doesn't exist respond with 404`, () => {
         beforeEach(`insert list into db`, () => helpers.seedListsTable(db, testUsers, testLists))

         it(`Responds with 404`, () => {
            const list_id = 999
            return supertest(app)
               .delete(`/api/lists/${list_id}`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(404, { error: { message: "List doesn't exist" }})
         })
      })

      context(`Given there are lists in the DB`, () => {
         beforeEach('inserts lists into DB', () => helpers.seedListsTable(db, testUsers, testLists))

         it(`Responds with 204 and then removes the list`, () => {
            const listIdToRemove = 2
            const expectedLists = testLists.filter(list => list.id !== listIdToRemove)
            return supertest(app)
               .delete(`/api/lists/${listIdToRemove}`)
               .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
               .expect(204)
               .then(res => {
                  supertest(app)
                     .get('/api/lists')
                     .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
                     .expect(expectedLists)
               })
         })
      })
   })
})