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

var PeopleStore = function() {
    this.people = {};
    var self = this;
    this.addPeople = function(peopleId) {
        self.people[peopleId] = {
            top: 100,
            left: 100,
            color: "rgb(" + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + "," + Math.round(Math.random() * 255) + ")"
        };
    }

    this.peopleColor = function(peopleId) {
        return self.people[peopleId].color;
    }

    this.getPosition = function(peopleId) {
        return {
            top: self.people[peopleId].top,
            left: self.people[peopleId].left
        };
    }

    this.moveY = function(peopleId, _mov) {
        self.people[peopleId].top += _mov;
    }

    this.moveX = function(peopleId, _mov) {
        self.people[peopleId].left += _mov;
    }

    this.checkColition = function(peopleId){
    	var _top = self.people[peopleId].top;
    	var _left = self.people[peopleId].left;
    	for(var sockId in self.people){
    		if(peopleId != sockId){
    			sockPosition = self.getPosition(sockId);
    			// if(_top > sockPosition.)
    		}
    	}
    }
}

var store = new PeopleStore();

io.on('connection', function(socket) {
    var cleanSocketId = socket.id.replace("/#", "");
    var mov = 10;
    store.addPeople(cleanSocketId);

    socket.broadcast.emit('createPeople', {
        id: cleanSocketId,
        color: store.peopleColor(cleanSocketId),
        position: store.getPosition(cleanSocketId)
    });


    socket.on("up", function() {
        store.moveY(cleanSocketId, mov);
        io.sockets.emit("move", {
            position: store.getPosition(cleanSocketId),
            id: cleanSocketId
        });
    });

    socket.on("down", function() {
        store.moveY(cleanSocketId, -mov);
        io.sockets.emit("move", {
            position: store.getPosition(cleanSocketId),
            id: cleanSocketId
        });
    });

    socket.on("left", function() {
        store.moveX(cleanSocketId, -mov);
        io.sockets.emit("move", {
            position: store.getPosition(cleanSocketId),
            id: cleanSocketId
        });
    });

    socket.on("right", function() {
        store.moveX(cleanSocketId, mov);
        io.sockets.emit("move", {
            position: store.getPosition(cleanSocketId),
            id: cleanSocketId
        });
    });

    socket.on('disconnect', function() {
        socket.broadcast.emit("deletePeople", cleanSocketId);
    });

    for (var socketId in io.sockets.sockets) {
        socket.emit('createPeople', {
            id: socketId.replace("/#", ""),
            color: store.peopleColor(socketId.replace("/#", "")),
            position: store.getPosition(socketId.replace("/#", ""))
        });
    }
});