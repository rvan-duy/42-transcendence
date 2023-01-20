# Use an official Node.js runtime as the base image
FROM node:19-alpine

# Set the working directory in the container
WORKDIR /app

COPY rubenpong/ .
# Copy the package.json and package-lock.json files to the container
# COPY rubenpong/package*.json ./

# Install dependencies
RUN npm install -g npm@latest

# RUN npm install -g vite
# RUN ls -l

# Install dependencies
RUN npm ci

# Expose port 4000 to the host
EXPOSE 8000

# Run the command to start the application
# CMD ["npm", "run", "preview"]
CMD ["sh", "startup.sh"]
# CMD ["ls", "-l"]
