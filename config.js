/* do NOT change this to ES6 or config wont work */
var env = process.env;

module.exports =  {
  autopilot: {
    key: env.AUTOPILOTKEY,
    clientlist: env.CLIENTLIST
  },
  konnective: {
    loginId: env.KONNEKTIVE_LOGINID,
    password: env.KONNEKTIVE_PASSWORD
  },
  leadoutpost: {
    apiKey: env.LEADOUTPOST_APIKEY,
    campaignId: env.LEADOUTPOST_CANPAIGNID,
  },
  MONGO_URI: env.MONGO_URI
};
