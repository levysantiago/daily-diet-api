import { execSync } from 'child_process'
import { describe, beforeAll, afterAll, beforeEach, it, expect } from 'vitest'
import { app } from '../app'
import request from 'supertest'

describe('Transactions routes', () => {
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

  it('should allow to create user', async () => {
    const response = await request(app.server).post('/users').send({
      name: 'John',
      email: 'john@gmail.com',
      password: '123',
    })

    expect(response.statusCode).toEqual(201)
  })

  it('should allow user to login', async () => {
    // Creating user
    await request(app.server).post('/users').send({
      name: 'John',
      email: 'john@gmail.com',
      password: '123',
    })

    // Loggin in user
    const response = await request(app.server).post('/users/login').send({
      email: 'john@gmail.com',
      password: '123',
    })

    expect(response.statusCode).toEqual(200)
  })
})
