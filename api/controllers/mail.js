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
    }
    catch(error) {
        return res.error(error.message);
    }
    res.success();
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

export default {
    addContact: addContact,
    getLead: getLead,
}
