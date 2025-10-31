# Backend Dockerfile
FROM node:18-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy application files
COPY . .

# Create uploads and data directories with proper permissions
RUN mkdir -p uploads data && chmod -R 755 uploads data

# Expose port
EXPOSE 5000

# Start the application
CMD ["node", "index.js"]

