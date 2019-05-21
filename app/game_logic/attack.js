function Attack(xLoc, yLoc, damage, unit){
	
	// Active attributes that will be potentially updated each turn.
	this.x = xLoc;
	this.y = yLoc;
	this.dam = damage;
	this.unit = unit;
}

module.exports = Attack;