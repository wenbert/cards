
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


var nowjs = require("/home/nodejs/node_modules/now");
var everyone = nowjs.initialize(server);


nowjs.on('connect', function(){
  this.now.room = "room 1";
  nowjs.getGroup(this.now.room).addUser(this.user.clientId);
  console.log("Joined: " + this.now.name);
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


//REDIS
//var redis = require("redis"),
var redis = require("/home/nodejs/node_modules/now/node_modules/socket.io/node_modules/redis"),
    client = redis.createClient();

client.on("error", function (err) {
    console.log("Error "+ err);
});

function guidGenerator() {
    var S4 = function() {
       return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
    };
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
}

everyone.now.signalShowRedisCard = function(card_placement, card_slug) {
    var self = this;
    var target = ("cards:"+ card_slug);

    client.incr('card_uid', function(err, uid) {
        client.hgetall(target, function(err, res) {
            nowjs.getGroup(self.now.room).now.receiveShowRedisCard(res,uid,card_placement);
            console.log('executing client.hgetall() for: ',target);
        });
    });
}
