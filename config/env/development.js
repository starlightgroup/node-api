/**
 * TODO: Enter the actual redis info.
 *
 * We're going to deploy our own redis server, found from below script:
 * https://github.com/starlightgroup/redis
 */
const _redis = {
  username: 'starlight-redis',
  password: 'tlergerbyhormecielkwarsiblevateximethanimpsonaturyotholholonitervusebardebedaphorgebulgibroperymbeam',
  /**
   * TODO: Set DNS with internal ip address
   *
   */
  // host: 'redis.database.tacticalmastery.com',
  port: '6379',
  baseUrl: '172.17.0.2',
};

/**
 * `keys === key` -> true
 *
 * In this server, we'll use these terms colloquially.
 */
const _keys = {
  autopilot: 'dfec2c98885c47789c8d5c52a2a8fad5',
  /**
   * FIXME: too short key length.
   *
   * Change the key with at maximum length
   */
  konnective: 'gCx3N8DGqDhTTh',
  leadoutpost: 'CITg0XHH3kGJQ4kkjZizRxzUEINR2nZaLRRstUyHs',
};

// TODO:
// We'll later save these logs in the mongodb
//
//const _log = {
//  isDebug: true,
//  db: {
//    username: 'bot-local',
//    key: '80ac18bc4e14a99340462adc037e362b59f3a534f7792362bd737605bd265ac3c50c17baa82529af744daa0b6b411e24f8933507d52221a1862a8482b6e4d1f7',
//    host: 'mongo.tacticalmastery.com',
//    port: '27017',
//    name: 'planxyz-database-log-696dae50-15b9-43a6-b526-e9b629a50396',
//  },
//};

const _apiVersion = '2';

/**
 * NOTE:
 * - DO NOT HARD CODE BELOW.
 * - Only hard-code the values above, then reuse those values
 */
export default {
  redis: {
    url: `redis://${_redis.host}:${_redis.port}`,
    //url: process.env.url || 'redis://localhost:6379',
  },
  autopilot: {
    key : 'dfec2c98885c47789c8d5c52a2a8fad5',
    clientlist: 'contactlist_59EA0BF8-46D0-4733-B6C5-4F2EB7C890AA'
  },
  konnective: {
    loginId: 'flashlightsforever',
    key: _keys.konnective,
  },
  leadoutpost: {
    key : _keys.leadoutpost,
    campaignId: 5
  },
  email: 'support@tacticalmastery.com',
  serverPort: 3000,
};
