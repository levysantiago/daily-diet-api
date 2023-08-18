import { app } from './app'
import { env } from './resources/env'

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('🚀 HTTP Server Running')
  })
