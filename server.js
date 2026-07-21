import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import expressPlayground from "graphql-playground-middleware-express";
import { createServer } from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import graphqlUploadExpress from "graphql-upload/graphqlUploadExpress.mjs";
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { readFileSync } from "fs"
import fileUpload from 'express-fileupload'
import bodyParser from 'body-parser'
import path from "path"
import { resolvers } from "./resolvers/index.js";
import nunjucks from 'nunjucks'
import cors from 'cors'
import swaggerUi from "swagger-ui-express"
// https://stackoverflow.com/questions/70106880/err-import-assertion-type-missing-for-import-of-json-file
// https://github.com/tc39/proposal-import-attributes
// In console: (node:220435) ExperimentalWarning: Importing JSON modules is an experimental feature and might change at any time (Use `node --trace-warnings ...` to show where the warning was created)
import swaggerDocument from './swagger.json' with { type: "json" };
import dotenv from 'dotenv';

dotenv.config({ 
	path: process.env.NODE_ENV === "test" ? ".env.testing" : 
		process.env.NODE_ENV === "production" ? ".env.production" : ".env"
});

const typeDefs = //	readFileSync("./schema.graphql", "utf8")
readFileSync(
    new URL("./schema.graphql", import.meta.url),
    "utf8"
);

// routes imports
import auth from './routes/auth.js'
import userRoute from './routes/userRoute.js'
import exempleRoute from './routes/exempleRoute.js'
import mercadopagoRoute from './routes/mercadopago.js'
import automationsRoute from './routes/automations.js'

const app = express()

// This `app` is the returned value from `express()`.
const httpServer = createServer(app);

app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument))
app.use(bodyParser.json()); // to support JSON-encoded bodies
// to support URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cors({
	origin: '*',
	exposedHeaders: '*',
	methods: ['GET','POST','DELETE','PUT', 'PATCH']
}));

//app.use(fileUpload())
// Para o upload do graphql funcionar o fileUpload do express deve ser comentado
// graphqlUploadExpress deve ser posicionado antes inicialização do middleware
// https://github.com/jaydenseric/graphql-upload
app.use(
	graphqlUploadExpress({
	  // Limits here should be stricter than config for surrounding infrastructure
	  // such as NGINX so errors can be handled elegantly by `graphql-upload`.
	  maxFileSize: 10000000, // 10 MB
	  maxFiles: 20,
	})
  );
// app.set("views", path.join(__dirname, "views"))
// app.set('view engine', 'pug')
// nunjucks.configure('views', {
//   autoescape: true,
//   express: app
// });
// nunjucks.render('index.html', { foo: 'bar' });

// Create the schema, which will be used separately by ApolloServer and
// the WebSocket server.
const schema = makeExecutableSchema({ typeDefs, resolvers });

// Creating the WebSocket server
const wsServer = new WebSocketServer({
	// This is the `httpServer` we created in a previous step.
	server: httpServer,
	// Pass a different path here if app.use
	// serves expressMiddleware at a different path
	path: '/graphql',
});
  
// Hand in the schema we just created and have the
// WebSocketServer start listening.
const serverCleanup = useServer({ schema }, wsServer);
/**
 * Cria uma nova instância do servidor
 * Envia-lhe um objeto com typeDefs (o esquema) e resolvers
 */
const server = new ApolloServer({ typeDefs, resolvers, 
	plugins: [
		// Proper shutdown for the HTTP server.
		ApolloServerPluginDrainHttpServer({ httpServer }),
		// Proper shutdown for the WebSocket server.
		{async serverWillStart() {
			return { 
				async drainServer() { await serverCleanup.dispose() },
			};
		}},
	] 
})
await server.start()
server.applyMiddleware({ app })

const PORT = 4000;
httpServer.listen(PORT, () => {
	console.log(`Server is now running on http://localhost:${PORT}/graphql`);
});



app.use('/playground', expressPlayground.default({endpoint: '/graphql'}))

// Create and use the GraphQL handler.
//app.post("/graphql", createHandler({ schema: schema, rootValue: resolvers }))

app.get('/', function(req, res) { res.send('nodejs-api running'); });
app.get('/exemplo_html', function(req, res) {
	res.sendFile(path.join(__dirname, "views/index.html"));
});
app.get('/exemplo_pug', function (req, res) {
	res.render('exemplo_pug', { title: 'Hey', message: 'Hello there!'});
});

app.use('/api/auth', auth)
app.use('/api/user', userRoute)
app.use('/api/exemple-route', exempleRoute)
app.use('/api/mercadopago', mercadopagoRoute)
app.use('/api/automations', automationsRoute)

// default response:
app.use((req, res) => { res.status(404) })

export default app
//export { start }
