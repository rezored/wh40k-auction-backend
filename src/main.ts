import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix for API versioning
  app.setGlobalPrefix('api/v1');

  // Log all routes on startup
  const server = app.getHttpServer();
  const router = server._events.request._router;

  console.log('\n🚀 Available Routes:');
  router.stack.forEach((layer) => {
    if (layer.route) {
      const path = layer.route?.path;
      const method = Object.keys(layer.route.methods)[0];
      console.log(`${method.toUpperCase()} /api/v1${path}`);
    }
  });
  console.log('');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
