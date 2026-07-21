import express from 'express'
import { randomUUID } from 'crypto';

const mpRouter = express.Router()

mpRouter.post('/process_order', async (req, res) => {
    console.log("/process_order ok");
	console.log(req.body);

    const id = randomUUID();
    console.log(id);

    const data = {

        "type": "online",
        "processing_mode": "automatic",
        "total_amount": "200.00",
        "external_reference": "ext_ref_1234",
        "payer": {
            "email": "test@testuser.com"
        },
        "transactions": {
            "payments": [
                {
                    "amount": "200.00",
                    "payment_method": {
                        "id": "master",
                        "type": "credit_card",
                        "token": "cdec67d2968519857969845137fed905",
                        "installments": 1
                    }
                }
            ]
        }
    }

    fetch("https://api.mercadopago.com/v1/orders", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            //"Authorization": "Bearer APP_USR-4379692147348051-020118-38ee633bae34f1d15021ba4e4f3a588f-68230654",
            "Authorization": "Bearer TEST-4379692147348051-020118-a06399ec09ed8071c6a64ef7f5994cb5-68230654",
            "X-Idempotency-Key": id
        },
        body: JSON.stringify({
            ...data
            // ...req.body,
            // type: "online",
            // external_reference: "ext_ref_1234",
            // processing_mode: "automatic",
        }),
        
    }).then((response) => response.json())
    .then((response) => {
        
        console.log("Resposta do pagamento:");
        console.log(response);
    })
    .catch((error) => {
        console.error("Erro ao processar o pagamento:");
        console.error(error);
    });


    res.json({ success: true });  

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
