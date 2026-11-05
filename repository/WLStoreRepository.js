import sqls from './sqls.js'
import { WLStoreConnection as db } from '../db/index.js'

const get = async (id) => {
    const client = await db.getClient();
    try {
        const res = await client.query(sqls.WLStore.order.select, [id])
        return res.rows
    } 
    catch (e) { throw e } 
    finally { client.release() }
}

const insert = async (values = []) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN')
        const preparedStatement = db.prepareStatement(
            sqls.WLStore.order.insert, 
            values
        )

        const res = await client.query(preparedStatement)

        await client.query('COMMIT')

        return res.rows;
    } catch (e) {
        await client.query('ROLLBACK')
        throw e
    } finally { client.release() }
}

const update = async (values = []) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN')
        const preparedStatement = db.prepareStatement(
            sqls.WLStore.order.update, 
            values
        )

        const res = await client.query(preparedStatement)

        await client.query('COMMIT')

        return res.rows;
    } catch (e) {
        await client.query('ROLLBACK')
        throw e
    } finally { client.release() }
}

const updateTimestamp = async (values = []) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN')
        const preparedStatement = db.prepareStatement(
            sqls.WLStore.order.updateTimestamp, 
            values
        )

        const res = await client.query(preparedStatement)

        await client.query('COMMIT')

        return res.rows;
    } catch (e) {
        await client.query('ROLLBACK')
        throw e
    } finally { client.release() }
}

const getOrderItems =  async (obj) => {
    const client = await db.getClient();

    try {
        const res = await client.query({text: "SELECT * FROM public.order"})
    } 
    catch (e) { throw e } 
    finally { client.release() }
}

const insertOrderItems = async (obj) => {
    const items = obj.items;

    const client = await db.getClient();
    try {
        await client.query('BEGIN')

        const preparedStatement = db.prepareStatement(
            sqls.WLStore.orderItems.insert, 
            
            [obj.orderId, items.map(i => i.productId), items.map(i => i.quantity)]
        )

        await client.query(preparedStatement)
        await client.query('COMMIT')

    } 
    catch (e) { throw e } 
    finally { client.release() }
}

const selectCatalog = async (values) => {
    const items = values.items;
    const client = await db.getClient();

    try {
        const res = await client.query(sqls.WLStore.catalog.select, [items])
        return res.rows
    } 
    catch (e) { throw e } 
    finally { client.release() }
}

const selectPayment = async (values) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN')

        const preparedStatement = db.prepareStatement(
            sqls.WLStore.payment.select, 
            values
        )

        const res = await client.query(preparedStatement)
        await client.query('COMMIT')

        return res.rows[0];
    } 
    catch (e) { throw e } 
    finally { client.release() }
}

const insertPayment = async (values) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN')

        const preparedStatement = db.prepareStatement(
            sqls.WLStore.payment.insert, 
            values
        )

        const res = await client.query(preparedStatement)
        await client.query('COMMIT')

        return res.rows[0].id;
    } 
    catch (e) { throw e } 
    finally { client.release() }
}

const insertPaymentStatus = async (values) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN')

        const preparedStatement = db.prepareStatement(
            sqls.WLStore.paymentStatus.insert, 
            values
        )

        await client.query(preparedStatement)
        await client.query('COMMIT')
    } 
    catch (e) { throw e } 
    finally { client.release() }
}

const insertPaymentMethod = async (values) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN')

        const preparedStatement = db.prepareStatement(
            sqls.WLStore.paymentMethod.insert, 
            values
        )

        const res = await client.query(preparedStatement)
        await client.query('COMMIT')
        return res.rows[0].id;
    } 
    catch (e) { throw e } 
    finally { client.release() }
}

const insertPaymentMethodStatus = async (values) => {
    const client = await db.getClient();

    try {
        await client.query('BEGIN')

        const preparedStatement = db.prepareStatement(
            sqls.WLStore.paymentMethodStatus.insert, 
            values
        )

        await client.query(preparedStatement)
        await client.query('COMMIT')
    } 
    catch (e) { throw e } 
    finally { client.release() }
}

export { 
    get, 
    insert, 
    update, 
    updateTimestamp, 
    getOrderItems, 
    insertOrderItems,
    insertPayment,
    insertPaymentMethod,
    selectPayment,
    insertPaymentStatus,
    insertPaymentMethodStatus,
    selectCatalog
}