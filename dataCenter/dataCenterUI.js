let possibleAddresses =
  {
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
