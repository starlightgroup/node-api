import Autopilot from 'autopilot-api';
import request from 'request-promise';
import config from '../../config/deprecated.server-config';
import xss from 'xss';

const autopilot = new Autopilot(config.autopilot.key);

async function addKonnektiveOrder(req, res, next) {
    const body = {};
    
    if(!req.body.cardNumber || !req.body.cardMonth  || !req.body.cardYear){
        return res.error("Invalid Card Details");
    }

    body.address1 = xss(req.body.address1);
    body.address2 = xss(req.body.address2);
    body.campaignId = xss(req.body.campaignId);
    body.cardMonth = xss(req.body.cardMonth);
    body.cardNumber = xss(req.body.cardNumber);
    body.cardYear = xss(req.body.cardYear);
    body.city = xss(req.body.city);
    body.emailAddress = xss(req.body.emailAddress);
    body.firstName = xss(req.body.firstName);
    body.lastName = xss(req.body.lastName) || "NA";
    body.orderId = xss(req.body.orderId);
    body.phoneNumber = xss(req.body.phoneNumber);
    body.postalCode = xss(req.body.postalCode);
    body.productId = xss(req.body.productId);
    body.state = xss(req.body.state);
    body.country = "US";

    if (!req.body.shipAddress1) {
        body["shipAddress1"] = body["address1"];
        body["shipAddress2"] = body["address2"];
        body["shipCity"] = body["city"];
        body["shipState"] = body["state"];
        body["shipPostalCode"] = body["postalCode"];
        body["shipCountry"] = body["country"];
    }

    if(req.body.cardSecurityCode) {
        delete req.body.cardSecurityCode;
    }
    //req.body.cardSecurityCode = "100";

    body.campaignId = 3;
    body.loginId = config.konnective.loginId;
    body.key = config.konnective.key;
    body.paySource = 'CREDITCARD';
    body.product1_qty = 1;
    body.product1_id = req.body.productId;
    //body.lastName = req.body.lastName || 'NA';
    //req.body.cardExpiryDate = `${req.body.month}/${req.body.year}`;
    //delete req.body.productId;
        

    const options = {
        uri: 'https://api.konnektive.com/order/import/',
        qs: body,
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
    const orderId = xss(req.params.id);
    const url = `https://api.konnektive.com/order/query/?loginId=${config.konnective.loginId}&password=${config.konnective.key}&orderId=${orderId}`;
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
    const orderId = xss(req.params.id);
    const url = `https://api.konnektive.com/transactions/query/?loginId=${config.konnective.loginId}&password=${config.konnective.key}&orderId=${orderId}`;
    const response = JSON.parse(await request(url));
    if(response.result == "ERROR") {
        res.error(response.message);
    }
    else {
        res.success(response.message);
    }
}

async function createKonnektiveLead(req, res, next) {

    console.log("createKonnektiveLead create-lead...");

    const campaignId = 3;
    
    var body = {};
    body.loginId = config.konnective.loginId;
    body.key = config.konnective.key;
    body.campaignId = campaignId;
    
    body.firstName = xss(req.body.firstName);
    body.lastName = xss(req.body.lastName) || "NA";
    body.phoneNumber = xss(req.body.phoneNumber);
    body.emailAddress = xss(req.body.emailAddress) || config.email;

    console.log(body);

    const options = {
        uri: 'https://api.konnektive.com/leads/import/',
        qs: body,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true // Automatically parses the JSON string in the response
    };
    const response = await request(options);
    console.log("response...",response);
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
        req.body.password = config.konnective.key;
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

export default {
    getLead: getLead,
    addKonnektiveOrder: addKonnektiveOrder,
    createKonnektiveLead: createKonnektiveLead,
    upsell: upsell,
    getTrans: getTrans
};
