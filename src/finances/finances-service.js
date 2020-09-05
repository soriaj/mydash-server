const xss = require('xss')
const BalancesService = require('../balances/balances-service')

const FinancesService = {
   getAllFinances(db, user_id) {
      return db
         .from('finances')
         .where('user_id', user_id)
         .select('*')
   },
   getFinanceById(db, id) {
      return db
         .select('*')
         .from('finances')
         .where('id', id)
         .first()
   },
   insertTransaction(db, newTransaction) {
      return db
         .insert(newTransaction)
         .into('finances')
         .returning('*')
         .then(rows => rows[0])
   },
   deleteTransaction(db, transaction_id, user_id) {
      return db.raw(
         `do
         $do$
         begin
            if ((select type from finances where id = ${transaction_id}) = 'credit')
               then update balances set balance = cast(balance as numeric) - (select cast(amount as numeric) from finances where id = ${transaction_id}) where user_id = ${user_id};
               delete from finances where id = ${transaction_id};
            else 
               update balances set balance = cast(balance as numeric) + (select cast(amount as numeric) from finances where id = ${transaction_id}) where user_id = ${user_id};
               delete from finances where id = ${transaction_id};
            end if;
         end
         $do$
         `
      )
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