import {sendAffiliateEmail} from '../common/mailer';
//import {Log} from '../models';
import Autopilot from 'autopilot-api';
import config from 'config3';
import request from 'request-promise';
import * as redis from '../common/redis';

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
    const orderId = req.params.id;
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

async function getTrans(req, res, next) {
    const orderId = req.params.id;
    const url = `https://api.konnektive.com/transactions/query/?loginId=${config.konnective.loginId}&password=${config.konnective.password}&orderId=${orderId}`
    const response = JSON.parse(await request(url));
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

async function sendSMS2(req, res, next) {
    const {contactid} = req.query;
    const response = await autopilot.journeys.add('0001', contactid);
    console.log(response);
    res.success();
}

async function updateContact(req, res, next) {
    const contactData = mapToAutopilotJson(req.body);

    try {
        //await sendAffiliateEmail(req.body);
        contactData._autopilot_list = config.autopilot.clientlist;
        const response = await autopilot.contacts.upsert(contactData);
        res.success(response.data);
    }
    catch(error) {
        return res.error(error.message);
    }
}

async function upsell(req, res, next) {
    const {productId, productQty, orderId} = req.body;
    if(!productId || !productQty) {
        res.error('Invalid Upsell Data');
    }
    else {
        req.body.loginId = config.konnective.loginId;
        req.body.password = config.konnective.password;
        const options = {
            uri: 'https://api.konnektive.com/upsale/import/',
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
}

async function getStateInfo(req, res, next) {
    const {stateNumber} = req.params;
    const details = await redis.getJson(stateNumber);
    if(details) {
        res.success({data: mapToStateDetails(details)});
    }
    else {
        res.error('state not found');
    }
}

async function triggerJourney(req, res, next) {
    const {contactid} = req.query;
    const hookid = req.query.hookid || '0001';
    const response = await autopilot.journeys.add(hookid, contactid);
    console.log(response);
    res.success();
}

function mapToStateDetails(data) {
    return {
        zip: data[0],
        type: data[1],
        primary_city: data[2],
        acceptable_cities: data[3],
        unacceptable_cities: data[4],
        state: data[5],
        county: data[6],
        timezone: data[7],
        area_codes: data[8],
        latitude: data[9],
        longitude: data[10],
        world_region: data[11],
        country: data[12],
        decommissioned: data[13],
        estimated_population: data[14],
        notes: data[15]
    }
}

function mapToAutopilotJson(data){
    return {
        FirstName: data.firstName,
        LastName: data.lastName,
        Email: data.emailAddress,
        MobilePhone: data.phoneNumber,
        MailingStreet: data.street1 + data.street2,
        MailingCity: data.city,
        MailingState: data.state,
        MailingPostalCode: data.postalCode,
    }
}

export default {
    addContact: addContact,
    getLead: getLead,
    createLead: createLead,
    sendSMS: sendSMS,
    updateContact: updateContact,
    sendSMS2: sendSMS2,
    upsell: upsell,
    getStateInfo: getStateInfo,
    triggerJourney: triggerJourney,
    getTrans: getTrans,
}
