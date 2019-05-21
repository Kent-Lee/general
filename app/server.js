var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var Units = require('./game_logic/units');
var Attack = require('./game_logic/attack');
var List = require('collections/list');
const fs = require('fs');
const models = require('./db/models');

// serve static files
app.use(express.static(__dirname + '/public'));

var units = Units.initialLayout();
updateAP(false);
var attackList = [];
var users = [];
var connections = [];
var team1 = 0;
var team2 = 0;
var newConnection;
var startTime = Date.now();
var timeout;
var planningTimer = 15000;
var executionTimer = 2000;
var gameStarted = false;
var turnActive = false;
var t1 = 0;
var t2 = 0;

server.listen(8000, function(){
  console.log('listening on *:8000');
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/public/index.html',);
});

models.sequelize.sync({force: true}).then(function() {
    fs.readFile('./db/scores.json', function(err, data) {
        var scores = JSON.parse(data).scores;

        scores.forEach(function(scores) {
            models.Scores.create({
                team: scores.team,
                points: scores.points
            });
        });
    });

});

io.on('connection', function(socket){
	connections.push(socket);
	console.log('Connected: currently %s clients connected', connections.length);
	
	// disconnect
	socket.on('disconnect', function(data){
		if(users.indexOf(socket.username) != -1) users.splice(users.indexOf(socket.username), 1);
		connections.splice(connections.indexOf(socket), 1);
		if(users.length != 0){
			if(socket.username) socket.broadcast.emit('new message', {msg: socket.username + ' has disconnected'});
			if(socket.room == 'TEAM 1') team1--;
			if(socket.room == 'TEAM 2') team2--;
			socket.leave(socket.room);
		}
		// close server after 10 seconds with no socket connection
		if(connections.length == 0){
			console.log('No users connected, server shutdown in 10 seconds.')
			setTimeout(function(){
				if(connections.length == 0){
					console.log('Server shutting down.')
					process.exit()
				};
			}, 10000);
		}
	});
	
	// add new user
	socket.on('new user', function(data, callback){
		if(!data || users.indexOf(data) != -1){
			callback(false);
			return;
		}else{
			callback(true);
			socket.username = data;
			users.push(socket.username);
			// assign new user to team1 or 2 based on condition (not yet specified so using the below condition to test)
			if(team1 <= team2){
				socket.room = 'TEAM 1';
				socket.join(socket.room);
				team1++;
			}else{
				socket.room = 'TEAM 2';
				socket.join(socket.room);
				team2++;
			}
			io.in(socket.room).emit('current game', {u:units, t:socket.room.substring(socket.room.length-1)}); 
			socket.emit('new message', {msg: 'you have joined the TEAM channel'});
			socket.broadcast.to(socket.room).emit('new message', {msg: socket.username + ' has joined the channel'});
			
			// Start game conditions.
			if(!gameStarted && (team1 < 1 || team2 < 1)){
				// Block game, show waiting for players.
				console.log('Waiting for players.');
				// Maybe an emit for a local waiting for players prompt.
			}else if(!gameStarted && team1 > 0 && team2 > 0){
				// Can start game now!
				gameStarted = true;
				// Emit for a countdown.
				console.log('Game starting in 3 seconds');
				startTime = Date.now();
				timeout = 3000;
				setTimeout(function(){
					updateAP(true);
					startTurn();
					
				}, 3000);
			}
		}
	});
	
	// send new message
	socket.on('send message', function(data){
		if(data.toggle){
			io.emit('new message', {msg: data.msg, user: socket.username, room: 'GLOBAL'});
		}else{
			io.in(socket.room).emit('new message', {msg: data.msg, user: socket.username, room: 'TEAM'});
		}
	});
	
	// send typing event
    socket.on('typing', function(data){
		if(data.toggle){
			socket.broadcast.emit('typing', data.user);
		}else{
			socket.broadcast.to(socket.room).emit('typing', data.user);
		}
    });
	
	//  switch room
	socket.on('switch room', function(data){
		socket.emit('new message', {msg: 'you have joined the ' + data.room + ' channel'});
		socket.broadcast.to(socket.room).emit('new message', {msg: socket.username + ' has joined the channel'});
	});

	// check if unit exists on given location
	socket.on('select unit', function(data, callback){
		if(units.length<1 || !data || data.e==''  || data.e.search('opacity')!=-1){
			callback(-1);
		}else{
			for(var i=0; i<units.length; i++){
				if(data.x == units[i]['currX'] && data.y == units[i]['currY'] && units[i]['currAct'] > 0){
					if((units[i].team).toString() == socket.room.substring(socket.room.length-1)){
						callback(i);
						units[i]['lock'] = true;
						socket.emit('lock unit', i);
						socket.emit('highlight', {i:i, action:'move', type:'show'});
						socket.broadcast.to(socket.room).emit('current game', {u:units, t:units[i].team});
						break;
					}else{
						callback(-1);
					}
				}
			}
		}
	});
	
	// check if unit movement is valid
	socket.on('validate move', function(unit, callback){
		var actions = Math.abs(unit.y - units[unit.i]['currY']) + Math.abs(unit.x - units[unit.i]['currX']);
		if(!unit || unit.e!='' || units[unit.i]['currAct']==0 || unit.x>12 || unit.x<1 || unit.y>12 || unit.y<1 || actions>units[unit.i]['mov'] || actions>units[unit.i]['currAct']){
			callback(false);
			units[unit.i]['lock'] = false;
			socket.emit('highlight', {i:unit.i, action:'move', type:'clear'});
			socket.emit('current game', {u:units, t:units[unit.i].team, i:unit.i});
		}else{
			callback(true);
			units[unit.i].currAct -= actions;
			units[unit.i].currX = unit.x;
			units[unit.i].currY = unit.y;
			units[unit.i]['lock'] = false;
			socket.emit('highlight', {i:unit.i, action:'move', type:'clear'});
			io.in(socket.room).emit('current game', {u:units, t:units[unit.i].team, i:unit.i});
			units[unit.i].x = unit.x;
			units[unit.i].y = unit.y;
		}
	});
	
	// check if unit attack is valid
	socket.on('validate attack', function(unit, callback){
		if(!unit || units[unit.i]['currAct']==0 ||  Math.abs(unit.y-units[unit.i]['y'])+Math.abs(unit.x-units[unit.i]['x'])>units[unit.i]['range']){
			callback(false);
			units[unit.i]['lock'] = false;
			socket.emit('highlight', {i:unit.i, action:'attack', type:'clear'});
			socket.emit('current game', {u:units, t:units[unit.i].team});
		}else{
			var atk = new Attack(unit.x, unit.y, units[unit.i].attack, -1);
			attackList.push(atk);
			units[unit.i]['currAct']--;
			io.in(socket.room).emit('current game', {u:units, t:units[unit.i].team});
			if(units[unit.i]['currAct'] == 0){
				callback(2);
				units[unit.i]['lock'] = false;
				socket.emit('highlight', {i:unit.i, action:'attack', type:'clear'});
				io.in(socket.room).emit('current game', {u:units, t:units[unit.i].team});
			}
		}
	});
	
	socket.on('cancel action', function(data){
		units[data].lock = false;
		io.in(socket.room).emit('current game', {u:units, t:units[data].team});
	});
	
	// send highlight info
	socket.on('highlight', function(data){
		socket.emit('highlight', {i:data.i, action:data.action, type:data.type});
	});
	
	// Start another game
	socket.on('next game', function(data){
		
		units = Units.initialLayout();
		updateAP(false);
		console.log(data);
		
		if(data == 1){
			t1++;
		}else if(data == 2){
			t2++;
		}
		
		if(t1 > 0 && t2 > 0){
			socket.emit('close end game');
			startTurn();
		}
	
	});
});


function updateAP(fill){
	if(fill){
		for(var i=0; i < units.length; i++){
			if (units[i].hp > 0){
				units[i].currAct = units[i].act;
			}
		}
	}else{
		for(var i=0; i < units.length; i++){
			if (units[i].hp > 0){
				units[i].currAct = 0;
			}
		}		
	}
}
// Updates all players on a set timer of n seconds = n*1000 ms															  
/*function updatePlayers(){
	io.emit('update game', units);
	setTimeout(words,10000);
}

function words(){
	console.log(units.length);
}*/

function getTimeLeft(timeout){
    return Math.floor((timeout + 1000 - (Date.now() - startTime))/1000);
}

function endTurn(){
	// the execution time will be the total of all timers inside this function, which is 2000(original)+1000+500+250
	// right now the countdown changes between 3 and 4 seconds because the total time is not integer (right now 3.75s); suggest to change to integer instead of decimal for consistency
	startTime = Date.now();
	timeout = executionTimer + 1000 + 500 + 250;
	
	turnActive = false;
	var liveTeam1 = 0;
	var liveTeam2 = 0;
	
	// Update the units list with the team moves.
	for(var i=0; i < units.length; i++){
		if (units[i].hp > 0){
			units[i].currAct = 0;
			units[i].x = units[i].currX;
			units[i].y = units[i].currY;
			units[i].lock = false;
		}
	}
	
	var attackedUnit;
	// Push moves.
	setTimeout(function(){
		io.emit('update game', units);
		
		// Calculate attacks.
		for(var j=0; j<attackList.length; j++){
			attackedUnit;
			var hit = false;
			
			for(var i=0; i<units.length; i++){
				if(attackList[j].x == units[i]['x'] && attackList[j].y == units[i]['y'] && units[i].hp > 0){
					attackedUnit = i;
					hit = true;
					attackList[j].unit = attackedUnit;
					break;
				}
			}
			
			if(attackList[j].unit > -1){
				units[attackedUnit]['hp'] -= attackList[j].dam;
			}
		}
		// Test for team size.
		for(var i=0; i < units.length; i++){
			if(units[i].hp >0){
				if(units[i].team == 1){
					liveTeam1++;
				}else{
					liveTeam2++;
				}
			}
		}
		// Let's wait a half moment, then send out a shot location update.
		setTimeout(function(){
			
			// Loop through each attack.
			for(var i = 0; i < attackList.length; i++){
				// Send out a shot call.
				shotCall(i);
			}
			
			// loop through all units, if two units have the same ending positions, remove them
			for(var i=0; i<units.length; i++){
				unitCollision(i);
			}
			
			setTimeout(function(){
				// Is game over?
				if(liveTeam1 == 0 || liveTeam2 == 0){
					t1 = 0;
					t2 = 0;
					if(liveTeam1 == 0 && liveTeam2 > 0){
						io.in("TEAM 2").emit('You win');
						io.in("TEAM 1").emit('You lose');
						updateScores(models, "TEAM 1", "win");
						updateScores(models, "TEAM 2", "lose");
					}else if(liveTeam1 > 0 && liveTeam2 == 0){
						io.in("TEAM 2").emit('You lose');
						io.in("TEAM 1").emit('You win');
						updateScores(models, "TEAM 1", "lose");
						updateScores(models, "TEAM 2", "win");
					}else{
						io.emit('Draw');
						updateScores(models, "TEAM 1", "draw");
						updateScores(models, "TEAM 2", "draw");
					}
				}else{
					// Push post attack stats.
					io.emit('update game', units);
					
					// Start next turn.
					setTimeout(startTurn, executionTimer);
					setTimeout(function(){console.log('Turn ended, execution phase.');},executionTimer);
				}
			}, 1000);		
		}, 500);
	}, 500);
}

function shotCall(i){
	setTimeout(function(){
		io.emit('show attack', attackList[i]);
		//console.log(i);
		// If it hits something then remove it if it died.
		var hitUnit = attackList[i].unit;
		if(hitUnit > -1 && units[hitUnit].hp < 1){
			io.emit('remove unit', {x:attackList[i].x, y:attackList[i].y});
			units[hitUnit].x = null;
			units[hitUnit].y = null;
		}
	}, 50);
}

function unitCollision(i){
		setTimeout(function(){
			// Check if two units have the same x, y position, if so remove them
			for(var k=i+1; k<units.length; k++){
				if(units[i].x && units[i].y && units[i].x == units[k].x && units[i].y == units[k].y){
					console.log('unit collision' + units[i].x, units[i].y);
					io.emit('remove unit', {x:units[i].x, y:units[i].y});
					units[i].hp = 0;
					units[i].x = null;
					units[i].y = null;
					units[k].hp = 0;
					units[k].x = null;
					units[k].y = null;
					break;	
				}
			}
		}, 50);
}

function startTurn(){
	startTime = Date.now();
	timeout = planningTimer;
	attackList = [];
	updateAP(true);
	io.emit('update game', units);
	
	setTimeout(function(){
		endTurn(); 
		console.log('planning phase ended.');
	}, planningTimer);
}

function updateScores(models, Team, status){
        var teamID = Team;
        
        models.Scores.findOne({where: {team: teamID}}).then((scores) => {
                console.log(scores);
                if (status === "win") {
                	score = scores.points + 1;
                	scores.update({points: score});
                }
                if (status === "lose"){
                	score = scores.points - 1;
                	scores.update({points: score});
                }
                if (status === "draw"){
                	score = scores.points -1;
                	scores.update({points: score});
                }
        });
            
        
 }

setInterval(function(){
    console.log('Time left: '+ getTimeLeft(timeout) +'s');
	io.emit('update time', getTimeLeft(timeout));
}, 1000);

// Turn timer
console.log(users);