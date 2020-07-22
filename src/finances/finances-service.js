const xss = require('xss')

const FinancesService = {
   getAllFinances(db, user_id) {
      return db
         .from('finances')
         .where('user_id', user_id)
         .select('*')
   },
   insertTransaction(db, newTransaction) {
      return db
         .insert(newTransaction)
         .into('finances')
         .returning('*')
         .then(rows => rows[0])
   },
   serializeFinances(finances) {
      return {
         id: finances.id,
         date: finances.date,
         type: finances.type,
         description: xss(finances.description),
         amount: xss(finances.amount),
         user_id: finances.user_id
      }
   }
}

module.exports = FinancesService