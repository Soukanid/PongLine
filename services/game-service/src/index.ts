import path from "path";
import { createInitialState, rooms, updateRoom} from "./game/gameLogic";
import { Server, Socket } from "socket.io";
import Fastify, { FastifyRequest, FastifyReply } from 'fastify';
import tournamentRoutes from './tournament/tour'; 


const fastify = Fastify({
  logger: true
});

const start = async () => {
  try {
    
    console.log('Server is running...');
    await fastify.ready();

    await fastify.register(tournamentRoutes);

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

      socket.on("joinRoom", (data) => {
          const { roomId, username, nickname } = data;

          const playerUpdate = {
              username: username,
              nickname: nickname || username, // Fallback to username if no nick
              socketId: socket.id
          };
        
          if (!rooms[roomId]) {
              rooms[roomId] = { players: [], gameState: createInitialState() };
          }
          rooms[roomId].players.push(playerUpdate);
      });
      
      socket.on("playerInput", (data: { gameId: string; up: boolean; down: boolean }) => {
        const room = rooms[data.gameId];
        const speed = 5;
        if (room) {
          const isPlayer1 = room.players[0]?.socketId === socket.id;
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
        
          const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
          if (playerIndex !== -1) {
            room.players.splice(playerIndex, 1);
          
            io.to(gameId).emit("playerDisconnected", {
              playerId: socket.id,
              message: "Opponent left the game."
            });
          
            console.log(`Player ${socket.id} left room ${gameId}. Remaining: ${room.players.length}`);
          
            if (room.players.length === 0) {
              delete rooms[gameId];
              console.log(`Room ${gameId} deleted.`);
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

