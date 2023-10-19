const {Pool, Client } = require('pg')
//const client = new Client()

//const pool = new Pool()

const pool = new Pool({
    user: 'sa',
    host: 'localhost',
    database: 'eevent',
    password: '123',
    port: 5432,
  })

  pool.query('SELECT NOW()', (err, res) => {
    console.log(err, res.rows)
    pool.end()
  })

  const client = new Client({
    user: 'sa',
    host: 'localhost',
    database: 'eevent',
    password: '123',
    port: 5432,
  })
  client.connect()

  const text = 'SELECT * FROM cidade WHERE nome = $1'
  const values = ['Formiga']

  client
    .query(text, values)  
    .then(res => {
        console.log(res.rows)
        client.end()
    })
    .catch(e => console.error(e.stack))
  