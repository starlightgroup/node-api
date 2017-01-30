module.exports = {
  autopilot: {
    key : process.env.AUTOPILOT_KEY || '7d72a72715de40668977c638c01273c8',
    clientlist:  process.env.CLIENT_LIST || 'contactlist_59EA0BF8-46D0-4733-B6C5-4F2EB7C890AA'
  },
  konnective: {
    loginId:  process.env.KONNECTIVE_LOGIN_ID || 'flashlightsforever',
    password:  process.env.KONNECTIVE_PASSWORD || 'gCx3N8DGqDhTTh'
  },
  redis: {
    REDIS_URL: 'redis://' + (process.env.REDIS_PORT_6379_TCP_ADDR || 'localhost') + ':' + (process.env.REDIS_PORT_6379_TCP_PORT || + '6379')
  },
  leadoutpost: {
    apiKey : process.env.LEADOUTPOST_API_KEY ||  'CITg0XHH3kGJQ4kkjZizRxzUEINR2nZaLRRstUyHs',
    campaignId:  process.env.LEADOUTPOST_CAMPAIGN_ID ||  5
  },
  email:  process.env.ADMIN_EMAIL || 'support@tacticalmastery.com'
};
