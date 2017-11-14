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


// // Load jQuery
// var head = document.getElementsByTagName('head')[0];
// var script = document.createElement('script');
// script.type = 'text/javascript';
// script.src = "https://code.jquery.com/jquery-3.2.1.min.js";
// // Then bind the event to the callback function.
// // There are several events for cross browser compatibility.
// script.onreadystatechange = handler;
// script.onload = handler;
// // Fire the loading
// head.appendChild(script);
// function handler() {
//     console.log('jquery added and loaded!');
// }


// // Determine if the document has fully loaded and is ready
// if (document.readyState === 'complete') {
//     console.log('Document Ready!');
// }


// // Turn all paragraphs green to verify extension is doing something
// let paragraph = document.getElementsByTagName('p');
// for (elt of paragraph) {
//     elt.style['background-color'] = '#00FF00';
// }


// Select the upper right (navbar-right) in ServiceNow
let serviceNowSelector = document.getElementsByClassName('navbar-right');
// Turn the upper right (navbar-right) gray in ServiceNow so we indicate the Chrome extenstion has attached
for (let elem of serviceNowSelector) {
    elem.style['background-color'] = '#A9A9A9';
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


function turnGray() {
    setTimeout(function () {
        for (let elem of serviceNowSelector) {
            elem.style['background-color'] = '#A9A9A9';
            console.log("Automation: COMPLETED");
        }
    }, 3000);
}

function engageRundeck(rundeckJobGuid, incidentNumber, incidentId, callback) {
    // Turn Yellow
    for (let elem of serviceNowSelector) {
        elem.style['background-color'] = '#CCCC00';
    }
    // Send this job to Rundeck
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
            elem.style['background-color'] = '#00FF00';
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
        // Set Yellow
        for (let elem of serviceNowSelector) {
            elem.style['background-color'] = 'FFFF00';
        }

        let sys_id = message.sncSysId; //let sys_id = 'zce2de9fdb56cbc00b8bf3d51d961976';
        getTicketInfo(sys_id, function (error, response) {
            if (error) {
                console.log(error);
                window.alert("Bummer... " + error);
                // Set Gray
                for (let elem of serviceNowSelector) {
                    elem.style['background-color'] = '#A9A9A9';
                    console.log("Automation: RESET");
                }
            } else {
                console.log(response.result[0]); // Complete Incident ticket details <--Turn this OFF for PROD!

                let incidentNumber = response.result[0].number;
                let incidentId = response.result[0].sys_id;
                if (window.confirm("Run automation on \nIncident # " + incidentNumber) == true) {
                    console.log("Automation: ACTIVATED");
                    for (let elem of serviceNowSelector) {
                        elem.style['background-color'] = '#FF0000';
                    }

                    // function openPopupWindow() {
                    //     window.open("http://google.com", "popup", "width=668,height=548,scrollbars=yes, resizable=yes");
                    //     console.log("Automation: POPUP WINDOW");
                    // }
                    // openPopupWindow();

                    let rundeckJobGuid = "mtrmtrmtr" // <--Whatever job GUID in Rundeck actually is!
                    engageRundeck(rundeckJobGuid, incidentNumber, incidentId, function (error, results) {
                        if (error) {
                            console.log(error);
                        } else {
                            //console.log(results);
                            for (let elem of serviceNowSelector) {
                                elem.style['background-color'] = '#00FF00';
                                console.log("Automation: RESULTS Update Ticket " + incidentNumber + " - " + results);
                                turnGray();
                            }
                        }
                    })
                } else {
                    // Automation cancelled
                    console.log("Automation: CANCELLED");
                    // Turn Blue
                    for (let elem of serviceNowSelector) {
                        elem.style['background-color'] = '#87CEFA';
                    }
                    turnGray();
                }
            }
        });
    }

    if (message.command === "procNotSupported") {
        console.log("tab.url " + message.url);
        console.log(serviceNowSelector);
        // Set Blue
        for (let elem of serviceNowSelector) {
            elem.style['background-color'] = '0000FF';
        }
        //window.alert("Sorry, only Incident tickets are supported at this time!");
        //turnGray();

        bootbox.prompt({
            title: "Please select an automation!",
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
                console.log(result);
                turnGray();
            }
        });

    }

}
