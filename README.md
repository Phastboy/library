# library
 A scalable and efficient API that allows users to explore books, check their availability, borrow and return books, and manage their library accounts.

## Features
### User
#### Authentication
- [X] Sign up
- [X] Sign in
- [X] Sign out

#### Profile Management
- [X] View profile
- [X] Edit profile
- [X] Delete profile

### Book
#### Book browsing and searching
- [ ] Book catalog
- [ ] search and filter books

#### Book borrowing and returning
- [ ] Borrow books
- [ ] Return books
- [ ] Renew books
- [ ] View borrowed books
- [ ] View borrowing history

#### Book reservation
- [ ] Reserve books
- [ ] Cancel reservations
- [ ] View reserved books

- [ ] Fine and fees

### Admin
- [ ] Book Management
- [ ] User Management
- [ ] Fine and fees Management

#### Book rating and review
- [ ] Rate books
- [ ] Review books
- [ ] View book ratings and reviews

## Tech Stack
The project is built using the following technologies:
- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **NestJS**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **Prisma**: A modern database toolkit that makes it easy to work with databases.
- **MongoDB**: A general-purpose, document-based, distributed database built for modern application developers and for the cloud era.

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Running the project locally

#### Automated setup
##### Using curl
To run the project locally, you can use the setup script by running the command below:
```bash
curl -o setup https://raw.githubusercontent.com/Phastboy/library/refs/heads/main/setup
chmod +x setup
./setup
```

##### Using wget
Alternatively, you can run the command below:
```bash
wget https://raw.githubusercontent.com/Phastboy/library/refs/heads/main/setup
chmod +x setup
./setup
```

#### Manual setup
To get a local copy up and running follow these simple steps.
```bash
git clone https://github.com/phastboy/library.git
cd library
npm install
```

### Environment Variables
Create a `.env` file in the root directory and add the following environment variables:
```bash
PORT=<anyNumber>
DATABASE_URL=<db://host:port/databaseName>
JWT_SECRET=<secret>
SMTP_HOST=<smtpHost>
SMTP_PORT=<smtpPort>
SMTP_USER=<smtpUser>
SMTP_PASS=<smtpPass>
SMTP_FROM=<smtpFrom>
```

### Generating prisma client
Run the command below to generate the prisma client:
```bash
npx prisma generate
```

### Viewing the database
You can view the database using Prisma Studio by running the command below:
```bash
npx prisma studio
```

### Running the app in dev mode
```bash
npm run dev
```

### Build

To build all apps and packages, run the following command:

```
npm run build
```

## API Documentation
The API documentation is available [here](https://library-czvh.onrender.com/docs).


## Deployment
The application is deployed to Render. Check it out [here](https://library-czvh.onrender.com).

## Development
To get started with development, follow the instructions below:
### Prerequisites
To run this project locally, you need to have the following installed on your machine:
- **Node.js**: Check out the [official guide](https://nodejs.org/en/download/) for instructions on how to install it.
- **Docker**: Check out the [official guide](https://docs.docker.com/get-docker/) for instructions on how to install it.
- **MongoDB**: Check out the [official guide](https://docs.mongodb.com/manual/installation/) for instructions on how to install it.
- **Git**: Check out the [official guide](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) for instructions on how to install it.

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
