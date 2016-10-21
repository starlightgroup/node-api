import Autopilot from 'autopilot-api';
import request from 'request-promise';
import config from 'config3';
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

    console.log("createKonnektiveLead create-lead------------------------------------->");

    const campaignId = 3;
    
    var body = {};
    body.loginId = config.konnective.loginId;
    body.password = config.konnective.password;
    body.campaignId = campaignId;
    body.firstName = req.body.firstName;
    body.lastName = req.body.lastName || "NA";
    body.phoneNumber = req.body.phoneNumber;
    body.emailAddress = req.body.emailAddress || config.email;

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
    console.log("response--------------------------------->",response);
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

export default {
    getLead: getLead,
    addKonnektiveOrder: addKonnektiveOrder,
    createKonnektiveLead: createKonnektiveLead,
    upsell: upsell,
    getTrans: getTrans
};
