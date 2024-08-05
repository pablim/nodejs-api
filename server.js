import express from 'express'
import fileUpload from 'express-fileupload'
import bodyParser from 'body-parser'
import path from "path"
import nunjucks from 'nunjucks'
import cors from 'cors'
import swaggerJsdoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express"
import options from './swaggerOptions.js'
import dotenv from 'dotenv';

dotenv.config({ 
  path: process.env.NODE_ENV === "test" ? ".env.testing" : 
    process.env.NODE_ENV === "production" ? ".env.production" : ".env"
});

/**
 * Import routes
 */
import auth from './routes/auth.js'
import exempleRoute from './routes/exempleRoute.js'
import mercadopagoRoute from './routes/mercadopago.js'

const specs = swaggerJsdoc(options);

const app = express()

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

app.use(bodyParser.json()); // to support JSON-encoded bodies

// to support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cors({
  origin: '*',
  methods: ['GET','POST','DELETE','PUT'],
}));
app.use(fileUpload())

// app.set("views", path.join(__dirname, "views"))
// app.set('view engine', 'pug')
// nunjucks.configure('views', {
//   autoescape: true,
//   express: app
// });
// nunjucks.render('index.html', { foo: 'bar' });

app.get('/', function(req, res) {
  	res.send('nodejs-api running');
});
app.get('/exemplo_html', function(req, res) {
  res.sendFile(path.join(__dirname, "views/index.html"));
});
app.get('/exemplo_pug', function (req, res) {
  res.render('exemplo_pug', { title: 'Hey', message: 'Hello there!'});
});

app.use('/api', auth)
app.use('/api/exemple-route', exempleRoute)
app.use('/api/mercadopago', mercadopagoRoute)

// default response:
app.use((req, res) => {
    res.status(404)
})

export default app