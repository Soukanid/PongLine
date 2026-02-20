async getFriendRequests(req: FastifyRequest, reply: FastifyReply)
{
    const myId = req.headers['x-user-id']?.toString();

    if (!myId)
      return reply.code(400).send();

    const userId = parseInt(myId);

    try {
      const incomingRequests = await prisma.friendship.findMany({
        where: {
          receiverId: userId,
          status: 'PENDING'
        },
        include: {
          sender: { 
            select: { id: true, username: true, avatar: true} 
          }
        }
      });

      const formattedRequests = incomingRequests.map(request => {
        let avatarBase64: string | null = null;

        if (request.sender.avatar) {
          const base64String = request.sender.avatar.toString('base64');
          avatarBase64 = `data:image/png;base64,${base64String}`;
        }

        return {
          requestId: request.id,
          id: request.sender.id,
          username: request.sender.username,
          avatar: avatarBase64
        };
      });

      return reply.send(formattedRequests);

    } catch (error) {
      console.error(error);
      return reply.status(500).send({ error: 'Failed to fetch friend requests' });
    }
  }
