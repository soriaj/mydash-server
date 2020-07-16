const bcrypt = require('bcryptjs')

function makeUsersArray() {
   return [
      {
         id: 1,
         user_name: 'javier',
         full_name: 'Javier Soria',
         email: 'test.mail@email.com',
         password: 'password',
         date_created: new Date('2020-07-16T16:28:32.615Z'),
      },
      {
         id: 2,
         user_name: 'user01',
         full_name: 'User One',
         email: 'user01.mail@email.com',
         password: 'password',
         date_created: new Date('2020-07-16T16:28:32.615Z'),
      }
   ]
}

function makeListsArray(users) {
   return [
      {
         id: 1,
         name: 'Packing Items',
         content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
         user_id: users[0].id
      },
      {
         id: 2,
         name: 'ToDo',
         content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
         user_id: users[0].id
      },
      {
         id: 3,
         name: 'Contacts',
         content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
         user_id: users[0].id
      }
   ]
}

function cleanTables(db) {
   return db.transaction(trx => 
      trx.raw(
         `TRUNCATE
         users,
         lists_items,
         events,
         finances,
         balances,
         lists
         `
      )
      .then(() =>
         Promise.all([
            trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
            trx.raw(`SELECT setval('users_id_seq', 0)`),
         ])
      )
   )
}

function makeFixtures() {
   const testUsers = makeUsersArray()
   const testLists = makeListsArray(testUsers)
   return { testUsers, testLists }
}

function seedUsers(db, users) {
   const Users = users.map(user => ({
      ...user,
      password: bcrypt.hashSync(user.password, 1)
   }))
   return db.into('users').insert(Users)
      .then(() => {
         db.raw(
            `SELECT setval('users_id_seq', ?)`,
            [users[users.length - 1].id],
         )
      })
}

function seedListsTable(db, users, lists) {
   return db.transaction(async trx => {
      await seedUsers(trx, users)
      await trx.into('lists').insert(lists)
   })
}

function makeExpectedLists(users, lists) {
   const user = users.find(user => user.id === lists.user_id)
   return {
      id: lists.id,
      name: lists.name,
      content: lists.content,
      user_id: lists.user_id
   }
}

function makeAuthHeader(user) {
   const token = Buffer.from(`${user.user_name}:${user.password}`).toString('base64')
   return `Basic ${token}`
}

module.exports = { 
   cleanTables,
   makeUsersArray, 
   makeListsArray,
   makeExpectedLists,
   makeFixtures,
   makeAuthHeader, 
   seedUsers, 
   seedListsTable,
}