import express from 'express'

const mpRouter = express.Router()

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
