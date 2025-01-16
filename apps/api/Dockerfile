FROM node:lts-alpine

# Set environment variable
ENV NODE_ENV=production

# Create a user named nest and group nest
RUN addgroup -S nest && adduser -S nest -G nest

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

# Change ownership of application files to the nest user
RUN chown -R nest:nest /usr/src/app /usr/src/node_modules

# Switch to the nest user
USER nest

# Generate Prisma client and build the app
RUN npx prisma generate
RUN npm run build

# Expose port and start application
EXPOSE 8080
CMD ["npm", "run", "start:prod"]
