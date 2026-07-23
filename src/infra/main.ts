import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { EnvService } from './env/env.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  })

  const configService = app.get(EnvService)
  const port = configService.get('PORT')

  app.setGlobalPrefix('api')
  app.enableCors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  app
    .listen(port)
    .then(() =>
      console.log(
        `\x1b[1m\x1b[32mHTTP server is running on port \x1b[34m${port} 🚀`,
      ),
    )
    .catch((error) =>
      console.error(`⚠️ An error occurred while starting the server: ${error}`),
    )
}

bootstrap()
