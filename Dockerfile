FROM node:10.22.0

# Setting Node environment
ENV NODE_ENV production

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY ["package.json", "yarn.lock", "./"]

# If you are building your code for development
# RUN yarn --development
# You can add --ignore-optional if you're not using ens and web3
RUN yarn --production --silent && yarn cache clean && mv node_modules ../

# Bundle app source
COPY . .

EXPOSE 8080

CMD yarn start
