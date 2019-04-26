const express = require('express');
const app = express();
const bodyParser =require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

const port = process.env.PORT || 3000;

const resources = {
	
	cpus: 32,
	//in gb
	ram: 16,
	//in gb
	ssd: 1000,
}

let remainingResources = resources;


//this is express http request http post request can have information
app.post('/dc1', (req,res) => {
	//the body could contain the a file or simply json of the
	//resources needed
	console.log(req.body);

	//this is how we can calculate the remaining resources 
	remainingResources.cpu = remainingResources.cpus - req.cpus

	//send back to the urb the remaining resources
	res.json(JSON.stringify(remainingResources));
})


app.get('/', (req,res) => {
	res.send('this is the home page');
});

app.listen(port, () => console.log(`listenin on port ${port}`));

