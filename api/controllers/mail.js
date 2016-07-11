import {sendAffiliateEmail} from '../common/mailer';
import Autopilot from 'autopilot-api';
import config from 'config3';
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

export default {
    addContact: addContact,
}
