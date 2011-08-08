
var fs = require('fs');
var server = require('http').createServer(function(req, response){
//  fs.readFile('/home/wenbert/public_html/mtg/index.html', function(err, data){
  fs.readFile('', function(err, data){
    response.writeHead(200, {'Content-Type':'text/html'}); 
    response.write(data);  
    response.end();
  });
});

server.listen(8080);

//REDIS
//var redis = require("redis"),
var redis = require("/home/nodejs/node_modules/now/node_modules/socket.io/node_modules/redis"),
    r = redis.createClient();

r.on("error", function (err) {
    console.log("Error "+ err);
});

var nowjs = require("/home/nodejs/node_modules/now");
var everyone = nowjs.initialize(server);

nowjs.on('connect', function(){
    //this.now.room = "lobby";
    nowjs.getGroup(this.now.room).addUser(this.user.clientId);
    console.log("Joined: " + this.now.name);
    //this.now.receiveMessage("SERVER", "You're now in " + this.now.room);
    nowjs.getGroup(this.now.room).now.receiveMessage(this.now.name, "Joined "+this.now.room);
});

nowjs.on('disconnect', function(){
    console.log("Left: " + this.now.name);
});


everyone.now.changeRoom = function(newRoom){
    nowjs.getGroup(this.now.room).removeUser(this.user.clientId);
    nowjs.getGroup(newRoom).addUser(this.user.clientId);
    this.now.room = newRoom;
    this.now.receiveMessage("SERVER", "You're now in " + this.now.room);
}


everyone.now.distributeMessage = function(message){
    nowjs.getGroup(this.now.room).now.receiveMessage(this.now.name, message);
};

/*
This creates a game.
First, it increments "game_id"
Then, the value from game_id is added in a Set named "games" - Set in redis
When the "game_id" is added in Set "games", we create a Hash with the game details
Finally, we send back the details to the client so that we can append it to the list.

In redis, it would look like this:
>INCR game_id
>1
>SADD games 1
>HSET game:1 id 1 desc "Blah" players 2 gametype Standard creator Blah
*/
everyone.now.createGame = function(desc, creator, players, gametype) {
    r.incr("game_id", function (err, incr_res){
        console.log('***incr_res***'+incr_res);
        r.sadd("games", incr_res, function(err, sadd_res){
            console.log('***sadd***'+sadd_res);
            r.hmset("game:"+incr_res, "id", incr_res, "desc",desc, "players", players, "gametype", gametype, "creator", creator, function(err, hmset_res) {    
                everyone.now.appendCreatedGame(incr_res, desc, creator, players, gametype);
                console.log('***RESULT***'+hmset_res);
            });
        });
    });
}

everyone.now.joinGame = function(game_id) {
    nowjs.getGroup(this.now.room).removeUser(this.user.clientId);
    nowjs.getGroup(game_id).addUser(this.user.clientId);
    this.now.room = game_id;
    this.now.receiveMessage("SERVER", "You're now in " + this.now.room);
}

everyone.now.fetchGamesList = function() {
    r.smembers("games", function (err, smembers_res) {
        everyone.now.receiveGamesList(smembers_res);
        console.log('Game list: '+smembers_res);
    });
}

everyone.now.fetchGameDetails = function(game_id) {
    r.hgetall("game:"+game_id, function(err,hgetall_res){
        everyone.now.appendGameDetailsToList(hgetall_res)
    });
}

everyone.now.signalTapCard = function(card_id){
  nowjs.getGroup(this.now.room).now.receiveSignalTapCard(this.now.name, card_id);
};

everyone.now.signalUntapCard = function(card_id) {
  nowjs.getGroup(this.now.room).now.receiveSignalUntapCard(this.now.name, card_id);
};

everyone.now.signalMoveToLocation = function(drop_where,card_id,posx,posy) {
  nowjs.getGroup(this.now.room).now.receiveSignalMoveToLocation(this.now.name, drop_where, card_id, parseInt(posx), parseInt(posy));
};

//Current player in room
//Allow switching turns
everyone.now.signalTurnPlayer = function() {
    nowjs.getGroup(this.now.room).now.receiveTurnPlayer(this.user.clientId);
    console.log('clientId: '+this.user.clientId);
}




function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

everyone.now.signalShowRedisCard = function(card_placement, card_slug) {
    var self = this;
    var target = ("cards:"+ card_slug);

    r.incr('card_uid', function(err, uid) {
        r.hgetall(target, function(err, res) {
            nowjs.getGroup(self.now.room).now.receiveShowRedisCard(res,uid,card_placement);
            console.log('executing client.hgetall() for: ',target);
        });
    });
}

