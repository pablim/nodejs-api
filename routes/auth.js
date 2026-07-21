import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from "bcryptjs";

import { getUser, getUserPostgres } from '../repository/authRepository.js'

const auth = express.Router()

auth.post('/', async (req, res) => {
    // const [, hash] = req.headers.authorization?.split(' ') || [' ', ' '];
    // const [username, password] = Buffer.from(hash, 'base64').toString().split(':');

    console.log(req.get('X-Datasource'));

    const dataSource = req.get('X-Datasource')
    let user = null;

    const  {username, password } = req.body
    
    try {

        if (dataSource === 'postgres') {
            user = await getUserPostgres({ username, password })

            const isCorrect = bcrypt.compareSync(password, user.auth.password)

            if(isCorrect && user.user){
                const payload = user.user

                const token = jwt.sign(
                    {
                        id: payload.id.toString(),
                        name: payload.name,
                        email: payload.email
                    }, 
                    process.env.SECRET, {
                    expiresIn: 300 // expires in 5min
                });
                return res.json({ auth: true, token: token });
            }

        } else {
            user = await getUser({ username, password })
            
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