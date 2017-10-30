var express = require('express');
var path = require("path");
var request = require('request');
var cors = require('cors');

var port = process.env.PORT || 8080;

const app = express();
app.use(cors());

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/../client/index.html'));
});

app.get('/povo', (req, res) => {
    let now = new Date();
    let day = now.getDate();
    let month = now.getMonth() + 1;
    let year = now.getFullYear();

    //Ask for info rooms for the current day.
    let url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede=E0503&_lang=it&date=" + day + "-" + month + "-" + year;
    //Chiamata all'API di easyroom
    request(url, function(error, response, body) {

        if(!error && response.statusCode == 200) {
            let data = JSON.parse(body);
            let events = data.events;
            let rooms = []; 
            for(let i = 0; i < events.length; i++) {
                let room = {room: events[i].room,
                            NomeAula: events[i].NomeAula,
                            orario: [{
                                from: events[i].from,
                                to: events[i].to,
                                timestamp_day: events[i].timestamp_day,
                                timestamp_from: events[i].timestamp_from,
                                timestamp_to: events[i].timestamp_to
                            }]
                            };
                let id = -1;                
                for(let j = 0; j < rooms.length; j++) {
                    if(rooms[j].room === room.room) {
                        id = j;
                    }
                }  
                
                if(id >= 0) {
                    let newOrario = {
                        from: events[i].from,
                        to: events[i].to,
                        timestamp_day: events[i].timestamp_day,
                        timestamp_from: events[i].timestamp_from,
                        timestamp_to: events[i].timestamp_to
                    }
                    rooms[id].orario.push(newOrario);
                    id = -1;
                } else {
                    rooms.push(room); 
                }           
            }
           
            res.json(rooms); //Get the list of rooms with events that day and the hours in which they are busy.
        }
    });
});

app.listen(port);
console.log("Server started on port " + port);
