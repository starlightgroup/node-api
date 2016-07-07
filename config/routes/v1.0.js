import mailCtrl from '../../api/controllers/mail';


import resError from '../../api/middlewares/res_error';
import resSuccess from '../../api/middlewares/res_success';

export default function (router) {
  router.use(resError);
  router.use(resSuccess);


  router.post('/send-email', mailCtrl.sendAffiliate);
};
