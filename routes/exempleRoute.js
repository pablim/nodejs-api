/**
 * @swagger
 * components:
 *   schemas:
 *     uploadFileRouter:
 *       type: file
 *       required:
 *         - file
 *       properties:
 *         file:
 *           type: file
 *           description: The sales file
 *       example:
 *         file: sales.txt
 * tags:
 *   name: Upload Sales File
 *   description: Handle the sales file
 * /api/upload-file:
 *   post:
 *     summary: Process a sales file
 *     tags: [Upload Sales File]
 *     requestBody:
 *       required: true
 *       content:
 *         application/octet-stream:
 *           schema:
 *             $ref: '#/components/schemas/uploadFileRouter'
 *     responses:
 *       200:
 *         description: Processed file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msgs:
 *                   type: array
 *                   description: string msg array
 *                 status:
 *                   type: string
 *                   description: string msg
 *                 data:
 *                   type: array
 *                   description: result array
 *               example:
 *                 msgs: ["success", "files processed"]
 *                 status: 'ok'
 *                 data: []
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msgs:
 *                   type: array
 *                   description: string msg array
 *                 status:
 *                   type: string
 *                   description: string msg
 *               example:
 *                 msgs: ["error in file process"]
 *                 status: 'error'
 * /api/get-data:
 *   get:
 *     summary: Get consolidated data
 *     tags: [Upload Sales File]
 *     responses:
 *       200:
 *         description: Processed file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msgs:
 *                   type: array
 *                   description: string msg array
 *                 status:
 *                   type: string
 *                   description: string msg
 *                 data:
 *                   type: array
 *                   description: result array
 *               example:
 *                 msgs: ["success"]
 *                 status: 'ok'
 *                 data: []
 *       500:
 *         description: server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 msgs:
 *                   type: array
 *                   description: string msg array
 *                 status:
 *                   type: string
 *                   description: string msg
 *               example:
 *                 msgs: ["error in file process"]
 *                 status: 'error'
 */
const express = require('express')
const path = require("path");
const { withJWT } = require('../utils/verifyJwt')
const { GoogleLoyalty } = require('../utils/GoogleLoyalty')

const exemplePostgresRepository = require('../repository/exemplePostgresRepository');

const issuerId = process.env.ISSUERID

const exempleRoute = express.Router()

/**
 * post request 
 * in post request the params are getting from body request
 * 
 * the query params can is utils too
 */
exempleRoute.post('/loyalty/loyalty-create', withJWT, async (req, res) => {
	const msgs = []

	try {
		var { name, email } = req.body
		var { coplement } = req.query

		const result = {
			msgs: [{text: "joined", type: 'success'}],
			data: `${name} - ${email} - ${coplement}`
		}
		
		msgs.push({text: "Loaded", type: "success"})
	
		res.status(200).json({
			msgs: [...result.msgs, ...msgs], 
			resource: result.data
		});
	} catch (e) {
		res.status(500).json({
			msgs: [{text: 'created', type: 'error'}], 
			status: "error"
		});
	}
})

/**
 * get request
 */
exempleRoute.get('/loyalty/get-loyalty', withJWT, async (req, res) => {
	const msgs = []

	try {
		var { loyaltyName } = req.query

		const googleLoyalty = new GoogleLoyalty()

		const result = await googleLoyalty.getClass(
			issuerId, 
			loyaltyName, 
		)
		
		msgs.push({text: "Loaded", type: "success"})
	
		res.status(200).json({
			msgs: [...result.msgs, ...msgs], 
			resource: result.data
		});
	} catch (e) {
		res.status(500).json({
			msgs: [{text: 'created', type: 'error'}], 
			status: "error"
		});
	}
})

exempleRoute.get('/get-data', async (req, res) => {
	let msgs = [];
	try {
		const totalized = await salesRepository.getValueByProdAndSeller()

		if (totalized.rows.length > 0)
			msgs.push('Success')
		else msgs.push('No data to show')
		res.status(200).json({msgs, status: "ok", data: totalized.rows});
	} catch (e) {
		if (e.constructor.name == "DatabaseError")
			// When DatabaseError supress the details msg by security.
			msgs.push(e.constructor.name + " - " + e.message)
		else msgs.push(e.constructor.name + " - " + e.message)

		res.status(500).json({msgs, status: "error"});
	}
})

exempleRoute.post('/upload-file', async (req, res) => {
	let sales;
	let uploadPath;
	let msgs = [];

	if (!req.files || Object.keys(req.files).length === 0) {
		return res.status(400).send('No files were uploaded.');
	}

	// The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
	sales = req.files.sales;
	uploadPath = __dirname + '/../storage/' + sales.name;

	try {
		// Use the mv() method to place the file somewhere on your server
		await sales.mv(uploadPath)

		let totalized = {};
		let insertValues = "";

		const fileStream = fs.createReadStream(uploadPath);
		const rl = readline.createInterface({
			input: fileStream,
			crlfDelay: Infinity
		});

		for await (const line of rl) {
			if (line != "") {
				const trasactionType = parseInt(line.slice(0,1))
				const date = line.slice(1,26)
				const product = line.slice(26,56).trim()
				const value = parseInt(line.slice(56,66)) / 100
				const seller = line.slice(66,86).trim()

				insertValues += ("(" + [
					trasactionType , 
					"'" + date + "'",
					"'" + product + "'",
					value,
					"'" + seller + "'"
				].join(',') + "),")
			}
		}

		rl.close()

		await salesRepository.insertMany(
			insertValues.slice(0, insertValues.length-1)
		).then(async () => {
			totalized = await salesRepository.getValueByProdAndSeller()
		})

		msgs.push('File uploaded!')
		res.status(200).json({msgs, status: "ok", data: totalized.rows});
	} catch (e) {
		if (e.constructor.name == "DatabaseError")
			// When DatabaseError supress the details msg by security.
			msgs.push(e.constructor.name + " - " + e.message)
		else msgs.push(e.constructor.name + " - " + e.message)

		res.status(500).json({msgs, status: "error"});
	}
})

exempleRoute.get('/feriados/:codigoIBGE/:data', (req, res) => {
    var codigoIBGE = req.params.codigoIBGE
    var data = req.params.data 
    var codigoEstadoIBGE = codigoIBGE.substr(0, 2)

    exemplePostgresRepository.getFeriadoNacional(data)
        .then(rows => {
            if (rows.length>0) {
                res.status(200).send(rows[0])
                return false
            } else {
                return true
            }
        })
        
})

exempleRoute.put('/feriados/:codigoIBGE/:data', (req, res) => {
    var codigoIBGE = req.params.codigoIBGE
    
    // Pode ser um nome ou data
    var data = req.params.data 
    
    var name = req.body.name
    
    var ano = new Date().getFullYear() 
    if (data in feriadosMoveis) {
        name = feriadosMoveis[data].nome
        var acrescimo = feriadosMoveis[data].acrescimo
        var dataFeriadoStr = calculaDataPascoa(ano)
        var dataFeriado = new Date(dataFeriadoStr+" 00:00:00")
        dataFeriado.setDate(dataFeriado.getDate()+acrescimo)
    
        data = dataFeriado
    } else {
        data = ano + "-" + data
    }
    
    
    cidadeRepository.isCidade(codigoIBGE)
        .then(rows => {
            if (rows.length==1) {
                return true
            } else if (codigoIBGE in estados) {
                return true
            } else {
                res.status(404).send("Não é uma cidade ou estado válido")
            }
        })
        
})
      
exempleRoute.delete('/feriados/:codigoIBGE/:data', (req, res) => {
    var codigoIBGE = req.params.codigoIBGE
    var data = req.params.data 
    var codigoEstadoIBGE = codigoIBGE.substr(0, 2)

    var ano = new Date().getFullYear() 
    if (data in feriadosMoveis) {
        name = feriadosMoveis[data].nome
        var acrescimo = feriadosMoveis[data].acrescimo
        var dataFeriadoStr = calculaDataPascoa(ano)
        var dataFeriado = new Date(dataFeriadoStr+" 00:00:00")
        dataFeriado.setDate(dataFeriado.getDate()+acrescimo)
    
        data = dataFeriado
    } else {
        data = ano + "-" + data
    }
 
    exemplePostgresRepository.getFeriadoFeriadoNacional(codigoIBGE, data)
        .then(rows => {
            // Caso seja feriado nacional
            if (rows.length==1) {
                res.status(403).end()
                return false
            } else {
                return true
            }
        })
        
})

module.exports = exempleRoute