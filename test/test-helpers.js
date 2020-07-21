const bcrypt = require('bcryptjs')

function makeUsersArray() {
   return [
      {
         id: 1,
         user_name: 'javier',
         full_name: 'Javier Soria',
         email: 'test.mail@email.com',
         password: 'password',
         date_created: new Date('2020-07-16T16:28:32.615Z').toISOString(),
      },
      {
         id: 2,
         user_name: 'user01',
         full_name: 'User One',
         email: 'user01.mail@email.com',
         password: 'password',
         date_created: new Date('2020-07-16T16:28:32.615Z').toISOString(),
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

function makeListsItemsArray() {
   return [
      {
         id: 1,
         name: '1 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
         iscomplete: false,
         list_id: 1,
         user_id: 1
      },
      {
         id: 2,
         name: '2 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
         iscomplete: false,
         list_id: 1,
         user_id: 1
      },
      {
         id: 3,
         name: '1 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
         iscomplete: false,
         list_id: 2,
         user_id: 2
      },
      {
         id: 4,
         name: '4 Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
         iscomplete: false,
         list_id: 1,
         user_id: 1
      },
   ]
}

function makeEventsArray(user) {
   return [
      {
         id: 1,
         date: new Date('2020-07-21T16:28:32.615Z').toISOString(),
         event_name: "Dinner with folks",
         event_loc: "Downtown",
         description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
         user_id: user[0].id
      },
      {
         id: 2,
         date: new Date('2020-07-21T12:28:32.615Z').toISOString(),
         event_name: "Lunch with friends",
         event_loc: "iron Tavern",
         description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
         user_id: user[0].id
      },
      {
         id: 3,
         date: new Date('2020-07-21T10:28:32.615Z').toISOString(),
         event_name: "Pick Up Flowers",
         event_loc: "Amy's Flowers",
         description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
         user_id: user[0].id
      },
      {
         id: 4,
         date: new Date('2020-07-20T07:40:14.036Z').toISOString(),
         event_name: "Product Pitch",
         event_loc: "Zoom",
         description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
         user_id: user[1].id
      },
   ]
}

function cleanTables(db) {
   return db.transaction(trx => 
      trx.raw(`TRUNCATE lists, lists_items, events, finances, balances, users RESTART IDENTITY CASCADE;`)
   )
}

function makeFixturesLists() {
   const testUsers = makeUsersArray()
   const testLists = makeListsArray(testUsers)
   return { testUsers, testLists }
}

function makeFixturesListsItems() {
   const testUsers = makeUsersArray()
   const testLists = makeListsArray(testUsers)
   const testListsItems = makeListsItemsArray()
   return { testUsers, testLists, testListsItems }
}

function makeFixturesLEvents() {
   const testUsers = makeUsersArray()
   const testEvents = makeEventsArray(testUsers)
   return { testUsers, testEvents }
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

function seedLists(db, lists) {
   const Lists = lists.map(list => ({
      ...list
   }))
   return db.into('lists').insert(Lists)
      .then(() => {
         db.raw(
            `SELECT setval('lists_id_seq', ?)`,
            [lists[lists.length - 1].id],
         )
      })
}

function seedListsItems(db, lists_items) {
   const ListsItems = lists_items.map(items => ({
      ...items
   }))
   return db.into('lists_items').insert(ListsItems)
      .then(() => {
         db.raw(
            `SELECT setval('lists_items_id_seq', ?)`,
            [lists_items[lists_items.length - 1].id],
         )
      })
}

function seedEvents(db, events) {
   const Events = events.map(event => ({
      ...event
   }))
   return db.into('events').insert(Events)
      .then(() => {
         db.raw(
            `SELECT setval('events_id_seq', ?)`,
            [events[events.length - 1].id]
         )
      })
}

function seedListsTable(db, users, lists) {
   return db.transaction(async trx => {
      await seedUsers(trx, users)
      await seedLists(trx, lists)
   })
}

function seedListsItemsTable(db, users, lists, lists_items) {
   return db.transaction(async trx => {
      await seedUsers(trx, users)
      await seedLists(trx, lists)
      await seedListsItems(trx, lists_items)
   })
}

function seedEventsTable(db, users, events) {
   return db.transaction(async trx => {
      await seedUsers(trx, users)
      await seedEvents(trx, events)
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
   makeFixturesLists,
   makeFixturesListsItems,
   makeFixturesLEvents,
   makeAuthHeader, 
   seedUsers,
   seedLists, 
   seedListsTable,
   seedListsItemsTable,
   seedEventsTable,
}