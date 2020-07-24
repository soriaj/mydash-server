const xss = require('xss')

const ListsService = {
   // Get and return all items from lists Db table
   getAllLists(db, user_id) {
      return db
         .from('lists')
         .where('user_id', user_id)
         .select('*')
   },
   getListById(db, id) {
      return db
         .from('lists')
         .select('*')
         .where('id', id)
         .first()
   },
   getItemsWithListId(db, user_id, id) {
      return db
         .from('lists_items')
         .where('user_id', user_id)
         .where('list_id', id)
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
   deleteList(db, id) {
      return db
         .from('lists')
         .where('id', id)
         .delete()
   },
   // serialize list table data for XSS
   serializeLists(list) {
      return {
         id: list.id,
         name: xss(list.name),
         user_id: list.user_id
      }
   }
}

module.exports = ListsService