var express = require('express');

const app = express();
var path = require("path");

var port = process.env.PORT || 8080;


app.get('/', function(req, res){
    res.sendFile(path.join(__dirname+'/../client/index.html'));
});



app.listen(port);
console.log("Server started on port " + port);
