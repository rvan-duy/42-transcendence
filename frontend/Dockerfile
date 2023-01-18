# Use an official Node.js runtime as the base image
FROM node:19-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files to the container
COPY rubenpong/package*.json ./

# Install dependencies
RUN npm ci

# Expose port 4000 to the host
EXPOSE 4173

# Run the command to start the application
CMD ["npm", "run", "preview"]
