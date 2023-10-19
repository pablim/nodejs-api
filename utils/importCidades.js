const {Client} = require('pg')

const connectionData = {
  user: 'sa',
  host: 'localhost',
  password: '123',
  database: '',
  port: 5432
}

const client = new Client(connectionDataPostgres)
client.connect()

const createTableSql = 'CREATE TABLE cidade (codigo_ibge INT, nome VARCHAR(300)) '
const importDataSql = 'COPY cidade(codigo_ibge, nome) FROM \'/home/pablo/instruct-proj/teste-backend-remoto/municipios-2019.csv\' DELIMITER \',\' CSV HEADER;'

client.query(createTableSql)  
  .then(res => {
      console.log(res.rows)
      importData(client)
      console.log("Tabela criada")
  })
  .catch(e => {
    console.error(e.stack)
    client.end()
  })

function importData(client) {
  client.query(importDataSql)
  .then(res => {
    console.log(res)
    client.end()
    console.log("Dados importados")
  })
}