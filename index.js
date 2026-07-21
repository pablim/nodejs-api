import app from "./server.js"
import fs from "fs"
import https from "https"
import { ApolloServer } from 'apollo-server-express'
import expressPlayground from "graphql-playground-middleware-express";
import http from 'http';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { readFileSync } from "fs"
import { resolvers } from "./resolvers/index.js";

const typeDefs = readFileSync("./schema.graphql", "utf8")

app.set('port', process.env.PORT || 5000);
const port = app.get('port');

if (process.env.WITH_HTTPS == "true") {
    https.createServer(
        {
            key: fs.readFileSync(process.env.HTTPS_KEY),
            cert: fs.readFileSync(process.env.HTTPS_CERT)
        }, 
        app
    )
    .listen(port, () => {
        console.log(`Servidor rodando em https://localhost:${port}`)
    });

} else {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`)
    });
}

