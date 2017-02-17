FROM node:7.5.0

# Build node_modules - they will be cached - they are changing more slowly than source code of `node-api`
RUN mkdir -p /src/app
ADD package.json /src/app/package.json
WORKDIR /src/app
RUN npm install


# Add source code of `node-api`
ADD . /src/app

# Verify we added only things reguired
RUN ls -l /src/app
# Creating volume to store frontend files on host machine
VOLUME /src/app/public

EXPOSE 8000
CMD ["npm","start"]