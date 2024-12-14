FROM node:lts-alpine

# Set environment variable
ENV NODE_ENV=production

# Install OpenSSL (libressl) and required dependencies
RUN apk update && apk add --no-cache \
    openssl \
    libressl \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production --silent && mv node_modules ../

# Copy the rest of the application files
COPY . .

# Generate Prisma client and build the app
RUN npx prisma generate 
RUN npm run build

# Expose port and start application
EXPOSE 8080
CMD [ "npm", "run", "start:prod" ]
