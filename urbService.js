const express = require('express');
const app = express();
const bodyParser =require('body-parser');
const fs = require('fs');
const cors = require('cors')

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

const port = process.env.PORT || 3001;

let activeJobs = require('./active-jobs');

app.get('/', (req,res) => {
    res.send(JSON.stringify(activeJobs));
});

app.post('/request', (req, res) => {
    activeJobs.push(req.body);
    fs.writeFile('./active-jobs.json', JSON.stringify(activeJobs), (err) => {
    	if (err) throw err;
    	console.log('Job queued to active');
    });
    res.send('Job Queued!');
})

app.listen(port, () => console.log(`listenin on port ${port}`));

