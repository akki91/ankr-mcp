FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source files
COPY . .

RUN NODE_OPTIONS="--max-old-space-size=8192"

ENV GENERATE_SOURCEMAP=false
# Build the TypeScript code
RUN npm run build

# Expose the port if needed (MCP typically uses stdio, but this is useful for debugging)
EXPOSE 3000

# Start the MCP server
CMD ["npm", "start"]
