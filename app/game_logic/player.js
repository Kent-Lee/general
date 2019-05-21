/**
 * Constructor for a Player
 */
function Player(id) {
  this.id = id;
}


/**
 * method for creating a Player
 */
Player.create = function(id) {
  return new Player(id);
};

/**
 * Updates the Player based on received input.
 */
Player.updateOnInput = function(keyboardState) {
  //needs to be implemented based on how we are defining moves
};

/**
 * Steps the Player forward in time
 */
Player.update = function() {
  this.parent.update.call(this);
};

module.exports = Player;