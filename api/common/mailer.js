import P from 'bluebird';
import config from '../../config/deprecated.server-config';
const sendgrid = require('sendgrid')(config.sendgridkey);

export async function sendAffiliateEmail({first_name, last_name, phone, skype, cell, background}) {
  var email = new sendgrid.Email({
    to: email,
    from: "autobot@tacticalmastery.com",
    fromname: "TacticalMastery",
    subject: "Affiliate Email",
    html: '<h2>Affiliate Email!</h2>', // <%body%> tag for text
    text: 'Affiliate Email!' // <%body%> tag for html
  });

// add filter settings one at a time
  email.setFilters({"templates": {"settings": {"enabled": 1, "template_id": "d88a7a32-0f16-44fc-8020-de6c6f3b65d0"}}});
  email.addSubstitution('-first_name-', first_name);
  email.addSubstitution('-last_name-', last_name);
  email.addSubstitution('-phone-', phone);
  email.addSubstitution('-skype-', skype);
  email.addSubstitution('-cell-', cell);
  email.addSubstitution('-background-', background);

  return new P(function(resolve, reject){
    sendgrid.send(email, function(err, json){
      if (err) {
        reject(err);
      } else {
        resolve(json);
      }
    });
  });
}
