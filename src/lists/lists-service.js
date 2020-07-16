const xss = require('xss')

const ListsService = {
   getAllLists(db) {
      return db
         .from('lists')
         .select('*')
   },
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