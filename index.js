const TIME_GAP = 10000;

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
    console.log("Accessed");
    //resp.send("Hello world");
    var db = admin.database();
    var ref = db.ref("/server");

    //Checks if DB is outdated
    ref.on("value", function (snapshot) {
        var obj = snapshot.val();
        var timeNow = Date.now();
        var timeDiff = timeNow - obj.lastUpdated ;
        if (timeDiff < TIME_GAP) {
            resp.end("Updated0 "+timeDiff);
            //dataBaseSender();
        }else {
            resp.end("Outdated0 "+timeDiff);
            updater(timeNow)
        }
    });

    function updater(timeNow) {
        timeUpdater(timeNow);
        //databaseUpdater();
    }

    function timeUpdater(timeNow){
        ref.child("lastUpdated").set(timeNow, function (error) {
            if (error) {
                //resp.end("error");
            } else {
                //resp.write("updatedNow :" + timeNow);
                //resp.end();
                //dataBaseSender();
            }
        });
    }

    /*function databaseUpdater(URL){
        //Function to retrieve data and update DB

        var url = "http://developer.cumtd.com/api/v2.2/json/GetStop?" +
            "key=d99803c970a04223998cabd90a741633" +
            "&stop_id=it";

        request({
            url: URL,
            json: true
        }, function (error, response, body) {

            if (!error && response.statusCode === 200) {
                console.log(body);
                resp.send(body);// Print the json response
            }
        });
    }*/

    /*function dataBaseSender(){
        //Function to send data back to CLIENT
    }*/

});

app.listen(port, () => console.log('http://localhost:'+port));

