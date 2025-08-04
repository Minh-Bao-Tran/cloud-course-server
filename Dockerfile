# Use the official Node.js slim lightweight image as the base image
FROM node:22-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Install Nodemon server dev
RUN npm install -g nodemon

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on (e.g., 3000)
EXPOSE 3000

# Define the command to run the application
CMD ["nodemon", "app.js"]