// this code is heavily inspired in a github repository that can be 
// found in the following link: https://github.com/sgoedecke/socket-io-game

$(function () {
  var socket = io();
  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');


  var localDirection // used to display accel direction

  socket.on('gameStateUpdate', updateGameState);

  function drawPlayers(players) {
    // draw players
    // the game world is 500x500, but we're downscaling 5x to smooth accel out
    Object.keys(players).forEach((playerId) => {
      let player = players[playerId]
      var direction

      ctx.fillStyle = player.colour;
      ctx.fillRect(player.x / 5, player.y / 5, playerSize / 5 + (player.score * 20), playerSize / 5);



      if (playerId == socket.id) {
        direction = localDirection
      } else {
        direction = player.direction
      }
      // draw  snake direction for current player based on local variable
      ctx.fillStyle = 'black';
      let accelWidth = 3

      switch (direction) {
        case 'up':
          ctx.fillRect(player.x / 5, player.y / 5 - accelWidth, playerSize / 5 + player.score * 20, accelWidth);
          break
        case 'down':
          ctx.fillRect(player.x / 5, player.y / 5 + playerSize / 5, playerSize / 5 + player.score * 20, accelWidth);
          break
        case 'left':
          ctx.fillRect(player.x / 5 - accelWidth, player.y / 5, accelWidth, playerSize / 5);
          break
        case 'right':
          ctx.fillRect(player.x / 5 + playerSize / 5 + player.score * 20, player.y / 5, accelWidth, playerSize / 5);
      }
    })
  }

  function updateGameState(gameState) {
    // update local state to match state on server
    players = gameState.players
    Apple = gameState.Apple
    Apple_poison = gameState.Apple_poison
    // draw stuff

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // set score info
    var playerCount = Object.keys(players).length
    document.getElementById('playerCount').innerHTML = String(playerCount) + " Cobrinha" + (playerCount > 1 ? 's' : '') + " na arena"
    var scores = ''
    Object.values(players).sort((a, b) => (b.score - a.score)).forEach((player, index) => {
      scores += "<p><span style='border-bottom: 1px solid " + player.colour + ";'>" + player.name + "</span> pegou <bold style = color: red;> " + player.score + "</bold> maçãs</p>"
    })
    document.getElementById('scores').innerHTML = scores


    // draw Apple_poison
    ctx.beginPath();
    ctx.arc((Apple_poison.x + AppleSize / 2) / 5, (Apple_poison.y + AppleSize / 2) / 5, AppleSize / 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'green';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#003300';
    ctx.stroke();

    // draw Apple
    ctx.beginPath();
    ctx.arc((Apple.x + AppleSize / 2) / 5, (Apple.y + AppleSize / 2) / 5, AppleSize / 5, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'red';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#003300';
    ctx.stroke();



    drawPlayers(players)
  }

  // check wich key is being pressed
  $('html').keydown(function (e) {
    if (e.key == "ArrowDown") {
      socket.emit('down', players);
      accelPlayer(socket.id, 0, 1)
      localDirection = 'down'
    } else if (e.key == "ArrowUp") {
      socket.emit('up', players);
      accelPlayer(socket.id, 0, -1)
      localDirection = 'up'
    } else if (e.key == "ArrowLeft") {
      socket.emit('left', players);
      accelPlayer(socket.id, -1, 0)
      localDirection = 'left'
    } else if (e.key == "ArrowRight") {
      socket.emit('right', players);
      accelPlayer(socket.id, 1, 0)
      localDirection = 'right'
    }
  })

  function gameLoop() {
    // update game
    updateGameState({ players: players, Apple: Apple, Apple_poison: Apple_poison })
    // move everyone around
    Object.keys(players).forEach((playerId) => {
      let player = players[playerId]
      movePlayer(playerId, direction)
    })
  }

  function drawGame() {
    // draw everything up
    drawPlayers(players)
    requestAnimationFrame(drawGame)
  }

  setInterval(gameLoop, 25)
  requestAnimationFrame(drawGame)

});
