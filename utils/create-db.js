const {Client} = require('pg')

const connectionData = {
  user: 'sa',
  host: 'localhost',
  password: '123',
  port: 5432
}

const connectionDataPostgres = Object.assign({}, connectionData);
connectionDataPostgres["database"] = "postgres"

const connectionDataFeriadosdb = Object.assign({}, connectionData);
connectionDataFeriadosdb["database"] = 'feriadosdb'

const client = new Client(connectionDataPostgres)

client.connect()

const createSql = 'CREATE DATABASE feriadosdb'
const createTableSql = 'CREATE TABLE cidade (codigo_ibge INT, nome VARCHAR(300)) '
const importDataSql = 'COPY cidade(codigo_ibge, nome) FROM \'/home/pablo/instruct-proj/teste-backend-remoto/municipios-2019.csv\' DELIMITER \',\' CSV HEADER;'

client.query(createSql)  
  .then(res => {
      console.log(res.rows)
      createTable()
      client.end()
      console.log("Banco de dados criado")
  })
  .catch(e => {
    console.error(e.stack)
    client.end()
  })

function createTable() {
  const client2 = new Client(connectionDataFeriadosdb)
  client2.connect()

  client2.query(createTableSql)  
    .then(res => {
        console.log(res.rows)
        importData(client2)
        console.log("Tabela criada")
    })
    .catch(e => {
      console.error(e.stack)
      client2.end()
    })
}

function importData(client2) {
  client2.query(importDataSql)
  .then(res => {
    console.log(res)
    client2.end()
    console.log("Dados importados")
  })
}