import path from "path";
import { createInitialState, rooms, updateRoom} from "./game/gameLogic";
import { Server, Socket } from "socket.io";
import Fastify, { FastifyRequest, FastifyReply } from 'fastify';

const fastify = Fastify({
  logger: true
});


const start = async () => {
  try {
    // This keeps the server alive!
    console.log('Server is running...');
    await fastify.ready();
    
    const io = new Server(fastify.server, {
      cors: { origin: "*" },
      path: "/api/game/socket.io"
    });
        
    setInterval(() => {
      for (const gameId in rooms) {
        updateRoom(gameId, io);
      }
    }, 16);

    io.on("connection", (socket: Socket) => {
      console.log("A user connected:", socket.id);

      socket.on("joinGame", (gameId: string) => {
        socket.join(gameId);
        
        if (!rooms[gameId]) {
          console.log(`Room ${gameId} is not found. Creating new room.`);
          rooms[gameId] = { 
            players: [], 
            gameState: createInitialState() 
          };
        }
        
        rooms[gameId].players.push(socket.id);
        
        console.log(`User ${socket.id} joined game ${gameId}`);
        
        if (rooms[gameId].players.length === 2) {
          io.to(gameId).emit("gameStart", {
            players: rooms[gameId].players,
          });
        }
        if (rooms[gameId].players.length > 2) {
          socket.leave(gameId);
          socket.emit("gameFull");
        }
      });
      
      socket.on("playerInput", (data: { gameId: string; up: boolean; down: boolean }) => {
        const room = rooms[data.gameId];
        const speed = 5;
        if (room) {
          const isPlayer1 = room.players[0] === socket.id;
          if (isPlayer1) {
            if (data.up) {
              room.gameState.paddles.left.y = Math.max(0, room.gameState.paddles.left.y - speed);
            }
            if (data.down) {
              room.gameState.paddles.left.y = Math.min(room.gameState.canvas.height - 80, room.gameState.paddles.left.y + speed);
            }
          } else {
            if (data.up) {
              room.gameState.paddles.right.y = Math.max(0, room.gameState.paddles.right.y - speed);
            }
            if (data.down) {
              room.gameState.paddles.right.y = Math.min(room.gameState.canvas.height - 80, room.gameState.paddles.right.y + speed);
            }
          }
        }
      });
      socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        
        for (const gameId in rooms) {
          const room = rooms[gameId];
          if (!room) continue;
          const playerIndex = room.players.indexOf(socket.id);
          if (playerIndex !== -1) {
            room.players.splice(playerIndex, 1);
            socket.to(gameId).emit("playerDisconnected", {
              playerId: socket.id,
            });
            if (room.players.length === 0) {
              delete rooms[gameId];
              console.log(`Room ${gameId} deleted due to no players.`);
            }
            break;
          }
        }
      });
    });
    
    await fastify.listen({ port: 3003, host: '0.0.0.0' }); 
    console.log("Game service is running on port 3003");


  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

