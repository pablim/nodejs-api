import express from 'express'
import { randomUUID, createHmac, timingSafeEqual } from 'crypto';

import { 
    get, 
    insert, 
    update, 
    updateTimestamp, 
    insertOrderItems,
    insertPayment,
    insertPaymentMethod,
    selectPayment,
    insertPaymentStatus,
    insertPaymentMethodStatus,
    selectCatalog
} from '../repository/WLStoreRepository.js'

const mpRouter = express.Router()
const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN
const secretSign = process.env.MERCADO_PAGO_NOTIFICTION_SECRET_SIGN

mpRouter.get('/order', async (req, res) => {
    try {    
        const data = req.query.orderId
        const result = await get(data)
        res.json({ data: result });  
    } catch (e) {
        res.json({ error: 'API error' });  
    }
})

mpRouter.post('/order', async (req, res) => {
    try {
        const data = req.body
    
        // Order Status
        // 1 - PENDING
        // 2 - {to define}
    
        const orderResult = await insert([
            data.customerId, 
            "pending",
            new Date(),
            "BRL"
        ]);

        
        if (data?.items) {

            const productList = data.items.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }))

            const orderItemsResult = await insertOrderItems({
                orderId: orderResult[0].id, 
                items: productList
            });
        }
    
        res.json({ data: orderResult[0] });  
    } catch (e) {
        res.json({ error: 'API error' });  
    }
})

mpRouter.post('/payment', async (req, res) => {
    try {
        const idempotencyKey = randomUUID();
    
        const paymentData = req.body.paymentData
        const orderId = req.body.orderId
        const directAmount = req.body.amount || 0
    
        // NUNCA aceite o valor vindo do front: busque no seu banco de dados
        const orderItems = await get(orderId)
        const amount = orderItems.reduce((acc, cur) => {
            return acc + (cur.price * cur.quantity)
        }, 0)
    
        if (!amount && !directAmount) {
            res.json({ error: "API error" });  
        }

        const data = {
            "type": "online",
            "processing_mode": "automatic",
            "total_amount": String(amount || directAmount),
            "external_reference": orderId,
            "payer": {
                "email": paymentData.payer.email,
            },
            "transactions": {
                "payments": [
                    {
                        "amount": String(amount || directAmount),
                        "payment_method": {
                            "id": "master",
                            "type": "credit_card",
                            "token": paymentData.token,
                            "installments": Number(paymentData.installments) || 1
                        }
                    }
                ]
            }
        }
    
        fetch("https://api.mercadopago.com/v1/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
                "X-Idempotency-Key": idempotencyKey
            },
            body: JSON.stringify({ ...data }),
        })
        .then((response) => response.json())
        .then(async (response) => {
            let orderStatus = "pending";
            let paid_at = null;

            const gatewayResponse = JSON.stringify(response)
            const paymentMethod = response.transactions.payments[0]

            if (response.status == "processed") {
                orderStatus = "paid"
                paid_at = response.last_updated_date
            }

            await update([
                orderStatus, 
                response.last_updated_date,
                paid_at,
                orderId
            ])

            const payment = await insertPayment([
                orderId,
                response.id, 
                response.total_amount,
                response.total_paid_amount,
                response.status,
                response.status_detail,
                response.currency,
                response.created_date,
                response.last_updated_date,
                idempotencyKey
            ])

            await insertPaymentStatus([
                response.last_updated_date,
                response.status,
                response.status_detail,
                payment
            ])

            response.transactions.payments.map(async (pay) => {
    
                const paymentMethodId = await insertPaymentMethod([
                    pay.id,
                    pay.amount,
                    pay.paid_amount,
                    pay.reference_id,
                    pay.status,
                    pay.status_detail,
                    pay.payment_method.id,
                    pay.payment_method.type,
                    pay.payment_method.installments,
                    pay.payment_method.installment_amount,
                    payment,
                ])
    
                await insertPaymentMethodStatus([
                    response.last_updated_date,
                    response.status,
                    response.status_detail,
                    paymentMethodId,
                    payment
                ])
            }) 
            

            res.json({ data: response });  
        })
        .catch((error) => {
            console.error("Erro ao processar o pagamento:", error);
            res.json({ error: "API error", details: error });
        });
    } 
    catch (e) {
        res.json({ error: "API error" });  
    }
})

mpRouter.get('/payment', async (req, res) => {
    try {
        fetch("https://api.mercadopago.com/v1/orders/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`
            },
            body: JSON.stringify({ ...data }),
        }).then((response) => response.json())
        .then((response) => {

            const gatewayResponse = JSON.stringify(response)

            update({id, orderId})
            insertPayment({orderId, gatewayResponse})
            
            res.json({ data: response });  
        })
        .catch((error) => {
            console.error("Erro ao processar o pagamento:", error);
            res.json({ error: "API error", details: error });
        });
    } catch (e) {
        res.json({ error: "API error" });  
    }
})

/**
 * Endpoint para o webhoook do gateway
 * 
 * query
 * {
 *     "data.id": "123456",
 *     type: "order",
 * }
 * 
 * body
 * action = 'order.processed'
 * api_version = 'v1'
 * application_id = '4379692147348051'
 * data = {
 *     external_reference: 'ext_ref_1234', 
 *     id: '123456', // ID do pagamento ORDTST01M5WPNGM5Y54AAC6EB72TPWKV
 *     status: 'processed', 
 *     status_detail: 'accredited', 
 *     total_paid_amount: 100000,
 *     transactions: {
 *         payments: [
 *             {
 *                 amount: 100000,
 *                 id: "PAY01K7S9596QBWZRTY02NF",
 *                 paid_amount: 100000,
 *                 payment_method: {
 *                     id: "visa",
 *                     installments: 1,
 *                     type: "credit_card",
 *                 },
 *                 reference: {
 *                     id: 1234567891,
 *                 },
 *                 status: "processed",
 *                 status_detail: "accredited",
 *             },
 *         ]
 *     },
 *     version = 3
 * }
 * date_created = '2021-11-01T02:02:02-04:00'
 * live_mode = true
 * type = 'order'
 * user_id =68230654
 *
 */
mpRouter.post('/payment_notification', async (req, res) => {

    const data = req.body.data

    try {
        const orderId = data.external_reference;
        // const orderId = "118" // pegar um código de ordem do banco para testar

        /**
         * Validação da origem da notificação
         * Doc: https://www.mercadopago.com.br/developers/pt/docs/checkout-pro-orders/notifications#bookmark_validar_a_origem_da_notificacao
         * */ 
        const xSignature = req.headers['x-signature'] ?? '';
        const xRequestId = req.headers['x-request-id'] ?? '';
        const dataId = (req.query['data.id'] ?? '').toLowerCase();

        let ts, hash;
        for (const part of xSignature.split(',')) {
            const eq = part.indexOf('=');
            if (eq === -1) continue;
            const key = part.slice(0, eq).trim();
            const val = part.slice(eq + 1).trim();
            if (key === 'ts') ts   = val;
            if (key === 'v1') hash = val;
        }

        const parts = [];
        if (dataId) parts.push(`id:${dataId}`);
        if (xRequestId) parts.push(`request-id:${xRequestId}`);
        parts.push(`ts:${ts}`);
        const manifest = parts.join(';') + ';';

        const computed = createHmac('sha256', secretSign)
            .update(manifest)
            .digest('hex');
        const computedBuf = Buffer.from(computed);
        const hashBuf = Buffer.from(hash ?? '');

        if (computedBuf.length !== hashBuf.length || 
            !timingSafeEqual(computedBuf, hashBuf)
        ) {
            res.status(401).end();
            return;
        }
        /**
         * Quando você recebe uma notificação em sua plataforma, o Mercado Pago 
         * espera uma resposta para validar que essa recepção foi correta. Para 
         * isso, você deve devolver um HTTP STATUS 200 (OK) ou 201 (CREATED).
         * 
         * O tempo de espera para essa confirmação será de 22 segundos. Se essa 
         * confirmação não for enviada, o sistema entenderá que a notificação 
         * não foi recebida e realizará uma nova tentativa de envio a cada 15 
         * minutos, até que receba a resposta. Após a terceira tentativa, o 
         * prazo será prorrogado, mas os envios continuarão acontecendo.
         * */ 

        const payment = await selectPayment([orderId])

        if (data.status == "processed")
            await update([
                'paid',
                new Date(),
                new Date(),
                orderId
            ])

        await insertPaymentStatus([
            new Date(),
            data.status,
            data.status_detail,
            payment.payment_id
        ])

        await insertPaymentMethodStatus([
            new Date(),
            data.transactions.payments[0].status,
            data.transactions.payments[0].status_detail,
            payment.payment_method_id,
            payment.payment_id
        ])

        res.sendStatus(200);
    } catch (e) {
        res.status(401).end();
    }
})

mpRouter.get('/catalog', async (req, res) => {
    try {
        
        const items = JSON.parse(req.query.filtro)

        const result = await selectCatalog(items)
        
        res.json({ data: result });
    } catch (e) {
        res.json({ error: "API error" });
    }
})

mpRouter.post('/payment', async (req, res) => {
	
    var mercadopago = require('mercadopago');
    //mercadopago.configurations.setAccessToken("TEST-4379692147348051-020118-a06399ec09ed8071c6a64ef7f5994cb5-68230654");
    var client = new mercadopago.MercadoPagoConfig({ 
        accessToken: 'TEST-4379692147348051-020118-a06399ec09ed8071c6a64ef7f5994cb5-68230654', 
        options: { timeout: 5000, idempotencyKey: 'abc' } 
    });

    var payment_data = {
        //transaction_amount: Number(req.body.transactionAmount),
        transaction_amount: 12.00,
        token: req.body.token,
        description: req.body.description,
        installments: Number(req.body.installments),
        payment_method_id: req.body.paymentMethodId,
        issuer_id: req.body.issuer,
        payer: {
            email: req.body.email,
            identification: {
            type: req.body.identificationType,
            number: req.body.identificationNumber
            }
        }
    };

    const payment = new mercadopago.Payment(client);

    payment.create({body: payment_data})
        .then((response) => {
            res.status(200).json(response);
        })
        .catch(console.log);
})

export default mpRouter
