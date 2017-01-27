FROM node:6.9.4

RUN mkdir -p /app
ADD . /app

WORKDIR /app
RUN npm install

ENV REDIS_URL redis://redis.local:6379

CMD ["npm","run-script","start-docker"]