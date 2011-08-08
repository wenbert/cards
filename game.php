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
  
    $("#send-button").click(function(){
        now.distributeMessage($("#text-input").val());
        $("#text-input").val("");
    });

    now.room = "Sample Room";
    now.name = "Noeme";
 
});

</script>

<style type="text/css">

</style>

</head>

<body>
<div id="messages"></div>
<input type="text" id="text-input">
<input type="button" value="Send" id="send-button">

<pre>
<?php
var_dump($_POST);
?>
</pre>
</body>
</html>
