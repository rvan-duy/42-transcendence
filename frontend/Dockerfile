# Use an official Node.js runtime as the base image
FROM node:19-alpine

# Set the working directory in the container
WORKDIR /app

COPY rubenpong .

# # Install dependencies
RUN npm install -g npm@latest
RUN npm install

# Expose port 4000 to the host
EXPOSE 8000

# Run the command to start the application
CMD ["npm", "run", "start"]
