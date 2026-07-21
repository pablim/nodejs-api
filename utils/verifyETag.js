import etag from 'etag'

/**
 * https://expressjs.com/pt-br/api.html#etag.options.table
 * https://www.npmjs.com/package/etag
 * 
 * "The ETag functionality is implemented using the etag package. For more 
 * information, see its documentation. "
 * 
 * @param {*} data 
 * @returns 
 */
function generateETag(data) {
	return etag(JSON.stringify(data), {weak: true})
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/412
 */
function verifyMidAirCollision(req, res, data){
	const clientETag = req.get('if-match')
	const currentETag = generateETag(data)
	if (clientETag && clientETag !== currentETag) res.status(412).send('Precondition Failed')
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag#caching_of_unchanged_resources
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Conditional_requests
 * https://dev.to/4shub/reducing-server-bandwidth-with-conditional-gets-54h6
 * https://dev.to/zainbinfurqan/what-is-etag-and-why-we-use-it-15jd
 */
function verifyUnchanged(req, res, data){
	const clientETag = req.get('if-none-match')
	const currentETag = generateETag(data)
	
	if (clientETag && clientETag === currentETag) return false
	
	return true
}

export { verifyMidAirCollision, verifyUnchanged };