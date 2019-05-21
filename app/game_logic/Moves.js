function Moves(){
	return Moves()
}

Moves.getValidMoves = function(turn, board){
	var moves = []
	for(y=0; y<board.length; y++){
		for(x=0; x<board.length; x++){
			if(board[y][x] != null && board[y][x].colour == turn){
				moves = moves.concat(getMoves(board[y][x], x, y, board));
			}
		}
	}
	return moves;
};

Moves.move = function(piece, newX, newY){
	this.piece = piece;
	this.newX = newX;
	this.newY = newY;
};

//moves function needs to be updated based on piece definitions
//currently just allowing up, down, left, right
//needs to be updated for each piece

Moves.getMoves = function(piece, x, y, board) {

	var moves = [];

	if(y>1){
		moves.push( new move(piece, x, y-1));
	}

	if(y<7){
		moves.push( new move(piece, x, y+1));
	}
	if(x>1){
		moves.push( new move(piece, x-1, y));
	}
	if(x<7){
		moves.push( new move(piece, x+1, y));
	}
	return moves;
};