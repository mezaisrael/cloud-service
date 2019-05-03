const express = require('express');
const app = express();
const bodyParser =require('body-parser');
const fs = require('fs');
const cors = require('cors');
const moment = require('moment');

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

const port = process.env.PORT || 3000;


let activeJobs = require('./active-jobs');
let completedJobs = require('./completed-jobs');

/*
    Startup Process
 */
// Find the max (last) id of the job in the system.
let maxId = activeJobs.reduce((acc, job) => {
    acc = Math.max(job.id, acc);
    return acc;
}, 0);

maxId = completedJobs.reduce((acc, job) => {
    acc = Math.max(job.id, acc);
    return acc;
}, maxId);

// Transfer all finished (endTime past) jobs from active-jobs to completed-jobs
let transferFromActiveJobs = activeJobs.reduce((acc, job) => {
    const endMoment = moment.unix(job.endTime);
    // If current moment is greater than the end moment of the job, the job had passed.
    if (moment().diff(endMoment) > 0) {
        acc.push(job);
    }

    return acc;
}, []);

// Filter out the completed jobs from the activeJobs array.
activeJobs = activeJobs.reduce((acc, job) => {
    // If the current job is not part of the jobs to be transferred to completed,
    // put it back into the active pool
    if (!transferFromActiveJobs.find(e => e.id === job.id)) {
        acc.push(job);
    }
    return acc;
}, [])

// Update both json files.
fs.writeFile('./urbService/active-jobs.json', JSON.stringify(activeJobs), (err) => {
    if (err) throw err;
    console.log('active-jobs updated');
});

fs.writeFile('./urbService/completed-jobs.json', JSON.stringify(completedJobs.concat(transferFromActiveJobs)), (err) => {
    if (err) throw err;
    console.log('completed-jobs updated');
});

/*
    End Startup Process
 */

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
    maxId++;
    activeJobs.push({...req.body, id: maxId, allocation});
    fs.writeFile('./urbService/active-jobs.json', JSON.stringify(activeJobs), (err) => {
    	if (err) throw err;
    	console.log('Job queued to active');
    });
    res.send('Job Queued!');
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    console.log('Max Id:', maxId);
});

