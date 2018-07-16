const socket = io('http://localhost/');
// Create game interface
var gameUI = new GameUI(".container", player);

// Initialize game
// TODO: Reimplement this function to support multiplayer
var init = function () {
    gameUI.setMessage("It is player " + gameUI.player.toUpperCase() + "'s turn.")
    gameUI.waitForMove();
}
// Callback function for when the user makes a move
// TODO: Reimplement this function to support multiplayer
var callback = function (row, col, player) {
    if (!gameUI.ended) {
        if (gameUI.player == "x") gameUI.player = "o";
        else if (gameUI.player == "o") gameUI.player = "x";
        gameUI.setMessage("It is player " + gameUI.player.toUpperCase() + "'s turn.")
        gameUI.waitForMove();
        socket.emit('move', JSON.stringify({row: row, col: col, player: player}))
    } else {
        gameUI.setMessage("Game has ended.")
    }
};

// Set callback for user move
gameUI.callback = callback;

// Initialize game
init()
socket.on('move', msg => {
    console.log(msg);
    msg = JSON.parse(msg)
    gameUI.setSquare(msg.row, msg.col, msg.player)
})
