const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const cheerio = require('cheerio');
const io = require('socket.io')(server);
const moment = require('moment');

const port = process.env.PORT || 3000;

// URB Actual
const endPoint = 'http://128.163.232.78:3000';

io.on('job-update', (update) => {
    console.log("new job update");
  	const data = JSON.parse(update);
  	currentJobs = sortDataByDomain(data.activeJobs);
  	jobHistory = sortDataByDomain(data.completedJobs);
  })

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

function interval(){
  //Load the current html file
  var $ = cheerio.load(fs.readFileSync('index.html'));
  var runningJob = fs.readFileSync('currentJob.json');
  var runningJobContent = JSON.parse(runningJob);

  var formattedTime = moment.unix(runningJobContent.requestEndTime).diff(moment(), 's') + ' seconds left';
  //console.log(formattedTime);


  //Check if job has finished
  if(moment.unix(runningJobContent.requestEndTime).isBefore(moment())){
    const newTimeRemaining = $('<th class="currentJobTime">' + "Job Finished" + '</th>')
    $('.currentJobTime').replaceWith(newTimeRemaining)
    $.html()
    fs.writeFileSync('index.html',$.html()); // Update html file with new time
  }

  else{
    const newTimeRemaining = $('<th class="currentJobTime">' + formattedTime + '</th>')
    $('.currentJobTime').replaceWith(newTimeRemaining)
    $.html()
    fs.writeFileSync('index.html',$.html()); // Update html file with new time
  }
}

  setInterval(interval,1000); // Wait 1 second
//this is express http request http post request can have information
app.post('/request', (req,res) => {
	//the body could contain the a file or simply json of the
	//resources needed
  console.log(req.hostname);
  console.log(req.port);
	console.log(req.body);

	var currentRequest = {
		requestName:      req.body.requestName,
		requestQuality:   req.body.quality,
		requestSecurity:  req.body.security,
		requestBackup:    req.body.backup,
    requestEndTime:   req.body.endTime,
    requestFileSize:  req.body.fileSize
	}
  var count = Object.keys(currentRequest).length;

  //Load the current html file
  var $ = cheerio.load(fs.readFileSync('index.html'));


//  console.log($('.table-body').contents() + 'test');

  console.log(Object.entries(currentRequest));


//Clear the existing table when a new job comes in
const defaultTable = $('<tbody class="table-body" align="left"> </tbody>')
$('.table-body').replaceWith(defaultTable)
$.html()


      $('<tr class="currentJobRequest">').appendTo('.table-body');
      $('<th class="currentJobRequest">' + currentRequest.requestName + '</th>').appendTo('.table-body');
      console.log('inserted JobName');

      $('<th class="currentJobQuality">' + currentRequest.requestQuality + '</th>').appendTo('.table-body');
      console.log('inserted JobQuality');

      $('<th class="currentJobSecurity">' + currentRequest.requestSecurity + '</th>').appendTo('.table-body');
      console.log('inserted JobSecurity');

      $('<th class="currentJobBackup">' + currentRequest.requestBackup + '</th>').appendTo('.table-body');
      console.log('inserted JobBackup');

      var formattedTime = moment.unix(currentRequest.requestEndTime).diff(moment(), 's') + ' seconds left';

      $('<th class="currentJobTime">' + formattedTime + '</th>').appendTo('.table-body');
      $('</tr>').appendTo('.table-body');
      console.log('inserted JobTime');

      $('<th class="currentJobBandwith">' + currentRequest.requestFileSize + '</th>').appendTo('.table-body');
      console.log('inserted JobSize');

    $.html(); //
    // console.log($('.table-body').contents() + 'test')

  var json = JSON.stringify({
    location: "DataCenter1",
    message: "POST Recieved"
  })

  //Respond back to URB
	res.end(json);


  fs.writeFileSync('index.html',$.html()); // Update html file with new html data
  fs.writeFile('currentJob.json', JSON.stringify(currentRequest), (err) => {
    if(err) console.log(err);
    console.log("Wrote to file");
  });

});


app.get('/', (req,res) => {
	res.send('this is the home page');
});

app.listen(port, () => console.log(`listening on port ${port}`));
