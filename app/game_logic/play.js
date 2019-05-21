var moves =require('./moves.js')

function Play(){
	return Play()
}

//defining grabbing of pieces
Play.grabPiece = function(board, turn, team, heldPiece, heldX, heldY, data){
	if(heldPiece == null && turn == team){
		for(y=0; y<board.length; y++){
			for(x=0; x<board.length; x++){
				if(board[y][x] != null && board[y][x].colour == turn){
					heldPiece = board[y][x];
					heldX = x;
					heldY = y;
				}
			}
		}
	}

	var grab ={
		x: heldX,
		y: heldY,
		piece: heldPiece
	};
	return grab;
};

module.exports = Play;




