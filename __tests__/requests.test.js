import request from 'supertest';
import db from '../db/index.js'
import path from "path"
import app from "../server.js"

//const { request } = supertest

describe('requests', () => {
    test('main route', async () => {
        const res = await request(app).get('/')
        expect(res.text).toBe('nodejs-api running')
    });

    test('Upload file route with no file', async () => {
        const res = await request(app).post('/api/exemple-route/upload-file')
        expect(res.statusCode).toBe(400)
        expect(res.text).toBe('No files were uploaded.')
    });

    test('Upload file route with file', async () => {
        const file = path.resolve(__dirname, './sales.txt');
        
        const res = await request(app).post('/api/exemple-route/upload-file')
            .set('content-type', 'multipart/form-data')
            .attach('sales', file)

        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('status')
        expect(res.body).toHaveProperty('msgs')
        expect(res.body.status).toBe('ok')

        db.pool.end();
    });

})