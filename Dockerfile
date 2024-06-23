FROM --platform=linux/aarch64 node:18
RUN npm install pm2 -g
# Working Dir
RUN mkdir -p /oxinus-task
WORKDIR /oxinus-task
# Copy Package Json Files
COPY package*.json /oxinus-task/
# Copy .env File
# COPY .env /oxinus-task/
# Install Files
RUN npm ci
# Copy Source Files
COPY . /oxinus-task/
# Build
RUN npm run build
CMD [ "npm", "run", "serve:prod" ]