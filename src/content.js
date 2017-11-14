const $ = require('jquery');
global.jQuery = require("jquery");
require("bootstrap-sass");
const bootbox = require('bootbox');

console.log("Chrome extension content.js is alive and running!"); // Let us know that the extension is running
//console.log(window);
//console.log('window.location.protocol ' + window.location.protocol);
//console.log('window.location.host ' + window.location.host);
// console.log('window.location ' + window.location);
// console.log('window.location.pathname ' + window.location.pathname);
// console.log('window.frames.location ' + window.frames.location);
// console.log('window.frames.location.search ' + window.frames.location.search);
// console.log('window.frames.location.href ' + window.frames.location.href);
// console.log('window.document.url ' + window.document.url);


// Select the upper right (navbar-right) in ServiceNow
let serviceNowSelector = document.getElementsByClassName('navbar-right');
// Turn the upper right (navbar-right) gray in ServiceNow so we indicate the Chrome extenstion has attached
for (let elem of serviceNowSelector) {
    elem.style['background-color'] = '#A9A9A9';  // Set Gray
}


function getTicketInfo(sys_id, callback) {

    let theProtocol = window.location.protocol;
    let theHost = window.location.host;
    //let sncFields = 'number,sys_id,sys_updated_on,state,sys_created_by,active,priority';
    //let theUrl = `${theProtocol}//${theHost}/api/now/v2/table/incident?sysparm_limit=1&sysparm_count=true&sys_id=${sys_id}&sysparm_fields=${sncFields}`;
    let theUrl = `${theProtocol}//${theHost}/api/now/v2/table/incident?sysparm_limit=1&sysparm_count=true&sys_id=${sys_id}`;
    //console.log("theUrl " + theUrl);
    fetch(theUrl, { credentials: 'same-origin' })
        .then(response => {
            if (response.status !== 200) {
                let errMsg = `ERROR: We asked for ${sys_id} and got an HTML status code error ` + response.status;
                throw errMsg;
            } else {
                return response.json();
            }
        })
        .then(body => {
            let myResults = body;
            callback(null, myResults)
        })
        .catch(err => callback(err));
}


function turnBlue() {
    for (let elem of serviceNowSelector) {
        elem.style['background-color'] = '#0000FF'; // Set Blue
        //console.log("SET BLUE");
    }
    setTimeout(function () {
        for (let elem of serviceNowSelector) {
            elem.style['background-color'] = '#A9A9A9'; // Set Gray
            console.log("Automation: COMPLETED");
        }
    }, 3000);
}

function turnGreen() {
    for (let elem of serviceNowSelector) {
        elem.style['background-color'] = '#00FF00'; // Set Green
    }
    setTimeout(function () {
        for (let elem of serviceNowSelector) {
            elem.style['background-color'] = '#A9A9A9'; // Set Gray
            console.log("Automation: COMPLETED");
        }
    }, 3000);
}

function engageRundeck(rundeckJobGuid, incidentNumber, incidentId, callback) {
    for (let elem of serviceNowSelector) {
        elem.style['background-color'] = '#CCCC00'; // Set Yellow
    }
    // Send this job to Rundeck - Just place holder code right now!
    console.log("Automation: Rundeck Started");
    console.log("Automation: Rundeck JobGuid: " + rundeckJobGuid);
    // Get the actual jobId from Rundeck at some point
    let rundeckJobId = "101";
    console.log("Automation: Rundeck JobId: " + rundeckJobId);
    // Get some actual results from Rundeck at some point!
    let results = "Woohoo! Blah blah blah..."
    // Simulate waiting for Rundeck
    setTimeout(function () {
        for (let elem of serviceNowSelector) {
            elem.style['background-color'] = '#00FF00'; // Set Green
            console.log("Automation: Rundeck Completed.");
            callback(null, results);
        }
    }, 3000);
}


chrome.runtime.onMessage.addListener(takeAction);

function takeAction(message, sender, sendResponse) {
    //console.log(message.command);
    if (message.command === "procIncident") {
        console.log("tab.url " + message.url);
        console.log(serviceNowSelector);

        let sys_id = message.sncSysId; // Example let sys_id = 'zce2de9fdb56cbc00b8bf3d51d961976';
        getTicketInfo(sys_id, function (error, response) {
            if (error) {
                console.log(error);
                window.alert("Bummer... " + error);
                turnBlue();
            } else {
                console.log(response.result[0]); // Complete Incident ticket details <--Turn this OFF for PROD!

                let incidentNumber = response.result[0].number;
                let incidentId = response.result[0].sys_id;
                //////

                bootbox.prompt({
                    title: "Please select an automation to run on: Incident # " + incidentNumber,
                    inputType: 'select',
                    inputOptions: [
                        {
                            text: 'Choose one...',
                            value: '',
                        },
                        {
                            text: 'MTR',
                            value: '1',
                        },
                        {
                            text: 'PING',
                            value: '2',
                        },
                        {
                            text: 'Traceroute',
                            value: '3',
                        }
                    ],
                    callback: function (result) {
                        if (result) {
                            // Automation selected
                            console.log(result);
                            let rundeckJobGuid = result; // <--Whatever job GUID in Rundeck actually is!
                            engageRundeck(rundeckJobGuid, incidentNumber, incidentId, function (error, results) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    //console.log(results);
                                    console.log("Automation: RESULTS Update Ticket " + incidentNumber + " - " + results);
                                    turnGreen();
                                }
                            })
                        } else {
                            // Automation cancelled
                            turnBlue();
                        }
                    }
                });

                //////
            }
        });
    }

    if (message.command === "procNotSupported") {
        console.log("tab.url " + message.url);
        console.log(serviceNowSelector);
        window.alert("Sorry, only Incident tickets are supported at this time!");
        turnBlue();
    }

}
