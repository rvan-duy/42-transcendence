# Use an official Node.js runtime as the base image
FROM node:19-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY volume/ .

#RUN npm install
RUN npm install -g npm@latest

# Install dependencies
RUN npm ci

# Make port 3000 available to the world outside the container
EXPOSE 3000

# Set the DATABASE_URL environment variable
ENV DATABASE_URL postgres://dbuser:dbpassword@db:5432/dbname

# Start the application
CMD ["sh", "startup.sh"]
