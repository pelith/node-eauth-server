FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm install --only=production
# You can add --no-optional if you're not using ens and web3

# Bundle app source
COPY . .

EXPOSE 8080

CMD [ "npm", "start" ]
