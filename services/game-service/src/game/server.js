const io = require('socket.io')(3000);

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // socket.on('createRoom', () => {
    //     const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
        
    //     rooms[roomId] = {
    //         players: [socket.id],
    //         gameState: {}
    //     };

    //     socket.join(roomId);
    //     socket.emit('roomCreated', roomId);
    //     console.log(`Room ${roomId} created by ${socket.id}`);
    // });

    socket.on('joinGame', (gameId) => {
        socket.join(gameId);
        
        if (!rooms[gameId]) {
            rooms[gameId] = { players: [] };
        }
        rooms[gameId].players.push(socket.id);
        
        console.log(`User ${socket.id} joined game ${gameId}`);
        
        if (rooms[gameId].players.length === 2) {
            io.to(gameId).emit('gameStart', { players: rooms[gameId].players });
        }
    });

    // socket.on('leaveGame', (gameId) => {
    //     socket.leave(gameId);
    //     if (rooms[gameId]) {
    //         rooms[gameId].players = rooms[gameId].players.filter(player => player !== socket.id);
    //         if (rooms[gameId].players.length === 0) {
    //             delete rooms[gameId];
    //         }
    //     }
    // });

    socket.on('paddleMove', (data) => {
        const { gameId, move } = data;
        console.log(`User ${socket.id} made a move in game ${gameId}:`, move);
        socket.to(gameId).emit('paddleMove', { playerId: socket.id, move });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

console.log('Game service is running on port 3000');