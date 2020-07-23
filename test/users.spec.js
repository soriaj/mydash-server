const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')
const { expect } = require('chai')

describe('Users service object', () => {
   let db

   const { testUsers } = helpers.makeFixturesUsers()

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
   
   // POST users
   describe(`POST /api/users`, () => {
      let newUser = {
         full_name: "Test Full Name",
         user_name: "test",
         email: "test.mail@email.com"
      }
      context(`Given password is too short`, () => {
         it(`Repsonds with 400 and error`, () => {
            newUser.password = '1234567'
            return supertest(app)
               .post(`/api/users`)
               .send(newUser)
               .expect(400, { error: `Password must be longer than 8 characters` })
         })
      })

      context(`Given password is too long`, () => {
         it(`Responds with 400 and error`, () => {
            newUser.password = 'CmjUCqbhyPyjfjZOUfvMFGpdcTHjmQXOImsLckqHpTmvrUjtEeSssMezurwFQnlMaxhemqtIw'
            return supertest(app)
               .post(`/api/users`)
               .send(newUser)
               .expect(400, { error: `Password must be less than 72 characters` })
         })
      })

      context(`Given password starts or ends with space`, () => {
         it(`Responds with 400 and error`, () => {
            newUser.password = ' CmjUCqbhyPyjfjZOUfvMFGpdcTHjmQXOImsLc '
            return supertest(app)
               .post(`/api/users`)
               .send(newUser)
               .expect(400, { error: 'Password must not start or end with empty spaces' })
         })
      })
      
      context(`Given password does not contain 1 upper case, lower case, number and special character`, () => {
         it(`Responds with 400 and error`, () => {
            newUser.password = 'CmjXOImsLc1'
            return supertest(app)
               .post(`/api/users`)
               .send(newUser)
               .expect(400, { error: 'Password must contain 1 upper case, lower case, number and special character' })
         })
      })

      context(`Given username aleady exists in the db`, () => {
         beforeEach('insert users',  () => helpers.seedUsers(db, testUsers))

         it(`Responds with 400 and error`, () => {
            const newUser = {
               full_name: "Test Full Name",
               user_name: "javier",
               email: "test.mail@email.com",
               password: 'P!a23456'
            }
            return supertest(app)
               .post('/api/users')
               .send(newUser)
               .expect(400, { error: 'Username is already exists' })
         })
      })

      context(`Given no user exists, new user will be added`, () => {
         it(`Responds with 201 and the new user`, () => {
            const newUser = {
               full_name: "Test Full Name",
               user_name: "test-user",
               email: "test.mail@email.com",
               password: 'P!a23456'
            }
            return supertest(app)
               .post('/api/users')
               .send(newUser)
               .expect(201)
               .expect(res => {
                  expect(res.body).to.have.property('id')
                  expect(res.body.full_name).to.eql(newUser.full_name)
                  expect(res.body.user_name).to.eql(newUser.user_name)
                  expect(res.body.email).to.eql(newUser.email)
                  expect(res.headers.location).to.eql(`/api/users/${res.body.id}`)
               })
         })
      })
   })

// END TEST
})

