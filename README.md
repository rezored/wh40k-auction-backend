<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

WH40K Auction Backend - A NestJS-based REST API for managing Warhammer 40,000 auction listings and bids.

## API Versioning

All API endpoints are versioned with the `/api/v1` prefix following REST API best practices:

- **Authentication**: `/api/v1/auth`
- **Users**: `/api/v1/user`
- **Listings**: `/api/v1/listings`
- **Bids**: `/api/v1/bids`

For detailed API documentation, see [API_STYLE_GUIDE.md](./API_STYLE_GUIDE.md).

## Features

- JWT-based authentication
- User registration and login
- Auction listings management
- Bidding system
- PostgreSQL database
- Docker containerization

## Quick Start

### Local Development (Docker - Recommended)

```bash
# Start the entire stack (database + backend)
docker-compose up -d

# Install dependencies in container
docker-compose exec backend npm install

# Access the API
curl http://localhost:3000/api/v1
```

### Local Development (Manual)

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit .env with your database credentials

# Start development server
npm run start:dev
```

## Project Setup

```bash
$ npm install
```

## Running the Project

### Development Mode
```bash
# Using Docker (recommended)
docker-compose up -d

# Using local PostgreSQL
npm run start:dev
```

### Production Mode
```bash
# Build the application
npm run build

# Start with PM2
npm run pm2:start:prod

# Or start directly
npm run start:prod
```

## Development Tools

```bash
# Format code
npm run format

# Lint code
npm run lint

# Watch for changes
npm run watch
```

## PM2 Management

```bash
# Start the application
npm run pm2:start:prod

# Stop the application
npm run pm2:stop

# Restart the application
npm run pm2:restart

# Reload (zero-downtime)
npm run pm2:reload

# View logs
npm run pm2:logs

# Monitor
npm run pm2:monit
```

## Deployment

### Local Development
- Use Docker Compose for easy setup
- Hot reload with `npm run start:dev`
- Database included in Docker setup

### Production Deployment
- Use PM2 for process management
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions
- Environment variables in `.env` file
- PostgreSQL database required

### Deployment Options

1. **PM2 (Recommended for VPS/Server)**
   ```bash
   npm run pm2:start:prod
   ```

2. **Docker (Recommended for containers)**
   ```bash
   docker-compose up -d
   ```

3. **Direct Node.js**
   ```bash
   npm run build
   npm run start:prod
   ```

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
