const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')
const supertest = require('supertest')

describe('Auth service object', () => {
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
   
   // POST auth
   describe(`POST /api/auth/login`, () => {
      context(`Given no users match users in db`, () => {
         beforeEach('insert users', () => helpers.seedUsers(db, testUsers))

         it(`Responds with 400`, () => {
            const userToSearch = {
               user_name: 'usertest',
               password: 'P@ssw0rd'
            }
            return supertest(app)
               .post(`/api/auth/login`)
               .send(userToSearch)
               .expect(400, { error: 'Incorrect username or password' })
         })
      })

      context(`Given login is missing a user_name or pasword`, () => {
         const required = ['user_name', 'password']
         required.forEach(field => {
            const loginUser = {
               user_name: 'usertest',
               password: 'P@ssw0rd'
            }

            it(`Responds with 400 and error message when the '${field}' is missing`, () => {
               delete loginUser[field]
               return supertest(app)
                  .post('/api/auth/login')
                  .send(loginUser)
                  .expect(400, { error: `Missing '${field}' in request body`})
            })
         })
      })

      context(`Given password doesn't match users password`, () => {
         beforeEach('insert users', () => helpers.seedUsers(db, testUsers))

         it(`Responds with 400`, () => {
            const loginUser = {
               user_name: 'user01',
               password: 'WrongPassword'
            }
            return supertest(app)
               .post('/api/auth/login')
               .send(loginUser)
               .expect(400, { error: 'Incorrect username or password' })
         })
      }) 

      context(`Given username and password are correct`, () => {
         beforeEach('insert users', () => helpers.seedUsers(db, testUsers))

         it(`Responds with authToken`, () => {
            const loginUser = {
               user_name: 'javier',
               password: 'password'
            }
            const expectedToken = Buffer.from(`${loginUser.user_name}:${loginUser.password}`).toString('base64')
            return supertest(app)
               .post('/api/auth/login')
               .send(loginUser)
               .expect({ authToken: expectedToken })
         })
      })
   })

// END Tests
})