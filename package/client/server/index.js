const express = require('express');
const app = express();

var fs = require('fs'), ini = require('ini')
var config = ini.parse(fs.readFileSync('./app_config.ini', 'utf-8'))

const path = require('path')

// add middleware
app.use(express.static(path.join(__dirname, '..', 'dist')));
app.use(express.static("public"));

app.listen(config.server.port, () => {
    console.log(`Aplicação iniciada na porta ${config.server.port}, acesse http://localhost:${config.server.port}`);
})