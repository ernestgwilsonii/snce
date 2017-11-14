console.log("Chrome extension background.js is alive and running!");

chrome.browserAction.onClicked.addListener(buttonClicked);

const parseQueryString = function (queryString, callback) {
    let split1 = queryString.split("?");
    //console.log(split1[1]);
    let split2 = split1[1].split("sys_id");
    //console.log(split2[1]);
    let split3 = split2[1].split("&");
    //console.log(split3[0]);
    let split4 = split3[0].replace(/%3D/g, "").split("%");
    //console.log(split4[0]);
    let sncSysId = split4[0];
    console.log(sncSysId);
    callback(null, sncSysId);
};


function buttonClicked(tab) {
    console.log("button clicked!");
    console.log(tab);
    console.log(tab.url);
    let theUrl = tab.url;
    let reIncident = /(incident.do)+/; // Use regex to see if this is an incident ticket by looking for 'incident.do' in the URL
    let incidentTicket = theUrl.match(reIncident);
    if (incidentTicket) {
        console.log('INFORMATIONAL: Incident ticket type detected!')
        let msg = {
            command: "procIncident",
            url: tab.url
        }
        let queryString = theUrl;
        parseQueryString(queryString, function (error, sncSysId) {
            if (error) {
                console.log('ERROR: ' + error);
                return;
            }
            msg.sncSysId = sncSysId;
            chrome.tabs.sendMessage(tab.id, msg);
        });
    } else {
        console.log('WARNING: Only incident ticket types are supported at this time!')
        let msg = {
            command: "procNotSupported",
            url: tab.url
        }
        chrome.tabs.sendMessage(tab.id, msg);
    }
}
