import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    // Configure body parser limits for large requests (base64 images)
    app.use(express.json({ limit: '50mb' }));
    app.use(express.urlencoded({ limit: '50mb', extended: true }));

    // Enable CORS
    const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:4200'];
    app.enableCors({
        origin: corsOrigins,
        credentials: true,
    });

    // Serve static files for uploaded images
    app.useStaticAssets(join(__dirname, '..', 'uploads'), {
        prefix: '/uploads/',
    });

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));



    // Set global prefix for API versioning
    app.setGlobalPrefix('api/v1');

    // Log environment and startup time
    console.log(`🚀 Starting server in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`⏰ Startup time: ${new Date().toISOString()}`);

    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`🎯 Server running on port ${port}`);
    console.log(`📁 Static files served from /uploads/`);
    console.log(`🌐 API available at: http://localhost:${port}/api/v1`);
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 SIGINT received, shutting down gracefully');
    process.exit(0);
});

bootstrap();
