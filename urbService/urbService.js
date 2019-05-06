const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const moment = require('moment');
const io = require('socket.io')(server);

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

const port = process.env.PORT || 3000;

// Keep var for global scoping.
var activeJobs = require('./active-jobs');
var completedJobs = require('./completed-jobs');

// Mock jobs for dev. Uncomment to return mock jobs.
// activeJobs = require('./mock-active-jobs');
// completedJobs = require('./mock-completed-jobs');

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
        // TODO: Add callback to terminate jobs during startup.
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


/*
    Socket.IO
 */

io.on('connection', (socket) => {
    console.log('[SOCKET.IO] Connection established');
});


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

// Endpoint to kill request
app.post('/kill', (req, res) => {
    console.log('[EVENT] Kill order for job ID:', req.body.id);
    terminateJob(req.body.id);
    console.log(`[SOCKET.IO] Emitting update. Job id killed: ${req.body.id}`);
    io.emit('job-update', JSON.stringify({activeJobs, completedJobs}));
})

// Handle request for new job
app.post('/request', (req, res) => {
    // Disable for now. Comment below if need to test for development purpose.
    // res.send('/request - API not available at the moment...')
    // return;


    // Determine allocation
    /*
    * Algorithm:
    * alpha = 0.8;
    * if security -> alpha += 0.8
    * if backup -> alpha += 0.4
    * if quality -> alpha -= 0.2
    *
    * score = (duration/10) * alpha
    *
    * if score >= 5, [SECURITY]
    * else if score < 5, [QUALITY]
    *
    * west = [QUALITY]
    * north = [SECURITY]
    * east = [QUALITY, SECURITY]
    * */
    console.log('[LOG] Request Body: ', req.body);
    const { quality, security, backup, duration } = req.body;

    let alpha = 0.8;
    if (!!security) {
        alpha += 0.8;
    }

    if (!!backup) {
        alpha += 0.4;
    }

    if (!!quality) {
        alpha -= 0.2;
    }

    const score = (duration/10) * alpha;

    console.log(`[LOG] Request[${req.body.requestName}] Score: ${score}`);
    let allocation = 'queued';
    // True switch, do not change the order.
    switch (true) {
        case score < 5:
            console.log('[LOG] Quality -> attempting to allocate to: West');
            allocation = queueJobForDomain('west', req.body.requestName);
            break;
        default:
            console.log('[LOG] Security -> attempting to allocate to: North');
            allocation = queueJobForDomain('north', req.body.requestName);
            break;
    }

    // If it's still in queue, try to allocate to best domain east that supports both security/quality
    if (allocation === 'queued') {
        console.log('[LOG] Security -> attempting to allocate to: East');
        allocation = queueJobForDomain('east', req.body.requestName);
    }


    if (allocation !== 'queued') {
        maxId++;
        const id = maxId;
        console.log(`[EVENT] Assigning request[${req.body.requestName}] - ${allocation}`);
        activeJobs.push({...req.body, id, allocation});
        writeActiveJobs();

        // Create callback to terminate job and move from active to completed list.
        const jobRunTimeMs = moment.unix(req.body.endTime).diff(moment(), 'ms');
        setTimeout(() => {
            terminateJob(id);
            console.log('[EVENT] Terminating job id: ', id);
            console.log('[SOCKET.IO] Emitting update.');

            io.emit('job-update', JSON.stringify({activeJobs, completedJobs}));
        }, jobRunTimeMs);
        // TODO: Send proper response.
        res.send({ id, allocation });
    } else {
        maxId++;
        const id = maxId;
        console.log(`[EVENT] Assigning request[${req.body.requestName}] - ${allocation}`);
        activeJobs.push({...req.body, id, allocation});
        writeActiveJobs();
        console.log(`[LOG] Queued job: ${req.body.requestName}`);
        res.send({ id, allocation });
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
        console.log('[SOCKET-IO] Emitting active job update');
        io.emit('job-update', JSON.stringify({activeJobs, completedJobs}));
    });
}

const writeCompletedJobs = () => {
    fs.writeFile('./urbService/completed-jobs.json', JSON.stringify(completedJobs), (err) => {
        if (err) throw err;
        console.log('[EVENT] completed-jobs updated');
        console.log('[SOCKET-IO] Emitting completed job update');
        io.emit('job-update', JSON.stringify({activeJobs, completedJobs}));
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

// Try to queue to vm1/2 of particular domain. return 'queued' if no space.
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
        return 'queued';
    }
}
