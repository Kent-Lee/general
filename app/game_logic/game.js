const Player = require('./Player');



Game.create = function() {
  return new Game();
};


Game.getPlayers = function() {
  return this.players.values();
};


Game.addNewPlayer = function(socket, data) {
  this.clients.set(socket.id, socket);
  this.players.set(socket.id, Player.create(socket.id, [10, 10]));
};

Game.removePlayer = function(id) {
  this.clients.remove(id);
  this.players.remove(id);
};

/* Updates a player based on input received from their client.
 */
Game.updatePlayerOnInput = function(id, data) {
  var player = this.players.get(id);
  if (player) {
    player.updateOnInput(data.keyboardState);
  }
};

/**Steps the server forward and updates game.
 */
Game.update = function() {
  var players = this.getPlayers();
  for (var i = 0; i < players.length; ++i) {
    players[i].update();
  }
};

/* Sends the state of the game to every client.
 */
Game.sendState = function() {
  var ids = this.clients.keys();
  for (var i = 0; i < ids.length; ++i) {
    this.clients.get(ids[i]).emit('update', {
      self: this.players.get(ids[i]),
      players: this.players.values().filter((player) => player.id != ids[i])
    });
  }
};

module.exports = Game;