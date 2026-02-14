import { rooms, updateRoom} from "./game/gameLogic";
import tournamentRoutes from './tournament/database'; 
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
    console.log('Server is running...');
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
      console.log("A user connected:", socket.id);

      socket.on("joinGame", (data) => {
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
        
        rooms[gameId].players.push(playerUpdate);
        
        socket.join(gameId);

        console.log(`User ${socket.id} joined game ${gameId}`);
        if (rooms[gameId].players.length === 2) {
          io.to(gameId).emit("gameStart", {
            players: rooms[gameId].players,
          });
          updateRoom(gameId, io);
        }
        if (rooms[gameId].players.length > 2) {
          socket.leave(gameId);
          socket.emit("gameFull");
        }
      });
      
      socket.on("playerInput", (data: { gameId: string; up: boolean; down: boolean }) => {
        const { gameId, up, down } = data;
        const speed = 5;
        const room = rooms[gameId];
        if (!room) return;

        const playerIndex = room.players.findIndex(p => p.socketId === socket.id);
        if (playerIndex === -1) return;

        const paddle = playerIndex === 0 ? room.gameState.paddles.right : room.gameState.paddles.left;
        if (up) paddle.y -= speed;
        if (down) paddle.y += speed;

        paddle.y = Math.max(0, Math.min(room.gameState.canvas.height - 100, paddle.y));
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

