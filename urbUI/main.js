let currentPage = 'active';

let currentJobs = [];

let jobHistory = [];

const serverConfig = {
	"urb": {
		"hostname": "pcvm2-15.lan.sdn.uky.edu",
		"l3": "128.163.232.78",
		"l2": "10.10.4.6"
	},
	"dashboard": {
		"hostname": "pcvm3-12.lan.sdn.uky.edu",
		"l3": "128.163.232.80",
		"l2": "10.10.10.23"
	},
	"east1": {
		"hostname": "pcvm1-3.lan.sdn.uky.edu",
		"l3": "128.163.232.69",
		"l2": "10.10.10.20"
	},
	"east2": {
		"hostname": "pcvm2-12.lan.sdn.uky.edu",
		"l3": "128.163.232.75",
		"l2": "10.10.10.21"
	},
	"north1": {
		"hostname": "pcvm5-5.lan.sdn.uky.edu",
		"l3": "128.163.232.86",
		"l2": "10.10.2.3"
	},
	"north2": {
		"hostname": "pcvm5-7.lan.sdn.uky.edu",
		"l3": "128.163.232.88",
		"l2": "10.10.2.4"
	},
	"west1": {
		"hostname": "pcvm3-13.lan.sdn.uky.edu",
		"l3": "128.163.232.81",
		"l2": "10.10.1.1"
	},
	"west2": {
		"hostname": "pcvm1-5.lan.sdn.uky.edu",
		"l3": "128.163.232.71",
		"l2": "10.10.1.2"
	},
	"localhost": {
		"hostname": "localhost"
	}
};

// Local host for dev work
// const endPoint = 'http://localhost:3000';

// URB Actual
const endPoint = `http://${serverConfig.urb.hostname}:3000`;

var socket = io(endPoint);
socket.on('job-update', (update) => {
	const data = JSON.parse(update);
	currentJobs = sortDataByDomain(data.activeJobs);
	jobHistory = sortDataByDomain(data.completedJobs);
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
		const rowClassName = i%2===1 ? 'alt' : '';
		html += "<tr class=\""+ rowClassName +"\">" +
					"<th>" + currentJob.id + "</th>" +
					"<td>" + currentJob.requestName + "</td>" +
					"<td>" + currentJob.quality + "</td>" +
					"<td>" + currentJob.security + "</td>" +
					"<td>" + currentJob.backup + "</td>" +
					"<td>" + timeDisplay + " </td>" +
					// TODO: Once IP address are finalized, replace layer text with ip address.
					"<td>" + currentJob.allocation + " (layer: "+ currentJob.layer + ")</td>" +
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






