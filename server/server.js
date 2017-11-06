var express = require('express');
var path = require("path");
var request = require('request');
var cors = require('cors');

var port = process.env.PORT || 8080;
var department_id =[("E0101","economia"),
                    ("E0801","lettere"),
                    ("E0801","filosofia"),
                    ("E0301","mesiano"),
                    ("E0301","ingegneria"),
                    ("E0201","giurisprudenza"),
                    ("E0201","giuri")];

function inArray(sede){
    for (let i = 0; i < department_id.length; i++)
    {
        if(sede == department_id[i][0])
            return true;
    }
}


const app = express();
app.use(cors());

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/../client/index.html'));
});

//funzione che data sede e giorno restituisce le aule libere quel giorno
app.post('/:sede', (req,res) => {
    let url;
    let sede;
    if (inArray(req.params.sede))
    {
        sede = req.params.sede;
        if (req.query.day&&req.query.month)     //se nella request ci sono i parametri day,month,year
        {
            let day = req.query.day;
            let month = req.query.month;
            let year = req.query.year;
            url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede="+ sede +"&_lang=it&date=" + day + "-" + month + "-" + year;
        }
        else        //se nella request non ci sono i parametri day,month,year significa "in questo momento"
        {
            let now = new Date();
            let day = now.getDate();
            let month = now.getMonth() + 1;
            let year = now.getFullYear();
            url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede="+ sede +"&_lang=it&date=" + day + "-" + month + "-" + year;
        }

        let now = new Date();
        let currentTimestamp = now.getTime() / 1000;
        
        request(url, function(error, response, body) {
            if(!error && response.statusCode == 200) {
                let data = JSON.parse(body);
                let events = data.events;
                let rooms = getRoomList(events); 
                rooms = cleanSchedule(rooms);    
                rooms = getFreeRooms(rooms, currentTimestamp);
                rooms = cleanPastSchedule(rooms, currentTimestamp);
                res.json(rooms); //Get the list of rooms with events that day and the hours in which they are busy.
            }
        });
    }
    else
    {
        //error page -> sede not valid
    }  
    
    
});

/*app.get('/povo', (req, res) => {
    let now = new Date();
    let day = now.getDate();
    let month = now.getMonth() + 1;
    let year = now.getFullYear();
    let currentTimestamp = now.getTime() / 1000;

    //Ask for info rooms for the current day.
    let url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede=E0503&_lang=it&date=" + day + "-" + month + "-" + year;
    //let url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede=E0503&_lang=it&date=8-11-2017";
    //Chiamata all'API di easyroom
    request(url, function(error, response, body) {
        if(!error && response.statusCode == 200) {
            let data = JSON.parse(body);
            let events = data.events;
            let rooms = getRoomList(events); 
            rooms = cleanSchedule(rooms);     
            rooms = getFreeRooms(rooms, currentTimestamp);
            rooms = cleanPastSchedule(rooms, currentTimestamp);
            res.json(rooms); //Get the list of rooms with events that day and the hours in which they are busy.
        }
    });
});*/
 

function getRoomList(events) {
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
            };
            rooms[id].orario.push(newOrario);
            id = -1;
        } else {
            rooms.push(room); 
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

function getFreeRooms(rooms, timeStamp) {
    //let closeTimeStamp = rooms[0].orario[0].timestamp_day + 72000;
    //console.log("getFreeRooms rooms.length: "+rooms.length);
    let closeTimeStamp;
    if(rooms.length > 0) {
        closeTimeStamp = rooms[0].orario[0].timestamp_day + 72000; // Time 20:00
    } 
    //console.log("closetimestamp: "+closeTimeStamp);
    for(let i = 0; i < rooms.length; i++) {
        //Check if the current time is between 00:00 and 20:00
        if(timeStamp > rooms[i].orario[0].timestamp_day && timeStamp < closeTimeStamp) {      
            for(let j = 0; j < rooms[i].orario.length; j++) {
                if(rooms[i].orario[j].timestamp_from < timeStamp && rooms[i].orario[j].timestamp_to > timeStamp) {
                    rooms[i].orario.splice(j, 1);
                    j--;
                }
            }
        }
    }
    return rooms;
}

//Delete those schedules that are in the past.
function cleanPastSchedule(rooms, timestamp) {
    for(let i = 0; i < rooms.length; i++) {
        for(let j = 0; j < rooms[i].orario.length; j++) {            
            if(timestamp > rooms[i].orario[j].timestamp_from) {
                rooms[i].orario.splice(j,1);
                j --; 
            }   
        }
        if(rooms[i].orario.length == 0) {
            rooms.splice(i, 1);
            i--;
        }
    }
    return rooms;
}


app.get('/schedule/*/*', (req, res) => {
    let now = new Date();
    let day = now.getDate();
    let month = now.getMonth() + 1;
    let year = now.getFullYear();

    let originalUrl = req.originalUrl;
    let arrayUrl = originalUrl.split('/');
    let sede = arrayUrl[2];
    let roomId = arrayUrl[3];

    let url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede=" + sede + "&_lang=it&date=" + day + "-" + month + "-" + year;
    //let url = "https://easyroom.unitn.it/Orario/rooms_call.php?form-type=rooms&sede=" + sede + "&_lang=it&date=8-11-2017";
    request(url, function(error, response, body) {
        if(!error && response.statusCode == 200) {
            let data = JSON.parse(body);
            let events = data.events;
            let room = getRoomSchedule(events, roomId);
            
            res.json(room); //Get the list of rooms with events that day and the hours in which they are busy.
        }
    });
});


function getRoomSchedule(events, roomId) {
    let ris;    
    for(let i = 0; i < events.length; i++) {
        if(events[i].room == roomId) {
            if(ris == null) {
                ris = { room: events[i].room,
                        NomeAula: events[i].NomeAula,            
                        orario: [{
                            nomeMateria : events[i].name,
                            nomeProf : events[i].Utenti[0].Nome + " " + events[i].Utenti[0].Cognome,
                            from: events[i].from,
                            to: events[i].to,
                            timestamp_day: events[i].timestamp_day,
                            timestamp_from: events[i].timestamp_from,
                            timestamp_to: events[i].timestamp_to
                        }]
                    };
            } else {
                let newOrario = {
                    nomeMateria : events[i].name,
                    nomeProf : events[i].Utenti[0].Nome + " " + events[i].Utenti[0].Cognome,
                    from: events[i].from,
                    to: events[i].to,
                    timestamp_day: events[i].timestamp_day,
                    timestamp_from: events[i].timestamp_from,
                    timestamp_to: events[i].timestamp_to
                };
                ris.orario.push(newOrario);
            }
        }
    }

    return ris == null ? "Nessuna lezione oggi in questa aula" : ris;
}

app.listen(port);
console.log("Server started on port " + port);
