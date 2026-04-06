# ── Stage 1: Build the React frontend ────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

# Install client dependencies (includes Vite, Tailwind, Rollup — all Alpine-native)
COPY client/package*.json ./client/
RUN cd client && npm ci

# Copy all client source files and build
COPY client/ ./client/
RUN cd client && npm run build

# ── Stage 2: Production server ────────────────────────────────────────
FROM node:22-alpine

WORKDIR /app

# Install backend production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy backend source
COPY src/ ./src/

# Copy the freshly built React app from the builder stage
COPY --from=builder /app/client/dist/ ./client/dist/

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 6000

# Set environment to production
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:6000/health', (r) => {if(r.statusCode === 200) process.exit(0); process.exit(1);})"

# Start the application
CMD ["npm", "start"]
