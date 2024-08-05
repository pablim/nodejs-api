import { mongoConnection as db } from '../db/index.js'

const loyaltyRepository = {
    getUser: async (obj) => {
        try {
            const users = db.collection('User');
            const auth = db.collection('Auth');
                        
            const user = await users.findOne({ 
                email: obj.username 
            });

            const pass = await auth.findOne({ 
                userId: user._id.toString(),
                password: obj.password
            });

            if (pass) {
                return user;
            }
        } catch (e) {
            throw e
        }
    }
}

export default loyaltyRepository