let possibleAddresses =
{
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
    "hostname": "",
    "l3": "204.76.187.95",
    "l2": "10.10.11.1"
  },
  "west2": {
    "hostname": "",
    "l3": "204.76.187.96",
    "l2": "10.10.11.2"
  },
  "localhost": {
    "hostname": "localhost"
  }
}
  $.getJSON( "../../cloud-service/server-config.json", function( json ) {
      console.log( "JSON Data received, name is " + json.name);
  });

  function init() {
   loadJSON(function(response) {
    // Parse JSON string into object
      var actual_JSON = JSON.parse(response);
      console.log(actual_JSON);
   });
  }
//Show the correct name based on ip
const displayCorrectName = (data) =>{
//    console.log(data.urb.hostname);
//Get the current host name

var hostname = window.location.hostname;

//For Testing
//var hostname = 'pcvm2-15.lan.sdn.uky.edu'

for(var entry in data)
{
  possibleHostName = (data[entry].hostname);
  console.log(possibleHostName);

  if(possibleHostName === hostname){
    document.getElementById("title").innerHTML = entry;
    console.log("Found a valid hostname");
  }

}
console.log("Couldn't find a matching hostname");


}


displayCorrectName(possibleAddresses);
