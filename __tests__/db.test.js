const salesRepository = require('../repository/salesRepository')
const db = require('../db');

describe('bd', () => {
    test('insertMany', async () => {
        const res = await salesRepository.insertMany(
            "(1, '2022-01-15', 'test course', 0001200, 'Pablo Vaz'), " + 
            "(1, '2022-01-18', 'test course 2', 0005200, 'Francisco Carlos') "
        )
        expect(res).toBeUndefined()
    });

    test('getValueByProdAndSeller', async () => {
        const res = await salesRepository.getValueByProdAndSeller()
        expect(res.rows.length).toBeGreaterThan(0)
        db.pool.end()
    });
})