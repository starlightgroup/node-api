import {sendAffiliateEmail} from '../common/mailer';
//import {Log} from '../models';
import Autopilot from 'autopilot-api';
import config from 'config3';
import request from 'request-promise';
import * as redis from '../common/redis';
import requestIp from 'request-ip';
import phone from 'phone';

const autopilot = new Autopilot(config.autopilot.key);






async function addKonnektiveOrder(req, res, next) {
    if(!req.body.cardNumber || !req.body.cardMonth  || !req.body.cardYear){
        return res.error("Invalid Card Details");
    }
    req.body.country = req.body.country || "US";

    if (!req.body.shipAddress1) {
        req.body["shipAddress1"] = req.body["address1"];
        req.body["shipAddress2"] = req.body["address2"];
        req.body["shipCity"] = req.body["city"];
        req.body["shipState"] = req.body["state"];
        req.body["shipPostalCode"] = req.body["postalCode"];
        req.body["shipCountry"] = req.body["country"];
    }

    if(req.body.cardSecurityCode) {
        delete req.body.cardSecurityCode;
    }
    //req.body.cardSecurityCode = "100";

    req.body.campaignId = 3;
    req.body.loginId = config.konnective.loginId;
    req.body.password = config.konnective.password;
    req.body.paySource = 'CREDITCARD';
    req.body.product1_qty = 1;
    req.body.product1_id = req.body.productId;
    req.body.lastName = req.body.lastName || 'NA';
    //req.body.cardExpiryDate = `${req.body.month}/${req.body.year}`;

    //delete req.body.productId;

    const options = {
        uri: 'https://api.konnektive.com/order/import/',
        qs: req.body,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };

    const response = await request(options);
    console.log(response);

    if(response.result == "ERROR") {
        res.error(response.message, 200);
    }
    else {
        res.success(response.message);
    }
}

async function getLead(req, res, next) {
    const orderId = req.params.id;
    const url = `https://api.konnektive.com/order/query/?loginId=${config.konnective.loginId}&password=${config.konnective.password}&orderId=${orderId}`;
    const response = JSON.parse(await request(url));
    console.log(response);
    if(response.result == "ERROR") {
        res.error(response.message);
    }
    else {
        res.success(response.message);
    }
}

async function getTrans(req, res, next) {
    const orderId = req.params.id;
    const url = `https://api.konnektive.com/transactions/query/?loginId=${config.konnective.loginId}&password=${config.konnective.password}&orderId=${orderId}`;
    const response = JSON.parse(await request(url));
    if(response.result == "ERROR") {
        res.error(response.message);
    }
    else {
        res.success(response.message);
    }
}

async function createKonnektiveLead(req, res, next) {
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
        res.error(response.message);
    }
    else {
        res.success(response.message);
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
            res.error(response.message);
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
        res.error('state not found', 200);
    }
}

async function triggerJourney(req, res, next) {
    const {contactid} = req.query;
    const hookid = req.query.hookid || '0001';
    const response = await autopilot.journeys.add(hookid, contactid);
    console.log(response);
    res.success();
}

async function getIpinfo(req, res, next) {
    const clientIp = requestIp.getClientIp(req);
    //const ipinfo = JSON.parse(await request(`http://ipinfo.io/${clientIp}`));
    //i am hardcoding our token in here because i don't give a fuck
    ipinfo = JSON.parse(await request(`https://ipinfo.io/${clientIp}/json/?token=1f4c1ea49e0aa2`));
    res.send(ipinfo);
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
    };
}

function mapToAutopilotJson(data){
    return {
        FirstName: data.firstName,
        LastName: data.lastName,
        Email: data.emailAddress,
        MobilePhone: data.phoneNumber,
        MailingStreet: data.address1 + " " +  data.address2,
        MailingCity: data.city,
        MailingState: data.state,
        MailingPostalCode: data.postalCode,
    };
}

function mapToLeadoutpostJson(data) {
    return {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.emailAddress,
        phone: data.phoneNumber,
        address: data.address1 + " " + data.address2,
        city: data.city,
        state: data.state,
        zip: data.postalCode,
    };
}

async function verifyPhoneNumber(req, res, next) {
    const number = req.params.phone;
    console.log(phone(number, 'US')[0]);
    if(!phone(number, 'US')[0]) {
        return res.error('Invalid phone number');
    }

    return res.success({formatted: phone(number, 'US')[0]});
}

async function ping(req,res, next) {
    return res.send({msg : "PONG"});
}

export default {
    getLead: getLead,
    createKonnektiveLead: createKonnektiveLead,
    //sendSMS: sendSMS,
    //sendSMS2: sendSMS2,
    upsell: upsell,
    getStateInfo: getStateInfo,
    triggerJourney: triggerJourney,
    getTrans: getTrans,
    getIpinfo: getIpinfo,
    addKonnektiveOrder: addKonnektiveOrder,
    verifyPhoneNumber: verifyPhoneNumber,
    ping : ping
};
