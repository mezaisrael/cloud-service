const express = require('express');
const app = express();
const bodyParser =require('body-parser');
const fs = require('fs');

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
	
	//this is how we can calculate the remaining resources 
	remainingResources.cpus = remainingResources.cpus - req.body.cpus;
	remainingResources.ram = remainingResources.ram - req.body.ram;

	//send back to the urb the remaining resources
	res.json(JSON.stringify(remainingResources));

	//make a file
	fs.writeFile('remainingResources.json', JSON.stringify(remainingResources), (err) => {
		if (err) throw err;
		console.log('The file has been saved');
	});

})


app.get('/', (req,res) => {
	res.send('this is the home page');
});

app.listen(port, () => console.log(`listenin on port ${port}`));

