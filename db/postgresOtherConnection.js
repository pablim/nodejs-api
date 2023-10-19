const { Pool } = require('pg')

const otherDBPool = new Pool({
	user: process.env.POSTGRES_OTHER_DBUSER,
	host: process.env.POSTGRES_OTHER_DBHOST,
	database: process.env.POSTGRES_OTHER_DATABASE,
	password: process.env.POSTGRES_OTHER_DBPASSWORD,
	port: process.env.POSTGRES_OTHER_DBPORT
})

// the pool will emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
otherDBPool.on('error', (err, client) => {
	console.error('Unexpected error on idle client', err)
	process.exit(-1)
})

const query = async (text, params) => {
	const start = Date.now()
	const res = await otherDBPool.query(text, params)
	const duration = Date.now() - start
	console.log('executed query', { text, duration, rows: res.rowCount })
	return res
}
   
const getClient = async () => {
	const client = await otherDBPool.connect()
	const query = client.query
	const release = client.release

	// set a timeout of 5 seconds, after which we will log this client's last query
	const timeout = setTimeout(() => {
	  console.error('A client has been checked out for more than 5 seconds!')
	  console.error(`The last executed query on this client was: ${client.lastQuery}`)
	}, 5000)

	// monkey patch the query method to keep track of the last query executed
	client.query = (...args) => {
	  client.lastQuery = args
	  return query.apply(client, args)
	}

	client.release = () => {
	  // clear our timeout
	  clearTimeout(timeout)

	  // set the methods back to their old un-monkey-patched version
	  client.query = query
	  client.release = release
	  return release.apply(client)
	}
	return client
}

const prepareStatement = (sqlObject, values) => {
	const preparedStatement = {...sqlObject}
	const valueArr = [] 

	if (Array.isArray(values)) {
		for (const value in values) {
			valueArr.push(values[value])
		}
	} else {
		valueArr.push(values)
	}

	preparedStatement.values = valueArr

	return preparedStatement;
}

const instructConnection = {
    query, 
    getClient,
    prepareStatement,
    otherDBPool
}

module.exports = { instructConnection }