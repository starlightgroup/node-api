import mailCtrl from '../../api/controllers/mail';


import resError from '../../api/middlewares/res_error';
import resSuccess from '../../api/middlewares/res_success';

export default function (router) {
  router.use(resError);
  router.use(resSuccess);



  router.get('/get-lead/:id', mailCtrl.getLead);
  router.post('/create-lead', mailCtrl.createKonnektiveLead);
  router.post('/create-order', mailCtrl.addKonnektiveOrder);
  router.post('/upsell', mailCtrl.upsell);
  router.get('/get-trans/:id', mailCtrl.getTrans);

  router.get('/verify-phone/:phone', mailCtrl.verifyPhoneNumber);

  router.post('/add-contact', mailCtrl.addContact);
  router.post('/text/:contactId', mailCtrl.sendSMS);
  router.get('/text/:contactId', mailCtrl.sendSMS);
  router.get('/text2', mailCtrl.sendSMS2);
  router.post('/text2', mailCtrl.sendSMS2);
  router.get('/aphq', mailCtrl.triggerJourney);
  router.post('/aphq', mailCtrl.triggerJourney);
  router.post('/update-contact', mailCtrl.updateContact);
  router.get('/state/:stateNumber', mailCtrl.getStateInfo);
  router.get('/ipinfo', mailCtrl.getIpinfo);

  router.post('/add-leadoutpost', mailCtrl.addLeadoutpost);

  //router.get('/run-migrator', mailCtrl.migrate);
};
