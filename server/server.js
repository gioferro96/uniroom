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
    let currentTimestamp = now.getTime();

    //Ask for info rooms for the current day.
    let url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede=E0503&_lang=it&date=" + day + "-" + month + "-" + year;
    //Chiamata all'API di easyroom
    request(url, function(error, response, body) {
        if(!error && response.statusCode == 200) {
            let data = JSON.parse(body);
            let events = data.events;
            let rooms = getRoomList(events, currentTimestamp); 
            rooms = cleanSchedule(rooms);     
            res.json(rooms); //Get the list of rooms with events that day and the hours in which they are busy.
        }
    });
});






function getRoomList(events, currentTimestamp) {
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
        
        if(currentTimestamp > room.orario[0].timestamp_from || currentTimestamp < room.orario[0].timestamp_to) {
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
    }
    return rooms;
}

function cleanSchedule(rooms) {
    for(let i = 0; i < rooms.length; i++) {
        for(let j = 0; j < rooms[i].orario.length - 1; j++) {
            if(rooms[i].orario[j].timestamp_to === rooms[i].orario[j + 1].timestamp_from) {
                    rooms[i].orario[j].to = rooms[i].orario[j + 1].to;
                    rooms[i].orario[j].timestamp_to = rooms[i].orario[j + 1].timestamp_to;
                    rooms[i].orario.splice(j + 1, 1);
                }
        }
    }
    return rooms;
}


app.listen(port);
console.log("Server started on port " + port);
