# Use an official Node.js runtime as the base image
FROM node:19-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY volume/ .

#RUN npm install
RUN npm install -g npm@latest

# Install dependencies
# RUN npm ci

RUN npm install prisma --save-dev && \
    npx prisma && \
    # npx prisma init && \
    # npx prisma migrate dev --name init && \
    # npm install @prisma/client && \
    npx prisma generate

RUN npm install

# Make port 3000 available to the world outside the container
EXPOSE 3000

# Set the DATABASE_URL environment variable
ENV DATABASE_URL postgres://dbuser:dbpassword@db:5432/dbname

# Start the application
CMD ["npm", "run", "start"]
