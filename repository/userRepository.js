import sqls from './sqls.js'
import { postgresConnection as db } from '../db/index.js'

/**
 * //https://node-postgres.com/features/queries#parameterized-query
 * 
 * @param {*} data 
 * @returns 
 */
export const insert = async (data) => {
    const client = await db.getClient();

    try {
        client.query('BEGIN')
        const res = await client.query(sqls.user.insert, [data.name, data.email])
        await client.query(sqls.auth.insert, [res.rows[0].id, data.hash])
        await client.query('COMMIT')
        return res.rows[0].id
    } catch (e) {
        await client.query('ROLLBACK')
        throw e
    } finally { client.release() }
}

export const update = async (data) => {
    const client = await db.getClient();

    try {
        await client.query(sqls.user.update, [
            data.name, 
            data.email, 
            data.id
        ])
    } 
    catch (e) { throw e } 
    finally { client.release() }
}

export const updatePatch = async (id, data) => {
    const client = await db.getClient();

    try {
        const keys = Object.keys(data)
        const values = Object.values(data)
        const fields = (keys.map((key, idx) => `${key} = $${idx+1}`)).join(', ')
                
        const queryStr = sqls.user.updatePatch
            .replace('{fields}', fields)
            .replace('{id}', keys.length+1)
        
        await client.query(queryStr, [...values, id])
    } 
    catch (e) {throw e } 
    finally { client.release() }
}

export const findAll = async () => {
    const client = await db.getClient();

    try {
        const res = await client.query(sqls.user.select)
        return res.rows
    } 
    catch (e) { throw e } 
    finally { client.release() }
}

export const find = async (id) => {
    const client = await db.getClient();

    try {
        const res = await client.query(sqls.user.selectById, [id])
        return res.rows[0]
    } 
    catch (e) { throw e } 
    finally { client.release() }
}

export const findPaginate = async (page = 1, pageSize = 10) => {
    const client = await db.getClient();

    try {
        const str = `SELECT * FROM public.user ORDER BY public.user.id LIMIT ${pageSize} OFFSET ${(page-1) * pageSize}`

        const res = await client.query(str)
        return res.rows
    } 
    catch (e) { throw e } 
    finally { client.release() }
}

/**
 * 
 * {
 * by: ['id', ...],
 * byValue: [1, ...]
 * 
 * pagination: {page: 1, pageSize: 10},
 * fields: ['*', ...]
 * orderByAsc: ['id', ...]
 * orderByDesc: ['id', ...]
 * }
 */
export const findGeneric = async (opt = {}) => {
    const client = await db.getClient();

    //page = 1, pageSize = 10
    let strQuery = ''
    strQuery = Object.entries(opt).length === 0 && 'SELECT {fields} FROM public.user'

    if (Array.isArray(opt?.by)) {
        
        const filters = (opt.by.map((field, idx) => `${field} = $${idx+1}`)).join(', ')

        strQuery = 'SELECT {fields} FROM public.user WHERE {filters}'.replace('{filters}', filters)
    }

    try {
        const str = `SELECT * FROM public.user ORDER BY public.user.id LIMIT ${pageSize} OFFSET ${(page-1) * pageSize}`

        const res = await client.query(str)
        return res.rows
    } 
    catch (e) { throw e } 
    finally { client.release() }
}

export const remove = async (id) => {
    const client = await db.getClient();

    try {
        client.query('BEGIN')
        await client.query(sqls.auth.delete, [id])
        await client.query(sqls.user.delete, [id])
        await client.query('COMMIT')
    } 
    catch (e) {
        await client.query('ROLLBACK')
        throw e
    } finally { client.release() }
}
