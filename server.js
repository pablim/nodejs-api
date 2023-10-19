const express = require('express')
const fileUpload = require('express-fileupload')
const bodyParser = require('body-parser')
const path = require("path");
const nunjucks = require('nunjucks')
const cors = require('cors')
const swaggerJsdoc = require("swagger-jsdoc")
const swaggerUi = require("swagger-ui-express")
const options = require('./swaggerOptions')

require('dotenv').config({  
  path: process.env.NODE_ENV === "test" ? 
      ".env.testing" : 
      process.env.NODE_ENV === "production" ? 
          ".env.production" : 
          ".env"
})

const specs = swaggerJsdoc(options);

/**
 * Import routes
 */
const auth = require('./routes/auth')
const exempleRoute = require('./routes/exempleRoute')

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

// default response:
app.use((req, res) => {
    res.status(404)
})

module.exports = app