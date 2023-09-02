import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'
import { randomUUID } from 'crypto'
import dayjs from 'dayjs'

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
        dateAndTime: new Date(dateAndTime),
        isOnDiet,
        userId: user.id,
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
        .select('userId')
        .where({
          id: mealId,
          userId: user.id,
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
          dateAndTime: dateAndTime ? new Date(dateAndTime) : undefined,
          isOnDiet,
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
        .select('userId')
        .where({
          id: mealId,
          userId: user.id,
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

  app.get(
    '/',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      // finding user
      const user = await knex('users').where({ session_id: sessionId }).first()
      if (!user) return reply.status(401).send()

      // Finding meals
      const meals = await knex('meals').select().where({
        userId: user.id,
      })

      return reply.status(200).send({
        data: meals.map((meal) => {
          meal.dateAndTime = dayjs(meal.dateAndTime).toDate()
          return meal
        }),
      })
    },
  )

  app.get(
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
        .select()
        .where({
          id: mealId,
          userId: user.id,
        })
        .first()

      // If meal doesn't exists
      if (!meal) {
        return reply.status(404).send('Meal not found')
      }

      meal.dateAndTime = dayjs(meal.dateAndTime).toDate()

      return reply.status(200).send({ data: meal })
    },
  )

  app.get(
    '/metrics',
    { preHandler: [checkSessionIdExists] },
    async (request, reply) => {
      const { sessionId } = request.cookies

      // finding user
      const user = await knex('users').where({ session_id: sessionId }).first()
      if (!user) return reply.status(401).send()

      // Finding meals
      const meals = await knex('meals').select().where({
        userId: user.id,
      })

      // Finding meals on diet
      const mealsOnDiet = meals.filter((meal) => {
        return meal.isOnDiet
      })

      // Finding today meals on diet
      const todaysMealsOnDiet = mealsOnDiet.filter((meal) => {
        const startOfDayDate = dayjs().startOf('day')
        const endOfDayDate = dayjs().endOf('day')
        const mealDate = dayjs(meal.dateAndTime)
        return (
          mealDate.isAfter(startOfDayDate) && mealDate.isBefore(endOfDayDate)
        )
      })

      const metrics = {
        mealsAmount: meals.length,
        mealsOnDietAmount: mealsOnDiet.length,
        mealsOffDietAmount: meals.length - mealsOnDiet.length,
        betterDailyMealsSequence: todaysMealsOnDiet.length,
      }

      return reply.status(200).send({ data: metrics })
    },
  )
}
