FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source
COPY dist/ ./dist/

# Expose ports
EXPOSE 3001 3002

# Environment variables
ENV PORT=3001
ENV WS_PORT=3002
ENV DOMAIN=devportal.live

# Start server
CMD ["node", "dist/index.js"]
