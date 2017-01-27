import Autopilot from 'autopilot-api';
import phone from 'phone';
import xss from 'xss';

import config from '../../config/deprecated.server-config';
import * as redis from '../common/redis';

const autopilot = new Autopilot(config.autopilot.key);

async function getStateInfo(req, res, next) {
    const stateNumber = xss(req.params.stateNumber);
    console.log(stateNumber);
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

export function mapToAutopilotJson(data){
    return {
        FirstName: xss(data.firstName),
        LastName: xss(data.lastName),
        Email: xss(data.emailAddress),
        MobilePhone: xss(data.phoneNumber),
        MailingStreet: xss(data.address1) + " " +  xss(data.address2),
        MailingCity: xss(data.city),
        MailingState: xss(data.state),
        MailingPostalCode: xss(data.postalCode)
    };
}

export function mapToLeadoutpostJson(data) {
    return {
        firstName: xss(data.firstName),
        lastName: xss(data.lastName),
        email: xss(data.emailAddress),
        phone: xss(data.phoneNumber),
        address: xss(data.address1) + " " + xss(data.address2),
        city: xss(data.city),
        state: xss(data.state),
        zip: xss(data.postalCode)
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
    getStateInfo: getStateInfo,
    triggerJourney: triggerJourney,
    getIpinfo: getIpinfo,
    verifyPhoneNumber: verifyPhoneNumber,
    ping : ping
};
