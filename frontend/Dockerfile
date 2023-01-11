# Use an official Node.js runtime as the base image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application's files to the container
COPY frontend .

# Expose port 4000 to the host
EXPOSE 4000

# Run the command to start the application
CMD ["npm", "start"]
