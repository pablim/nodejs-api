import sqls from './sqls.js'
import {postgresConnection as db} from '../db/index.js'

const feriadoRepository = {
    getFeriadoCidade: async (codigoIBGE, data) => {
        try {
            const client = await db.getClient();
            const res = await client.query(sqls.feriado.selectFeriado, [codigoIBGE, data])
            client.release();
            return res;
        } catch (e) {
            throw e
        }
    },
    update: async (codigoIBGE, data, name) => {
        try {
            const client = await db.getClient();
            const res = await client.query(sqls.feriado.updateFeriado, [codigoIBGE, data, name])
            client.release();
            return res;
        } catch (e) {
            throw e
        }
    },
    insert: async (codigoIBGE, data, name) => {
        try {
            const client = await db.getClient();
            const preparedStatement = db.prepareStatement(sqls.feriado.insertFeriado, [codigoIBGE, data, name])
    
            await client.query(preparedStatement)
            client.release();
        } catch (e) {
            throw e
        }
    }, 
    delete: async (codigoIBGE, data) => {
        try {
            const client = await db.getClient();
            const res = await client.query(sqls.feriado.deleteFeriado, [codigoIBGE, data])
            client.release();
            return res;
        } catch (e) {
            throw e
        }
    }
}

export default feriadoRepository