import { Router } from 'express'

import { point } from "@pablovf/point-automation/src/point.js";

const automationRouter = Router()


automationRouter.get('/point', async (req, res) => {
	let msgs = [];

	try {
		point(
			process.env.POINT_URL,
			process.env.POINT_LOGIN,
			process.env.POINT_PASSWORD,
		)
		res.status(200).json({msgs, status: "ok"});
	} catch (e) {
	
		res.status(500).json({msgs, status: "error"});
	}
})

export default automationRouter
