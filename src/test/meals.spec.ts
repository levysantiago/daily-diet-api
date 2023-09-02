import { execSync } from 'child_process'
import { describe, beforeAll, afterAll, beforeEach, it, expect } from 'vitest'
import { app } from '../app'
import request from 'supertest'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should allow user to create meal', async () => {
    // creating user
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John',
      email: 'john@gmail.com',
      password: '123',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    // creating meal
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Almoço',
        description: 'Feijão com arroz',
        dateAndTime: '2023-09-01T03:08:24.377Z',
        isOnDiet: true,
      })
      .set('Cookie', cookies)
      .expect(201)
  })

  it('should allow user to list meal', async () => {
    // creating user
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John',
      email: 'john@gmail.com',
      password: '123',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    // creating meal
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Almoço',
        description: 'Feijão com arroz',
        dateAndTime: '2023-09-01T03:08:24.377Z',
        isOnDiet: true,
      })
      .set('Cookie', cookies)
      .expect(201)

    // creating meal
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Janta',
        description: 'Lasagna',
        dateAndTime: '2023-09-01T03:21:24.377Z',
        isOnDiet: false,
      })
      .set('Cookie', cookies)
      .expect(201)

    // listing meals
    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealsResponse.body.data).toEqual([
      expect.objectContaining({
        name: 'Almoço',
        description: 'Feijão com arroz',
        dateAndTime: '2023-09-01T03:08:24.377Z',
        isOnDiet: 1,
      }),
      expect.objectContaining({
        name: 'Janta',
        description: 'Lasagna',
        dateAndTime: '2023-09-01T03:21:24.377Z',
        isOnDiet: 0,
      }),
    ])
  })

  it('should allow user to get meal', async () => {
    // creating user
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John',
      email: 'john@gmail.com',
      password: '123',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    // creating meal
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Almoço',
        description: 'Feijão com arroz',
        dateAndTime: '2023-09-01T03:08:24.377Z',
        isOnDiet: true,
      })
      .set('Cookie', cookies)
      .expect(201)

    // listing meals
    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    // finding meal
    const getMealResponse = await request(app.server)
      .get(`/meals/${listMealsResponse.body.data[0].id}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMealResponse.body.data).toEqual(
      expect.objectContaining({
        name: 'Almoço',
        description: 'Feijão com arroz',
        dateAndTime: '2023-09-01T03:08:24.377Z',
        isOnDiet: 1,
      }),
    )
  })

  it('should allow user to update meal', async () => {
    // creating user
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John',
      email: 'john@gmail.com',
      password: '123',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    // creating meal
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Almoço',
        description: 'Feijão com arroz',
        dateAndTime: '2023-09-01T03:08:24.377Z',
        isOnDiet: true,
      })
      .set('Cookie', cookies)
      .expect(201)

    // listing meals
    let listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    // updating meal
    await request(app.server)
      .put(`/meals/${listMealsResponse.body.data[0].id}`)
      .send({
        name: 'Janta',
        description: 'Arroz com feijão',
        dateAndTime: '2023-09-01T03:09:24.377Z',
        isOnDiet: false,
      })
      .set('Cookie', cookies)
      .expect(200)

    // listing meals
    listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealsResponse.body.data).toEqual([
      expect.objectContaining({
        name: 'Janta',
        description: 'Arroz com feijão',
        dateAndTime: '2023-09-01T03:09:24.377Z',
        isOnDiet: 0,
      }),
    ])
  })

  it('should allow user to delete meal', async () => {
    // creating user
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John',
      email: 'john@gmail.com',
      password: '123',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    // creating meal
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Almoço',
        description: 'Feijão com arroz',
        dateAndTime: '2023-09-01T03:08:24.377Z',
        isOnDiet: true,
      })
      .set('Cookie', cookies)
      .expect(201)

    // listing meals
    let listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    // deleting meal
    await request(app.server)
      .delete(`/meals/${listMealsResponse.body.data[0].id}`)
      .set('Cookie', cookies)
      .expect(200)

    // listing meals
    listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)
      .expect(200)

    expect(listMealsResponse.body.data).toEqual([])
  })

  it('should allow user to get metrics', async () => {
    // creating user
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'John',
      email: 'john@gmail.com',
      password: '123',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    // creating meal
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Almoço',
        description: 'Feijão com arroz',
        dateAndTime: '2023-09-01T03:08:24.377Z',
        isOnDiet: true,
      })
      .set('Cookie', cookies)
      .expect(201)

    // creating meal
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Almoço',
        description: 'Feijão com arroz',
        dateAndTime: new Date(),
        isOnDiet: true,
      })
      .set('Cookie', cookies)
      .expect(201)

    // creating meal
    await request(app.server)
      .post('/meals')
      .send({
        name: 'Almoço',
        description: 'Feijão com arroz',
        dateAndTime: new Date(),
        isOnDiet: false,
      })
      .set('Cookie', cookies)
      .expect(201)

    // deleting meal
    const getMetricsResponse = await request(app.server)
      .get(`/meals/metrics`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getMetricsResponse.body.data).toEqual({
      mealsAmount: 3,
      mealsOnDietAmount: 2,
      mealsOffDietAmount: 1,
      betterDailyMealsSequence: 1,
    })
  })
})
