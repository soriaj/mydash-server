const xss = require('xss')

const ListsItemsService = {
   // Get and return all lists items from lists_item DB table
   getAllListsItems(db, user_id) {
      return db
         .from('lists_items')
         .where('user_id', user_id)
         .select('*')
   },
   getListsItemById(db, id) {
      return db
         .from('lists_items')
         .select('*')
         .where('id', id)
         .first()
   },
   // Insert new lists item to lists_items table
   insertItem(db, newItem) {
      return db
         .insert(newItem)
         .into('lists_items')
         .returning('*')
         .then(rows => {
            return rows[0]
         })
   },
   // Delete lists_items that match id
   deleteItem(db, id) {
      return db
         .from('lists_items')
         .where('id', id)
         .delete()
   },
   // serialize lists_items table data for XSS
   serializeListsItems(list_item) {
      return {
         id: list_item.id,
         name: xss(list_item.name),
         iscomplete: list_item.iscomplete,
         list_id: list_item.list_id,
         user_id: list_item.user_id
      }
   }
}

module.exports = ListsItemsService