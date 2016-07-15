import {sendAffiliateEmail} from '../common/mailer';
import Autopilot from 'autopilot-api';
import config from 'config3';
import request from 'request-promise';

const autopilot = new Autopilot(config.autopilot.key);


/*
 * add contact to autopilot
 *
 * req.body.Email
 * req.body.FirstName
 * req.body.LastName
 * req.body.Phone
 * req.body.MobilePhone
 * req.body.SkypeId
 *
 */

async function addContact(req, res, next) {
    try {
        //await sendAffiliateEmail(req.body);
        req.body._autopilot_list = config.autopilot.clientlist;
        const response = await autopilot.contacts.upsert(req.body);
        console.log(response);
        res.success(response.data);
    }
    catch(error) {
        return res.error(error.message);
    }
}


async function getLead(req, res, next) {
    const orderId = req.params.id
    const url = `https://api.konnektive.com/order/query/?loginId=${config.konnective.loginId}&password=${config.konnective.password}&orderId=${orderId}`
    const response = JSON.parse(await request(url));
    console.log(response);
    if(response.result == "ERROR") {
        res.error(response.message)
    }
    else {
        res.success(response.message);
    }
}

async function createLead(req, res, next) {
    const campaignId = 3;
    req.body.loginId = config.konnective.loginId;
    req.body.password = config.konnective.password;
    req.body.campaignId = 3;
    req.body.emailAddress = req.body.emailAddress || config.email;

    const options = {
        uri: 'https://api.konnektive.com/leads/import/',
        qs: req.body,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };
    const response = await request(options);
    console.log(response);
    if(response.result == "ERROR") {
        res.error(response.message)
    }
    else {
        res.success(response.message);
    }
}

async function sendSMS(req, res, next) {
    const {contactId} = req.params;
    const response = await autopilot.journeys.add('0001', contactId);
    console.log(response);
    res.success();
}

export default {
    addContact: addContact,
    getLead: getLead,
    createLead: createLead,
    sendSMS: sendSMS
}
