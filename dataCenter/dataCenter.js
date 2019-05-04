const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const cheerio = require('cheerio');


var http = require('http').Server(app);
var io = require("socket.io").listen(http);
var moment = require('moment');

io.sockets.on('connection',function (socket){
  console.log("connection");

socket.on("request", function (data){
  data.forEach(obj => {
    console.log (data.requestName + data.requestQuality + data.requestSecurity);
  })
});

});

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

const port = process.env.PORT || 3000;

const resources = require('./resources');

let remainingResources = resources;

//this is express http request http post request can have information
app.post('/dc1', (req,res) => {
	//the body could contain the a file or simply json of the
	//resources needed
	console.log(req.body);

	var currentRequest = {
		0:  req.body.requestName,
		1:  req.body.quality,
		2:  req.body.security,
		3:  req.body.backup,
    4:  req.body.endTime
	}
  var count = Object.keys(currentRequest).length;

  //Load the current html file
  var $ = cheerio.load(fs.readFileSync('datacenterui.html'));


//  console.log($('.table-body').contents() + 'test');

  console.log(Object.entries(currentRequest));
  for (let i = 0; i < count; i++) {
    let currentJobPart = currentRequest[i];
    console.log(currentJobPart + "this is the currrent job")

    if(i == 0){
      $('<tr class="currentJobRequest">').appendTo('.table-body');
      $('<th class="currentJobRequest">' + currentJobPart + '</th>').appendTo('.table-body');
      console.log('inserted JobName');
    }

    if(i == 1){
      $('<th class="currentJobQuality">' + currentJobPart + '</th>').appendTo('.table-body');
      console.log('inserted JobQuality');
    }

    if(i == 2){
      $('<th class="currentJobSecurity">' + currentJobPart+ '</th>').appendTo('.table-body');
      console.log('inserted JobSecurity');
    }
    if(i == 3){
      $('<th class="currentJobBackup">' + currentJobPart + '</th>').appendTo('.table-body');
      console.log('inserted JobBackup');
    }

    if(i == 4){
      var formattedTime = moment.unix(currentJobPart).diff(moment(), 's') + ' seconds left';

      $('<th class="currentJobTime">' + formattedTime + '</th>').appendTo('.table-body');
      $('</tr>').appendTo('.table-body');
      console.log('inserted JobTime');
    }

    $.html(); //
//    console.log($('.table-body').contents() + 'test');
    }

var json = JSON.stringify({
  location: "DataCenter1",
  message: "POST Recieved"
})

  //Respond back to URB
	res.end(json);

  fs.writeFileSync('datacenterui.html',$.html()); // Update html file with new html data

});


app.get('/', (req,res) => {
	res.send('this is the home page');
});

app.listen(port, () => console.log(`listening on port ${port}`));
