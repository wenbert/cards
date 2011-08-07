$(document).ready(function(){
    now.receiveMessage = function(name, message){
        $("#messages").append("<br>" + name + ": " + message);
    }
    
    $("#send-button").click(function(){
        now.distributeMessage($("#text-input").val());
        $("#text-input").val("");
    });
    
    $(".change").click(function(){
        now.changeRoom($(this).text());
    });
    
    //cards can only be dragged inside the #board
    $(".card").draggable({ containment: "#board", stack: "#board div"  });
    
    //dragstart for a card
    $(".card").bind( "dragstart", function(event, ui) {
        $(".card").removeClass('current_card');
        $(this).addClass('current_card');
    });
    
    //dragstop for a card
    $(".card").bind( "dragstop", function(event, ui) {        
        //now.signalMoveToLocation($(this).attr('id'),$(this).css('left'),$(this).css('top'));
    });
    
    //click a card
    $(".card").click(function (e) {
        $(".card").removeClass('current_card');
        $(this).addClass('current_card');
    });
    
    //tap/untap a card
    $(".card").toggle(
        function () {
            $(this).rotate({animateTo:90});
            now.signalTapCard($(this).attr('id'));
        },
        function () {
            $(this).rotate({animateTo:0});
            now.signalUntapCard($(this).attr('id'));
    });
    
    //drop in battlefield
    $( ".battlefield").droppable({
        drop: function( event, ui ) {
            var dropped_card = ui.draggable.attr('id');
            var dropped_card_x = ui.draggable.css('left')
            var dropped_card_y = ui.draggable.css('top')
            //var drop_where = 'battlefield';
            var drop_where = $(this).attr('id');
            
            now.signalMoveToLocation(drop_where, dropped_card,dropped_card_x,dropped_card_y);
        }
		});
		
		//drop in hand
		$( ".hand").droppable({
        drop: function( event, ui ) {
            var dropped_card = ui.draggable.attr('id');;
            var dropped_card_x = ui.draggable.css('left');
            var dropped_card_y = ui.draggable.css('top');
            //var drop_where = 'hand';
            var drop_where = $(this).attr('id');
            now.signalMoveToLocation(drop_where, dropped_card,dropped_card_x,dropped_card_y);
        }
		});
		
    //Nowjs receiveSignalX
    now.receiveSignalTapCard = function(name, card_id) {
        $("#"+card_id).rotate({animateTo:90});
    }
    now.receiveSignalUntapCard = function(name, card_id) {
        $("#"+card_id).rotate({animateTo:0});
    }
    now.receiveSignalMoveToLocation = function(player,drop_where, card_id, posx, posy) {
        try {
        	console.log(player + ' move '+ card_id +' in '+ drop_where +'. left:'+ posx +', top:'+posy);
        } catch(e) {
        	console.log("Firebug not installed.");
        }
        $("#"+card_id).animate({"left": posx+"px","top": posy+"px"});
    }
    
    $(".redis_test").click(function (e) {
        now.signalShowRedisCard($(this).val());
    });
    
    now.receiveShowRedisCard = function(card,card_uid,card_placement) {
        //alert("creating: "+card.name);
        var $newcard = $("<div id='"+
                        card.slug+card_uid+"' class='card'>"+
                        "<div>"+card.name+"</div>"+
                        "<div class='rulestext'>["+card.cost+"] "+card.rulestext+"</div>"+
                        "</div>");
                        
        $newcard.appendTo('#'+card_placement);
        
        //make generated card draggable
        $("#"+card.slug+card_uid).live('mouseover',function(){
            $(this).draggable();
        });
        
        //make generated card tappable
        $("#"+card.slug+card_uid).live('click', function() {
            $(this).toggle(
                function () {
                    $(this).rotate({animateTo:90});
                    now.signalTapCard($(this).attr('id'));
                },
                function () {
                    $(this).rotate({animateTo:0});
                    now.signalUntapCard($(this).attr('id'));
            });
        });
    }
    
    $("#myturn").click(function (e) {
        now.signalTurnPlayer();
    });
    
    now.receiveTurnPlayer = function(clientId) {
        $("#player_turn").html(now.currentplayer);
    }
    
    now.name = prompt("What's your name?", "");
    
    now.signalShowRedisCard('player2_battlefield','goblin-chieftain');
    now.signalShowRedisCard('player1_battlefield','mountain');
    now.signalShowRedisCard('player1_battlefield','goblin-guide');
    now.signalShowRedisCard('player1_hand','goblin-guide');
    
});