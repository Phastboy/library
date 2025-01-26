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
- [X] Book catalog
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

#### Rate Limiting
- [X] Global rate limiting configuration

## Tech Stack
The project is built using the following technologies:
- **Node.js**: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **NestJS**: A progressive Node.js framework for building efficient, reliable, and scalable server-side applications.
- **Prisma**: A modern database toolkit that makes it easy to work with databases.
- **MongoDB**: A general-purpose, document-based, distributed database built for modern application developers and for the cloud era.

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

### Running the app
```bash
npm run dev
```


## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
