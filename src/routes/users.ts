import { randomUUID } from 'node:crypto'
import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { encryptPassword } from '../helpers/encrypt-password'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
      password: z.string(),
    })

    const { name, email, password } = createUserBodySchema.parse(request.body)

    const sessionId = randomUUID()
    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days,
    })

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      password: encryptPassword(password),
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.post('/login', async (request, reply) => {
    const createUserBodySchema = z.object({
      email: z.string().email(),
      password: z.string(),
    })

    const { email, password } = createUserBodySchema.parse(request.body)

    // Selecting user
    const user = await knex('users')
      .select()
      .where({
        email,
      })
      .first()
    if (!user) return reply.status(404).send('User not found')
    if (user.password !== encryptPassword(password)) {
      return reply.status(404).send('Invalid password')
    }

    // Creating sessionId
    const sessionId = randomUUID()
    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days,
    })

    // Updating user sessionId
    await knex('users')
      .update({
        session_id: sessionId,
      })
      .where({
        email,
      })

    return reply.status(200).send()
  })
}
