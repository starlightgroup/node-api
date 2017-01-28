module.exports = {
  autopilot: {
    key : '7d72a72715de40668977c638c01273c8',
    clientlist: 'contactlist_59EA0BF8-46D0-4733-B6C5-4F2EB7C890AA'
  },
  konnective: {
    loginId: 'flashlightsforever',
    password: 'gCx3N8DGqDhTTh'
  },
  redis: {
    REDIS_URL: 'redis://' + (process.env.REDIS_PORT_6379_TCP_ADDR || 'localhost') + ':' + (process.env.REDIS_PORT_6379_TCP_PORT || + '6379')
  },
  leadoutpost: {
    apiKey : 'CITg0XHH3kGJQ4kkjZizRxzUEINR2nZaLRRstUyHs',
    campaignId: 5
  },
  email: 'support@tacticalmastery.com'
};
