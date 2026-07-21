export const defaultResponse = (res, code = 200, data = {}) => { 
	res.status(code).json(data) 
}

export const defaultError = (res, e, errorData = {}) => {
	/**
	 * {
	 * 	"type": "/errors/incorrect-user-pass",
	 * 	"title": "Incorrect username or password.",
	 * 	"status": 401,
	 * 	"detail": "Authentication failed due to incorrect username or password.",
	 * 	"instance": "/login/log/abc123"
	 * }
	 * https://www.baeldung.com/rest-api-error-handling-best-practices
	 * https://datatracker.ietf.org/doc/html/rfc7807 
	 */
	
	console.log(e)
	res.status(500).json(
		{
			"type": `/errors/${e.code}`,
			"title": e.message,
			"status": 500,
			"detail": e.detail,
			"instance": res.req.originalUrl
		}
	);
}