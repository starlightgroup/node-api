/* do NOT change this to ES6 or config wont work */
var env = process.env;

module.exports =  {
  sendgridkey: env.SENDGRIDKEY,
  autopilot: {
    key: env.AUTOPILOTKEY
  }
};
