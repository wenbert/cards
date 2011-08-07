<!DOCTYPE html>
<html lang="en">
<head>
<title>nowjs test</title>

<link href="style.css" rel="stylesheet" type="text/css" media="screen" /> 

<link type="text/css" href="css/pepper-grinder/jquery-ui-1.8.14.custom.css" rel="Stylesheet" />	
<script type="text/javascript" src="json2.js"></script>
<script type="text/javascript" src="js/jquery-1.5.1.min.js"></script>

<script type="text/javascript" src="js/jquery-ui-1.8.14.custom.min.js"></script>

<script src="http://192.168.1.9:8080/nowjs/now.js"></script>
<script type="text/javascript" src="js/jQueryRotate.2.1.js"></script>
<script type="text/javascript" src="js/mtg_client.js"></script>

<style type="text/css">

</style>

</head>

<body>
It is now: <span id="player_turn"></span>'s turn.
<ul id="player_list">
</ul>
<input type="button" id="myturn" value="My Turn"/>
<div id="board">
    player2_battlefield:
    <div id="player2_battlefield" class="battlefield">
    </div>
    player2_hand
    <div id="player2_hand" class="hand">
    </div>
    <hr/>
    player1_battlefield
    <div id="player1_battlefield" class="battlefield">
    </div>
    player1_hand
    <div id="player1_hand" class="hand">
    </div>
</div>
<br style="clear: both;"/>
<div>
    <a href="#" class="change selected">room 1</a> -
    <a href="#" class="change">room 2</a> -
    <a href="#" class="change">room 3</a>
</div>
<br>
<div id="messages"><br>You're in room 1</div>
<input type="text" id="text-input">
<input type="button" value="Send" id="send-button">


</body>
</html>
