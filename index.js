// this code is heavily inspired in a github repository that can be 
// found in the following link: https://github.com/sgoedecke/socket-io-game

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var engine = require('./public/game2')

var gameInterval, updateInterval

function snakeName() {
  var names = [
    'Fernando',
    'Bernard',
    'Gabi',
    'Joao',
    'Carol',
    'Pierre',
    'Luiz',
    'Icaro',
    'Guilherme'


  ]
  return names[Math.floor(Math.random() * names.length)]
}



function gameLoop() {
  // move everyone around
  Object.keys(engine.players).forEach((playerId) => {
    let player = engine.players[playerId]
    engine.movePlayer(playerId)
  })
}

// ----------------------------------------
// Main server code
// ----------------------------------------

// serve css and js
app.use(express.static('public'))

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});



function emitUpdates() {
  // tells everyone what's up
  io.emit('gameStateUpdate', { players: engine.players, Apple: engine.Apple, Apple_poison: engine.Apple_poison });
}

io.on('connection', function (socket) {
  console.log('User connected: ', socket.id)
  // game starts in the case we have our first hungry snake
  if (Object.keys(engine.players).length == 0) {
    engine.shuffleApple(engine.Apple)
    engine.shuffleApple(engine.Apple_poison)
    gameInterval = setInterval(gameLoop, 25)
    updateInterval = setInterval(emitUpdates, 40)
  }

  // check valid position to place the hungry snake
  var posX = 0
  var posY = 0
  while (!engine.isValidPositionD({ x: posX, y: posY }, socket.id)) {
    posX = Math.floor(Math.random() * Number(engine.gameSize) - 100) + 10
    posY = Math.floor(Math.random() * Number(engine.gameSize) - 100) + 10
  }

  // add player to engine.players obj
  engine.players[socket.id] = {
    accel: {
      x: 0,
      y: 0
    },

    x: posX,
    y: posY,
    size: 20,
    colour: engine.stringToColour(socket.id),
    score: 0,
    name: snakeName()
  }

  // set socket listeners

  socket.on('disconnect', function () {
    delete engine.players[socket.id]
    // end game if there are no engine.players left
    if (Object.keys(engine.players).length > 0) {
      io.emit('gameStateUpdate', engine.players);
    } else {
      clearInterval(gameInterval)
      clearInterval(updateInterval)
    }
  })

  socket.on('up', function (msg) {
    engine.accelPlayer(socket.id, 0, -1)
  });

  socket.on('down', function (msg) {
    engine.accelPlayer(socket.id, 0, 1)
  })

  socket.on('left', function (msg) {
    engine.accelPlayer(socket.id, -1, 0)
  });

  socket.on('right', function (msg) {
    engine.accelPlayer(socket.id, 1, 0)
  })
});

http.listen(process.env.PORT || 8080, function () {
  console.log('listening on *:8080', process.env.PORT);
});
