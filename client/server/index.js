const express = require('express');
// const http = require('http')
const app = express();

const path = require('path')

// add middleware
app.use(express.static(path.join(__dirname, '..', 'dist')));
app.use(express.static("public"));

app.listen(5000, () => {
    console.log("Server started on port 5000");
})