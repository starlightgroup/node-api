import mailCtrl from '../../api/controllers/mail';
// import smsCtrl from '../../api/controllers/sms';
import leadoutpostCtrl from '../../api/controllers/leadoutpost';
import konnektiveCtrl from '../../api/controllers/konnektive';
import testSession from '../../api/controllers/testSession';
import resError from '../../api/middlewares/res_error';
import resSuccess from '../../api/middlewares/res_success';


/*
 * DO NOT REMOVE THIS COMMENT!!!
 * I know that code is quite ugly in this file.
 * Be carefull with changing it.
 * We have unit tests that covers nearly all actions called by frontend code.
 * But if you change code here, you will have to
 * 1) verify that unit tests PASS (quite simple)
 * 2) verify that frontend code is not broken. It is much more complicated task - frontend code has worse quality.
 *
 *
 * - Anatolij
 *
 * In this file router handlers depicted with ### has server side unit tests.
 *
 *
 * For this file - it bounds various controllers from `api/v2/controllers` to expess router,
 * and than exports this router for being served as webserver.
 */


function route(router) {
  router.use(resError);
  router.use(resSuccess);

  router.get('/get-lead/:id', konnektiveCtrl.getLead); //###
  router.post('/create-lead', konnektiveCtrl.createKonnektiveLead); //###
  router.post('/create-order', konnektiveCtrl.addKonnektiveOrder); //###
  router.post('/upsell', konnektiveCtrl.upsell); //###
  router.get('/get-trans/:id', konnektiveCtrl.getTrans); //###

  // router.post('/text/:contactId', smsCtrl.sendSMS);
  // router.get('/text/:contactId', smsCtrl.sendSMS);
  // router.get('/text2', smsCtrl.sendSMS2);
  // router.post('/text2', smsCtrl.sendSMS2);
  // router.get('/verify-phone/:phone', mailCtrl.verifyPhoneNumber);
  // router.get('/aphq', mailCtrl.triggerJourney);
  // router.post('/aphq', mailCtrl.triggerJourney);
  
  router.get('/state/:stateNumber', mailCtrl.getStateInfo); //###, 3 times)
  // router.get('/ipinfo', mailCtrl.getIpinfo);
  router.get('/ping' , mailCtrl.ping); //###
  router.post('/add-contact', leadoutpostCtrl.addContact); //###
  router.post('/update-contact', leadoutpostCtrl.updateContact);//###
  //router.post('/add-leadoutpost', leadoutpostCtrl.addLeadoutpost);
  //router.get('/run-migrator', leadoutpostCtrl.migrate);

//related to https://starlightgroup.atlassian.net/browse/SG-5
//shows 404 on production
  router.get('/testSession', testSession);
}

var routes = {v2 : route};

export {routes};
