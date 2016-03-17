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

io.on('connection', function(socket) {
    console.log(socket.id.replace("/#", ""));

    socket.emit('createBox', socket.id.replace("/#", ""));
    socket.broadcast.emit('createPeople', socket.id.replace("/#", ""));
    socket.on("up", function(position) {
        position.top += 50;
        io.sockets.emit("move", {
            position: position,
            id: socket.id.replace("/#", "")
        });
    });
    socket.on("down", function(position) {
        position.top -= 50;
        io.sockets.emit("move", {
            position: position,
            id: socket.id.replace("/#", "")
        });
    });
    socket.on("left", function(position) {
        position.left -= 50;
        io.sockets.emit("move", {
            position: position,
            id: socket.id.replace("/#", "")
        });
    });
    socket.on("right", function(position) {
        position.left += 50;
        io.sockets.emit("move", {
            position: position,
            id: socket.id.replace("/#", "")
        });
    });
    socket.on('disconnect',function(){
    	socket.broadcast.emit("deletePeople",socket.id.replace("/#", ""));
    });

    for (var socketId in io.sockets.sockets) {
	    if(socket.id != socketId){
	    	console.log("all: " + socketId);
    		socket.emit('createPeople', socketId.replace("/#", ""));
	    } 
	}
});