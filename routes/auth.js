import express from 'express'
import jwt from 'jsonwebtoken'

import authRepository from '../repository/AuthRepository.js'

const auth = express.Router()

auth.post('/auth', async (req, res) => {
    // const [, hash] = req.headers.authorization?.split(' ') || [' ', ' '];
    // const [username, password] = Buffer.from(hash, 'base64').toString().split(':');

    try {
        const user = await authRepository.getUser({
            username: req.body.username, 
            password: req.body.password
        })

        if(user){
            const token = jwt.sign(
                {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email
                }, 
                process.env.SECRET, {
                expiresIn: 300 // expires in 5min
            });
            return res.json({ auth: true, token: token });
        }
      
        res.status(500).json({message: 'Login inválido!'});
    } catch (error) {
        console.log(error);
        return res.send(error);
    }


    
})

	
auth.post('/logout', function(req, res) {
    res.json({ auth: false, token: null });
})

export default auth