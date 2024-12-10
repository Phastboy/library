# Base image: node:lts-iron
FROM node:lts-iron

# Create app directory
WORKDIR /usr/src/app

# Copy and Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Create a "dist" folder with the production build
RUN npm run build

# Expose port and start application
EXPOSE 8080
CMD [ "npm", "run", "start:prod" ]
