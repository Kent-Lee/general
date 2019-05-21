function Unit(unitID, team, xLoc, yLoc, movement, actions, hp, range, attack, lock){
	
	// Active attributes that will be potentially updated each turn.
	this.x = xLoc;
	this.y = yLoc;
	this.hp = hp;
	this.currAct = actions;
	this.currX = xLoc;
	this.currY = yLoc;
	this.lock = false;
	
	// Static values to define the unit attributes.
	this.id = unitID;
	this.team = team;
	this.mov = movement;
	this.act = actions;
	this.attack = attack;
	this.range = range;
}

module.exports = Unit;