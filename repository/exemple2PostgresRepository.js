const sqls = require('./sqls')
const { postgresConnection: db } = require('../db');

const salesRepository = {
    insert: async (obj) => {
        try {
            const client = await db.getClient();
            const preparedStatement = db.prepareStatement(sqls.sales.insert, obj)
    
            await client.query(preparedStatement)
            client.release();
        } catch (e) {
            throw e
        }
    }, 
    insertMany: async (value) => {
        try {
            const client = await db.getClient();
            await client.query(sqls.sales.insertMany.text + value)
            client.release();
        } catch (e) {
            throw e
        }
    },
    getValueByProdAndSeller: async () => {
        try {
            const client = await db.getClient();
            const res = await client.query(sqls.sales.getValueByProdAndSeller)
            client.release();
            return res;
        } catch (e) {
            throw e
        }
    }
}

module.exports = salesRepository