
let currentJobs = [
	new Job("cern", true,false, true, "32hr", "123.543.23.34"),
	new Job("Team 3", false,false, false, "2hr", "123.54.123.34"),
	new Job("Hunter College", false,true, false, "32hr", "123.543.23.34"),

];

let jobHistory = [
	new Job("nasa", true,true, true, "12:00", "127.12.123.123")
];

let showCurrentJobs = () => {
	//change the time label
	let time = document.getElementById("time-col");
	time.innerHTML = "Time Left";

	addDataToTable(currentJobs);
}


let showHistory = () => {
	//change the time label
	let time = document.getElementById("time-col");
	time.innerHTML = "End Time";

	addDataToTable(jobHistory);
}


//takes in data which is an array of Job objects
const addDataToTable = (data) => {
	let tBody = document.getElementById("table-body");
	console.log(tBody);
	let html = "";
	for (let i = 0; i < data.length; i++) {
		let currentJob = data[i];

		html += "<tr>" +
					"<th>" + currentJob.name + "</th>" +
					"<td>" + currentJob.quality + "</td>" +
					"<td>" + currentJob.security + "</td>" +
					"<td>" + currentJob.backup + "</td>" +
					"<td>" + currentJob.time + "</td>" +
					"<td>" + currentJob.location + "</td>" +
			"</tr>"
	}

	tBody.innerHTML = html;
}

//when page start show current running jobs
window.onload = showCurrentJobs;