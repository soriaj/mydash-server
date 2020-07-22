const xss = require('xss')

const FinanceService = {
   getAllFinances(db, user_id) {
      return db
         .from('finances')
         .where('user_id', user_id)
         .select('*')
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

module.exports = FinanceService