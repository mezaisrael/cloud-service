let currentPage = 'active';

let currentJobs = [];

let jobHistory = [];

const serverConfig = {
    "urb": {
        "hostname": "pcvm3-14.instageni.umkc.edu",
        "l3": "204.76.187.94",
        "l2": "10.10.12.6"
    },
    "dashboard": {
        "hostname": "pcvm1-9.instageni.umkc.edu",
        "l3": "204.76.187.77",
        "l2": "n/a"
    },
    "east1": {
        "hostname": "pcvm2-20.instageni.umkc.edu",
        "l3": "204.76.187.85",
        "l2": "10.10.12.1"
    },
    "east2": {
        "hostname": "pcvm1-10.instageni.umkc.edu",
        "l3": "204.76.187.78",
        "l2": "10.10.12.2"
    },
    "north1": {
        "hostname": "pcvm3-13.instageni.umkc.edu",
        "l3": "204.76.187.93",
        "l2": "10.10.10.3"
    },
    "north2": {
        "hostname": "pcvm2-24.instageni.umkc.edu",
        "l3": "204.76.187.89",
        "l2": "10.10.10.4"
    },
    "west1": {
        "hostname": "pcvm3-15.instageni.umkc.edu",
        "l3": "204.76.187.95",
        "l2": "10.10.11.1"
    },
    "west2": {
        "hostname": "pcvm3-16.instageni.umkc.edu",
        "l3": "204.76.187.96",
        "l2": "10.10.11.2"
    },
    "localhost": {
        "hostname": "localhost"
    }
};

const getServerInfo = (s) => {
    switch (s) {
        case 'east1':
            return serverConfig.east1;
        case 'east2':
            return serverConfig.east2;
        case 'west1':
            return serverConfig.west1;
        case 'west2':
            return serverConfig.west2;
        case 'north1':
            return serverConfig.north1;
        case 'north2':
            return serverConfig.north2;
        case 'urb':
            return serverConfig.urb;
        case 'dashboard':
            return serverConfig.dashboard;
        default:
            return serverConfig.localhost;
    }
}

// Local host for dev work
// const endPoint = 'http://localhost:3000';

// URB Actual
const endPoint = `http://${serverConfig.urb.hostname}:3000`;

var socket = io(endPoint);
socket.on('job-update', (update) => {
	const data = JSON.parse(update);
	currentJobs.sort((a, b) => a.id - b.id);
	jobHistory.sort((a, b) => a.id - b.id);
})

let showCurrentJobs = () => {
	currentPage = 'active';
	//change the time label
	let timeElement = document.getElementById("time-col");
	timeElement.innerHTML = "Time Left";
	document.getElementById('current-jobs').className = "selected"
    document.getElementById('past-jobs').className = ""
	addDataToTable(currentJobs);
}


let showHistory = () => {
	currentPage = 'history';
	//change the time label
	let time = document.getElementById("time-col");
	time.innerHTML = "End Time";
    document.getElementById('current-jobs').className = ""
    document.getElementById('past-jobs').className = "selected"
	addDataToTable(jobHistory);
}


let redirectToDataCenter = (e) => {

}

//takes in data which is an array of Job objects
const addDataToTable = (data) => {
	let tBody = document.getElementById("table-body");
	let html = "";

	for (let i = 0; i < data.length; i++) {
		let currentJob = data[i];

		let timeLeft = moment.unix(currentJob.endTime).diff(moment(), 's');
		let timeEnded = moment.unix(currentJob.endTime).format('MMMM Do YYYY, h:mm:ss a');
		let timeDisplay = currentPage === 'active' ? timeLeft : timeEnded;
		if (currentJob.allocation === 'queued') {
			timeDisplay = currentJob.duration;
		}
        const serverInfo = getServerInfo(currentJob.allocation);
				const urbInfo = getServerInfo('urb');
		    const link = currentJob.allocation === 'queued' || currentJob.allocation === 'terminated' ?
					urbInfo.hostname + '/cloud-service/urbUI'
					:
					serverInfo.hostname + '/cloud-service/dataCenter';
		    const targetBlank = currentJob.allocation === 'queued' || currentJob.allocation === 'terminated' ?
					"" : "_blank";
		const rowClassName = i%2===1 ? 'alt' : '';
		html += "<tr onclick='redirectToDataCenter(currentJob.allocation)' class=\""+ rowClassName +"\">" +
					"<th>" + currentJob.id + "</th>" +
					"<td>" + currentJob.requestName + "</td>" +
					"<td>" + currentJob.quality + "</td>" +
					"<td>" + currentJob.security + "</td>" +
					"<td>" + currentJob.backup + "</td>" +
					"<td>" + timeDisplay + " </td>" +
					// TODO: Once IP address are finalized, replace layer text with ip address.
					"<td><a href='http://"+link+"' target='"+targetBlank+"'>"
			+ currentJob.allocation + " (layer: "+ currentJob.layer + ")" +
			"</a></td>" +
			"</tr>"
	}

	tBody.innerHTML = html;
}



//all functionality that needs to fire on start goes here
const onMount = () => {
	fetch(endPoint)
		.then(response => {
			return response.json();
		})
		.then(myJson => {
            console.log('OnMount Res', myJson);
            currentJobs = myJson.activeJobs;
			jobHistory = myJson.completedJobs;
			showCurrentJobs();
		});

	setInterval(() => {
		currentPage === 'active' ? showCurrentJobs() : showHistory();
	}, 300);
}

const sortDataByDomain = (data) => {
	let west = [];
	let north = [];
	let east = [];
	let queue = [];
	let terminated = [];
	//im only checking the first letter for simplicity
	data.forEach( job => {
		if (job.allocation[0] === 'w') {
			west.push(job);
		} else if (job.allocation[0] === 'n') {
			north.push(job);
		} else if (job.allocation[0] === 'e') {
			east.push(job);
		} else if (job.allocation === 'queued'){
			queue.push(job);
		} else if (job.allocation === 'terminated') {
			terminated.push(job);
		}
	});

	return (west.concat(north).concat(east).concat(queue).concat(terminated));
}

window.onload = onMount;






