const socket = io('http://localhost/');
// Create game interface
var gameUI = new GameUI(".container", player);

// Initialize game
// TODO: Reimplement this function to support multiplayer
async function init() {
    let resp = await fetch('/turn');
    let data = await resp.json();
    (msg => {
        gameUI.setMessage("It is player " + msg.toUpperCase() + "'s turn.")
        if (msg === player) gameUI.waitForMove();
    })(data);
    resp = await fetch('/board');
    data = await resp.json();
    (data => {
        console.log(data)
        gameUI.setBoard(data)
    })(data)
}

// Callback function for when the user makes a move
// TODO: Reimplement this function to support multiplayer
var callback = function (row, col, _player) {
    if (!gameUI.ended) {
        if (gameUI.player !== player) gameUI.disable()
        if (gameUI.player == "x") gameUI.player = "o";
        else if (gameUI.player == "o") gameUI.player = "x";
        gameUI.setMessage("It is player " + gameUI.player.toUpperCase() + "'s turn.")
        socket.emit('move', JSON.stringify({row: row, col: col, player: _player}))
    } else {
        socket.emit('move', JSON.stringify({row: row, col: col, player: _player}))
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
        if (gameUI.checkEnded()) {
            gameUI.setMessage("Game has ended.")
        }
        if (msg.player !== player) {
            gameUI.player = player;
            console.log(player)
            gameUI.setMessage("It is your turn.");//player " + gameUI.player.toUpperCase() + "'s turn.");
            gameUI.waitForMove();
        }
    }
)
