import "../css/2049.css"
import { Tile } from "./Tile";

export const GameBoard = ({ board }) => {
    let tiles = [];
if (board.length ?? false) {
    
    console.log("game board: ", board);
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            tiles.push(board[i][j])
        }
    }
    console.log("tiles: ", tiles)
}
    return (
      <div className="board">
        <div className="grid">
            
            {tiles.map((tile, index) => (
                <Tile key={index} value={tile} />
            ))}
            </div>
      </div>
    );
  };
/*

*/