const TIME_GAP = 3600*1000; // in milliseconds
const API_KEY = "355c6fb67f8dbb3a15a103816e614daa";
const URL = "http://data.fixer.io/api/latest?access_key=355c6fb67f8dbb3a15a103816e614daa";
const DATAREF = "currentExchangeRate";

var port = process.env.PORT || 8080;

var express = require('express');
var request = require('request');
var admin = require('firebase-admin');


var serviceAccount = require("./converter-13b02-firebase-adminsdk-zbn29-1e801e1a41");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://converter-13b02.firebaseio.com"
});

const app = express();

app.get('/', function (req, resp) {
    console.log("\nAccessed : "+req.url);
    //resp.send("Hello world");
    var db = admin.database();
    var ref = db.ref("/server");

    //Checks if DB is outdated
    ref.once("value", function (snapshot) {
        var obj = snapshot.val();
        var timeNow = Date.now();
        //console.log("timestamp :"+obj[DATAREF]["timestamp"]);
        //console.log("timenow :"+timeNow);
        var timeDiff = timeNow - obj["lastUpdated"] ;
        //console.log("diff:"+timeDiff);
        //console.log(timeDiff);
        if (timeDiff < TIME_GAP) {
            console.log("Up to date Data");
            console.log("sending up to data , last updated (sec) : "+timeDiff/1000+", saved data from DB ");
            resp.end(JSON.stringify(obj[DATAREF]));
            console.log("sending finished");
            //dataBaseSender();
        }else {
            //resp.end("Outdated0 "+timeDiff);
            //updater(timeNow);
            console.log("Outdated DAta : trying to update");
            timeUpdater(timeNow);
            updateDBandSendJSON();
        }
        function updateDBandSendJSON() {
            request({
                url: URL,
                json: true
            }, function (error, response, body) {
                console.log("DataRetrieval from fixer successful");
                if (!error && response.statusCode === 200) {
                    //console.log(body);
                    ref.child(DATAREF).set(body);
                    console.log("DatabaseUpdated: Ok");
                    console.log("sending new data directly to client");
                    resp.end(JSON.stringify(body));// Print the json response
                    console.log("datasend successful");
                }
            });
        }
        function timeUpdater(time){
            ref.child("lastUpdated").set(time, function (error) {
                if (error) {
                    //resp.end("error");
                } else {
                    //resp.write("updatedNow :" + timeNow);
                    //resp.end();
                    //dataBaseSender();
                }
            });
        }
    });
    /*
    function databaseUpdater(){
        //Function to retrieve data and update DB

        request({
            url: URL,
            json: true
        }, function (error, response, body) {

            if (!error && response.statusCode === 200) {
                //console.log(body);
                //resp.end(JSON.stringify(body));// Print the json response
            }
        });
    }

    /*function dataBaseSender(){
        //Function to send data back to CLIENT
    }*/

});

app.listen(port, () => console.log('http://localhost:'+port));

