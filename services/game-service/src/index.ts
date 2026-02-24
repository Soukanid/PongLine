import { rooms, updateRoom} from "./game/gameLogic";
import tournamentRoutes from './tournament/database'; 
import { saveMatch } from "./game/database";
import gameRoutes from "./game/database";
import { Server, Socket } from "socket.io";
import Fastify from 'fastify';
import cors from '@fastify/cors';

const fastify = Fastify({
  logger: true
});

fastify.register(cors, { 
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
});

const start = async () => {
  try {
    
    await fastify.register(gameRoutes);
    await fastify.register(tournamentRoutes);
    await fastify.ready();


    const io = new Server(fastify.server, {
      cors: { origin: "*" },
      path: "/socket.io"
    });
        
    setInterval(() => {
      for (const gameId in rooms) {
        updateRoom(gameId, io);
      }
    }, 16);

    io.on("connection", (socket: Socket) => {

      socket.on("joinGame", (data: any) => {
        const { gameId, username, nickname } = data;
        
        if (!rooms[gameId]) {
            socket.emit("gameNotFound");
            return;
        }
        
        const playerUpdate = {
          username: username,
          nickname: nickname,
          socketId: socket.id
        };
        
        if (rooms[gameId].players.length === 2) {
          socket.emit("gameFull");
          return;
        }
        
        rooms[gameId].players.push(playerUpdate);
        
        socket.join(gameId);

        console.log(`User ${socket.id} joined game ${gameId}`);
        if (rooms[gameId].players.length === 2) {
          io.to(gameId).emit("gameStart", {
            players: rooms[gameId].players,
          });
          updateRoom(gameId, io);
        }
      });
      
      socket.on("playerInput", (data: { gameId: string; up: boolean; down: boolean }) => {
        const { gameId, up, down } = data;
        const paddleHeight = 80;
        const speed = 5;
        const room = rooms[gameId];
        if (!room) return;

        const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
        if (playerIndex === -1) return;

        const paddle = playerIndex === 0 ? room.gameState.paddles.left : room.gameState.paddles.right;
        if (up) paddle.y -= speed;
        if (down) paddle.y += speed;

        paddle.y = Math.max(0, Math.min(room.gameState.canvas.height - paddleHeight, paddle.y));
      });
      socket.on("disconnect", () => {
          for (const gameId in rooms) {
              const room = rooms[gameId];
              if (!room) continue;
          
              const playerIndex = room.players.findIndex(p => p.socketId === socket.id);

              if (playerIndex !== -1) {
                const winnerIndex = 1 - playerIndex; 
                const winner = room.players[winnerIndex];

                if (winner && winner.socketId) {
                  io.to(winner.socketId).emit("playerDisconnected");
                  const state = room.gameState;
                  const matchResult = {
                    room_id: gameId,
                    username1: room.players[0]?.username,
                    username2: room.players[1]?.username,
                    score_plr1: state.scores.left,
                    score_plr2: state.scores.right,
                    winnerName: winner?.username,
                  };
                      
                  saveMatch(matchResult, winner);
                }
                
                delete rooms[gameId];
                break; 
              }
          }
      });
    });
    
    await fastify.listen({ port: 3003, host: '0.0.0.0' });

  } catch (err) {
    fastify.log.error(err);
  }
};

start();

