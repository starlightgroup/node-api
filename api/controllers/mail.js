import {sendAffiliateEmail} from '../common/mailer';

async function sendAffiliate(req, res, next) {
    try {
        await sendAffiliateEmail(req.body);
    }
    catch(error) {
        return res.error(error.message);
    }
    res.success();
}

export default {
    sendAffiliate: sendAffiliate,
}
