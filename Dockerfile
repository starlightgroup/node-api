FROM node:6.9.4
RUN mkdir -p /src/app
WORKDIR /src/app
ADD package.json package.json
RUN npm install
ADD .  /src/app
EXPOSE 8000
CMD ["npm","start"]