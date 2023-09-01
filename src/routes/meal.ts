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

  app.put(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      // finding user
      const user = await knex('users').where({ session_id: sessionId }).first()
      if (!user) return reply.status(401).send()

      // Creating meal params schema
      const updateMealParamsSchema = z.object({
        mealId: z.string(),
      })

      // Capturing params data
      const { mealId } = updateMealParamsSchema.parse(request.params)

      // Finding meal
      const meal = await knex('meals')
        .select('user_id')
        .where({
          id: mealId,
          user_id: user.id,
        })
        .first()

      // If meal doesn't exists
      if (!meal) {
        return reply.status(404).send('Meal not found')
      }

      // Creating meal body schema
      const createMealBodySchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        dateAndTime: z.string().optional(),
        isOnDiet: z.boolean().optional(),
      })

      // Capturing data
      const { name, description, dateAndTime, isOnDiet } =
        createMealBodySchema.parse(request.body)

      if (dateAndTime) {
        const isValidDate = Date.parse(dateAndTime)
        if (!isValidDate) return reply.status(400).send('Invalid date')
      }

      // Updating meal
      await knex('meals')
        .update({
          name,
          description,
          date_and_time: dateAndTime ? new Date(dateAndTime) : undefined,
          is_on_diet: isOnDiet,
        })
        .where({
          id: mealId,
        })

      return reply.status(200).send()
    },
  )

  app.delete(
    '/:mealId',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      // finding user
      const user = await knex('users').where({ session_id: sessionId }).first()
      if (!user) return reply.status(401).send()

      // Creating meal params schema
      const updateMealParamsSchema = z.object({
        mealId: z.string(),
      })

      // Capturing params data
      const { mealId } = updateMealParamsSchema.parse(request.params)

      // Finding meal
      const meal = await knex('meals')
        .select('user_id')
        .where({
          id: mealId,
          user_id: user.id,
        })
        .first()

      // If meal doesn't exists
      if (!meal) {
        return reply.status(404).send('Meal not found')
      }

      // Deleting meal
      await knex('meals').delete().where({
        id: mealId,
      })

      return reply.status(200).send()
    },
  )
}
