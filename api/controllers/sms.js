import Autopilot from 'autopilot-api';
import config from '../../server-config';
const autopilot = new Autopilot(config.autopilot.key);

async function sendSMS(req, res) {
  const {contactId} = req.params;
  const response = await autopilot.journeys.add('0001', contactId);
  console.log(response);
  res.success();
}

async function sendSMS2(req, res) {
  const {contactid} = req.query;
  const response = await autopilot.journeys.add('0001', contactid);
  console.log(response);
  res.success();
}

export default {
  sendSMS: sendSMS,
  sendSMS2: sendSMS2
};
