const jwt = require('jsonwebtoken');

const withJWT = (req, res, next) => {
	if (process.env.WITH_JWT == 'true') {
		return verifyJWT(req, res, next)
	} else return next()
}

function verifyJWT(req, res, next){
    const token = req.headers['authorization'].split(" ")[1];

    if (!token) return res.status(401).json({ 
      	auth: false, message: 'No token provided.' 
    });
    
    jwt.verify(token, process.env.SECRET, function(err, decoded) {
      	if (err) return res.status(401).json({ 
        	auth: false, message: 'Failed to authenticate token.' 
     	});
      
      	// se tudo estiver ok, salva no request para uso posterior
		req.id = decoded.id;
		next();
    });
}

module.exports = { verifyJWT, withJWT };