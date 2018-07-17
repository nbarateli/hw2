// Main server program

// Import packages
var express = require("express");
var ejs = require("ejs");

// Create server
var app = express();
var http = require('http').Server(app);
const io = require('socket.io')(http);

io.on('connection', socket => {
    socket.on('move', function (msg) {
        msg = JSON.parse(msg)
        console.log(JSON.stringify(msg));
        if (move(msg.row, msg.col, msg.player))
            io.emit('move', JSON.stringify(msg
            ))
        else
            console.log("OEEEEEEEEEEe")
    })
    socket.on('new_game', () => {
        resetGame();
        io.emit('new_game');
    })
})
// Print HTTP requests to console
app.use(express.logger());

// Serve static files from public directory
app.use(express.static(__dirname + "/public"));

// Parse HTTP POST parameters
app.use(express.bodyParser());

// Use the EJS templating engine
app.set("view engine", "ejs");

// Look for view files in the view directory
app.set("views", __dirname + "/views");

// Game state variables
const board = [["", "", ""], ["", "", ""], ["", "", ""]];
var turn;

// Reset the game
var resetGame = function () {
    for (i in board)
        for (j in board[i]) board[i][j] = "";
    turn = "x";
    console.error(new Error().stack)
};

// Given a board, return true if the game has ended and false otherwise
var gameEnded = function (board) {
    // Possible lines to check
    var lines = [
        [[0, 0, 0], [0, 1, 2]],
        [[1, 1, 1], [0, 1, 2]],
        [[2, 2, 2], [0, 1, 2]],
        [[0, 1, 2], [0, 0, 0]],
        [[0, 1, 2], [1, 1, 1]],
        [[0, 1, 2], [2, 2, 2]],
        [[0, 1, 2], [0, 1, 2]],
        [[0, 1, 2], [2, 1, 0]]
    ];

    // If any line is controlled by a single player, the game is ended
    for (var i = 0; i < lines.length; i++) {
        if (board[lines[i][0][0]][lines[i][1][0]]
            == board[lines[i][0][1]][lines[i][1][1]]
            && board[lines[i][0][1]][lines[i][1][1]]
            == board[lines[i][0][2]][lines[i][1][2]]
            && board[lines[i][0][0]][lines[i][1][0]] != "") {
            return true;
        }
    }

    // If all the spots are taken, the game has ended.
    for (var row = 0; row < 3; row++) {
        for (var col = 0; col < 3; col++) {
            if (board[row][col] == "") {
                return false;
            }
        }
    }
    return true;
}

// Client page for Player X
app.get("/playerx", function (req, res) {
    res.render("client", {"player": "x"});
});

// Client page for Player Y
app.get("/playero", function (req, res) {
    res.render("client", {"player": "o"});
});

// HTTP GET endpoint that resets the game
app.get("/reset", function (req, res) {
    resetGame();
    res.send(JSON.stringify(true));
    res.end();
});


// HTTP GET endpoint that resets the game only if it is finished
app.get("/newgame", function (req, res) {
    if (gameEnded(board)) {
        resetGame();
        res.send(JSON.stringify(true));
        res.end();
    } else {
        res.send(JSON.stringify(false));
        res.end();
    }
});

// HTTP GET endpoint that gets the board
app.get("/board", function (req, res) {
    console.log(board)
    res.send(JSON.stringify(board));
    res.end();
});

// HTTP GET endpoint that gets whose turn it is
app.get("/turn", function (req, res) {
    res.send(JSON.stringify(turn));
    res.end();
});

function inRange(val, start, end) {
    return start <= val && val <= end;
}

function valid(x, y, player) {

    return (player === 'x' || player === 'o') && inRange(x, 0, board.length - 1)
        && inRange(y, 0, board.length - 1) && board[x][y] === '' && turn === player;
}

function move(x, y, player) {
    if (valid(x, y, player)) {
        board[x][y] = player;
        turn = gameEnded(board) ? "" : player === 'x' ? 'o' : 'x';
        console.log(JSON.stringify(board))
        return true
    }
    return false


}

// HTTP GET endpoint that makes a player move
app.get("/move", function (req, res) {
    // TODO: Implement this
    let x = req.query.row, y = req.query.col, player = req.query.player;
    res.send(JSON.stringify(move(x, y, player)))
    res.end();
});

// Initialize the game
resetGame();

// Listen for new HTTP connections at the given port number
var port = 80;
//app.listen(port);
http.listen(80);

// console.log("Listening for new connections on http://localhost:" + port + "/");
