// import P from 'bluebird';
// import twilio from 'twilio';
// import _ from 'lodash';
// import config from 'config3';

// const twilioClient = new twilio.RestClient(config.twilio.TWILIO_ACCOUNT_SID, config.twilio.TWILIO_AUTH_TOKEN);
// const createMessage = P.promisify(twilioClient.sendMessage, twilioClient);

// export function sendText ({ to, from, body, mediaUrl }) {
//   return createMessage(_.omit(arguments[0], _.isUndefined));
// }
