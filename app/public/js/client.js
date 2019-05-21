// Socket
var socket = io.connect();

//Login
var userError = document.getElementById('userError');
var userArea = document.getElementById('userArea');
var tutorialPage = document.getElementById('tutorialPage');
var joinButton = document.getElementById('joinButton');
var username = document.getElementById('username');

// Chat
var chatBox = document.getElementById('chatBox');
var globalToggle = false;
var global_btn = document.getElementById('roomGlobal');
var team_btn = document.getElementById('roomTeam');
var chatWindow = document.getElementById('chatWindow');
var output = document.getElementById('output');
var feedback = document.getElementById('feedback');
var message = document.getElementById('message');
var messageSend = document.getElementById('messageSend');

//Game
var gameBox = document.getElementById('gameBox');
var gameBoard = document.getElementById('gameBoard');
var actionMenu = document.getElementById('actionMenu');
var attack_btn = document.getElementById('attack_btn');
var move_btn = document.getElementById('move_btn');
var cancel_btn = document.getElementById('cancel_btn');
// var actions = document.getElementById('actions');
// var health = document.getElementById('health');
var time = document.getElementById('time');
var unitSelected = false;
var unitIndex;
var units;
var attackSelected = false;
var team;
var cellElement;

//Game end
var endPage = document.getElementById('endPage');
var endText = document.getElementById('endText');
var nextGame = document.getElementById('nextGame');

//Function Defs

function clearBoard(){
	for(var r=1; r<gameBoard.rows.length; r++){
		for(var c=1; c<gameBoard.rows[r].cells.length; c++){
			gameBoard.rows[r].cells[c].style.cssText = '';
			gameBoard.rows[r].cells[c].innerHTML = '';
		}
	}
}

// Message Handler

// add new user
joinButton.addEventListener('click', function(e){
	// prevent default behaviour of the event, which is to submit the form and refresh the page
	// this condition is for when using IE, as IE does not support e.preventDefault()
	e.preventDefault ? e.preventDefault() : (e.returnValue = false);

	// callback: send data from the server to the function and get it as a callback to do operations depending on the value of that data
		socket.emit('new user', username.value, function(data){
		if(!username.value){
			userError.innerHTML = '<p>please enter a username</p>';
		}else if(!data){
			userError.innerHTML = '<p>username is already taken</p>';
		}else{
			userArea.style.display = "none";
			tutorialPage.style.display = "none";
			chatBox.style.display = "inline-block";
			gameBox.style.display = "inline-block";
			global_btn.style.cssText = '';
			team_btn.style.cssText = 'background:#2A2C31;';
		}
	});
});

tutorialButton.addEventListener('click', function(e){

	e.preventDefault ? e.preventDefault() : (e.returnValue = false);

	userArea.style.display = "none";
	tutorialPage.style.display = "flex";
	chatBox.style.display = "none";
	gameBox.style.display = "none";
});

backButton.addEventListener('click', function(e){

	e.preventDefault ? e.preventDefault() : (e.returnValue = false);

	userArea.style.display = "flex";
	tutorialPage.style.display = "none";
	chatBox.style.display = "none";
	gameBox.style.display = "none";
});
// select global room
global_btn.addEventListener('click', function(){
	globalToggle = true;
	global_btn.style.cssText = 'background:#2A2C31;';
	team_btn.style.cssText = '';
	socket.emit('switch room', {room: 'GLOBAL', toggle: globalToggle});
});

// select team room
team_btn.addEventListener('click', function(){
	globalToggle = false;
	global_btn.style.cssText = '';
	team_btn.style.cssText = 'background:#2A2C31;';
	socket.emit('switch room', {room: 'TEAM', toggle: globalToggle});
});

// send message
messageSend.addEventListener('click', function(e){
	e.preventDefault ? e.preventDefault() : (e.returnValue = false);
	socket.emit('send message', {msg: message.value, toggle: globalToggle});
	message.value = '';
});

// send typing event
message.addEventListener('keypress', function(){
		socket.emit('typing', {user: username.value, toggle: globalToggle});
});

// receive and display new message
socket.on('new message', function(data){
	feedback.innerHTML = '';
	if(data.user){
		output.innerHTML += '<p><strong>(' + data.room +  ') ' + data.user + ': </strong>' + data.msg + '</p>';
	}else{
		output.innerHTML += '<p><em>' + data.msg + '</em></p>';
	}
	chatWindow.scrollTop = chatWindow.scrollHeight;
});

// receive and display typing event
socket.on('typing', function(data){
		feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>';
});

/* Game Handler */
// send game board click event
gameBoard.addEventListener('click', function(e){
	var cell = e.target;
	var currPosX = cell.cellIndex;
	var currPosY = cell.parentNode.rowIndex;
	if(!currPosX || currPosX==-1) return;
	cellElement = gameBoard.rows[currPosY].cells[currPosX].innerHTML;
	
	// if unit selected
	if(unitSelected && !attackSelected){
		socket.emit('validate move', {x:currPosX, y:currPosY, i:unitIndex, e:cellElement}, function(moveValid){
			if(moveValid){
				actionMenu.style.display = "none";
				gameBoard.rows[units[unitIndex]['currY']].cells[units[unitIndex]['currX']].innerHTML = '';
				unitSelected = false;
			}else{
				actionMenu.style.display = "none";
				unitSelected = false;
			}
		});
	// if unit selected and attack button pressed
	}else if(unitSelected && attackSelected){
		socket.emit('validate attack', {x:currPosX, y:currPosY, i:unitIndex, e:cellElement}, function(attackValid){
			if(!attackValid){
				actionMenu.style.display = "none";
				unitSelected = false;
				attackSelected = false;
			}else if(attackValid == 2){
				actionMenu.style.display = "none";
				unitSelected = false;
				attackSelected = false;
			}
		});
	// if no unit selected
	}else{
		socket.emit('select unit', {x:currPosX, y:currPosY, e:cellElement}, function(unitFound){
			if(unitFound!=-1){
				actionMenu.style.display = "block";
				attack_btn.style.cssText = '';
				cancel_btn.style.cssText = '';
				move_btn.style.cssText = 'background:#42464D;';
				// actions.innerHTML = units[unitFound]['currAct'] + "AP";
				// health.innerHTML = units[unitFound]['hp'] + "HP";
				unitIndex = unitFound;
				unitSelected = true;
			}else{
				unitSelected = false;
			}
		});
	}
});

// select attack action
attack_btn.addEventListener('click', function(){
	attack_btn.style.cssText = 'background:#42464D;';
	cancel_btn.style.cssText = '';
	move_btn.style.cssText = '';
	socket.emit('highlight', {i:unitIndex, action:'attack', type:'show'});
	attackSelected = true;
});

// select move action
move_btn.addEventListener('click', function(){
	attack_btn.style.cssText = '';
	cancel_btn.style.cssText = '';
	move_btn.style.cssText = 'background:#42464D;';
	socket.emit('highlight', {i:unitIndex, action:'attack', type:'clear'});
	socket.emit('select unit', {x:units[unitIndex]['x'], y:units[unitIndex]['y'], e:cellElement}, function(unitFound){
		if(unitFound != -1){
			unitSelected = true;
			attackSelected = false;
		}
	});
});

// cancel action
cancel_btn.addEventListener('click', function(){
	actionMenu.style.display = "none";
	if(attackSelected) socket.emit('highlight', {i:unitIndex, action:'attack', type:'clear'});
	else socket.emit('highlight', {i:unitIndex, action:'move', type:'clear'});
	socket.emit('cancel action', unitIndex);
	unitSelected = false;
	attackSelected = false;
});

// highlight handler
socket.on('highlight', function(data){

	var x = units[data.i]['currX'];
	var y = units[data.i]['currY'];
	var mov = units[data.i]['currAct'];
	var range = units[data.i]['range'];
	var highlight;

	if(data.action == 'move'){
		highlight = (data.type == 'show') ? 'background:#C8E7A7;' : '';
		for (var r=Math.max(1, y-mov); r<=Math.min(y+mov,12); r++){
			for (var c=Math.max(1, x-mov); c<=Math.min(x+mov,12); c++){
				if(!(r == y-mov  && c != x)
					&& !(r == y+mov  && c != x)
					&& !(r != y  && c == x-mov)
					&& !(r != y  && c == x+mov)){
					//gameBoard.rows[r].cells[c].innerHTML = '';
					gameBoard.rows[r].cells[c].style.cssText = highlight;

				}
			}
		}
	}else if(data.action == 'attack'){
		highlight = (data.type == 'show') ? 'background:#FF7F7F;' : '';
		for (var r=Math.max(1, y-range); r<=Math.min(y+range,12); r++){
			for (var c=Math.max(1, x-range); c<=Math.min(x+range,12); c++){
				if(!(r == y-range  && c != x)
					&& !(r == y+range  && c != x)
					&& !(r != y  && c == x-range)
					&& !(r != y  && c == x+range)
					&& !(r == y-range+1  && c != x && c != x+1 && c != x-1)
					&& !(r == y+range-1  && c != x && c != x+1 && c != x-1)
					&& !(r != y  && r != y+1 && r != y-1 && c == x-range+1)
					&& !(r != y  && r != y+1 && r != y-1 && c == x+range-1)){
					//gameBoard.rows[r].cells[c].style.innerHTML = '';
					gameBoard.rows[r].cells[c].style.cssText = highlight;
					
				}
			}
		}
	}
});

socket.on('lock unit', function(data){
	document.getElementById(data).style.cssText = 'pointer-events:none; opacity:0.5;';
})

// remove unit
socket.on('remove unit', function(data){
	if(data.x && data.y){
		gameBoard.rows[data.y].cells[data.x].innerHTML = '';
	};
});

// First game update from server.
socket.on('current game', function(data){
	console.log('Received update of current team status');
	units = data.u;
	team = data.t;
	teamColor = (team == 1)? "Red" : "Blue";
	if(data.i) gameBoard.rows[units[data.i].y].cells[units[data.i].x].innerHTML = '';
	if(data.i) socket.emit('highlight', {i:data.i, action:data.action, type:data.type});
	for(var i=0; i<units.length; i++){
		var ap = units[i].currAct;
		var hp = units[i].hp;
		var imgPath = (units[i].team == 1) ? '/images/tank-red.png' : '/images/tank-blue.png';

		team_btn.innerHTML = teamColor + ' Team';
		if(units[i].x && units[i].y && units[i].hp > 0){
			if(units[i].team == data.t){
				var ap = units[i].currAct;
				var hp = units[i].hp;
				gameBoard.rows[units[i]['currY']].cells[units[i]['currX']].innerHTML = '<img style="pointer-events:none" width="50%" id="' + units[i]['id'] + '" src="' + imgPath + '"/><br>AP ' + ap + '<br>HP ' +hp;
				if(units[i].lock){
					document.getElementById(units[i]['id']).style.cssText = 'pointer-events:none; opacity:0.5;';
				}
				if(units[i].currAct == 0){
					document.getElementById(units[i]['id']).style.cssText = 'pointer-events:none; filter: grayscale(50%);';
				}
			}
		}
	}
});

// Update tick from server.
socket.on('update game', function(data){
	console.log('Received update from server');
	units = data;
	clearBoard();
	for(var i=0; i<units.length; i++){
		if(units[i].x && units[i].y && units[i].hp > 0){
			var ap = units[i].currAct;
			var hp = units[i].hp;
			var imgPath = (units[i].team == 1) ? '/images/tank-red.png' : '/images/tank-blue.png';
			gameBoard.rows[units[i]['y']].cells[units[i]['x']].innerHTML = '<img style="pointer-events:none" width="50%" id="' + units[i]['id'] + '" src="' + imgPath + '"/><br>'+ 'AP ' + ap + '<br>HP ' + hp;
			if(units[i].currAct == 0){
				document.getElementById(units[i]['id']).style.cssText = 'pointer-events:none; filter: grayscale(50%);';
			}
		}
	}
	actionMenu.style.display = "none";
	unitSelected = false;
	attackSelected = false;
});

// update time
socket.on('update time', function(data){
	time.innerHTML = (data == null)? "Waiting" : data + " sec";
});

socket.on('You win', function(){
	// Show you win screen.
	endText.innerHTML = 'You win!';
	endPage.style.display = "flex";
	//console.log("You win");
});

socket.on('You lose', function(){
	// Show you lose screen.
	endText.innerHTML = 'You lose.'
	endPage.style.display = "flex";
	//console.log("You lose");
});

socket.on('Draw', function(){
	// Show you draw screen.
	endText.innerHTML = 'Draw.';
	endPage.style.display = "flex";
	//console.log("Draw");
});

socket.on('close end game', function(){
	endPage.style.display = "none";
	console.log('Closing end game screen');
});

socket.on('show attack', function(attack){
	var x = attack.x;
	var y = attack.y;
	
	// show explosion icon at x,y

	setTimeout(function(){
		//hide explosion icon at x,y
	}, 100);
	
	
});

nextGame.addEventListener('click', function(e){

	e.preventDefault ? e.preventDefault() : (e.returnValue = false);

	endPage.style.display = "none";
	socket.emit('next game', team);

});