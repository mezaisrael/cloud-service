const express = require('express');
const app = express();
const bodyParser =require('body-parser');
const fs = require('fs');
const cors = require('cors')

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

const port = process.env.PORT || 3001;

const resources = require('./resources');

let remainingResources = resources;

app.get('/', (req,res) => {
    res.send(JSON.stringify(remainingResources));
});

app.listen(port, () => console.log(`listenin on port ${port}`));

