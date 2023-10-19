const { postgresOtherConnection } = require('./postgresOtherConnection')
const { postgresConnection } = require('./postgresConnection')
const { mongoConnection } = require('./mongoConnection')

module.exports = {
	postgresOtherConnection,
	postgresConnection,
	mongoConnection
}


