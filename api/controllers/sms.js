import Autopilot from 'autopilot-api';
import config from '../../server-config';
const autopilot = new Autopilot(config.autopilot.key);

/*
 * DO NOT REMOVE THIS COMMENT!!!
 * I know that code is quite ugly in this file.
 * Be carefull with changing it.
 * We have unit tests that covers nearly all actions called by frontend code.
 * But if you change code here, you will have to
 * 1) verify that unit tests PASS (quite simple)
 * 2) verify that frontend code is not broken. It is much more complicated task - frontend code has worse quality.
 *
 *
 * - Anatolij
 */


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
