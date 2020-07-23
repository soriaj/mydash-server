const xss = require('xss')

const BalancesService = {
   getAllBalances(db, user_id) {
      return db
         .select('*')
         .from('balances')
         .where('user_id', user_id)
   },
   getBalanceById(db, id) {
      return db
         .select('*')
         .from('balances')
         .where('id', id)
         .first()
   },
   updateBalance(db, user_id, updatedBalance) {

   },
   serializeBalances(balances) {
      return {
         id: balances.id,
         balance: balances.balance,
         user_id: balances.user_id,
      }
   }
}

module.exports = BalancesService