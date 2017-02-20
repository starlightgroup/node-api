import Autopilot from 'autopilot-api';
import config from '../../server-config';
import request from 'request-promise';
import xss from 'xss';
import phone from 'phone';

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


const autopilot = new Autopilot(config.autopilot.key);
import {mapToAutopilotJson, mapToLeadoutpostJson} from './mail';

async function migrate(req, res) {
  let contacts = await autopilot.lists.roster(config.autopilot.clientlist, 'person_0E8607F2-E308-438F-BF16-FB627DB4A4C9');
  while (contacts.data.contacts.length >= 100) {
    let contact = {};
    for (contact of contacts.data.contacts) {
      if (contact.Phone && phone(contact.Phone, 'US')[0]) {
        const leadoutpost = {
          firstName: contact.FirstName,
          lastName: contact.LastName,
          email: contact.Email,
          phone: contact.Phone
        };
        leadoutpost.apiKey = config.leadoutpost.apiKey;
        leadoutpost.campaignId = config.leadoutpost.campaignId;
        const options = {
          uri: 'https://www.leadoutpost.com/api/v1/lead',
          qs: leadoutpost,
          headers: {
            'User-Agent': 'Request-Promise'
          },
          json: true // Automatically parses the JSON string in the response
        };
        await request.post(options); // eslint-disable-line babel/no-await-in-loop
        console.log(contact.contact_id, contact.Email, contact.Phone, contact.FirstName, contact.LastName);
      }
    }
    contacts = await autopilot.lists.roster(config.autopilot.clientlist, contact.contact_id); // eslint-disable-line babel/no-await-in-loop
    console.log('last----------------', contact.contact_id);
  }
  res.success({length: contacts.data.contacts.length});

}

/*
 * add contact to autopilot
 *
 * req.body.Email
 * req.body.FirstName
 * req.body.LastName
 * req.body.Phone
 * req.body.MobilePhone
 * req.body.SkypeId
 * req.body.Browser
 *
 */

function addContact(req, res) {
  try {
    const leadoutpost = {
      firstName: xss(req.body.FirstName),
      lastName: xss(req.body.LastName),
      email: xss(req.body.Email),
      phone: xss(req.body.MobilePhone) || xss(req.body.Phone)
    };
    if (!req.body.MobilePhone) {
      req.body.MobilePhone = xss(req.body.Phone);
    }

    if (!req.body.Phone) {
      req.body.Phone = xss(req.body.MobilePhone);
    }
    //await sendAffiliateEmail(req.body);
    req.body._autopilot_list = config.autopilot.clientlist;
    autopilot.contacts.upsert(req.body);

    leadoutpost.apiKey = config.leadoutpost.apiKey;
    leadoutpost.campaignId = config.leadoutpost.campaignId;
    const options = {
      uri: 'https://www.leadoutpost.com/api/v1/lead',
      qs: leadoutpost,
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true // Automatically parses the JSON string in the response
    };
    request.post(options);
    res.success();
  }
  catch (error) {
    return res.error(error.message);
  }
}

function updateContact(req, res) {
  const contactData = mapToAutopilotJson(req.body);
  const leadoutpostData = mapToLeadoutpostJson(req.body);

  try {
    //await sendAffiliateEmail(req.body);
    contactData._autopilot_list = config.autopilot.clientlist;
    autopilot.contacts.upsert(contactData);
    res.success();

    leadoutpostData.apiKey = config.leadoutpost.apiKey;
    leadoutpostData.campaignId = config.leadoutpost.campaignId;

    const options = {
      uri: 'https://www.leadoutpost.com/api/v1/lead',
      qs: leadoutpostData,
      headers: {
        'User-Agent': 'Request-Promise'
      },
      json: true // Automatically parses the JSON string in the response
    };

    request.post(options);
  }
  catch (error) {
    return res.error(error.message);
  }
}

async function addLeadoutpost(req, res) {
  req.body.apiKey = config.leadoutpost.apiKey;
  req.body.campaignId = config.leadoutpost.campaignId;
  const options = {
    uri: 'https://www.leadoutpost.com/api/v1/lead',
    qs: req.body,
    headers: {
      'User-Agent': 'Request-Promise'
    },
    json: true // Automatically parses the JSON string in the response
  };

  const response = await request.post(options);
  res.send(response);
}

export default {
  migrate: migrate,
  addContact: addContact,
  updateContact: updateContact,
  addLeadoutpost: addLeadoutpost
};
