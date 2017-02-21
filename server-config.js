'use strict';
/*global process*/
import util from 'util';

let redisUrl = 'redis://localhost:6379/';

if (process.env.REDIS_URL) {
  redisUrl = process.env.REDIS_URL;
}

//for docker compose setup
if (process.env.REDIS_PORT_6379_TCP_ADDR && process.env.REDIS_PORT_6379_TCP_PORT) {
  redisUrl = util.format('redis://%s:%s/', process.env.REDIS_PORT_6379_TCP_ADDR, process.env.REDIS_PORT_6379_TCP_PORT);
}

//for secured docker compose setup
if (process.env.REDIS_PORT_6379_TCP_ADDR && process.env.REDIS_PORT_6379_TCP_PORT && process.env.REDIS_AUTH) {
  redisUrl = util.format('redis://redis:%s@%s:%s/',
    process.env.REDIS_AUTH,
    process.env.REDIS_PORT_6379_TCP_ADDR,
    process.env.REDIS_PORT_6379_TCP_PORT);
}

module.exports = {
  ENV : process.env.NODE_ENV || 'development',
//ENV can be production - live server
//ENV can be staging - testing server

  PORT : process.env.PORT || 8000,
  HOST : process.env.HOST || '0.0.0.0',

//to prevent from tampering with sessions
//related to https://starlightgroup.atlassian.net/browse/SG-5
  secret: process.env.SECRET || '68e416b2408f34c5a887c321139fb576b89fa4dc',

  autopilot: {
    key : process.env.AUTOPILOT_KEY || '7d72a72715de40668977c638c01273c8',
    clientlist:  process.env.CLIENT_LIST || 'contactlist_59EA0BF8-46D0-4733-B6C5-4F2EB7C890AA'
  },
  konnective: {
    proxy: 'https://starlightproxy.herokuapp.com/',
    proxyApiKey: '7d3c81'
  },
  redis: {
    REDIS_URL: redisUrl
  },
  leadoutpost: {
    apiKey : process.env.LEADOUTPOST_API_KEY ||  'CITg0XHH3kGJQ4kkjZizRxzUEINR2nZaLRRstUyHs',
    campaignId:  process.env.LEADOUTPOST_CAMPAIGN_ID ||  5
  },
  email:  process.env.ADMIN_EMAIL || 'support@tacticalmastery.com'
};
