const xss = require('xss')

const ListsService = {
   // Get and return all items from lists Db table
   getAllLists(db) {
      return db
         .from('lists')
         .select('*')
   },
   insertList(db, newList) {
      return db
         .insert(newList)
         .into('lists')
         .returning('*')
         .then(rows => {
            return rows[0]
         })
   },
   // serialize list table data for XSS
   serializeLists(list) {
      return {
         id: list.id,
         name: xss(list.name),
         content: xss(list.content),
         user_id: list.user_id
      }
   }
}

module.exports = ListsService