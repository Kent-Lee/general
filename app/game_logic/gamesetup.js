function Gamesetup(){
	return Gamesetup()
}

// pieces
Gamesetup.piece = function(colour){
	this.colour = colour
	this.xPos = 0
	this.yPos = 0
};

//initialize board
Gamesetup.newBoard = function(){
	var board = new Array(8);
	for(var i = 0; i<board.length; i++){
		board[i] = new Array(8);
	}
	for(y=0; y<board.length; y++){
		for(x=0; x<board.length; x++){
			if(y>=0 && y<=2 && (x+y) %2 != 0){
				board[x][y] = new this.piece("white");
			}else if (y>=5 && y<=7 && (x+y) %2 != 0){
				board[y][x] = new this.piece("black");
			}else{
				board[y][x] = null;
			}
		}
	}
	return board;
};

//initialize pieces
Gamesetup.initializePieces = function(board, boardHeight){
	squareSize = boardHeight/8;
	for(y=0; y<board.length; y++){
		for(x=0; x<board[0].length; x++){
			if(board[y][x] != null){
				board[y][x].xPos = (squareSize/2)+(x*squareSize);
				board[y][x].yPos = (squareSize/2)+(y*squareSize);
			}
		}
	}
};


Gamesetup.printBoard = function(board){
	console.log("board:")
	for(y=0; y<board.length; y++){
		var str="";
		for(x=0; x<board.length; x++){
			str += board[y][x] + "";
		}
		console.log(str);
	}
};

module.exports = Gamesetup;
