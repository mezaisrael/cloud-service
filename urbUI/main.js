let currentPage = 'active';

let currentJobs = [
	new Job("cern", true,false, true, "32hr", "123.543.23.34"),

];

let jobHistory = [
	new Job("nasa", true,true, true, "12:00", "127.12.123.123")
];

let showCurrentJobs = () => {
	currentPage = 'active';
	//change the time label
	let timeElement = document.getElementById("time-col");
	timeElement.innerHTML = "Time Left";

	addDataToTable(currentJobs);
}


let showHistory = () => {
	currentPage = 'history';
	//change the time label
	let time = document.getElementById("time-col");
	time.innerHTML = "End Time";

	addDataToTable(jobHistory);
}


//takes in data which is an array of Job objects
const addDataToTable = (data) => {
	let tBody = document.getElementById("table-body");
	let html = "";

	for (let i = 0; i < data.length; i++) {
		let currentJob = data[i];


		// TODO: calculate the time of the job
		let timeLeft = moment.unix(currentJob.endTime).diff(moment(), 's') + ' seconds left';
		let timeEnded = moment.unix(currentJob.endTime).format('MMMM Do YYYY, h:mm:ss a');
		const timeDisplay = currentPage === 'active' ? timeLeft : timeEnded;
		html += "<tr>" +
					"<th>" + currentJob.requestName + "</th>" +
					"<td>" + currentJob.quality + "</td>" +
					"<td>" + currentJob.security + "</td>" +
					"<td>" + currentJob.backup + "</td>" +
					"<td>" + timeDisplay + " </td>" +
					"<td>" + currentJob.allocation + "</td>" +
			"</tr>"
	}

	tBody.innerHTML = html;
}


//all functionality that needs to fire on start goes here
const onMount = () => {
	fetch('http://pcvm1-11.lan.sdn.uky.edu:3000/')
		.then(response => {
			return response.json();
		})
		.then(myJson => {
			currentJobs = myJson.activeJobs;
			jobHistory = myJson.completedJobs;
			showCurrentJobs();
		});

	setInterval(() => {
		currentPage === 'active' ? showCurrentJobs() : showHistory();
	}, 500);
}

window.onload = onMount;






