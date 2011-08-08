<!DOCTYPE html>
<html lang="en">
<head>
<title>nowjs test</title>

<link href="style.css" rel="stylesheet" type="text/css" media="screen" /> 

<link type="text/css" href="css/pepper-grinder/jquery-ui-1.8.14.custom.css" rel="Stylesheet" />	
<script type="text/javascript" src="json2.js"></script>
<script type="text/javascript" src="js/jquery-1.5.1.min.js"></script>

<script type="text/javascript" src="js/jquery-ui-1.8.14.custom.min.js"></script>

<script src="http://192.168.1.7:8080/nowjs/now.js"></script>
<script type="text/javascript" src="js/jQueryRotate.2.1.js"></script>
<script>
$(document).ready(function(){
    now.receiveMessage = function(name, message){
        $("#messages").append("<br>" + name + ": " + message);
    }
  
    /*
    Fetch Set "games" in redis using fetchGamesList(), received by now.receiveGamesList()
    Loop thru the Set and fetchGamesList()
    */
    now.receiveGamesList = function(gameslist_obj) {
        $('#games').empty();
        for (var key in gameslist_obj) {
            var value = gameslist_obj[key];
            now.fetchGameDetails(value);
            now.appendGameDetailsToList = function(gamedetails_obj) {
                $('#games').append('<li>'+gamedetails_obj.id+') '+gamedetails_obj.desc+
                '<form method="post" action="game.php">'+
                '<input type="hidden" id="game_id" value="'+gamedetails_obj.id+'"/><input type="submit" class="join_game" value="Join this game">'+
                '</form>'+
                '</li>');
            };
        }
    }
    /*
    Append to #games
    For example, this function is called when a user creates a game.
    */
    now.appendCreatedGame = function(id,desc, creator, players, gametype) {
        $('#games').append('<li>'+id+') '+desc+'<form method="post" action="game.php"><input type="hidden" name="game_id" id="game_id" value="'+gamedetails_obj.id+'"/><input type="submit" class="join_game" value="Join this game"></form></li>');
    }
    
    /*
    Calls now.fetchGamesList() on the server, then sends the data back to now.receiveGamesList()
    */
    $("#getlist").click(function() {
        now.fetchGamesList();
    });
    
    /*
    Opens up a jquery dialog box. Nothing special.
    */
    $("#creategame").click(function() {
        $( "#creategameform" ).dialog({
            height: 200,
            modal: true
        });
    });
    
    /*
    When user tries to create game. #submitgame is a button inside #creategameform
    Values are sent directly to the now.createGame() in the server. 
    
    TODO: Sanitize the data?!
    */
    $("#submitgame").click( function() {
        now.createGame($("#desc").val(), "creator_test", $("#players").val(), $("#gametype").val());
    });
    
    now.room = "Lobby";
    now.name = "Noeme";
});
</script>
<style type="text/css">

</style>

</head>

<body>
<input type="button" id="creategame" value="Create a game." />
<input type="button" id="getlist" value="Click here to get list of games." />
<ul id="games">
</ul>

<div id="messages"></div>

<div id="creategameform" style="display: none;" title="Create/host a game">
Description: <input type="text" id="desc" name="desc" /><br/>
Game Type: <select id="gametype">
<option value=""></option>
<option value="Standard">Standard</option>
<option value="Legacy">Legacy</option>
</select><br/>
# of Players: <select id="players">
<option value="2">2</option>
</select><br/>
<input type="button" value="Create Game!" id="submitgame"/>
</div>
</body>
</html>
