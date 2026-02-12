
interface GameState {
  canvas: { width: number; height: number }; 
  ballPosition: { x: number; y: number };
  ballVelocity: { x: number; y: number };
  paddles: { left: { y: number }; right: { y: number } };
  scores: { left: number; right: number };
}

interface PlayerInfo {
  username: string;
  nickname: string;
  socketId: string;
}

interface Room {
  players: PlayerInfo[];
  gameState: GameState;
}

export const rooms: Record<string, Room> = {};

export function createInitialState(): GameState {
  return {
    canvas: { width: 800, height: 500 },
    ballPosition: { x: 400, y: 250 },
    ballVelocity: { x: 3, y: 3 },
    paddles: { left: { y: 210 }, right: { y: 210 } },
    scores: { left: 0, right: 0 },
  };
}

function checkPaddleCollision(state: GameState, paddle: "left" | "right") {
  const paddleWidth = 10;
  const paddleHeight = 80;
  const ballX = state.ballPosition.x;
  const ballY = state.ballPosition.y;
  const ballRadius = 7;

  if (paddle === "left") {
    if (
      ballX - ballRadius <= paddleWidth + 10 &&
      ballY >= state.paddles.left.y &&
      ballY <= state.paddles.left.y + paddleHeight
    ) {
      state.ballVelocity.x = -state.ballVelocity.x;
    }
  } else {
    if (
      ballX + ballRadius >= state.canvas.width - paddleWidth - 10 &&
      ballY >= state.paddles.right.y &&
      ballY <= state.paddles.right.y + paddleHeight
    ) {
      state.ballVelocity.x = -state.ballVelocity.x;
    }
  }
}

function resetBall(state: GameState) {
  state.ballPosition = { x: state.canvas.width / 2, y: state.canvas.height / 2 };
  state.ballVelocity = { x: 3 * (Math.random() > 0.5 ? 1 : -1), y: 3 * (Math.random() > 0.5 ? 1 : -1) };
}

export function updateRoom(gameId: string, io: any) {
  const room = rooms[gameId];

  if (!room) return;
  const state = room.gameState;
  
  const syncData = {
    player1: room.players[1]?.username || 'Waiting...',
    player2: room.players[0]?.nickname || 'Waiting...',
    paddle1Y: state.paddles.right.y,
    paddle2Y: state.paddles.left.y,
    score_plr1: state.scores.right,
    score_plr2: state.scores.left,
    ballX: state.ballPosition.x,
    ballY: state.ballPosition.y,
    timestamp: Date.now()
  };
  
  io.to(gameId).emit("gameState", syncData);
  
  if (room.players.length < 2) return;

  state.ballPosition.x += state.ballVelocity.x;
  state.ballPosition.y += state.ballVelocity.y;

  checkPaddleCollision(state, "left");
  checkPaddleCollision(state, "right");

  if (state.ballPosition.y <= 0 || state.ballPosition.y >= state.canvas.height) {
    state.ballVelocity.y = -state.ballVelocity.y;
  }

  if (state.ballPosition.x <= 0) {
    state.scores.right += 1;
    resetBall(state);
  } else if (state.ballPosition.x >= state.canvas.width) {
    state.scores.left += 1;
    resetBall(state);
  }
  if (state.scores.right >= 5 || state.scores.left >= 5) {
    io.to(gameId).emit("gameOver");
    delete rooms[gameId];
  }
}
