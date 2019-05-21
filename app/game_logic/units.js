var Unit = require('./unit');

function initialLayout(){
	// TEMP SOLUTION: Create 2 units, return array
	// TODO: have a db with initialized units, pull all units from db, return as array
	// Create layout unitID, team, xLoc, yLoc, movement, actions, hp, range, attack

	function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
	}

	function index(array, item) {
    for (var i = 0; i < array.length; i++) {
        if (array[i].toString() === item.toString()) return i;
    }
    return -1;
}

	var intialSetup = [];
	var units = [];

	for (i = 0; i<10; i++){
		x = getRandomInt(1,12);
		y = getRandomInt(1,3);
		xy = [x, y];

		itemIndex = index(intialSetup, xy);

		if (itemIndex != -1){
			while (itemIndex != -1){
				x = getRandomInt(1,12);
				y = getRandomInt(1,3);
				xy = [x, y];
				itemIndex = index(intialSetup, xy);
			}
		}


		
		intialSetup[i]= xy;
		units[i] = new Unit(i, 1, x, y, 2, 2, 2, 4, 1, false);
	

	}


	for (i = 10; i<20; i++){
		x = getRandomInt(1,12);
		y = getRandomInt(10,12);
		xy = [x, y];

		itemIndex = index(intialSetup, xy);

		

		if (itemIndex != -1){
			while (itemIndex != -1){
				x = getRandomInt(1,12);
				y = getRandomInt(10,12);
				xy = [x, y];
				itemIndex = index(intialSetup, xy);
			}
		}

		intialSetup[i] = xy;
		units[i] = new Unit(i, 2, x, y, 2, 2, 2, 4, 1, false);
		
	}
	
	return units;
	
}

module.exports.initialLayout = initialLayout;