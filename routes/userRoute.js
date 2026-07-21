import { Router } from 'express'
import { withJWT } from '../utils/verifyJwt.js'
import { verifyMidAirCollision, verifyUnchanged } from '../utils/verifyETag.js'
import { defaultResponse, defaultError } from '../utils/responseUtils.js'
import { logger } from "../logger/logger.js";

import { 
	insert,  
	find,
	findAll,
	findPaginate,
	update, 
	updatePatch, 
	remove 
} from '../repository/userRepository.js'

const router = Router()

/**
 * Usar os métodos adequados para cada operação, POST, PUT, GET, PATCH, DELETE
 */

/**
 * Use os código de resposta HTTP corretamente
 * 
 * 2xx, if everything was okay,
 * 3xx, if the resource was moved,
 * 4xx, if the request cannot be fulfilled because of a client error (like 
 * 	requesting a resource that does not exist),
 * 5xx, if something went wrong on the API side (like an exception happened).
 * 
 * If you are using Express, setting the status code is as easy as 
 * res.status(500).send({error: 'Internal server error happened'}). 
 * Similarly with Restify: res.status(201).
 * 
 * Lista completa de códigos http
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Status
 * https://en.wikipedia.org/wiki/List_of_HTTP_status_codes
 */

/**
 * POST /user or PUT /user:/id to create a new user,
 * 
 * in post request the params are getting from body request
 * the query params can is utils too
 */
router.post('/', async (req, res) => {
	try {
		const { name, email, hash } = req.body

		//verifyMidAirCollision(req, res, data)
		//verifyUnchanged(req, res, data)

		const userId = await insert({ name, email, hash })
		defaultResponse(res, 201, {userId})
	} catch (e) {
		defaultError(res, e)
	}
})

// O PUT, é usado para alteração de todos os campos da entidade
router.put('/:id', async (req, res) => {
	try {
		const { id } = req.params
		const { name, email, hash } = req.body

		const user = await getById(id)

		var userId;
		if (user) {
			userId = await update({ name, email, id })
		} else {
			userId = await insert({ name, email, hash })
		}

		defaultResponse(res, 201, {userId})
	} catch (e) {
		defaultError(res, e)
	}
})

// PATCH /user/:id to modify an existing user record,
// Atualização parcial dos dados da entidade
router.patch('/:id', async (req, res) => {
	try {
		const { id } = req.params
		const user = req.body

		const userId = await updatePatch(id, user)

		defaultResponse(res, 200, {userId})
	} catch (e) {
		defaultError(res, e)
	}
})

// GET /user to retrieve a list of users,
router.get('/', async (req, res) => {
	try {
		const { page, pageSize } = req.query

		//const userList = await findAll()
		const userList = await findPaginate(page, pageSize)
		
		logger.info("consulting");
		
		/**
		 * Usar os cabecalhos http para enviar metadados
		 * 
		 * Se precisar customizar algum header comece com X. X-Pagination
		 * 
		 * Lista dos cabeçalhos http
		 * https://en.wikipedia.org/wiki/List_of_HTTP_header_fields
		 */
		res.setHeader('X-Pagination', JSON.stringify({page, pageSize}))
		res.setHeader('Content-Type', 'application/json');

		defaultResponse(res, 200, userList)
	} catch (e) {
		defaultError(res, e)
	}
})

// GET /user/:id to retrieve a user,
router.get('/:id', async (req, res) => {
	try {
		const user = await find(req.params.id)

		res.setHeader('Content-Type', 'application/json');
		defaultResponse(res, 200, user)
	} catch (e) {
		defaultError(res, e)
	}
})

// DELETE /user/:id to remove a user.
router.delete('/:id', async (req, res) => {
	try {
		const { id } = req.params
		const user = await remove(req.params.id)

		res.setHeader('Content-Type', 'application/json');
		defaultResponse(res, 200, user)
	} catch (e) {
		defaultError(res, e)
	}
})


export default router
