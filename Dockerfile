# Use the official Node.js image
FROM --platform=$BUILDPLATFORM node:18

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 8080 (required by Cloud Run)
EXPOSE 8080

# Start the app
CMD ["node", "app.js"]