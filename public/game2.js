// this code is heavily inspired in a github repository that can be 
// found in the following link: https://github.com/sgoedecke/socket-io-game


var players = {}
var Apple = {} // the fruit
var Apple_poison = {} // the evil fruit that kills and reset the player
const gameSize = 2500; // the gamesize is used to draw and check collisions to the walls 

const playerSize = 100;
const AppleSize = 50
const maxAccel = 100

function checkCollision(obj1, obj2) {

  return (Math.abs((obj1.x + obj1.score * 80) - obj2.x) <= playerSize + (obj1.score * 80) && Math.abs(obj1.y - obj2.y) <= playerSize)
}

function isValidPosition(newPosition, playerId, score) {
  // bounds check
  if (newPosition.x < 0 || (newPosition.x + playerSize + score * 80) > gameSize) {
    return false
  }
  if (newPosition.y < 0 || newPosition.y + playerSize > gameSize) {
    return false
  }
  return true
}

//the need of two different position validations is due to the fact that the snake now increases its size 
// and the apple has a constant size
function isValidPositionD(newPosition, playerId) {
  // bounds check
  if (newPosition.x < 0 || newPosition.x + playerSize > gameSize) {
    return false
  }
  if (newPosition.y < 0 || newPosition.y + playerSize > gameSize) {
    return false
  }
  return true
}

function shuffleApple(Apple_i) {
  var posX = Math.floor(Math.random() * Number(gameSize) - 100) + 10
  var posY = Math.floor(Math.random() * Number(gameSize) - 100) + 10

  while (!isValidPositionD({ x: posX, y: posY }, '_Apple')) {
    posX = Math.floor(Math.random() * Number(gameSize) - 100) + 10
    posY = Math.floor(Math.random() * Number(gameSize) - 100) + 10
  }

  Apple_i.x = posX
  Apple_i.y = posY


}

function movePlayer(id) {

  var player = players[id]

  var newPosition = {
    x: player.x + player.accel.x,
    y: player.y + player.accel.y
  }
  if (isValidPosition(newPosition, id, player.score)) {
    // move the player 
    player.x = newPosition.x
    player.y = newPosition.y
  } else {
    // don't move the player
    player.accel.x = 0
    player.accel.y = 0
  }

  //snake ate poison ): sets score to zero, wich also resizes the snake
  if (checkCollision(player, Apple_poison)) {

    player.score = 0
    shuffleApple(Apple_poison)
  }

  //snake ate the apple (: increases the score of our healthy snake and also its size
  if (checkCollision(player, Apple)) {

    player.score += 1
    shuffleApple(Apple)
  }

}

function accelPlayer(id, x, y) {
  var player = players[id]
  var currentX = player.accel.x
  var currentY = player.accel.y

  // used to indicate the direction of the snake. little black bar is drawn in the client2.js to that matter
  if (x > 0) {
    player.direction = 'right'
  } else if (x < 0) {
    player.direction = 'left'
  } else if (y > 0) {
    player.direction = 'down'
  } else if (y < 0) {
    player.direction = 'up'
  }

  if (Math.abs(currentX + x) < maxAccel) {
    player.accel.x += x
  }
  if (Math.abs(currentY + y) < maxAccel) {
    player.accel.y += y
  }
}


function stringToColour(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  var colour = '#';
  for (var i = 0; i < 3; i++) {
    var value = (hash >> (i * 8)) & 0xFF;
    colour += ('00' + value.toString(16)).substr(-2);
  }
  return colour;
}

if (!this.navigator) { // super hacky thing to determine whether this is a node module or inlined via script tag
  module.exports = {
    players: players,
    stringToColour: stringToColour,
    accelPlayer: accelPlayer,
    movePlayer: movePlayer,
    playerSize: playerSize,
    gameSize: gameSize,
    isValidPosition: isValidPosition,
    isValidPositionD: isValidPositionD,
    Apple: Apple,
    Apple_poison: Apple_poison,
    shuffleApple: shuffleApple
  }
}
