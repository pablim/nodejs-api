const app = require('./server')
const fs = require("fs");
const https = require("https");

app.set('port', process.env.PORT || 5000);
const port = app.get('port');

if (process.env.WITH_HTTPS == "true") {
    https.createServer(
        {
            key: fs.readFileSync(process.env.HTTPS_KEY),
            cert: fs.readFileSync(process.env.HTTPS_CERT)
        }, 
        app
    ).listen(port, () => {
        console.log(`Servidor rodando em https://localhost:${port}`)
    });
} else {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`)
    });
}
