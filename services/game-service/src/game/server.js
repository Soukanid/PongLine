const io = require('socket.io')(3000);

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinGame', (gameId) => {
        socket.join(gameId);
        console.log(`User ${socket.id} joined game ${gameId}`);
    });

    socket.on('playerMove', (data) => {
        const { gameId, move } = data;
        console.log(`User ${socket.id} made a move in game ${gameId}:`, move);
        socket.to(gameId).emit('playerMove', { playerId: socket.id, move });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

console.log('Game service is running on port 3000');