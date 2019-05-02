const express = require('express');
const app = express();
const bodyParser =require('body-parser');
const fs = require('fs');
const cors = require('cors')

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

const port = process.env.PORT || 3000;


let activeJobs = require('./active-jobs');
let completedJobs = require('./completed-jobs');

// Mock jobs for dev
let mockActiveJobs = require('./mock-active-jobs');
let mockCompletedJobs = require('./mock-completed-jobs');

// Query all jobs that are currently active or have been completed.
app.get('/', (req,res) => {
    res.send(JSON.stringify({activeJobs: mockActiveJobs, completedJobs: mockCompletedJobs}));
});

app.get('/activejobs', (req,res) => {
    res.send(JSON.stringify(mockActiveJobs));
});

app.get('/completedjobs', (req,res) => {
    res.send(JSON.stringify(mockCompletedJobs));
});

// Get jobs for particular domains.
const domains = [ 'west', 'north', 'east', 'south' ];
domains.map(domain => {
    return app.get(`/jobs/${domain}`, (req, res) => {
        const westJobs = mockActiveJobs.filter(e => {
            return e.allocation.includes(domain);
        });
        res.end(JSON.stringify(westJobs));
    })
})

// Handle request for new job
app.post('/request', (req, res) => {
    // Determine allocation
    /*
    * (Quality, Security)
    * (T,F) -> West
    * (F,T) -> North
    * (T,T) -> East
    * */

    const { quality, security } = req.body;
    let allocation = 'east1';
    // True switch, do not change the order.
    switch (true) {
        case quality && security:
            console.log('Quality && Security -> East');
            allocation = 'east1';
            break;
        case quality:
            console.log('Quality -> West');
            allocation = 'west1';
            break;
        case security:
            console.log('Security -> North');
            allocation = 'north1';
            break;
        default:
            break;
    }

    activeJobs.push({...req.body, allocation});
    fs.writeFile('./urbService/active-jobs.json', JSON.stringify(activeJobs), (err) => {
    	if (err) throw err;
    	console.log('Job queued to active');
    });
    res.send('Job Queued!');
})

app.listen(port, () => console.log(`Listening on port ${port}`));

