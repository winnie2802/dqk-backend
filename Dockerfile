# Use the official Node.js image with Alpine Linux (lightweight)
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first to cache npm dependency installation
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the rest of the application files (including serviceAccountKey.json)
COPY . .

# Expose the port (Render will automatically detect this, but it's good practice)
EXPOSE 3000

# Start the application
CMD [ "node", "server.js" ]
