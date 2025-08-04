import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend access
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Set global prefix for API versioning
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}/api/v1`);

  // Log all routes on startup (after app is listening)
  try {
    const server = app.getHttpServer();
    const router = server._events.request._router;

    console.log('\n📋 Available Routes:');
    if (router && router.stack) {
      let routeCount = 0;
      router.stack.forEach((layer) => {
        if (layer.route) {
          const path = layer.route?.path;
          const method = Object.keys(layer.route.methods)[0];
          console.log(`  ${method.toUpperCase()} /api/v1${path}`);
          routeCount++;
        }
      });
      console.log(`\n✅ Total routes registered: ${routeCount}`);
    } else {
      console.log('  (Routes will be available after first request)');
    }
    console.log('');
  } catch (error) {
    console.log('⚠️  Could not log routes:', error.message);
  }
}
bootstrap();
