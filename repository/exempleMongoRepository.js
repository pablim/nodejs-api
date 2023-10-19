const {mongoConnection: db} = require('../db');

const loyaltyRepository = {
    get: async (obj) => {
        try {
            //const c = db.db('loyalty');
            const cards = db.collection('LoyaltyCard');
            
            // Query for a movie that has the title 'Back to the Future'
            const query = { name: 'teste' };
            const r = await cards.findOne(query);

            return r;
        } catch (e) {
            throw e
        }
    },
}

module.exports = loyaltyRepository