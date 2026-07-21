import { mongoConnection as db } from '../db/index.js'
import { postgresConnection as postgres } from "../db/index.js";

import sqls from './sqls.js'

export const getUser = async (obj) => {
    try {
        const users = db.collection('User');
        const auth = db.collection('Auth');
                    
        const user = await users.findOne({ 
            email: obj.username 
        });

        const pass = await auth.findOne({ 
            userId: user._id.toString(),
            password: obj.password
        });

        if (pass) {
            return user;
        }
    } catch (e) {
        throw e
    }
}

export const getUserPostgres = async (data) => {
    const client = await postgres.getClient();

    try {
        const userRes = await client.query(sqls.user.selectByEmail, [data.username])
        const authRes = await client.query(sqls.auth.selectByUserId, [userRes.rows[0].id])
        return {user: userRes.rows[0], auth: authRes.rows[0]}
    } catch (e) {
        throw e
    } finally { client.release() }
}
