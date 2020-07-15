require('dontenv').config()

const knew = require('knew')
const app = require('./app')
const { PORT, DATABASE_URL } = require('./config')

const db = knew({
   client: 'pg',
   connection: TEST_DATABASE_URL,
})

app.set('db', db)

app.listen(PORT, () => {
   console.log(`Server listening at http://localhost:${PORT}`)
})