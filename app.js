var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
var port = 3000;
app.listen(port);


console.log("app listening port: " + port);

function handler(req, res) {
    fs.readFile(__dirname + '/index.html',
        function(err, data) {
            if (err) {
                res.writeHead(500);
                return res.end("Error loading index.html");
            }
            res.writeHead(200);
            res.end(data);
        });
}

var ColorStore = function(){
	this.people = {};
	var self = this;
	this.addPeople = function(peopleId){
		self.people[peopleId] = "rgb("+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+","+Math.round(Math.random()*255)+")";
	}

	this.peopleColor = function(peopleId){
		return self.people[peopleId];
	}
}

var store = new ColorStore();

io.on('connection', function(socket) {
    var cleanSocketId = socket.id.replace("/#", "");
    var mov = 10;
    store.addPeople(cleanSocketId);
    console.log(cleanSocketId+"---> "+store.peopleColor(cleanSocketId));

    socket.emit('createBox', {id:cleanSocketId,color:store.peopleColor(cleanSocketId)});

    socket.broadcast.emit('createPeople', {id:cleanSocketId,color:store.peopleColor(cleanSocketId)});

    socket.on("up", function(position) {
        position.top += mov;
        io.sockets.emit("move", {
            position: position,
            id: cleanSocketId
        });
    });
    socket.on("down", function(position) {
        position.top -= mov;
        io.sockets.emit("move", {
            position: position,
            id: cleanSocketId
        });
    });
    socket.on("left", function(position) {
        position.left -= mov;
        io.sockets.emit("move", {
            position: position,
            id: cleanSocketId
        });
    });
    socket.on("right", function(position) {
        position.left += mov;
        io.sockets.emit("move", {
            position: position,
            id: cleanSocketId
        });
    });
    socket.on('disconnect',function(){
    	socket.broadcast.emit("deletePeople",cleanSocketId);
    });

    for (var socketId in io.sockets.sockets) {
	    if(socket.id != socketId){
    		socket.emit('createPeople', {id:socketId.replace("/#", ""),color:store.peopleColor(socketId.replace("/#", ""))});
	    } 
	}
});