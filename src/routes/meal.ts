import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { randomUUID } from 'crypto'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      // finding user
      const user = await knex('users').where({ session_id: sessionId }).first()
      if (!user) return reply.status(401).send()

      // Creating meal body schema
      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        dateAndTime: z.string(),
        isOnDiet: z.boolean(),
      })

      // Capturing data
      const { name, description, dateAndTime, isOnDiet } =
        createMealBodySchema.parse(request.body)

      const isValidDate = Date.parse(dateAndTime)
      if (!isValidDate) return reply.status(400).send('Invalid date')

      // Creating meal
      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        date_and_time: new Date(dateAndTime),
        is_on_diet: isOnDiet,
        user_id: user.id,
      })

      return reply.status(201).send()
    },
  )
}
