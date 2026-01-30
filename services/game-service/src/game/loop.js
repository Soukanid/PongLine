

setInterval(() => {
  updateBall()
  handleCollisions();
  updateScore();
  broadcastGameState();
}, 16);