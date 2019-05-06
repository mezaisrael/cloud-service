const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const moment = require('moment');

app.use(cors())

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

const port = process.env.PORT || 3000;

// Keep var for global scoping.
var activeJobs = require('./active-jobs');
var completedJobs = require('./completed-jobs');

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
    console.log('[EVENT] Startup: active-jobs updated');
});

fs.writeFile('./urbService/completed-jobs.json', JSON.stringify(completedJobs.concat(transferFromActiveJobs)), (err) => {
    if (err) throw err;
    console.log('[EVENT] Startup: completed-jobs updated');
});

/*
    End Startup Process
 */

// Mock jobs for dev. Uncomment to return mock jobs.
activeJobs = require('./mock-active-jobs');
completedJobs = require('./mock-completed-jobs');

// Query all jobs that are currently active or have been completed.
app.get('/', (req,res) => {
    res.send(JSON.stringify({activeJobs, completedJobs}));
});

app.get('/activejobs', (req,res) => {
    res.send(JSON.stringify(activeJobs));
});

app.get('/completedjobs', (req,res) => {
    res.send(JSON.stringify(completedJobs));
});

// Get jobs for particular domains.
const domains = [ 'west', 'north', 'east', 'south' ];
domains.map(domain => {
    return app.get(`/jobs/${domain}`, (req, res) => {
        const domainJobs = activeJobs.filter(e => {
            return e.allocation.includes(domain);
        });
        res.end(JSON.stringify(domainJobs));
    })
})

// Handle request for new job
app.post('/request', (req, res) => {
    // Disable for now. Comment below if need to test for development purpose.
    res.send('/request - API not available at the moment...')
    return;


    // Determine allocation
    /*
    * (Quality, Security)
    * (T,F) -> West
    * (F,T) -> North
    * (T,T) -> East
    * */

    const { quality, security } = req.body;
    let allocation = 'reject';
    // True switch, do not change the order.
    switch (true) {
        case quality && security:
            console.log('[LOG] Quality && Security -> East');
            allocation = queueJobForDomain('east', req.body.requestName);
            break;
        case quality:
            console.log('[LOG] Quality -> West');
            allocation = queueJobForDomain('west', req.body.requestName);
            break;
        case security:
            console.log('[LOG] Security -> North');
            allocation = queueJobForDomain('north', req.body.requestName);
            break;
        default:
            break;
    }
    if (allocation !== 'reject') {
        maxId++;
        console.log(`[EVENT] Assigning request[${req.body.requestName}] to ${allocation}`);
        activeJobs.push({...req.body, id: maxId, allocation});
        writeActiveJobs();

        // Create callback to terminate job and move from active to completed list.
        const jobRunTimeMs = moment.unix(req.body.endTime).diff(moment(), 'ms');
        setTimeout(() => {
            terminateJob(maxId);
            console.log('[EVENT] Terminating job id: ', maxId);
        }, jobRunTimeMs);
        res.send('Job Queued!');
    } else {
        console.log(`[LOG] Reject job: ${req.body.requestName}`);
    }
})

server.listen(port, () => {
    console.log('=== URB Service Started ===')
    console.log(`Listening on port ${port}`);
    console.log('Max Id:', maxId);
    console.log('ActiveJobs:', activeJobs.length);
    console.log('CompletedJobs:', completedJobs.length);
    console.log('===========================')
});

/*
    Helper Functions
 */

const writeActiveJobs = () => {
    fs.writeFile('./urbService/active-jobs.json', JSON.stringify(activeJobs), (err) => {
        if (err) throw err;
        console.log('[EVENT] active-jobs updated.');
    });
}

const writeCompletedJobs = () => {
    fs.writeFile('./urbService/completed-jobs.json', JSON.stringify(completedJobs), (err) => {
        if (err) throw err;
        console.log('[EVENT] completed-jobs updated');
    });
}

const terminateJob = (id) => {
    activeJobs = activeJobs.reduce((acc, job) => {
        if (job.id === id) {
            completedJobs.push(job);
        } else {
            acc.push(job);
        }

        return acc;
    }, []);
    writeActiveJobs();
    writeCompletedJobs();
}

// Try to queue to vm1/2 of particular domain. return 'reject' if no space.
const queueJobForDomain = (domain, jobName) => {
    // Look for VM1
    const d1 = domain + '1';
    const d2 = domain + '2';
    if (activeJobs.filter(e => e.allocation === d1).length === 0) {
        console.log(`[LOG] Found space in ${domain}1 for job ${jobName}`);
        return d1;
    } else if (activeJobs.filter(e => e.allocation === d2).length === 0) {
        console.log(`[LOG] Found space in ${domain}2 for job ${jobName}`);
        return d2;
    } else {
        return 'reject';
    }
}
