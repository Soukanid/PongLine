import type { FastifyInstance } from 'fastify'
import { prisma } from '../index.ts'

interface SendMessageBody {
  sender_id: number
  receiver_id: number
  content: string
}


export async function chatRoutes(server: FastifyInstance) {

  server.post<{ Body: SendMessageBody }>('/messages', async (request, reply) => {
    const { sender_id, receiver_id, content } = request.body

    try {
      const newMessage = await prisma.message.create({
        data: {
          sender_id,
          receiver_id,
          content
        }
      })
    } catch (error) {
      request.log.error(error);
      return reply.code(500).send({ error: 'Failed to send message'})
    }
  })
}
